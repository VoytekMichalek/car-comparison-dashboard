# Fieldnotes — the family car shortlist

A local-first Australian car-research dashboard for a Queensland family with three child seats, home charging and an A$45,000 purchase target.

The initial research snapshot was checked **18 October 2026**. It contains **25 configurations across 12 model families**, **324 source records** and **17 genuine, attributed vehicle photographs**. The data is curated, not a live inventory or a valuation service. Evidence gaps are part of the catalogue.

## Run locally

Requires Node.js **22.12 or later** (tested with 22.23.3) and npm.

```bash
npm ci
npm run dev
```

Open the Local URL printed by Vite, normally **http://localhost:5173/**. Stop the server with Ctrl+C. The development script binds to all interfaces so the dashboard can also be checked on a phone on the same network. To restrict it to this computer:

```bash
npm run dev -- --host 127.0.0.1
```

## Use it

- **Browse cars:** one card per model family. Select its year/variant to explore the researched configurations. Click a card or its View car details link to open that exact configuration’s full page. Filters combine search, powertrain, year, seating, fit evidence, budget and favourites. Prices above the selected target appear separately; yellow amounts identify uncertain pricing; true gaps have their own section.
- **Car detail pages:** dedicated URLs restore the selected year/variant on refresh and support browser Back/Forward. Each page contains purchase/setup costs, every annual cost component, ownership totals, resale/depreciation, all eight category scores with explanations, owner reviews, specifications, child-seat fit, warranty/repair risks, sources and private notes. Use the section navigation to jump through the page and Edit costs for this car to enter quotes for that configuration. Child-seat evidence and your own fit confirmations live here; there is no separate Family Fit navigation tab.
- **Compare:** choose up to four configurations directly from dropdowns on Compare. Shared links restore those exact configurations and public filters and scoring weights, including on a static host. Shaded rows identify differences, which are not automatically advantages. An Edit costs link opens the correct configuration in Ownership costs. All eight category scores appear at the top. Car photos/names remain sticky inside the table; row labels stay visible during horizontal scrolling. Sources and measurement bases stay with the figures.
- **Ownership costs:** annual energy, insurance estimates/quotes, QLD registration/CTP, servicing, tyres, repair reserves and finance interest. Separate purchase duty/transfer fees, charger/inspection outlays and compounded depreciation scenarios. The table keeps the cost components visible alongside one annual running cost and its matching 10-year running total. Purchase, setup, depreciation, resale and one-off repair scenarios are kept separate from these running budgets. Electricity/fuel is a combined column. It fits the page on desktop and becomes labelled cost grids at narrower widths, without sideways scrolling. Repairs + other shows one compact annual total, with its reserve and finance breakdown available on hover, focus or tap. Each column header has a separate info icon explaining the figures. Click any column heading to sort, then click again to reverse. A 3/5/10-year selector changes the cost period. Inspect manufacturer warranty limits and 39 sourced repair/recall scenarios. Every model has an initial insurance, service and energy budget; 25 configuration-specific tyre-class budgets scale with annual kilometres. Per-car electricity, fuel, insurance, servicing, tyres, rego, reserve and finance-interest overrides update the cost views and scoring. Yellow values show estimates with ranges and methods, and your quotes replace them.
- **Scores & reviews:** eight category importance sliders, each 1–10. Overall scores and rankings update immediately. Scoped Australian community ratings, sample counts and documented brand support are shown separately. Open each criterion to inspect its raw score, evidence factor and scoring rule.
- **Notebook:** favourites, individual sale listings, seat models and private notes. Export/import a versioned JSON backup to move them between devices.

All photographs, fonts and vehicle data are bundled locally. Browsing, comparing and note-taking do not call third-party APIs. Following a source or sale-listing link opens that external website.

## Personal data

Your notebook is stored under `fieldnotes-family-cars:v1` in this browser's local storage. It does not sync between devices. Changing the hostname or port uses a different browser-storage origin. Clearing site data also removes the local notebook, so export a backup when it matters.

Comparison URLs never include notebook entries, personal notes, child-seat models, fit confirmations or cost settings. Weights are shareable; local quotes and fit confirmations can make the recipient’s score differ. The research bundle is public if you publish the static site. There are no accounts, tracking, backend services or database credentials.

If storage cannot be read, Fieldnotes preserves existing stored data and starts a temporary session with a visible notice. If saving fails, changes remain in memory and can still be exported. Importing a valid backup requires an in-page review before replacing the notebook. Invalid backups leave it untouched.

## Verify / build

```bash
npm test
npm run validate:data
npm run build
npm run preview
```

The build runs TypeScript and creates `dist/`. Vite preview serves that production build, usually at **http://localhost:4173/**. The automated tests cover research integrity, filtering, public URL state, comparison limits, cost calculations and backup/storage failure scenarios. The completed desktop/mobile walkthrough is recorded in [docs/VALIDATION.md](docs/VALIDATION.md).

## Maintain and publish

- [Research and data guide](docs/DATA.md)
- [Free static hosting guide](docs/DEPLOYMENT.md)
- [Validation record](docs/VALIDATION.md)
- Image attribution and generation/market caveats: `src/data/images.json` and the dashboard's **Research & photo credits** dialog.
- Font licenses and provenance: `public/fonts/`.

The React/TypeScript UI is in `src/`, JSON research in `src/data/`, calculation and persistence functions in `src/lib.ts`, `src/ownership.ts` and `src/scoring.ts`, and Zod data validation in `src/data.ts`. New data does not require a database migration.

The [18 October research audit](docs/RESEARCH-AUDIT-2026-10-18.md) records the pricing corrections, sample counts, representative budgets and remaining evidence limits.

The original Model Y RWD bundles an editable A$1,800/year repair reserve and an anonymous A$1,800/year insurance planning budget. These are assumptions, not predicted bills or personalised insurance quotes. Your browser-local inputs take priority.
