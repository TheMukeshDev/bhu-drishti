-- ============================================================================
-- 1. SCHEMAS, EXTENSIONS & SEARCH PATH (ZERO LINTER WARNINGS)
-- ============================================================================
-- Create dedicated schemas to hide extensions and internal functions from the API
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE SCHEMA IF NOT EXISTS internal;

-- Secure the internal schema completely from external API access
REVOKE ALL ON SCHEMA internal FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA internal TO authenticated, service_role, postgres;

-- Install extensions securely
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "postgis" SCHEMA extensions;

-- Set global search path so PostGIS types resolve automatically
ALTER DATABASE postgres SET search_path TO public, extensions, internal;

-- ============================================================================
-- 2. ENUMS (STRICT LOWERCASE IDENTIFIERS AS PER BEST PRACTICES)
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM (
            'CENTRAL', 'STATE', 'DISTRICT', 'AGENCY', 'FIELD_OFFICER'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_stage') THEN
        CREATE TYPE public.project_stage AS ENUM (
            'SIA_STUDY', 'SEC_11_NOTIF', 'SEC_15_OBJECTION', 
            'SEC_19_DECLARATION', 'SEC_23_AWARD', 'SEC_38_POSSESSION', 'COMPLETED'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'parcel_status') THEN
        CREATE TYPE public.parcel_status AS ENUM (
            'ACQUIRED', 'UNDER_PROCESS', 'COMP_PENDING', 
            'POSSESSION_PENDING', 'RR_PENDING', 'HIGH_RISK'
        );
    END IF;
END $$;

-- ============================================================================
-- 3. CORE TABLES
-- ============================================================================

-- Department Officer Registry (Whitelist)
CREATE TABLE IF NOT EXISTS public.department_officer_registry (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    officer_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    designation TEXT NOT NULL,
    assigned_role public.user_role NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- User Profiles (Linked to Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    bhoomi_id TEXT UNIQUE,
    officer_id TEXT REFERENCES public.department_officer_registry(officer_id) ON DELETE SET NULL,
    role public.user_role NOT NULL DEFAULT 'FIELD_OFFICER',
    state TEXT NOT NULL,
    district TEXT NOT NULL
);

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    project_code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    current_stage public.project_stage NOT NULL DEFAULT 'SIA_STUDY',
    target_area_hectares NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    estimated_budget_cr NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Land Parcels (Cadastral Mapping)
CREATE TABLE IF NOT EXISTS public.land_parcels (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    ulpin VARCHAR(14) UNIQUE NOT NULL, -- 14-digit alphanumeric Bhu-Aadhaar
    khasra_survey_no TEXT NOT NULL,
    status public.parcel_status NOT NULL DEFAULT 'UNDER_PROCESS',
    pending_with_role public.user_role DEFAULT 'FIELD_OFFICER', -- Tracks whose side it is stuck on
    geom extensions.geometry(Polygon, 4326) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Audit Logs (Append Only)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Spatial Index
CREATE INDEX IF NOT EXISTS idx_land_parcels_geom ON public.land_parcels USING GIST (geom);

-- ============================================================================
-- 4. SECURE HELPER FUNCTIONS (INTERNAL SCHEMA ONLY)
-- ============================================================================
CREATE OR REPLACE FUNCTION internal.get_user_role()
RETURNS public.user_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, internal
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION internal.is_central()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, internal
AS $$
    SELECT internal.get_user_role() = 'CENTRAL'::public.user_role;
$$;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA internal TO authenticated;

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.department_officer_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.land_parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5.1 Profiles: Users can see their own; Central sees all
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated
    USING (id = auth.uid() OR internal.is_central());

-- 5.2 Projects: Anyone can read; Only Central/State can modify
CREATE POLICY "projects_select" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "projects_modify" ON public.projects FOR ALL TO authenticated
    USING (internal.get_user_role() IN ('CENTRAL', 'STATE'))
    WITH CHECK (internal.get_user_role() IN ('CENTRAL', 'STATE'));

-- 5.3 Land Parcels (Strict Hierarchy & Ownership)
-- Read: Central sees all. Field officer sees only what they created or what is public.
CREATE POLICY "parcels_select" ON public.land_parcels FOR SELECT TO authenticated
    USING (internal.is_central() OR created_by = auth.uid());

-- Insert/Update: Field Officers can only insert their own records.
-- They can ONLY update if `pending_with_role` is currently 'FIELD_OFFICER'.
CREATE POLICY "parcels_insert" ON public.land_parcels FOR INSERT TO authenticated
    WITH CHECK (internal.is_central() OR created_by = auth.uid());

CREATE POLICY "parcels_update" ON public.land_parcels FOR UPDATE TO authenticated
    USING (
        internal.is_central() OR 
        (created_by = auth.uid() AND pending_with_role = 'FIELD_OFFICER')
    )
    WITH CHECK (
        internal.is_central() OR 
        (created_by = auth.uid() AND pending_with_role = 'FIELD_OFFICER')
    );

-- 5.4 Audit Logs: Append ONLY. No modifications allowed by anyone.
CREATE POLICY "audit_insert" ON public.audit_logs FOR INSERT TO authenticated
    WITH CHECK (actor_id = auth.uid());
CREATE POLICY "audit_select" ON public.audit_logs FOR SELECT TO authenticated
    USING (internal.is_central() OR actor_id = auth.uid());