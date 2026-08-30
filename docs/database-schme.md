# Database Architecture & PostGIS Spatial Schema Specifications
**Platform:** Supabase (PostgreSQL 16 + PostGIS Extension)[cite: 2, 3]  
**Spatial Reference System:** EPSG:4326 (WGS 84)[cite: 2, 3]  
**Statutory Framework:** RFCTLARR Act, 2013 & DoLR ULPIN Standard[cite: 2, 3]  
**Lead Owner:** Mukesh[cite: 4]

---

## 1. Custom PostgreSQL Types & Enums

```sql
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- Stakeholder Jurisdictional Roles
create type user_role as enum ('CENTRAL', 'STATE', 'DISTRICT', 'AGENCY', 'FIELD_OFFICER');

-- RFCTLARR Act 2013 Statutory Lifecycle Stages
create type project_stage as enum (
    'SIA_STUDY',            -- Sec 4-9: Social Impact Assessment (6-Month Max)
    'SEC_11_NOTIF',        -- Sec 11: Preliminary Gazette Notification
    'SEC_15_OBJECTION',    -- Sec 15: 60-Day Objection Hearing Window
    'SEC_19_DECLARATION',  -- Sec 19: Final Acquisition Declaration (12-Month Max)
    'SEC_23_AWARD',        -- Sec 23: Valuation Award & 100% Solatium Determination
    'SEC_38_POSSESSION',   -- Sec 38: R&R Entitlements & Handover
    'COMPLETED'            -- Final Land Title Vesting
);

-- Cadastral Parcel Acquisition Status
create type parcel_status as enum (
    'ACQUIRED',
    'UNDER_PROCESS',
    'COMP_PENDING',
    'POSSESSION_PENDING',
    'RR_PENDING',
    'HIGH_RISK'
);
```[cite: 2, 3, 4, 6]

---

## 2. Table Schemas & Data Dictionaries

### Table: `department_officer_registry`
*Maintains pre-verified government designations to enforce trust-before-access governance.*[cite: 4]

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key, `uuid_generate_v4()` | Internal unique registry identifier. |
| `officer_id` | VARCHAR(50) | Unique, Not Null | Official Gov Officer ID (e.g., `OFF-UP-2026-042`)[cite: 4]. |
| `full_name` | VARCHAR(100) | Not Null | Full legal name of the officer[cite: 4]. |
| `designation` | VARCHAR(100) | Not Null | Designation (e.g., `District Magistrate / Collector`)[cite: 4]. |
| `department` | VARCHAR(100) | Default: `'DoLR'` | Administrative department[cite: 1, 4]. |
| `jurisdiction_state` | VARCHAR(50) | Not Null | State authority boundary[cite: 4, 6]. |
| `jurisdiction_district`| VARCHAR(50) | Nullable | District authority boundary (e.g., `Sitapur`)[cite: 4, 6]. |
| `assigned_role` | `user_role` | Not Null | Role mapping for system access[cite: 4]. |
| `is_claimed` | BOOLEAN | Default: `false` | Prevents multiple registrations under one ID[cite: 4]. |

---

### Table: `profiles`
*Application user accounts bound to Supabase Authentication.*[cite: 4]

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key, References `auth.users(id)` | Supabase Auth identity reference[cite: 4]. |
| `bhoomi_id` | VARCHAR(50) | Unique, Not Null | System identifier (e.g., `BH-DIS-UP-PRY-001`)[cite: 4]. |
| `officer_id` | VARCHAR(50) | FK $\rightarrow$ `department_officer_registry(officer_id)` | Link to verified registry[cite: 4]. |
| `email` | VARCHAR(150) | Unique, Not Null | Officer email address[cite: 6]. |
| `full_name` | VARCHAR(100) | Not Null | Display name of the user[cite: 4]. |
| `role` | `user_role` | Not Null | RBAC permission level[cite: 4]. |
| `state` | VARCHAR(50) | Not Null | Operational state jurisdiction[cite: 4, 6]. |
| `district` | VARCHAR(50) | Nullable | Operational district jurisdiction[cite: 4, 6]. |
| `created_at` | TIMESTAMPTZ | Default: `now()` | Account creation timestamp[cite: 4]. |

---

### Table: `projects`
*Master record for national and state infrastructure land acquisition projects.*[cite: 1, 2, 4]

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key, `uuid_generate_v4()` | Unique internal project key. |
| `project_code` | VARCHAR(50) | Unique, Not Null | Public code (e.g., `PRJ-2026-0417`)[cite: 4, 6]. |
| `title` | VARCHAR(255) | Not Null | Project name (e.g., `Sitapur Bypass Pkg 4`)[cite: 6]. |
| `description` | TEXT | Nullable | Macro infrastructure scope summary[cite: 1, 4]. |
| `implementing_agency`| VARCHAR(100) | Not Null | Agency name (e.g., `NHAI`, `State PWD`)[cite: 1, 4]. |
| `state` | VARCHAR(50) | Not Null | Primary state location[cite: 1, 6]. |
| `district` | VARCHAR(50) | Not Null | Primary district location[cite: 1, 6]. |
| `current_stage` | `project_stage`| Default: `'SIA_STUDY'` | Current active RFCTLARR stage[cite: 2, 4]. |
| `target_area_hectares`| NUMERIC(10,2)| Not Null | Total proposed acquisition area[cite: 1, 2]. |
| `estimated_budget_cr` | NUMERIC(12,2)| Not Null | Budget allocation in ₹ Crores[cite: 2, 6]. |
| `created_by` | UUID | FK $\rightarrow$ `profiles(id)` | Project creator reference[cite: 4]. |
| `created_at` / `updated_at` | TIMESTAMPTZ | Default: `now()` | Audit timestamps[cite: 4]. |

---

