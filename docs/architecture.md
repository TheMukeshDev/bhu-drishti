# Architecture Specification (`docs/architecture.md`)

**Project:** BHU-DRISHTI (Predictive Land Acquisition Intelligence & Control Tower)

**Problem Statement ID:** 26016 (Ministry of Rural Development / DoLR)

---

## 1. Executive System Overview

**BHU-DRISHTI** is a cloud-native spatial intelligence platform that transitions national land acquisition governance from reactive, post-facto record tracking into an end-to-end predictive control tower. The architecture integrates statutory compliance under the **RFCTLARR Act, 2013**, spatial geofencing tied to the **14-digit ULPIN (Bhu-Aadhaar)**, and explainable machine learning for delay risk forecasting and Next-Best Action generation.

---

## 2. Six-Tier Modular Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│ TIER 1: PRESENTATION LAYER (Next.js 14 / React SPA, Tailwind, MapLibre) │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 2: API & INTEGRATION GATEWAY (Python FastAPI, Pydantic, Celery)   │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 3: STATUTORY WORKFLOW ENGINE (RFCTLARR Act 2013 Finite State M/c) │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 4: SPATIAL DATA ENGINE (Supabase PostgreSQL 16 + PostGIS / GiST)   │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 5: AI & PREDICTIVE ANALYTICS (XGBoost, SHAP Feature Attribution)  │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 6: STORAGE & AUDIT LAYER (MinIO / S3 Vault, SHA-256 Audit Trail)  │
└────────────────────────────────────────────────────────────────────────>

```

### Tier Breakdown

1. **Presentation Layer (Unified Control Tower):** Built using modern frontend frameworks with MapLibre GL JS GPU-accelerated vector map rendering. Displays real-time risk color-coding across national, state, and district dashboards.
2. **API & Integration Gateway:** Powered by FastAPI (Python), providing asynchronous processing, strict Pydantic payload validation, and auto-generated OpenAPI documentation (`/docs`). Handles bi-directional integration wrappers for DILRMP data standards.
3. **RFCTLARR Business Workflow Engine:** A custom finite state machine executing statutory transition rules mandated by the RFCTLARR Act, 2013 (covering Sections 4, 11, 15, 19, 23, and 38), enforcing strict stage dependencies and SLA timelines.
4. **Spatial Data Engine:** Built on PostgreSQL with the PostGIS extension (`EPSG:4326`). Handles cadastral polygon boundary calculations, vertex coordinate mapping, and sub-second spatial queries (`ST_Intersects`, `ST_Contains`) indexed via GiST.
5. **AI Risk & Decision Engine:** Runs an XGBoost regression/classification pipeline paired with SHAP (SHapley Additive exPlanations) to compute real-time delay probabilities, root-cause feature attributions, and administrative Next-Best Action recommendations.
6. **Data & Storage Layer:** Manages relational/spatial metadata, encrypted S3-compatible object storage for legal gazette notifications and field evidence files, and Redis caching for sub-second dashboard updates.

---

## 3. Data Flow & Inter-Service Communication

```
[ Field Officer PWA / Web App ]
         │ (Geotagged Survey & Photos)
         ▼
[ FastAPI Gateway (/api/v1/) ] ──► [ p-Hash Duplicate Checker ]
         │
         ├──────────────────────────────┐
         ▼                              ▼
[ PostGIS Spatial DB ]         [ RFCTLARR State Machine ]
(ULPIN Vector Parcels)         (Stage SLAs & Audit Logging)
         │                              │
         └──────────────┬───────────────┘
                        ▼
         [ XGBoost & SHAP Risk Engine ]
                        │
                        ▼
         [ Control Tower UI & Next-Best Action ]

```

---

## 4. Security, Access Control & Auditability

* **Role-Based Access Control (RBAC):** Hierarchical access model restricting operational control scopes across Central Ministries, State Revenue Departments, District Collectors, Implementing Agencies, and Field Officers.
* **Trust-Before-Access Verification:** Officer registration requires matching pre-seeded records within the Department Officer Registry before generating system profiles.
* **Cryptographic Non-Repudiation:** Every state change, objection disposition, and award approval generates an immutable SHA-256 audit log capturing actor IDs, timestamps, previous/new states, and IP addresses.