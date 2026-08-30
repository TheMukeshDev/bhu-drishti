# Day 1 Sprint Blueprint: Architecture & Base Setup
**Project:** BHU-DRISHTI (National Land Acquisition Control Tower)  
**Problem Statement:** PS 26016 (Ministry of Rural Development / DoLR)  

## 🎯 Target & Definition of Done (DoD)
1. **Database:** Supabase project running with PostGIS enabled, core tables created, and mock seed records inserted.
2. **Backend:** FastAPI running locally (Port 8000). Officer verification and statutory workflow endpoints defined and responding via Swagger UI (`/docs`).
3. **Frontend:** React application running locally (Port 5173). Light Government Theme applied, displaying the TopBar, navigation tabs, and the 8-stage RFCTLARR workflow tracker.

---

## 👤 Mukesh — Database Architecture & Schema
**Task:** Initialize Supabase, enable PostGIS, and create the following tables.

### 1. Enums
* `user_role`: CENTRAL, STATE, DISTRICT, AGENCY, FIELD_OFFICER
* `project_stage`: SIA_STUDY, SEC_11_NOTIF, SEC_15_OBJECTION, SEC_19_DECLARATION, SEC_23_AWARD, SEC_38_POSSESSION, COMPLETED
* `parcel_status`: ACQUIRED, UNDER_PROCESS, COMP_PENDING, POSSESSION_PENDING, RR_PENDING, HIGH_RISK

### 2. Core Tables
* **`department_officer_registry`**: `officer_id` (Unique), `full_name`, `designation`, `assigned_role`. (Used to prevent unauthorized sign-ups).
* **`profiles`**: `id` (Auth UUID), `bhoomi_id`, `officer_id` (FK), `role`, `state`, `district`.
* **`projects`**: `id`, `project_code` (Unique), `title`, `current_stage`, `target_area_hectares`, `estimated_budget_cr`.
* **`land_parcels`**: `id`, `project_id` (FK), `ulpin` (14-digit Bhu-Aadhaar), `khasra_survey_no`, `status`, `geom` (PostGIS Polygon, SRID 4326 with GiST index).
* **`audit_logs`**: `actor_id` (FK), `action_type`, `entity_name`, `entity_id`, `details` (JSONB).

---

## 👤 Nikhil & Deepak — Backend API Contracts
**Task:** Set up FastAPI and build the following endpoints to unblock the frontend team.

### 1. Officer Verification (Nikhil)
* **Endpoint:** `POST /api/v1/auth/verify-officer`
* **Payload:** `{ "officer_id": "OFF-UP-2026-042" }`
* **Response (200):**
  ```json
  {
    "status": "VERIFIED",
    "officer_id": "OFF-UP-2026-042",
    "full_name": "Rajesh Verma",
    "assigned_role": "DISTRICT",
    "jurisdiction": "Sitapur, Uttar Pradesh"
  }
  ```

### 2. RFCTLARR Statutory State Machine (Deepak)

* **Endpoint:** `POST /api/v1/workflow/transition`
* **Logic:** Enforce the legal stage transitions (e.g., Sec 11 -> Sec 15 -> Sec 19) and calculate the SLA deadlines (e.g., 60 days for objections, 365 days for declarations).
* **Payload:** `{ "project_code": "PRJ-2026-0417", "current_stage": "SEC_11_NOTIF" }`
* **Response (200):**
```json
{
  "status": "SUCCESS",
  "active_stage": "SEC_15_OBJECTION",
  "statutory_mandate": "RFCTLARR Section 15",
  "sla_deadline_utc": "2026-10-29T18:00:00Z"
}
```

---

## 👤 Alok — Frontend UI & Design System

**Task:** Scaffold React + Vite, configure Tailwind, and build the structural shell.

### 1. Light Theme Design Tokens (Tailwind)

* **Background:** `#F8FAFC` (Slate)
* **Surface/Cards:** `#FFFFFF` (White)
* **Primary Text:** `#0F172A` (Navy)
* **Muted Text:** `#64748B` (Slate)
* **Primary Accent:** `#0D9488` (Teal - For active/verified elements)
* **Warning/Alert:** `#D97706` (Amber - For in-progress stages)
* **Danger/Risk:** `#DC2626` (Red - For bottlenecks)

### 2. Components to Build Today

* **`TopBar.jsx`:** Show the "BHU-DRISHTI" logo, jurisdiction breadcrumbs, and user role pill.
* **`LevelNav.jsx`:** Horizontal tabs (Control Tower, GIS Parcel Map, Workflow Engine, Risk & Bottleneck, Documents, Roles).
* **`WorkflowTracker.jsx`:** 8 horizontal nodes representing the RFCTLARR stages. Completed stages show a Teal checkmark; the active stage shows an Amber ring.

---

## ✅ End of Day Integration Check

* [ ] Database is live on Supabase with mock data.
* [ ] Backend `/docs` shows the Auth and Workflow endpoints.
* [ ] Frontend successfully renders the TopBar and Workflow Tracker using the exact color hex codes above.