### Table: `land_parcels`
*PostGIS spatial cadastral layer bound to 14-digit ULPIN codes.*[cite: 2, 3]

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key, `uuid_generate_v4()` | Parcel record identifier. |
| `project_id` | UUID | FK $\rightarrow$ `projects(id)` on delete cascade | Parent infrastructure project[cite: 4]. |
| `ulpin` | VARCHAR(14) | Unique, Not Null | 14-digit standard Bhu-Aadhaar[cite: 2, 3]. |
| `khasra_survey_no` | VARCHAR(50) | Not Null | State revenue survey number (e.g., `KH-402/1`)[cite: 2, 4]. |
| `village_name` / `taluka_name` | VARCHAR(100) | Not Null | Sub-district hierarchy names[cite: 2, 4]. |
| `district` / `state` | VARCHAR(100) | Not Null | Administrative hierarchy names[cite: 2, 4]. |
| `area_sq_meters` | NUMERIC(12,2)| Not Null | Exact cadastral parcel area[cite: 2, 4]. |
| `status` | `parcel_status`| Default: `'UNDER_PROCESS'` | Live parcel status tag[cite: 6]. |
| `compensation_progress_pct` | INTEGER | Range: 0–100, Default: `0` | Disbursed compensation percentage[cite: 2, 6]. |
| `possession_status` | VARCHAR(50) | Default: `'Pending'` | Physical possession state[cite: 1, 6]. |
| `rr_progress` | VARCHAR(50) | Default: `'Not Started'` | Rehabilitation & Resettlement status[cite: 1, 6]. |
| `delay_risk_level` | VARCHAR(20) | Default: `'Low'` | AI Risk Band (`Low`, `Medium`, `High`)[cite: 2, 6]. |
| `main_bottleneck` | VARCHAR(100) | Default: `'None'` | Dominant operational delay factor[cite: 2, 6]. |
| `geom` | GEOMETRY(Polygon, 4326) | Not Null | Georeferenced WGS84 parcel boundary[cite: 2, 3]. |

> **Spatial Indexing Note:**  
> A spatial index must be maintained on `geom`:  
> `create index idx_land_parcels_geom on land_parcels using gist(geom);`[cite: 2, 3]

---

### Table: `field_verifications`
*Field-level ground survey submissions with GPS geotagging and perceptual photo hash.*[cite: 2, 4]

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key, `uuid_generate_v4()` | Verification submission ID. |
| `parcel_id` | UUID | FK $\rightarrow$ `land_parcels(id)` | Target cadastral parcel[cite: 4]. |
| `officer_id` | UUID | FK $\rightarrow$ `profiles(id)` | Submitting field inspector[cite: 4]. |
| `progress_percentage` | INTEGER | Check: `between 0 and 100` | Ground completion percentage[cite: 4]. |
| `latitude` / `longitude` | NUMERIC(10,7)| Nullable | Physical GPS coordinates at capture[cite: 4]. |
| `image_url` | TEXT | Not Null | S3 / MinIO evidence photo URL[cite: 2, 4]. |
| `image_phash` | VARCHAR(64) | Nullable | 64-bit perceptual hash for fraud check[cite: 4]. |
| `status` | VARCHAR(30) | Default: `'PENDING_REVIEW'` | Review status (`VERIFIED`, `REJECTED`)[cite: 4]. |
| `submitted_at` | TIMESTAMPTZ | Default: `now()` | Evidence submission timestamp[cite: 4]. |

---

### Table: `compensation_records`
*Section 26–30 RFCTLARR compensation, multiplier, and mandatory solatium calculations.*[cite: 2, 3]

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key, `uuid_generate_v4()` | Compensation record ID. |
| `parcel_id` | UUID | FK $\rightarrow$ `land_parcels(id)` | Target cadastral parcel[cite: 4]. |
| `beneficiary_name` | VARCHAR(150) | Not Null | Verified landowner / title holder[cite: 4]. |
| `base_market_value` | NUMERIC(12,2)| Not Null | Assessed base market valuation[cite: 2, 4]. |
| `multiplier_factor` | NUMERIC(3,1) | Default: `2.0` | Rural ($2.0\times$) or Urban ($1.0\times$) multiplier[cite: 2, 3]. |
| `solatium_amount` | NUMERIC(12,2)| Not Null | Mandatory 100% Solatium under Section 30[cite: 2, 3]. |
| `total_award_amount`| NUMERIC(12,2)| Not Null | Total statutory compensation award[cite: 2, 4]. |
| `disbursed_amount` | NUMERIC(12,2)| Default: `0` | Disbursed amount to date[cite: 2, 4]. |
| `disbursement_status`| VARCHAR(30) | Default: `'PENDING'` | Status (`PENDING`, `PARTIAL`, `DISBURSED`)[cite: 4]. |

---

### Table: `audit_logs`
*Cryptographic non-repudiation audit trail for all statutory state transitions.*[cite: 2, 4]

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key, `uuid_generate_v4()` | Log event identifier. |
| `actor_id` | UUID | FK $\rightarrow$ `profiles(id)` | Responsible authority who executed action[cite: 4]. |
| `action_type` | VARCHAR(50) | Not Null | Event tag (`STAGE_TRANSITION`, `DOC_UPLOAD`)[cite: 4]. |
| `entity_name` | VARCHAR(50) | Not Null | Entity modified (`PROJECT`, `PARCEL`, `AWARD`)[cite: 4]. |
| `entity_id` | VARCHAR(50) | Not Null | Reference identifier of target object[cite: 4]. |
| `details` | JSONB | Not Null | Payload storing `{from_stage, to_stage, sla_days, remarks}`[cite: 4]. |
| `created_at` | TIMESTAMPTZ | Default: `now()` | Immutable timestamp of log creation[cite: 2, 4]. |