# API Contracts & REST Specification (`docs/api-contracts.md`)

**Platform:** FastAPI (Python 3.10+) + Pydantic v2

**Base URL:** `http://localhost:8000/api/v1`

**Authentication:** Bearer Token (JWT / Supabase Auth)

**Lead Backend Owners:** Nikhil (Gateway & Auth) & Deepak (Workflow & ML Engine)

---

## 1. Authentication & Officer Verification (Module 1)

### 1.1 Verify Department Officer ID

Pre-seeded government officer registry check to prevent unauthorized privilege escalation.

* **Endpoint:** `POST /api/v1/auth/verify-officer`

* **Request Body:**

```json
{
  "officer_id": "OFF-UP-2026-042"
}
```[cite: 4]
* **Response (200 OK):**
```json
{
  "status": "VERIFIED",
  "officer_id": "OFF-UP-2026-042",
  "full_name": "Rajesh Verma",
  "designation": "District Magistrate / Collector",
  "department": "Department of Land Resources",
  "jurisdiction": "Sitapur, Uttar Pradesh",
  "assigned_role": "DISTRICT"
}
```[cite: 4, 6]
* **Error Response (404 Not Found):**
```json
{
  "detail": "Officer ID not found in Department of Land Resources registry."
}
```[cite: 4]

---

### 1.2 System Sign-In
* **Endpoint:** `POST /api/v1/auth/login`[cite: 4]
* **Request Body:**
```json
{
  "email": "admin@bhoomi-st.gov.in",
  "password": "Admin@2026"
}
```[cite: 6]
* **Response (200 OK):**
```json
{
  "access_token": "mock-token-sih2026-bhu-drishti",
  "token_type": "bearer",
  "user": {
    "bhoomi_id": "BH-CEN-DL-001",
    "name": "Dr. Ramesh Sharma",
    "role": "CENTRAL",
    "jurisdiction": "National Control Tower"
  }
}
```[cite: 6]

---

## 2. RFCTLARR 2013 Workflow Engine (Module 2)

### 2.1 Execute Statutory Stage Transition
Enforces procedural milestones, calculates legal SLA deadlines, and records immutable audit logs[cite: 2, 3, 4].
* **Endpoint:** `POST /api/v1/workflow/transition`[cite: 4]
* **Request Body:**
```json
{
  "project_code": "PRJ-2026-0417",
  "current_stage": "SEC_11_NOTIF",
  "action_remarks": "Gazette notification published in district press. Initiating Section 15 hearings.",
  "actor_bhoomi_id": "BH-DIS-UP-PRY-001"
}
```[cite: 4]
* **Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "project_code": "PRJ-2026-0417",
  "previous_stage": "SEC_11_NOTIF",
  "active_stage": "SEC_15_OBJECTION",
  "statutory_mandate": "RFCTLARR Section 15",
  "sla_days_allocated": 60,
  "sla_deadline_utc": "2026-10-29T18:00:00Z",
  "audit_logged": true
}
```[cite: 2, 3, 4]

---

## 3. GIS Cadastral Vector Layer (Module 3)

### 3.1 Fetch Georeferenced Parcel GeoJSON
Returns PostGIS spatial geometry collections bound to 14-digit ULPIN codes for MapLibre client rendering[cite: 2, 3, 4, 6].
* **Endpoint:** `GET /api/v1/parcels/geojson`[cite: 4]
* **Query Parameters:** `project_code` (optional string)
* **Response (200 OK):**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "ulpin": "UP26016PRY1042",
        "name": "Sitapur Bypass Pkg 4",
        "status": "HIGH_RISK",
        "stage": "Stage 4 of 8 — Notification",
        "comp_pct": 45,
        "possession_status": "Pending",
        "rr_status": "In Progress",
        "risk_level": "High",
        "main_bottleneck": "Document Verification"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [80.89, 27.56],
            [80.91, 27.56],
            [80.91, 27.58],
            [80.89, 27.58],
            [80.89, 27.56]
          ]
        ]
      }
    }
  ]
}
```[cite: 2, 3, 4, 6]

---

## 4. Explainable AI & Risk Scoring (Module 6)

### 4.1 Evaluate Parcel Delay Risk Score
Computes XGBoost-SHAP feature contributions and generates Next-Best Action administrative recommendations[cite: 2, 3, 4].
* **Endpoint:** `GET /api/v1/risk/evaluate/{ulpin}`[cite: 4]
* **Response (200 OK):**
```json
{
  "ulpin": "UP26016PRY1042",
  "total_risk_score": "82%",
  "risk_band": "High",
  "factors": [
    {"label": "Compensation backlog", "weight": 35, "pct": "35%"},
    {"label": "Pending documents", "weight": 25, "pct": "25%"},
    {"label": "Approval delay pattern", "weight": 20, "pct": "20%"},
    {"label": "Field / R&R complexity", "weight": 20, "pct": "20%"}
  ],
  "next_best_actions": [
    "Verify pending documents with District Authority",
    "Escalate compensation backlog to State Authority",
    "Schedule field inspection for possession readiness"
  ]
}
```[cite: 2, 3, 4, 6]

```