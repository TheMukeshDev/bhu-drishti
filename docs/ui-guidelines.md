# UI Design System & Component Guidelines (`docs/ui-guidelines.md`)

**Project:** BHU-DRISHTI (National Land Acquisition & Management Control Tower)

**Organization:** Ministry of Rural Development | Department of Land Resources (DoLR)

**Target User Persona:** Central Ministries, State Revenue Authorities, District Collectors, and Field Officers

**Lead Designer / Frontend Engineer:** Alok

---

## 1. Design Philosophy & Visual Identity

The interface follows an **Executive Light Government Design System**. It replaces outdated, cluttered administrative portals with a high-density, accessible, and fast data visualization control tower:

* **High Contrast & Legibility:** Neutral slate backgrounds (`#F8FAFC`) with pure white card surfaces (`#FFFFFF`) and dark slate typography (`#0F172A`).


* **Statutory Status Clarity:** Dedicated semantic accent colors for each statutory milestone and risk state under the RFCTLARR Act, 2013.


* **Zero Cognitive Overload:** Strict typographic hierarchy, structured tables, visual progress trackers, and explainable feature bars.



---

## 2. Color Palette & Design Tokens

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LIGHT THEME PALETTE TOKENS                      │
├──────────────────┬─────────────────┬──────────────────┬────────────────┤
│ Background       │ Surface / Card  │ Primary Accent   │ Executive Navy │
│ #F8FAFC (Slate)  │ #FFFFFF (White) │ #0D9488 (Teal)   │ #0F172A (Text) │
├──────────────────┼─────────────────┼──────────────────┼────────────────┤
│ Warning / Alert  │ Critical Risk   │ Processing Blue  │ Muted Text     │
│ #D97706 (Amber)  │ #DC2626 (Red)   │ #2563EB (Blue)   │ #64748B (Slate)│
└──────────────────┴─────────────────┴──────────────────┴────────────────┘

```

### Color Token Reference Table

| Token Name | Hex Code | Purpose & Semantic Usage |
| --- | --- | --- |
| `gov-bg` | `#F8FAFC` | Global page background canvas.

 |
| `gov-surface` | `#FFFFFF` | Card panels, modal windows, table surfaces.

 |
| `gov-border` | `#E2E8F0` | Structural dividers, card borders, grid lines.

 |
| `gov-text` | `#0F172A` | Primary headings, table data, high-emphasis text.

 |
| `gov-muted` | `#64748B` | Subtext, timestamps, field labels, breadcrumbs.

 |
| `gov-primary` | `#0D9488` | Active tabs, verified status, success buttons (Teal).

 |
| `gov-primary-hover` | `#0F766E` | Hover state for primary interactive elements. |
| `gov-secondary` | `#1E293B` | Section titles, sidebar badges, executive callouts. |
| `gov-accent` | `#2563EB` | In-progress workflow indicators, active hyperlinks. |
| `gov-warning` | `#D97706` | In-progress milestones, approaching statutory deadlines (Amber).

 |
| `gov-warning-bg` | `#FFFBEB` | Warning badge background / notification container. |
| `gov-danger` | `#DC2626` | High delay risk, statutory SLA breaches, bottlenecks (Red).

 |
| `gov-danger-bg` | `#FEF2F2` | Critical alert background container. |
| `gov-success-bg` | `#F0FDF4` | Verified / acquired highlight background. |

---

## 3. Typography & Font Hierarchy

### Font Families

* **Display / Headings:** `'Inter', system-ui, sans-serif` (Bold, 600–700 weight)
* **Body / Interface:** `'Inter', system-ui, sans-serif` (Regular 400, Medium 500)
* **Codes, Metrics & IDs:** `'JetBrains Mono', monospace` (Used for ULPIN, Khasra numbers, project IDs, currency, and timestamps)



### Type Scale & Hierarchy

| Element | Class / Size | Weight | Color Token | Example Usage |
| --- | --- | --- | --- | --- |
| **Page Title** | `text-2xl` (24px) | 700 Bold | `text-gov-text` | "CONTROL TOWER", "LAND PARCEL MAP"

 |
| **Eyebrow Header** | `text-xs` (11px) | 600 SemiBold | `text-gov-primary` | "NATIONAL OVERVIEW", "RFCTLARR 2013"

 |
