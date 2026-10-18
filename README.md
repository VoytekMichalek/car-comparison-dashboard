# Fieldnotes — the family car shortlist

A local-first Australian car-research dashboard for a Queensland family with **one rear-facing restraint plus two forward-facing seats or boosters**, home charging and an A$45,000 purchase target. Exact seat models remain unconfirmed.

The latest research audit was checked **18 October 2026**. It contains **35 configurations across 19 model families**, **1,179 source records** and **23 genuine, attributed vehicle photographs**. The data is curated, not a live inventory or a valuation service. Evidence gaps are part of the catalogue. The [latest model-by-model audit](docs/research/README.md) contains 190 item checks and 35 detailed fit assessments.

## Latest research update

Multi-site review research now adds **76 cohorts from 89 source records** across all 19 families: owner ratings, professional rating indexes and reliability studies remain distinct. Large matching or related cohorts exceed 50 contributions for several established models; newer models and Australian-only powertrains retain explicit gaps. Ratings show country, original scale, actual denominator and applicability. Mixed engines, borrowed professional tests and dealer-service scores are reference-only when a suitable owner denominator cannot be recovered. Cross-site totals are contributions, not distinct people. Reports: [EVs](docs/research/REVIEWS-EVS-2026-10-18.md), [other family cars](docs/research/REVIEWS-FAMILY-CARS-2026-10-18.md).

The new **Charts** page shows annual depreciation scenarios and purchase price versus your weighted overall score, coloured by powertrain. Filters, selected year/variant and personal purchase/resale inputs apply. Annual values have mobile cards; uncertain future values stay visibly labelled estimates. These broad powertrain curves are assumptions, not model-specific resale forecasts.

Every listed model now has a dedicated audit of ten research categories. Child-seat scores separate the tested mixed arrangement, booster buckles, front-seat clearance and access; unknown items have no scoring influence. Older saved fit confirmations need a new check for the rear-facing target, while other notebook data is retained. The Sources section on each car shows the item-by-item findings and unresolved gaps.

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

- **Browse cars:** one card per model family. Select its year/variant to explore the researched configurations. Click a card or its View car details link to open that exact configuration’s full page. Shared filters combine search, multiple powertrains, make, year, new/used stock, seating, fit evidence, budget and favourites. Tick any combination of electric, plug-in hybrid, hybrid, petrol and diesel; All types clears the selection. They also appear on Compare, Ownership costs, Scores, Charts and Notebook; filtered-out selections and notes remain saved. Prices above the selected target appear separately; yellow amounts identify uncertain pricing; true gaps have their own section.
- **Car detail pages:** dedicated URLs restore the selected year/variant on refresh and support browser Back/Forward. Each page contains purchase/setup costs, every annual cost component, ownership totals, resale/depreciation, all eight category scores with explanations, owner reviews, specifications, child-seat fit, warranty/repair risks, sources and private notes. Use the section navigation to jump through the page and Edit costs for this car to enter quotes for that configuration. Child-seat evidence and your own fit confirmations live here; there is no separate Family Fit navigation tab.
- **Compare:** choose up to four configurations directly from dropdowns on Compare. Shared links restore those exact configurations and public filters and scoring weights, including on a static host. Shaded rows identify differences, which are not automatically advantages. An Edit costs link opens the correct configuration in Ownership costs. All eight categories appear at the top, with raw scores where evidence exists and explicit No data / Not applicable labels otherwise. Car photos/names remain sticky inside the table; row labels stay visible during horizontal scrolling. Sources and measurement bases stay with the figures.
- **Ownership costs:** annual energy, insurance estimates/quotes, QLD registration/CTP, servicing, tyres, repair reserves and finance interest. Separate purchase duty/transfer fees, charger/inspection outlays and compounded depreciation scenarios. The table keeps the cost components visible alongside one annual running cost and its matching 10-year running total. Purchase, setup, depreciation, resale and one-off repair scenarios are kept separate from these running budgets. Electricity/fuel is a combined column. It fits the page on desktop and becomes labelled cost grids at narrower widths, without sideways scrolling. Repairs + other shows one compact annual total, with its reserve and finance breakdown available on hover, focus or tap. Each column header has a separate info icon explaining the figures. Column headings stick while the desktop page scrolls. In narrower cost cards, the current car’s heading sticks below the mobile app bar. Click any column heading to sort, then click again to reverse. A 3/5/10-year selector changes the cost period. Inspect manufacturer warranty limits and sourced repair/recall scenarios. Every model has an initial insurance, service and energy budget; 35 configuration-specific tyre budgets scale with annual kilometres. Per-car electricity, fuel, insurance, servicing, tyres, rego, reserve and finance-interest overrides update the cost views and scoring. Yellow values show estimates with ranges and methods, and your quotes replace them.
- **Scores & reviews:** eight category importance sliders, each 1–10. Overall scores and rankings update immediately. Missing categories are excluded; weak evidence reduces their effective weight. Non-applicable electric range does not penalise petrol/diesel cars or hybrids. Evidence coverage stays visible. Running-budget scores use one fixed scale: A$4,000/year or less = 10; A$8,000/year or more = 1; linear between. Filters do not change that scale. Scoped Australian community ratings, sample counts and documented brand support are shown separately. Open each criterion to inspect its raw score, evidence factor and scoring rule.
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

