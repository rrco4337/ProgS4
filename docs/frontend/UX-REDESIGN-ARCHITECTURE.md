# UX/UI Redesign Architecture Pack

Date: 2026-03-17  
Scope: Full product redesign (information architecture, workflows, UI system, implementation blueprint)

---

## 1) Product Architecture (Target IA)

### 1.1 Navigation Model

Use a persistent **application shell**:
- Left **sidebar** (primary navigation)
- Top **utility bar** (global search, quick actions, alerts, profile)
- Main **content area** with breadcrumb + page actions

### 1.2 Sidebar Structure

1. **Dashboard**
2. **Production**
   - Lots
   - Growth Tracking
   - Feed & Weight
3. **Incubation**
   - Incubation Batches
   - Auto-Hatch Monitor
   - Hatch Events
4. **Health**
   - Mortalities
   - Incidents
5. **Eggs & Stock**
   - Egg Collection
   - Stock Ledger
   - Transfers
6. **Sales**
   - Egg Sales
   - Revenue Summary
7. **Reports**
   - Production KPIs
   - Health & Mortality
   - Incubation Performance
   - Sales & Margin
8. **Settings**
   - Races
   - Growth Models
   - Roles & Permissions
   - System Jobs

### 1.3 Top Bar Structure

- Global search (`lots, races, batches, sales`)
- Context selector (`site/farm`, optional)
- Date shortcut (`today`, `7d`, `30d`, custom)
- Alert center (high-priority issues)
- Quick create (`New Lot`, `New Mortality`, `New Collection`, `New Sale`)

---

## 2) Route Map (Angular)

```text
/
├─ /dashboard
├─ /production
│  ├─ /production/lots
│  ├─ /production/lots/new
│  ├─ /production/lots/:id
│  ├─ /production/lots/:id/edit
│  ├─ /production/growth
│  └─ /production/feed-weight
├─ /incubation
│  ├─ /incubation/batches
│  ├─ /incubation/batches/new
│  ├─ /incubation/batches/:id
│  ├─ /incubation/hatch-events
│  └─ /incubation/auto-hatch-monitor
├─ /health
│  ├─ /health/mortalities
│  └─ /health/incidents
├─ /eggs
│  ├─ /eggs/collection
│  ├─ /eggs/stock-ledger
│  └─ /eggs/transfers
├─ /sales
│  ├─ /sales/egg-sales
│  └─ /sales/revenue
├─ /reports
│  ├─ /reports/production
│  ├─ /reports/health
│  ├─ /reports/incubation
│  └─ /reports/sales
└─ /settings
   ├─ /settings/races
   ├─ /settings/races/:id
   ├─ /settings/growth-models
   ├─ /settings/roles
   └─ /settings/system-jobs
```

---

## 3) Screen Inventory (Purpose + UI Layout Contract)

## 3.1 Dashboard
**Purpose**: Operational command center for daily decisions.  
**Layout**:
- Row 1: KPI cards (active lots, mortality rate, eggs stock, pending hatches, today sales)
- Row 2: Trend charts (growth deviation, mortality trend, hatch success)
- Row 3: Attention queue (critical alerts) + Today actions checklist

## 3.2 Lots List (`/production/lots`)
**Purpose**: Find, compare, and act on lots quickly.  
**Layout**:
- Header actions: `New Lot`, export, saved views
- Filter bar: race, status, age, date range, anomalies
- Main table: sortable columns + bulk actions
- Right drawer: quick lot preview

## 3.3 Lot Detail (`/production/lots/:id`)
**Purpose**: 360° visibility of one lot lifecycle.  
**Layout**:
- Top summary strip: status, age, current count, expected/actual weight
- Tabbed content:
  1. Overview
  2. Growth
  3. Mortalities
  4. Eggs
  5. Incubation links
  6. Financial summary
- Right action rail: record mortality, add collection, create sale, open report

## 3.4 Create/Edit Lot (`/production/lots/new`, `/edit`)
**Purpose**: Reduce lot setup errors.  
**Layout**:
- Stepper form:
  1. Identity (name/code/site)
  2. Population (initial count/date)
  3. Race & model
  4. Review & confirm
- Live validation + projected performance preview

## 3.5 Growth Tracking (`/production/growth`)
**Purpose**: Monitor expected vs actual growth.  
**Layout**:
- Multi-lot comparison table
- Variance chart by week
- Highlight deviations above threshold
- Drill-down to lot detail

