-- 1. Ensure required workflow columns exist on land_parcels
ALTER TABLE public.land_parcels ADD COLUMN IF NOT EXISTS pending_with_role public.user_role DEFAULT 'FIELD_OFFICER';
ALTER TABLE public.land_parcels ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Inject Mock Users into auth.users (Bypassing FK Error)
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'central@bhudrishti.in', 'crypt_placeholder', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'field@bhudrishti.in', 'crypt_placeholder', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Application Data (Strictly matching your provided schema)
DO $$ 
DECLARE
    central_uid UUID := '11111111-1111-1111-1111-111111111111';
    field_uid UUID   := '22222222-2222-2222-2222-222222222222';
    v_proj_id UUID;
BEGIN
    -- Department Registry (No jurisdiction columns, just the 4 provided)
    INSERT INTO public.department_officer_registry (officer_id, full_name, designation, assigned_role)
    VALUES 
        ('CEN-001', 'Amit Central', 'Director', 'CENTRAL'),
        ('UP-PRY-F01', 'Rahul Prayagraj', 'Surveyor', 'FIELD_OFFICER')
    ON CONFLICT (officer_id) DO NOTHING;

    -- Profiles
    INSERT INTO public.profiles (id, bhoomi_id, officer_id, role, state, district)
    VALUES 
        (central_uid, 'BHOOMI-CEN', 'CEN-001', 'CENTRAL', 'Delhi', 'New Delhi'),
        (field_uid, 'BHOOMI-PRY1', 'UP-PRY-F01', 'FIELD_OFFICER', 'Uttar Pradesh', 'Prayagraj')
    ON CONFLICT (id) DO NOTHING;

    -- Projects
    INSERT INTO public.projects (project_code, title, current_stage, target_area_hectares, estimated_budget_cr)
    VALUES ('PRJ-PRY-001', 'Prayagraj Ring Road Phase 1', 'SIA_STUDY', 15.5, 250.00) 
    ON CONFLICT (project_code) DO NOTHING;

    SELECT id INTO v_proj_id FROM public.projects WHERE project_code = 'PRJ-PRY-001' LIMIT 1;

    -- Land Parcels (14-digit ULPIN for Bhu-Aadhaar)
    INSERT INTO public.land_parcels (project_id, ulpin, khasra_survey_no, status, pending_with_role, geom, created_by)
    VALUES (
        v_proj_id, 
        'UP81PRY0001001', 
        '104/A', 
        'UNDER_PROCESS', 
        'FIELD_OFFICER', -- Stuck with Field Officer initially
        extensions.ST_GeomFromText('POLYGON((81.8340 25.4410, 81.8360 25.4410, 81.8360 25.4430, 81.8340 25.4430, 81.8340 25.4410))', 4326),
        field_uid
    ) ON CONFLICT (ulpin) DO NOTHING;
END $$;