- [Latest model-by-model audit and source reports](docs/research/README.md)
- [Research and data guide](docs/DATA.md)
- [Free static hosting guide](docs/DEPLOYMENT.md)
- [Validation record](docs/VALIDATION.md)
- Image attribution and generation/market caveats: `src/data/images.json` and the dashboard's **Research & photo credits** dialog.
- Font licenses and provenance: `public/fonts/`.

The React/TypeScript UI is in `src/`, JSON research in `src/data/`, calculation and persistence functions in `src/lib.ts`, `src/ownership.ts` and `src/scoring.ts`, and Zod data validation in `src/data.ts`. New data does not require a database migration.

The [deep research audit](docs/DEEP-RESEARCH-2026-10-18.md) records the specification, ownership, review and pricing findings. The catalogue contains 35 configuration snapshots, with individual observations, sample sizes and price bases recorded per entry. The MY23 Ioniq Dynamiq now has one exact NSW asking observation, replacing its earlier valuation proxy. Asking prices are dated evidence, not achieved sale prices or market valuations.

The original Model Y RWD bundles an editable A$1,000/year repair savings estimate and an anonymous A$2,000/year insurance planning budget. These are assumptions, not predicted bills or personalised insurance quotes. Your browser-local inputs take priority.

The [earlier research refresh](docs/CURRENT-RESEARCH-REFRESH-2026-10-18.md) records current-stock exclusions and replacements, maintenance/recall corrections, fuel scenarios and primary-source rechecks. EV, hybrid and petrol/diesel findings are linked from that report.

## Mobile update — 18 October 2026

Phone comparisons show two cars together with sticky photos/names and full-width category labels. With three or four selected cars, the Left car / Right car dropdowns choose which pair to display; the full shortlist remains in shared links and desktop comparisons. Ownership costs use sortable cards with annual and period totals first, followed by every expense. Mobile section jumps, larger touch controls, collapsible assumptions/weights and a readable price/range list replace cramped layouts.

Added separate **2023 MY23 Ioniq 5 Dynamiq RWD and Techniq AWD** configurations (77.4 kWh). The MY23 configurations include matching late-2022 MY23 builds, separately from the earlier 72.6-kWh car. The Dynamiq price is a yellow, low-confidence A$41,900 NSW private asking example excluding charges, with one observation and unconfirmed seller availability. Techniq has one interstate dealer observation, also yellow because the sample is weak. Both retain unconfirmed personal seat fit; the related 2022 BabyDrive trial is not presented as a MY23-specific test.

## Energy-price refresh