## 3.6 Mortalities (`/health/mortalities`)
**Purpose**: Fast recording and anomaly detection.  
**Layout**:
- Quick entry panel (lot, date, count, reason)
- Event table (chronological + grouped)
- Anomaly widget (spikes vs baseline)

## 3.7 Egg Collection (`/eggs/collection`)
**Purpose**: Daily collection capture with low friction.  
**Layout**:
- Date-first workflow
- Grid entry by lot
- Validation panel (stock effect preview)
- Save and continue mode for operators

## 3.8 Stock Ledger (`/eggs/stock-ledger`)
**Purpose**: Trustable stock history.  
**Layout**:
- Current stock card + alerts
- Inflow/outflow timeline table
- Reconciliation badge and discrepancy indicators

## 3.9 Incubation Batches (`/incubation/batches`)
**Purpose**: Follow incubation state transitions.  
**Layout**:
- Kanban by stage: setup, active, due soon, hatched, failed
- KPI strip: active batches, due today, hatch rate
- Batch quick actions: hatch now, mark issue, open detail

## 3.10 Batch Detail (`/incubation/batches/:id`)
**Purpose**: Control one incubation run.  
**Layout**:
- Header: eggs count, stage, expected hatch date
- Timeline: milestones/events
- Performance block: success/failure metrics
- Linked resulting lot (if hatched)

## 3.11 Auto-Hatch Monitor (`/incubation/auto-hatch-monitor`)
**Purpose**: Observe and control scheduled automation.  
**Layout**:
- Last run status card
- Next run countdown
- Execution logs table
- Manual trigger action (guarded)

## 3.12 Egg Sales (`/sales/egg-sales`)
**Purpose**: Register and track sales operations.  
**Layout**:
- Sales table (date, lot, qty, price, channel, payment status)
- Inline totals and period summary
- Action: `New Sale`

## 3.13 Sale Entry (`/sales/egg-sales/new`)
**Purpose**: Prevent stock or pricing errors during sale.  
**Layout**:
- POS-like compact form
- Live stock availability check
- Price/total calculator
- Confirm and print/export receipt option

## 3.14 Reports (`/reports/*`)
**Purpose**: Strategic analysis and planning.  
**Layout**:
- Template pages with shared filter bar
- KPI summary + detailed chart/table pair
- Export (`CSV`, `XLSX`, `PDF`)

## 3.15 Settings: Races & Growth Models (`/settings/races`, `/settings/growth-models`)
**Purpose**: Maintain biological/economic reference data.  
**Layout**:
- Race list and detail
- Growth model editor (weekly matrix + curve preview)
- Model versioning with effective dates

## 3.16 Settings: Roles & System Jobs (`/settings/roles`, `/settings/system-jobs`)
**Purpose**: Governance and reliability.  
**Layout**:
- Role-permission matrix
- Job status panel (auto-hatch, backups, imports)

---

## 4) Main User Flows (Task-First)

## 4.1 Daily Operator Flow
1. Open dashboard and process alert queue.
2. Record mortalities and egg collection.
3. Validate stock and pending incubation actions.
4. Close shift with summary confirmation.

## 4.2 New Lot Creation Flow
1. Start from quick action `New Lot`.
2. Complete stepper form.
3. System validates race growth model compatibility.
4. Confirm and redirect to lot detail with suggested next actions.

## 4.3 Incubation to Hatch Flow
1. Create incubation batch.
2. Monitor due status and alerts.
3. Trigger hatch (manual or automatic job).
4. Auto-create linked lot + update dashboard KPIs.

## 4.4 Sales Flow
1. Open sale form.
2. Select lot and quantity.
3. System checks available stock.
4. Confirm sale and write movement in stock ledger.

## 4.5 Exception Flow (Mortality Spike)
1. Alert raised on dashboard.
2. Open lot anomaly context.
3. Inspect mortality events and trends.
4. Create incident + assign action + monitor outcome.

---

## 5) Design System Specification

## 5.1 Foundational Tokens
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32
- Radius: 8 (inputs/cards), 12 (modals), 999 (chips)
- Elevation: 3 levels only (base, raised, overlay)
- Motion: subtle (`150ms`, `220ms`) with no decorative animation