| **Card Header** | `text-base` (16px) | 600 SemiBold | `text-gov-text` | "OLDEST PENDING CASES", "AUDIT TRAIL"

 |
| **KPI Big Number** | `text-3xl` (30px) | 700 Bold | `text-gov-text` | "₹342 Cr", "61%", "128 Projects"

 |
| **Body / Table Cell** | `text-sm` (14px) | 400 Regular | `text-gov-text` | Project titles, officer designations

 |
| **Meta / Mono Label** | `text-xs` (12px) | 500 Medium | `text-gov-muted` | `UP26016PRY1042`, `2026-08-30 14:22 UTC`<br> |

---

## 4. Application Layout & Component Specifications

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TopBar: [● Brand: BHU-DRISHTI] [Breadcrumb: National]       [Role Pill] [User] [Logout]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ LevelNav: [Control Tower] [GIS Parcel Map] [Workflow] [Risk] [Documents] [RBAC]       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Main Container (max-w-7xl px-8 py-6):                                                 │
│                                                                                        │
│ ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 6-Column KPI Metrics Ribbon                                                        │ │
│ └────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                        │
│ ┌───────────────────────────────────────────┬────────────────────────────────────────┐ │
│ │ Primary Left Container (60%)              │ Secondary Right Panel (40%)            │ │
│ │ (Cadastral Vector Map / Data Tables)      │ (ULPIN Details / Risk & Action Drawer) │ │
│ └───────────────────────────────────────────┴────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘

```

---

### Component 1: TopBar (`src/components/layout/TopBar.jsx`)

* **Background:** `bg-white/95 backdrop-blur border-b border-gov-border`

* **Elements:**
* **Brand Mark:** A glowing teal dot (`bg-gov-primary shadow-[0_0_8px_rgba(13,148,136,0.5)]`), bold uppercase label `BHU-DRISHTI`, and sub-heading `NATIONAL LAND ACQUISITION CONTROL TOWER` in uppercase monospace.


* **Jurisdiction Breadcrumb:** `National → All States` with the active scope highlighted in teal.


* **Role Badge:** Pill badge showing active stakeholder access level (`● Central Authority` or `● District Collector`).


* **User Profile & Logout:** Avatar initials chip with clean text and a red hover state on the logout button.





---

### Component 2: Level Navigation Tabs (`src/components/layout/LevelNav.jsx`)

* **Tabs:**
1. `Control Tower` (`/dashboard`)


2. `GIS Parcel Map` (`/gis`)


3. `Workflow Engine` (`/workflow`)


4. `Risk & Bottleneck` (`/risk`)


5. `Documents & Audit` (`/documents`)


6. `Roles & Access` (`/rbac`)




* **Active State:** Solid bottom border (`border-b-2 border-gov-primary`), bold teal text (`text-gov-primary`), and subtle green tint background (`bg-gov-success-bg/40`).


* **Inactive State:** `text-gov-muted hover:text-gov-text border-transparent`.



---

### Component 3: 8-Stage Statutory Workflow Tracker (`src/components/workflow/WorkflowTracker.jsx`)

Visualizes the linear stage progression mandated by the **RFCTLARR Act, 2013**:

```
[1. SIA Study] ──► [2. Prelim Notice] ──► [3. Objections] ──► [4. Declaration]
     (Sec 4-9)          (Sec 11)              (Sec 15)            (Sec 19)
         │
         ▼
[5. Award & Solatium] ──► [6. Possession] ──► [7. R&R Progress] ──► [8. Completed]
       (Sec 23)               (Sec 38)            (Schedule II)         (Possession)