New-browser petrol defaults distinguish regular 91 RON (A$2.21/L, RACQ September 2026 Brisbane monthly average) from premium 95 (A$2.38/L, explicitly inferred planning proxy). Each hybrid/PHEV has checked fuel-grade notes, with original-model Sorento PHEV guidance checked against its Australian MY23 manual. Electricity remains illustrative. Existing saved inputs are preserved; use Energy & range to edit inputs or select **Use research defaults** (resets all energy assumptions).

## Petrol/diesel and repair-evidence expansion — 18 October 2026

Added eight configurations across seven families: used/new Subaru Forester, Subaru Outback, Kia Sportage, Hyundai Tucson, Kia Carnival diesel, Mitsubishi Outlander petrol and Nissan X-Trail petrol. The new Forester has two verified interstate A$44,990 drive-away asks; the blocked Queensland listing is excluded. A separate official Brisbane-inclusive offer is A$45,990, subject to stock and delivery by 31 October 2026; it is not a third physical sample. New samples, insurance, service, tyres, repair funds, family-fit limitations and professional reviews retain source and confidence information. Missing owner aggregates remain gaps.

Petrol and diesel use their own fuel rates and four-cylinder QLD duty/registration groups; they have no charger allowance. Diesel defaults to the dated RACQ September Brisbane benchmark rounded to A$2.72/L. Older backups preserve their original settings and show a notice when the diesel rate has not been set.

Original Model Y RWD and Long Range both use independent A$1,000/year repair savings estimates (A$400–2,500 sensitivity budgets). Juniper uses A$700/year (A$300–2,000). The earlier A$1,800 repair default was removed after clarification that the user’s number concerned insurance. No Australian frequency-weighted repair-cost dataset was verified; funds remain yellow savings assumptions. The evidence panel distinguishes German inspection defects, German roadside breakdowns, Australian component offers, warranty and insured collision costs. Eligible Australian ICCU extended cover is reported with VIN-confirmation requirements.

The Ioniq 5 MY23 entries now show a related published three-across test, exact named seats and selected booster-installation limitations; personal fit remains pending. All new related-trim/powertrain tests are labelled separately from exact-configuration tests.

Research audits: [Tesla repairs](docs/TESLA-REPAIR-AUDIT-2026-10-18.md), [comparative repair evidence](docs/COMPARATIVE-REPAIR-AUDIT-2026-10-18.md), [Ioniq child seats](docs/IONIQ-CHILDSEAT-AUDIT-2026-10-18.md), [Subaru](docs/ICE-SUBARU-AUDIT-2026-10-18.md), [Korean petrol/diesel](docs/ICE-KOREAN-AUDIT-2026-10-18.md), [Japanese petrol](docs/ICE-JAPANESE-AUDIT-2026-10-18.md).

## Panel fixes and independent Tesla repair estimate

Top filter panels now use wider control columns, larger insets and touch targets. Powertrain checkboxes allow any combination; old single-type share links remain supported. Comparison selectors use two spacious desktop columns or one phone column, and sticky vehicle headers retain larger text, photos and more space. Mobile score rows put the importance below the category name.

Responsive panels now handle long variant names, qualitative review verdicts, 10.0/10 scores, source references and cost-card totals within their available width. Small-screen cards no longer inherit a180px minimum width for the period-total cell. The narrowest filters stack rather than overlapping their arrows; expanded research panels have consistent padding.

Annual and period totals are labelled running **budgets including repair savings**. A second amount shows costs **before the repair fund**, so contributions are not mistaken for predicted annual repair bills. The ownership budget includes the fund; unused money remains the owner’s cash. Original Tesla insurance remains A$2,000/year. Repair savings are independently set to A$1,000/year original RWD/LR and A$700/year Juniper; personal overrides remain intact.

## Running-budget score correction — 18 October 2026

The former A$2,000–6,500 scoring scale was too low for the full running budgets now shown. It gave the original Model Y RWD about 2/10 despite a middle-of-catalogue budget. The corrected A$4,000–8,000 scale gives its default A$6,015.15/year budget **5.5/10**. That includes A$1,000 repair savings; costs before that fund are A$5,015.15/year. No cost estimates were changed for this correction.
