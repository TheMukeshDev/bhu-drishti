# Contributing & Collaboration Guidelines — Team MadNex

All contributors must adhere to the following Git conventions, branch naming rules, and pull request policies to prevent merge conflicts and ensure code quality[cite: 4].

---

## 1. Branch Naming Standards
Never push commits directly to the `main` branch. Always work in an isolated feature branch named according to your role:

* **Database (Mukesh):** `feature/db-<feature-description>`
* **Frontend (Alok):** `feature/fe-<component-description>`
* **Backend API / Auth (Nikhil):** `feature/be-gateway-<feature-description>`
* **Backend Workflow / ML (Deepak):** `feature/be-workflow-<feature-description>`

---

## 2. Commit Message Standards
Follow standard semantic commit prefixes:
* `feat(auth): add department officer registry verification endpoint`[cite: 4]
* `feat(workflow): implement RFCTLARR Section 15 60-day objection timer`[cite: 2, 3]
* `feat(gis): add PostGIS polygon geometry schema with GiST indexing`[cite: 2, 3]
* `style(ui): apply light government theme tokens to Control Tower cards`[cite: 3, 6]
* `fix(compensation): adjust rural multiplier factor to 2.0x for solatium calculation`[cite: 2, 3]

---

## 3. Pull Request (PR) Requirements
Every Pull Request must fill out `.github/PULL_REQUEST_TEMPLATE.md` and provide **mandatory output proof**:

1. **Frontend PRs:** Must attach a screenshot or GIF of the rendered light UI component[cite: 6].
2. **Backend PRs:** Must paste the JSON response body and HTTP status code from `/docs` or Postman[cite: 4].
3. **Database PRs:** Must include the SQL execution output log from the Supabase SQL Editor[cite: 4].

---

## 4. Code & Architecture Rules
* **Strict Light Theme:** Use only the approved Tailwind government color tokens (`#F8FAFC`, `#0F172A`, `#0D9488`, `#D97706`, `#DC2626`)[cite: 6].
* **Statutory Accuracy:** Workflow transitions must strictly match the procedural clauses of the **RFCTLARR Act, 2013** (Sections 4, 11, 15, 19, 23, 38)[cite: 2, 3].
* **No Hardcoded Secrets:** Never commit `.env` files, Supabase service keys, or database passwords to Git.
