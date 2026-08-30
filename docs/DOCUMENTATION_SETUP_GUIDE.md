# 📚 Project Documentation Setup Guide

> **Purpose:** Guide for setting up the project's knowledge base, sprint docs, and team standards.  
> **Run from:** project root directory  
> **Prerequisites:** Git configured, write access to `main` branch

---

## 1. Overview

This guide creates the full documentation skeleton for the team:

```
.
├── README.md                          # Project overview & quickstart
├── CONTRIBUTING.md                    # Contribution rules & PR standards
├── docs/
│   ├── sprints/
│   │   └── day-1.md                   # Sprint day-1 checklist
│   ├── database-schema.md             # DB schema reference
│   ├── api-contracts.md               # API endpoint contracts
│   └── ui-guidelines.md               # UI/UX design rules
├── .github/                           # (exists)
├── backend/                           # (exists)
├── database/                          # (exists)
└── frontend/                          # (exists)
```

---

## 2. Step-by-Step Commands

### Step 1 — Create the directory tree

```bash
mkdir -p docs/sprints
```

> `docs/sprints/` is the only **new** directory.  
> `.github`, `backend`, `database`, `frontend` already exist — no action needed.

---

### Step 2 — Create all documentation files

```bash
# Root-level files
touch README.md CONTRIBUTING.md

# Sprint docs
touch docs/sprints/day-1.md

# Technical reference docs
touch docs/database-schema.md
touch docs/api-contracts.md
touch docs/ui-guidelines.md
```

| File | Purpose |
|------|---------|
| `README.md` | Project overview, setup instructions, team contacts |
| `CONTRIBUTING.md` | Branch naming, commit conventions, PR review rules |
| `docs/sprints/day-1.md` | Sprint kickoff checklist — goals, tasks, assignments |
| `docs/database-schema.md` | Schema diagrams, table descriptions, migrations |
| `docs/api-contracts.md` | Endpoint list, request/response examples |
| `docs/ui-guidelines.md` | Component library, colors, spacing, accessibility |

---

### Step 3 — Stage the files

```bash
git add docs/ README.md CONTRIBUTING.md
```

**Verify before committing:**
```bash
git status
```
Expected output — only your new files in green:
```
new file:   README.md
new file:   CONTRIBUTING.md
new file:   docs/database-schema.md
new file:   docs/api-contracts.md
new file:   docs/sprints/day-1.md
new file:   docs/ui-guidelines.md
```

---

### Step 4 — Commit

```bash
git commit -m "docs: add project knowledge base, team sprint guides, and contributing rules"
```

---

### Step 5 — Push

```bash
git push origin main
```

> If your default branch is `master` instead of `main`, use:  
> `git push origin master`  
> Check with: `git branch`

---

## 3. File Content Templates

### README.md

```markdown
# Project Name

Short description of what this project does.

## Getting Started

### Prerequisites
- [list dependencies]

### Installation
[step-by-step setup]

## Architecture
- **backend/** — [description]
- **frontend/** — [description]  
- **database/** — [description]

## Team
[team members and roles]

## License
[license info]
```

### CONTRIBUTING.md

```markdown
# Contributing Guide

## Branch Naming
| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/<ticket>-<slug>` | `feature/123-user-auth` |
| Bugfix | `fix/<ticket>-<slug>` | `fix/456-null-ref` |
| Docs | `docs/<topic>` | `docs/api-contracts` |

## Commit Messages
Format: `<type>(<scope>): <description>`

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

Examples:
- `feat(backend): add user registration endpoint`
- `docs: update API contracts for v2`

## Pull Requests
1. Create PR from your branch → `main`
2. Fill in the PR template
3. Request at least 1 review
4. Squash and merge after approval

## Code Style
- Run linter before committing
- Follow existing patterns in the codebase
```

### docs/sprints/day-1.md

```markdown
# Sprint Day 1 — Setup & Kickoff

## Checklist
- [ ] All devs have repo access
- [ ] Local environment running
- [ ] Database seeded with test data
- [ ] Sprint goals reviewed and tickets assigned
- [ ] Slack/Discord channel created

## Goals
1. [Sprint goal 1]
2. [Sprint goal 2]

## Assignments
| Task | Owner | Status |
|------|-------|--------|
| | | |

## Notes
[Meeting notes go here]
```

### docs/database-schema.md

```markdown
# Database Schema

## ER Diagram
[Link to diagram or ASCII art]

## Tables

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |

[Add remaining tables]

## Migrations
Run: `npm run migrate` or `npx prisma migrate dev`
```

### docs/api-contracts.md

```markdown
# API Contracts

## Base URL
`http://localhost:3000/api`

## Endpoints

### POST /api/users
**Request:**
```json
{
  "email": "user@example.com",
  "name": "Jane Doe"
}
```
**Response (201):**
```json
{
  "id": "uuid-123",
  "email": "user@example.com",
  "name": "Jane Doe"
}
```

### GET /api/users/:id
...

[Add all endpoints]
```

### docs/ui-guidelines.md

```markdown
# UI Guidelines

## Design Tokens
| Token | Value | Usage |
|-------|-------|-------|
| --color-primary | #3B82F6 | Buttons, links |
| --color-bg | #FFFFFF | Page background |
| --color-text | #1F2937 | Body text |

## Components
- Buttons: [link to component docs]
- Forms: [link to component docs]

## Spacing Scale
4px → 8px → 12px → 16px → 24px → 32px → 48px → 64px

## Typography
- Headings: Inter / system font stack
- Body: Inter / system font stack

## Accessibility
- Min contrast ratio: 4.5:1
- All images must have alt text
- Keyboard navigable
```

---

## 4. Verification

After running all commands:

```bash
# Confirm files exist
ls -la README.md CONTRIBUTING.md docs/

# Confirm git state
git log --oneline -1
# Expected: <hash> docs: add project knowledge base, team sprint guides, and contributing rules

# Confirm push
git remote -v
git status
```

---

## 5. Troubleshooting

| Problem | Fix |
|---------|-----|
| `git push` fails with "does not match" | Run `git branch -M main` then push again |
| Files not showing in `git status` | Check you're in project root: `pwd` |
| Permission denied on push | Confirm SSH key or token: `git remote -v` |
| Wrong default branch name | Use `git push origin HEAD:main` |

---

## 6. Next Steps After Setup

1. **Fill in templates** — Replace placeholder content with real project data
2. **Add more sprint docs** — `docs/sprints/day-2.md`, etc.
3. **Set up PR templates** — `.github/PULL_REQUEST_TEMPLATE.md`
4. **Add CI checks** — Lint, test, and typecheck on PR
5. **Link docs in README** — Add a `## Documentation` section

---

*Generated for the team — update as the project evolves.*
