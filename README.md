# 🌍 BHU-DRISHTI

> **National Land Acquisition Control Tower** — A GIS-powered workflow management platform for monitoring land acquisition projects under the RFCTLARR Act.
>
> **Problem Statement:** PS 26016 (Ministry of Rural Development / DoLR)

---

## 📋 Table of Contents

- [About](#about)
- [Team](#team)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [Development](#development)
- [API Overview](#api-overview)
- [Contributing](#contributing)
- [License](#license)

---

## About

BHU-DRISHTI is a full-stack application that combines geographic information system (GIS) capabilities with the statutory workflow engine for land acquisition under the RFCTLARR Act. It enables government officers to:

- 🗺️ Visualize and track land parcels on interactive PostGIS-backed maps
- ⚙️ Manage the 8-stage RFCTLARR statutory workflow (Sec 11 → Sec 15 → Sec 19 → Sec 23 → Sec 38)
- ⏱️ Monitor SLA deadlines and identify bottlenecks in real time
- 🔒 Verify officer identities and enforce role-based jurisdiction access
- 📄 Maintain a tamper-proof audit trail of all actions

---

## Team

| Name | Role | GitHub |
|------|------|--------|
| **Mukesh** | Database Architecture & Schema (Supabase / PostGIS) | [@themukeshdev](https://github.com/themukeshdev) |
| **Nikhil** | Backend — Officer Verification API | [@nikhilsingh7356-max](https://github.com/nikhilsingh7356-max) |
| **Deepak** | Backend — RFCTLARR Workflow State Machine | [@deepak-bca22](https://github.com/deepak-bca22) |
| **Alok** | Frontend — UI & Design System (React + Vite + Tailwind) | [@Alok9928](https://github.com/Alok9928) |
| **Aryan** | Team Member | [@tech-with-aryan](https://github.com/tech-with-aryan) |

> 📌 See [docs/sprints/day-1.md](docs/sprints/day-1.md) for detailed Day 1 task assignments and deliverables.

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Frontend                             │
│              React + Vite + Tailwind (Port 5173)          │
│                                                           │
│  ┌────────────┐ ┌──────────────┐ ┌────────────────────┐  │
│  │  TopBar &  │ │  GIS Parcel  │ │  Workflow Tracker  │  │
│  │  LevelNav  │ │     Map      │ │  (8-Stage RFCT)    │  │
│  └─────┬──────┘ └──────┬───────┘ └─────────┬──────────┘  │
│        └───────────────┼───────────────────┘             │
│                        │                                  │
│                 ┌──────▼──────┐                           │
│                 │   Services  │                           │
│                 │   (API)     │                           │
│                 └──────┬──────┘                           │
└────────────────────────┼──────────────────────────────────┘
                         │  HTTP / REST
┌────────────────────────▼──────────────────────────────────┐
│                      Backend                               │
│               Python / FastAPI (Port 8000)                 │
│                                                            │
│  ┌────────────┐ ┌────────────────┐ ┌──────────────────┐   │
│  │   Core     │ │    Routers     │ │    Services      │   │
│  │  (Config)  │ │ (Auth/Workflow)│ │ (Business Logic) │   │
│  └─────┬──────┘ └───────┬────────┘ └────────┬─────────┘   │
│        └────────────────┼───────────────────┘             │
│                  ┌──────▼──────┐                           │
│                  │  Supabase   │                           │
│                  │ (PostgreSQL │                           │
│                  │  + PostGIS) │                           │
│                  └─────────────┘                           │
└───────────────────────────────────────────────────────────┘
```

**Flow:** Frontend → REST API → Backend Routers → Services → Supabase (PostgreSQL + PostGIS)

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React + Vite | Client-side application (Port 5173) |
| **Styling** | Tailwind CSS | Utility-first CSS with Light Government Theme |
| **GIS Mapping** | *(TBD — Leaflet / Mapbox / OpenLayers)* | PostGIS-backed map visualization |
| **Backend** | Python 3.11+ / FastAPI | REST API server (Port 8000) |
| **Database** | Supabase (PostgreSQL + PostGIS) | Spatial queries, auth, real-time |
| **Auth** | Supabase Auth + Officer Registry | Role-based access with officer verification |

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Python** 3.11 or higher
- **Node.js** 18+ and npm/yarn/pnpm
- **Supabase** account — create project at [supabase.com](https://supabase.com) and enable PostGIS
- **Git** — for version control

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-org/bhu-drishti.git
cd bhu-drishti
```

**2. Set up the backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**3. Set up the frontend**
```bash
cd frontend
npm install
```

**4. Set up the database**
```bash
# Follow database setup instructions in docs/database-schema.md
```

### Running the App

**Start the backend (API server)**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
# Swagger docs: http://localhost:8000/docs
```

**Start the frontend (development server)**
```bash
cd frontend
npm run dev
# App: http://localhost:5173
```

The app will be available at:
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:8000`
- **Swagger UI:** `http://localhost:8000/docs`
- **Supabase Dashboard:** Your Supabase project URL

---

## Project Structure

```
bhu-drishti/
├── backend/                    # Python/FastAPI backend
│   └── app/
│       ├── core/               # Configuration, settings, dependencies
│       ├── routers/            # API route handlers (endpoints)
│       └── services/           # Business logic & data access
│
├── frontend/                   # JavaScript/TypeScript frontend
│   ├── public/                 # Static assets
│   └── src/
│       ├── assets/             # Images, fonts, icons
│       ├── components/         # Reusable UI components
│       │   ├── common/         # Generic components (buttons, modals, etc.)
│       │   ├── gis/            # Map viewers, spatial tools, layers
│       │   ├── layout/         # Page layout, navigation, header/footer
│       │   └── workflow/       # Workflow builder, step editors, triggers
│       ├── services/           # API client & data fetching
│       └── views/              # Page-level components / routes
│
├── database/                   # Schema definitions, migrations, seeds
├── docs/                       # Project documentation
│   ├── sprints/                # Sprint planning & daily notes
│   ├── database-schema.md      # DB schema reference
│   ├── api-contracts.md        # API endpoint contracts
│   └── ui-guidelines.md        # UI/UX design standards
│
├── .github/                    # GitHub config (PR template, CI, etc.)
├── CONTRIBUTING.md             # Contribution guidelines
└── README.md                   # This file
```

---

## Development

### Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `feature/<ticket>-<slug>` | New features |
| `fix/<ticket>-<slug>` | Bug fixes |
| `docs/<topic>` | Documentation changes |

### Available Scripts

**Backend:**
```bash
# Run tests
pytest

# Lint
ruff check .

# Format
ruff format .
```

**Frontend:**
```bash
# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint
npm run lint
```

> ⚠️ Update these scripts once `requirements.txt` and `package.json` are created.

---

## API Overview

Full API documentation is available in [docs/api-contracts.md](docs/api-contracts.md).

Once the backend is running, interactive API docs are available at:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### Core Endpoints (Planned)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects` | List all projects |
| `POST` | `/api/projects` | Create a new project |
| `GET` | `/api/projects/{id}` | Get project details |
| `PUT` | `/api/projects/{id}` | Update a project |
| `DELETE` | `/api/projects/{id}` | Delete a project |
| `GET` | `/api/workflows` | List workflows |
| `POST` | `/api/workflows` | Create a workflow |
| `POST` | `/api/layers/upload` | Upload spatial data layer |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for full contribution guidelines including:

- Branch naming conventions
- Commit message format
- PR review process
- Code style requirements

---

## Sprint Docs

| Sprint | Status | Link |
|--------|--------|------|
| Day 1 — Architecture & Base Setup | 🟢 Active | [day-1.md](docs/sprints/day-1.md) |

---

## License

*License TBD — add once decided.*

---

<p align="center">
  <sub>Built with 💚 by the BHU-DRISHTI team — Ministry of Rural Development / DoLR</sub>
</p>
