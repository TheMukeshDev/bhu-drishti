# 🚀 CI/CD Pipeline Guide — GitHub Actions

> **Purpose:** Set up automated testing, linting, building, and deployment for GeoFlow.  
> **Runs on:** GitHub Actions (`.github/workflows/`)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Pipeline Architecture](#pipeline-architecture)
- [Setup Steps](#setup-steps)
  - [Step 1 — Create Workflow Directory](#step-1--create-workflow-directory)
  - [Step 2 — Backend CI Workflow](#step-2--backend-ci-workflow)
  - [Step 3 — Frontend CI Workflow](#step-3--frontend-ci-workflow)
  - [Step 4 — Full Stack CI Workflow](#step-4--full-stack-ci-workflow)
  - [Step 5 — Deploy Workflow (Optional)](#step-5--deploy-workflow-optional)
- [Environment Secrets](#environment-secrets)
- [Caching Strategy](#caching-strategy)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)
- [Reference](#reference)

---

## Overview

We use **GitHub Actions** for CI/CD. Every push and pull request triggers automated checks:

```
Push / PR opened
       │
       ▼
┌──────────────────┐
│   Detect Changes │  (what code was modified?)
└──────┬───────────┘
       │
       ├──── backend/  changed ──▶ Run Backend CI
       ├──── frontend/ changed ──▶ Run Frontend CI
       └──── both     changed ──▶ Run Full Stack CI
```

**Pipeline stages per workflow:**

| Stage | Backend | Frontend |
|-------|---------|----------|
| **Lint** | `ruff check` | `eslint` |
| **Test** | `pytest` | `vitest` / `jest` |
| **Build** | *(optional Docker)* | `npm run build` |
| **Typecheck** | `mypy` / `pyright` | `tsc --noEmit` |

---

## Prerequisites

- [ ] Repository has GitHub Actions enabled (Settings → Actions → General)
- [ ] Branch protection rules set on `main`
- [ ] Secrets configured (if deploying — see [Environment Secrets](#environment-secrets))

---

## Pipeline Architecture

```
.github/workflows/
├── ci-backend.yml       # Backend tests on backend/ changes
├── ci-frontend.yml      # Frontend tests on frontend/ changes
├── ci-fullstack.yml     # Both together (optional, or merge into one)
└── deploy.yml           # Deploy on merge to main (optional)
```

---

## Setup Steps

### Step 1 — Create Workflow Directory

```bash
mkdir -p .github/workflows
```

---

### Step 2 — Backend CI Workflow

Create `.github/workflows/ci-backend.yml`:

```yaml
# ============================================================
# Backend CI — Runs when backend/ or database/ files change
# ============================================================
name: Backend CI

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
      - 'database/**'
  pull_request:
    branches: [main]
    paths:
      - 'backend/**'
      - 'database/**'

# Cancel in-progress runs for the same branch
concurrency:
  group: backend-ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  backend-ci:
    name: Lint, Typecheck & Test
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend

    steps:
      # ── Checkout ──
      - name: Checkout repository
        uses: actions/checkout@v4

      # ── Python Setup ──
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt  # dev dependencies (lint, test)

      # ── Lint ──
      - name: Lint with Ruff
        run: ruff check .

      # ── Format Check ──
      - name: Check formatting
        run: ruff format --check .

      # ── Type Check ──
      - name: Type check with mypy
        run: mypy app/
        continue-on-error: true  # remove once type coverage is solid

      # ── Test ──
      - name: Run tests
        run: pytest --tb=short --cov=app --cov-report=xml
        env:
          DATABASE_URL: sqlite:///./test.db

      # ── Upload Coverage ──
      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: backend-coverage
          path: backend/coverage.xml
```

---

### Step 3 — Frontend CI Workflow

Create `.github/workflows/ci-frontend.yml`:

```yaml
# ============================================================
# Frontend CI — Runs when frontend/ files change
# ============================================================
name: Frontend CI

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'
  pull_request:
    branches: [main]
    paths:
      - 'frontend/**'

concurrency:
  group: frontend-ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  frontend-ci:
    name: Lint, Typecheck & Test
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend

    steps:
      # ── Checkout ──
      - name: Checkout repository
        uses: actions/checkout@v4

      # ── Node Setup ──
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      # ── Lint ──
      - name: Lint
        run: npm run lint

      # ── Type Check ──
      - name: Type check
        run: npx tsc --noEmit

      # ── Test ──
      - name: Run tests
        run: npm test -- --coverage

      # ── Build ──
      - name: Build
        run: npm run build

      # ── Upload Build Artifact ──
      - name: Upload build output
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: frontend-build
          path: frontend/dist/
          retention-days: 7
```

---

### Step 4 — Full Stack CI Workflow (Alternative)

If you prefer a **single workflow** instead of separate backend/frontend files:

```yaml
# ============================================================
# Full Stack CI — Runs on any change
# ============================================================
name: Full Stack CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: fullstack-ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # ── Detect which parts changed ──
  changes:
    runs-on: ubuntu-latest
    outputs:
      backend: ${{ steps.filter.outputs.backend }}
      frontend: ${{ steps.filter.outputs.frontend }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            backend:
              - 'backend/**'
              - 'database/**'
            frontend:
              - 'frontend/**'

  # ── Backend ──
  backend:
    name: Backend CI
    needs: changes
    if: needs.changes.outputs.backend == 'true'
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      - run: pip install -r requirements.txt && pip install -r requirements-dev.txt
      - run: ruff check .
      - run: pytest --tb=short
        env:
          DATABASE_URL: sqlite:///./test.db

  # ── Frontend ──
  frontend:
    name: Frontend CI
    needs: changes
    if: needs.changes.outputs.frontend == 'true'
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm test
      - run: npm run build
```

> ✅ **Recommended:** Use the separate workflows (Steps 2 & 3) for better modularity, or Step 4 for simplicity. Pick one approach.

---

### Step 5 — Deploy Workflow (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
# ============================================================
# Deploy — Runs on merge to main
# ============================================================
name: Deploy

on:
  push:
    branches: [main]

# Only one deploy at a time
concurrency:
  group: deploy-production
  cancel-in-progress: false

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment: production  # requires environment setup in GitHub Settings
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # ── Backend Deploy ──
      - name: Deploy backend
        run: |
          echo "🔧 Add your backend deploy command here"
          # Examples:
          # - docker build -t geoflow-api . && docker push ...
          # - ssh deploy@server "cd /app && git pull && pip install -r requirements.txt && systemctl restart geoflow"
          # - aws ecs update-service ...
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}

      # ── Frontend Deploy ──
      - name: Deploy frontend
        run: |
          echo "🌐 Add your frontend deploy command here"
          # Examples:
          # - npm run build && npx netlify deploy --prod
          # - aws s3 sync dist/ s3://my-bucket --delete
          # - vercel --prod
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

---

## Environment Secrets

Set these in **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Where Used | Description |
|--------|-----------|-------------|
| `DATABASE_URL` | Backend CI / Deploy | Production database connection string |
| `DEPLOY_TOKEN` | Deploy workflow | Auth token for your hosting platform |
| `API_KEY_*` | Backend tests | Any third-party API keys needed in CI |
| `NPM_TOKEN` | Frontend (if private registry) | Auth for private npm packages |

**To add a secret:**
1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Enter name and value → **Add secret**

---

## Caching Strategy

Cache dependencies to speed up pipeline runs:

| Language | Cache Config | What's Cached |
|----------|-------------|---------------|
| **Python** | `actions/setup-python` with `cache: 'pip'` | `~/.cache/pip` |
| **Node.js** | `actions/setup-node` with `cache: 'npm'` | `~/.npm` |
| **Docker** | `docker/build-push-action` with `cache-from` | Layer cache |

**Cache invalidation:** Automatically invalidated when `requirements.txt` or `package-lock.json` changes.

---

## Customization

### Change Python Version
```yaml
- uses: actions/setup-python@v5
  with:
    python-version: '3.12'  # change as needed
```

### Change Node Version
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '22'  # change as needed
```

### Add Slack Notifications
```yaml
- name: Notify Slack on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {"text": "❌ CI failed on ${{ github.ref_name }} — ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"}
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Require Specific Checks for PR Merge
In **Settings → Branches → Branch protection rules** for `main`:
- ✅ Require status checks to pass
- ✅ Select: `Backend CI`, `Frontend CI`

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| Workflow not triggering | Path filter mismatch | Check `paths:` in workflow, ensure file paths match |
| `pip install` fails | Missing `requirements.txt` | Create the file, or pin packages inline |
| `npm ci` fails | No `package-lock.json` | Run `npm install` locally and commit the lockfile |
| Tests fail in CI but pass locally | Environment difference | Use `DATABASE_URL: sqlite:///./test.db` or add `.env.test` |
| Deploy doesn't run | Missing `environment` setup | Create environment in Settings → Environments |
| Cache not working | Wrong `cache-dependency-path` | Ensure path points to lockfile (e.g., `frontend/package-lock.json`) |
| `concurrency` cancels deploy | `cancel-in-progress: true` on deploy | Set to `false` for deploy workflows |

---

## Reference

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [actions/checkout](https://github.com/actions/checkout)
- [actions/setup-python](https://github.com/actions/setup-python)
- [actions/setup-node](https://github.com/actions/setup-node)
- [dorny/paths-filter](https://github.com/dorny/paths-filter)
- [GitHub Actions Marketplaces](https://github.com/marketplace?type=actions)

---

*Update this guide as your pipeline evolves. Keep workflow YAML files in `.github/workflows/`.*