```[cite: 2, 3, 6]

* **Step State 1 (Completed):** Circle filled with `bg-gov-primary text-white` showing checkmark `✓`[cite: 6]. Connector bar rendered in solid teal (`bg-gov-primary`)[cite: 6].
* **Step State 2 (Active / Current):** Circle filled with `bg-gov-warning text-white` surrounded by an amber pulse/ring (`ring-4 ring-gov-warning/20`)[cite: 6].
* **Step State 3 (Pending / Future):** Circle rendered with `bg-gov-bg border border-gov-border text-gov-muted`[cite: 6].

---

### Component 4: KPI Metric Card (`src/components/common/KpiCard.jsx`)
Used across the Control Tower to display aggregate metrics[cite: 6]:
* **Card Surface:** `bg-white border border-gov-border rounded-lg p-5 shadow-sm`[cite: 6]
* **Top Label:** Monospace, uppercase, tracking-wider (`text-[11px] font-mono text-gov-muted`)[cite: 6]
* **Value Display:** Bold heading (`text-3xl font-bold text-gov-text`)[cite: 6]
* **Trend / Delta Footer:**
  * Positive Progress: `text-xs text-gov-primary` (e.g., `↑ 4% this month`)[cite: 6]
  * Delay Warning: `text-xs text-gov-danger font-medium` (e.g., `↑ 8% vs last qtr`)[cite: 6]

---

### Component 5: Cadastral Map & Parcel Detail Drawer (`src/components/gis/ParcelDetail.jsx`)

#### Map Canvas Guidelines (MapLibre / Leaflet)
* **Tile Basemap:** Light grayscale or muted administrative canvas.
* **Vector Polygon / Point Colors:**
  * **Acquired / Completed:** `#0D9488` (Teal)[cite: 6]
  * **Under Process / Review:** `#2563EB` (Blue)[cite: 6]
  * **Compensation Pending:** `#D97706` (Amber)[cite: 6]
  * **Possession Pending:** `#9333EA` (Purple)[cite: 6]
  * **High Delay Risk / Bottleneck:** `#DC2626` (Red with pulsing ring `animate-pulse`)[cite: 6]

#### Detail Drawer Panel (Right Side)
When a user clicks on a parcel polygon or dot, the panel displays[cite: 4, 6]:
1. **Header:** 14-Digit ULPIN badge (`UP26016PRY1042`) + Project Title[cite: 2, 4, 6].
2. **Statutory Status Rows:** Grid displaying Current Stage, Khasra Survey No, Village, and Disbursed Compensation %[cite: 2, 4, 6].
3. **Progress Bar:** High-contrast bar showing percentage complete[cite: 6]:
   ```jsx
   <div className="w-full bg-gov-border h-2 rounded-full overflow-hidden">
     <div className="bg-gov-primary h-full transition-all duration-500" style={{ width: `${comp_pct}%` }}></div>
   </div>
   ```[cite: 6]
4. **Explainable AI Risk Decomposition:** Horizontal SHAP contribution bars (e.g., *Compensation Backlog: 35%*, *Pending Documents: 25%*, *Approval Delay: 20%*)[cite: 2, 3, 6].
5. **Next-Best Action (NBA) Card:** Amber-bordered callout box suggesting actionable administrative steps under the RFCTLARR mandate[cite: 2, 3, 6].

---

### Component 6: Data Tables & Audit Logs (`src/components/common/DataTable.jsx`)
* **Header Row:** `bg-gov-bg/60 border-b border-gov-border text-xs font-mono uppercase text-gov-muted font-semibold px-4 py-3`[cite: 6]
* **Row Styling:** `hover:bg-slate-50/80 transition-colors border-b border-gov-border text-sm px-4 py-3.5`[cite: 6]
* **Monospace Format:** Survey Numbers, ULPINs, Dates, and Monetary Values must use `font-mono`[cite: 2, 6].
* **Status Badges:**
  * `HIGH RISK`: `bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold`[cite: 6]
  * `MEDIUM RISK`: `bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold`[cite: 6]
  * `LOW RISK / APPROVED`: `bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold`[cite: 4, 6]

---

## 5. Frontend Engineering Rules for Alok

1. **No Dark Theme Classes:** Avoid dark mode utility overrides (`dark:bg-slate-900`). The entire portal runs on the light government design tokens[cite: 6].
2. **Zero Empty States:** Never leave a table or map panel blank. Always display a clean empty state card:
   > *"No parcel selected. Click on any georeferenced polygon on the map to load full RFCTLARR status and delay risk attribution."*[cite: 6]
3. **No Artificial Loading Delays:** Ensure fast, optimistic UI updates when users filter by State, District, or Stage[cite: 2, 6].
4. **Mobile & Field Viewport:** Maintain full responsiveness so field verification officers can submit surveys and geotagged photographs on mobile screens without horizontal clipping[cite: 1, 2].

