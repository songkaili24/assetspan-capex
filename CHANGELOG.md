# Changelog

All notable changes to AssetSpan are documented here. Versions follow semver;
dates are UTC.

## v0.3.0 — 2026-04-18

### Added

- **Depreciation configuration** (`/depreciation`): straight-line and declining-balance methods
  with declining rate, salvage %, and full-year/half-year convention defaults per asset class;
  live book-value preview chart, year-by-year schedule table, and straight-line reference curve.
- **Approval workflow configuration** (`/approvals`): role-based routing rules by request type
  and amount band with editable SLAs, the delegation-of-authority escalation ladder, and a route
  simulator whose approval chain animates stage by stage.
- **Vendor database** (`/vendors`): qualified contractor directory with performance scorecards
  (quality/schedule/safety on a 0–5 scale), win rate, lifetime awarded value, bonding capacity,
  bid history, and contact management; detail drawer with sortable directory filters.
- **Micro-interactions**: scenario slider now drives a real-time funding-vs-requirement chart
  with eased number interpolation; forecast chart gained hover crosshairs with P10/P50/P90
  tooltips; skeleton loaders appear during scenario waterfalls; condition badges transition
  color on rating changes; approval steppers animate as requests progress.
- **Form validation & edge cases**: scenario category allocations must sum to 100% with no
  negative shares; change orders exceeding 10% of the original project budget require Regional
  VP escalation acknowledgment; condition downgrades require a written justification (≥20
  characters) and Critical ratings require attached photo evidence.
- `prefers-reduced-motion` is respected across all animations (CSS `motion-safe` variants plus
  JS feature detection for number interpolation).

### Changed

- Project detail actions extracted to a client component to host the change-order flow.
- Scenario allocation section upgraded from static weights to an editable, validated table.

## v0.2.0 — 2026-03-21

### Added

- **Portfolio dashboard** (`/dashboard`): health score with FCI, deferred backlog, and funded
  ratio; KPI tiles; 24-month replacements runway; condition-by-category chart; budget status
  (allocated / invoiced / committed / forecast-at-completion); condition × criticality risk
  matrix; quick actions.
- **Asset registry** (`/assets`): full data table with client-side sorting on all columns,
  search across ID/name/location, category/condition/building/remaining-life filters, CSV
  export, and an Add Asset form computing remaining life and forecast year.
- **Asset detail** (`/assets/[id]`): condition header, lifecycle progress, depreciation
  economics (cost basis, accumulated depreciation, book value), maintenance history, linked
  projects, and Update Condition / Schedule Replacement / View Depreciation actions with a
  straight-line book-value modal.
- **Lifecycle forecasts** (`/forecasts`): ten-year projection with AACE Class 4 P10–P90 bands
  and a 3.1% inflation toggle, category expenditure breakdown, sortable end-of-life schedule,
  and a proactive-vs-reactive comparison (+32% emergency premium).
- **Budget scenarios** (`/scenarios`): funding constraint slider (55–140% of baseline) with a
  computed waterfall — deferred assets, backlog, funded ratio, annual savings — plus scenario
  comparison, version history, and approve/reject workflow.
- **Capital projects** (`/projects`, `/projects/[id]`): filterable project board and detail
  pages with scope, budget breakdown, change order log, bid comparison, timeline, documents,
  and progress photos.
- **Reports** (`/reports`): template picker, section/date-range builder with live preview,
  generation history, and scheduled automation.
- Data foundation rebuilt: 30 assets across five categories and three buildings, four capital
  projects in mixed statuses, vendor bids with EOPC variance, and the forecast engine
  (`src/lib/forecast.ts`).

### Changed

- `DataTable` gained optional per-column sorting with `aria-sort` support.
- Root route now redirects to `/dashboard`.

## v0.1.0 — 2026-02-14

### Added

- Next.js 14 App Router foundation with TypeScript strict mode (`noUncheckedIndexedAccess`),
  Tailwind CSS design system (charcoal/gold financial palette, `figure-*` mono type scale),
  ESLint, and Prettier with Tailwind class sorting.
- Reusable component library: Button (primary/secondary/outline/calculation), condition badges,
  AssetCard with lifecycle progress, DataTable with mono figure columns, BudgetProgressBar with
  85%/100% threshold tones, FinancialChart chrome, ScenarioToggle, TimelineView, Modal,
  ExportMenu, and StatTile.
- Navigation shell: dark top bar with portfolio and fiscal-year selectors, FY budget status,
  and reports menu; desktop sidebar rail; mobile bottom tab bar.
- Seed data model for the Meridian Office Portfolio with realistic capital expenditure
  terminology throughout, and Intl-based financial formatters including accounting negatives.