## 5.2 Color Strategy (Semantic First)
- Neutral grayscale for surfaces and text hierarchy
- Primary accent for core actions and active states
- Semantic status only:
  - Success (positive completion)
  - Warning (attention)
  - Critical (risk/blocker)
  - Info (context)

## 5.3 Typography
- Single modern sans-serif family
- Type scale:
  - Display/Page title
  - Section heading
  - Card metric
  - Body
  - Caption/meta
- Numeric alignment for KPI/table columns

## 5.4 Core Components
- AppShell, SidebarNav, TopBar, Breadcrumbs
- KPI cards, status chips, badges
- Smart table (sticky header, sorting, filters, pagination)
- Form primitives (field, select, date, quantity, validation)
- Drawer + modal patterns
- Timeline, chart container, empty state, skeleton loader

## 5.5 Interaction Rules
- Every page must expose one primary action.
- Inline validations for all critical forms.
- Bulk actions always require preview + confirmation.
- Destructive actions always require intent check.
- Keep error states actionable (what failed + what to do).

---

## 6) UX Logic Improvements (High Impact)

1. **From module CRUD to guided workflows**
   - Users perform tasks, not table edits.

2. **Context persistence**
   - Keep site/date/filter context across pages.

3. **Progressive disclosure**
   - Show essentials first, details on tabs/drawers.

4. **Operational prioritization**
   - Alert center with severity + due date + owner.

5. **Data trust and auditability**
   - Last updated, source event, job logs visible in context.

6. **Input efficiency for repetitive tasks**
   - Quick-entry forms, keyboard-friendly navigation.

7. **Terminology unification**
   - Single naming standard for lot states, stock movements, hatch statuses.

---

## 7) Angular Implementation Blueprint

## 7.1 Feature Module Structure (Standalone-compatible)

```text
frontend/src/app/
├─ core/
│  ├─ layout/ (app-shell, sidebar, topbar)
│  ├─ guards/
│  ├─ interceptors/
│  └─ services/ (session, alerts, global-filters)
├─ shared/
│  ├─ ui/ (table, card, form controls, chips, modal)
│  ├─ charts/
│  └─ utils/
├─ features/
│  ├─ dashboard/
│  ├─ production/
│  │  ├─ lots/
│  │  ├─ growth/
│  │  └─ feed-weight/
│  ├─ incubation/
│  ├─ health/
│  ├─ eggs/
│  ├─ sales/
│  ├─ reports/
│  └─ settings/
└─ app.routes.ts
```

## 7.2 Backend Endpoint Mapping to New UX

- `lots`, `lots/:id`, `lots/:id/poids`, `lots/situation-globale` → Production + Dashboard
- `races`, `races/:id/croissance`, `croissance/*` → Settings + Growth Tracking
- `mortalites/*` → Health
- `oeufs/*` → Eggs & Stock
- `incubations/*`, `incubations/auto-eclosion/*` → Incubation + System Jobs
- `ventes-oeufs/*` → Sales

## 7.3 Delivery Phases

### Phase 1 (Foundation)
- New app shell, sidebar, topbar, shared table/forms, dashboard v1

### Phase 2 (Core Ops)
- Lots list/detail, mortality quick entry, egg collection, stock ledger

### Phase 3 (Advanced Ops)
- Incubation kanban/detail, auto-hatch monitor, sales flow

### Phase 4 (Optimization)
- Reports suite, race/model editors, role/job settings, UX polish

---

## 8) Acceptance Criteria for Redesign Success

- Users complete daily operations with fewer navigation hops.
- Critical events are visible within 5 seconds from dashboard load.
- Lot detail supports all core actions without returning to list pages.
- Data entry forms show inline validation before submit.
- All modules follow same table/filter/form interaction pattern.
- Automation status (auto-hatch) is transparent and manually controllable.

---

## 9) Immediate Next Build Tasks (Execution-Ready)

1. Implement `AppShellComponent` with sidebar + topbar.
2. Replace current flat route table with grouped route tree.
3. Introduce `SharedDataTableComponent` and `FilterBarComponent`.
4. Build `DashboardPage` and `LotsListPage` using new shell.
5. Add `LotDetailPage` tabs with existing APIs.
6. Add `AutoHatchMonitorPage` bound to current backend status endpoints.

This document is intended as the direct UX + architecture handoff for implementation.