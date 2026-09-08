# AssetSpan

**Capital expenditure planning for commercial real estate asset managers.**

AssetSpan tracks building asset lifecycles, forecasts replacement costs, and manages capital
project budgets. It is built for the workflow of an asset management team: condition assessments
feed a lifecycle model, the model drives a ten-year funding forecast, scenarios stress-test that
forecast against reserve funding levels, and capital projects execute the adopted plan — with
approval routing, vendor management, and board/lender reporting wrapped around it.

## Tech Stack

| Layer     | Choice                  | Notes                                                                              |
| --------- | ----------------------- | ---------------------------------------------------------------------------------- |
| Framework | Next.js 14 (App Router) | Server components for data-bound pages, client components for interactive analysis |
| Language  | TypeScript (strict)     | `strict` + `noUncheckedIndexedAccess` — array access is checked                    |
| Styling   | Tailwind CSS            | Design tokens for the charcoal/gold financial palette; `figure-*` mono type scale  |
| Charts    | Inline SVG              | Dependency-free; `CHART_COLORS` shared palette ready for a charting library swap   |
| Quality   | ESLint + Prettier       | `next/core-web-vitals` + type-aware rules; Tailwind class sorting                  |

## Financial Modeling Accuracy

The lifecycle model in `src/lib/forecast.ts` follows industry estimating conventions:

- **Condition-adjusted replacement timing.** Assets rated Poor or Critical are forecast before
  nominal end-of-life; the registry carries both the FCA-derived forecast year and quarter.
- **AACE Class 4 cost bands.** Every projection carries a P10–P90 range (−12% / +28% of the P50)
  rather than a single-point estimate, and reactive (run-to-failure) cases widen the band to
  reflect urgency pricing.
- **Escalation.** Planning figures escalate at 3.1% annual construction inflation to the fiscal
  year of expenditure; present-dollar views are available for reserve reconciliation.
- **Reactive premium.** Run-to-failure replacements carry a modeled +32% emergency procurement
  premium, plus a two-year pull-forward for degraded assets.
- **Scenario waterfall.** Funding scenarios walk the requirement chronologically and fund
  high-criticality assets first; unfunded items roll into deferred backlog that compounds at the
  inflation assumption.
- **Depreciation.** Straight-line and declining-balance schedules with salvage value and
  full-year/half-year conventions (see `src/lib/depreciation.ts`).
- **Accounting presentation.** All currency renders through `Intl.NumberFormat` with
  `tabular-nums` for column alignment; negatives use accounting parentheses, e.g. `$(412,000)`.

## CapEx Lifecycle Tracking

The platform covers the full replacement cycle:

1. **Assess** — condition inspection (Excellent → Critical) with a 0–100 score, warranty state,
   and maintenance history per asset.
2. **Forecast** — ten-year replacement projection by category with confidence bands.
3. **Model** — budget scenarios (proactive / deferred / reactive) with funding sliders and
   impact analysis: assets deferred, backlog, funded ratio, annual savings.
4. **Govern** — delegation-of-authority routing with escalation thresholds and SLAs; scenario
   approve/reject workflow with version history.
5. **Execute** — capital projects with budget breakdown, change order log, and a 10% budget
   threshold that escalates approval to the Regional VP.
6. **Procure** — vendor bid tabulation against the engineer's opinion of probable cost (EOPC),
   backed by a vendor database with performance scorecards.
7. **Report** — templated board, IC, and lender packages generated from the live model.

## Getting Started

```bash
npm install
npm run dev        # http://localhost:3000 → /dashboard
```

| Script              | Purpose                                 |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Development server                      |
| `npm run build`     | Production build (all routes prerender) |
| `npm run lint`      | ESLint                                  |
| `npm run typecheck` | `tsc --noEmit`                          |
| `npm run format`    | Prettier write                          |

## Project Structure

```
src/
├── app/                    # App Router pages (dashboard, assets, forecasts, …)
├── components/
│   ├── ui/                 # Button, Badge, DataTable, Modal, charts, skeletons
│   ├── layout/             # Top bar, sidebar, mobile tabs
│   ├── assets/ projects/   # Feature components by domain
│   ├── scenarios/ forecasts/
│   ├── depreciation/ approvals/ vendors/ reports/ dashboard/
└── lib/
    ├── types.ts            # Domain contracts
    ├── forecast.ts         # Lifecycle model + portfolio analytics
    ├── depreciation.ts     # SL / declining-balance schedules
    ├── format.ts           # Intl currency/date formatters
    ├── motion.ts           # Reduced-motion-aware animation helpers
    └── data/               # Seed data (30 assets, 4 projects, 8 vendors, …)
```

## Conventions

- Semantic HTML first: `table`/`th[scope]`/`dl`/`ol` where they apply; ARIA only to fill gaps
  (`aria-sort`, `role="status"`, `aria-live`).
- Every animation ships behind Tailwind `motion-safe:` variants; `prefers-reduced-motion` is
  honored for CSS and JS effects alike.
- Charts are labeled SVG with keyboard-reachable controls and currency-formatted tooltips.

## Status

v0.3.0 — see [CHANGELOG.md](./CHANGELOG.md). Seed data models the "Meridian Office Portfolio"
(3 buildings, 30 assets); shapes match the intended API contract so pages can switch to a live
data source without UI churn.
