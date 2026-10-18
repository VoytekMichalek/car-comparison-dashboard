# Research and data maintenance

## What is covered

The snapshot checked 18 October 2026 covers Tesla Model Y, BYD Atto 3, Kia EV6, Kia EV5, Hyundai Ioniq 5, Zeekr 7X, Mitsubishi Outlander PHEV, BYD Sealion 6, Nissan X-Trail e-Power, Toyota RAV4 Hybrid, Toyota Kluger Hybrid and Kia Sorento HEV/PHEV.

There are 25 configurations, grouping unchanged Australian-delivered years. Coverage is deliberately incomplete at the trim level. For example, older ZL Outlander PHEVs, EV6 facelifts, 77.4 kWh Ioniq 5s and several Sorento configurations remain documented research gaps. Do not apply the populated configurations' specifications to those cars.

Late-2023 Model Y entries distinguish the Australian original body from the later Juniper refresh. The precise Australian suspension cutover and VIN-specific hardware are unverified. The October 2023 Chinese dashboard/ambient-light announcement does not establish Australian equipment. Build, compliance and delivery dates can differ.

## Files and contracts

- `ev-vehicles.json` / `hybrid-vehicles.json`: configuration arrays matching `Vehicle` in `src/types.ts`.
- `ev-sources.json` / `hybrid-sources.json`: source registry, including publisher, URL, kind and actual checked date.
- `ev-prices.json` / `hybrid-prices.json`: separate price observations linked by stable `vehicleId`.
- `images.json`: asset paths, generation, market/trim caveats, author, reuse license and original page.

`src/data.ts` validates the structure with Zod. `validateReferences()` and the data tests check ID uniqueness, references, families, units and local asset files.

Keep configuration IDs stable: shared comparison links and private notebooks refer to them. If new evidence changes which years share a specification, preserve the existing identity where possible and add a new entry for the materially different configuration. The v1 backup importer rejects unknown vehicle IDs rather than silently losing notes.

## Add or refresh a configuration

1. Read the Australian manufacturer brochure/manual for that generation, drivetrain and model year. Preserve the actual source URL; current model pages can change under old URLs. Record dealer-hosted copies of manufacturer documents as such.
2. Read the applicable ANCAP report. Store the assessment year and build/variant applicability, not just stars. Newer variants do not automatically inherit ratings. Restraint-installation assessments are not simultaneous three-across tests.
3. Find independent Australian family tests. Record the exact seats, facing directions, trim, generation and any buckle/access restrictions. `tested-three` and `tested-multirow` require evidence for the populated configuration; reference tests of another trim stay labelled as context.
4. Check manufacturer warranty/service terms and official Australian recall records. Distinguish original warranty from current new-car terms and VIN-specific coverage. Warranty eligibility may depend on servicing, ownership and use.
5. Capture asking-price evidence, condition, fee basis, location and odometer. Record the actual observed sample count and date. Indexed or ambiguous offers must retain their limitations; use `basis: "unverified"` when charges or applicability cannot be established. Do not call a planning band an observed market range. Explicit best estimates use `kind: "estimate"`, `sampleCount: 0`, confidence and a calculation basis; the original observed anchors remain cited.
6. Add concise paraphrased strengths, compromises, year changes, inspection questions and explicit remaining gaps. Attach source IDs to each fact and relevant commentary group.
7. Add a correctly licensed photograph for the pictured generation, or retain the labelled photo fallback. Save it locally and preserve credit/license/source metadata. Overseas reference cars must say so. For a new generation, extend `imageFor()` instead of reusing an inaccurate image.
8. Run `npm run validate:data`, `npm test` and `npm run build`; check the affected detail views, comparison and costs.

## Facts, units and uncertainty

Each numerical `Fact` carries `value`, `unit`, `basis` and `sourceIds`. Missing values are `null`, never zero or a guessed average. Explain the gap in `basis` and the configuration's `gaps` list. Required units are km, kWh, kW, L, mm, kg, kWh/100km and L/100km.

- **Range:** distinguish WLTP, NEDC and observed results. Record wheel/trim conditions. PHEV range is electric-only; a non-plug-in hybrid has no equivalent electric-range claim here. The range-label helper uses the affirmative standard, not a later phrase such as “not WLTP”.
- **Consumption:** HEV consumption is combined petrol use. PHEV `consumption` is electrical use; `depletedConsumption` is petrol use after depletion. Never substitute a low, weighted PHEV fuel figure for depleted consumption.
- **Boot:** record the occupied/folded-row arrangement and measurement method. Tesla's non-VDA cargo claim is not directly equivalent to VDA litre figures, and frunk/underfloor inclusion must be clear.
- **Charging:** separate the vehicle's peak from the charger's rating. A quoted 10–80% time is conditional and is not guaranteed by peak power alone. Record connector type, AC phase conditions and any missing applicability evidence.
- **Fit:** dimensions, seat count and anchors alone do not demonstrate a safe three-seat combination. Booster buckle access deserves separate attention. Personal confirmations are private user records, not edits to published evidence.

## Cost estimates

Default assumptions are illustrative: 15,000 km/year, A$0.30/kWh home, A$0.65/kWh public, A$1.90/L petrol, 90% home charging, 80% PHEV electric distance and 10% charging losses where applicable. They are not current tariff research. Users can edit and export them.

The calculator supports zero-distance and 0%/100% PHEV electric-distance scenarios. The strict fact calculator withholds results when required data is missing. The separate energy-budget layer uses explicit sourced class/model proxies to populate planning totals, without changing the verified specification. Energy costs exclude insurance, depreciation, servicing, finance and registration; the full ownership calculator adds them. Comparisons retain the source measurement basis, including observed versus rated consumption.

## Refresh dates

Only mark a source checked after opening or inspecting it. Keep observation dates separate from a page's publication/model year. The present app-wide check date and backup filename are explicit constants: update them, the dated documentation and affected tests when refreshing the research. Old vehicle facts do not become freshly verified just because a new listing was checked.

This version updates through committed JSON edits and rebuilds. There is no automated scraper, runtime API or scheduled refresh.

## Ownership costs and review scoring

Additional research lives in the `*-ownership.json`, `*-ownership-sources.json`, `*-reviews.json`, `*-review-sources.json`, `qld-costs.json`, `qld-cost-sources.json`, `brands.json` and `brand-sources.json` files. Dates, service eligibility, original versus current warranty terms, repair quote inclusions and owner-review scope must remain explicit. Never infer a model’s failure rate from forum posts, recall counts or national origin.

QLD registration uses actual cylinder class: BEVs and the three-cylinder X-Trail e-Power share the lower group. Other populated hybrids use four-cylinder fees. CTP is added once; an owner’s full registration override replaces registration plus CTP. Duty above $100,000 uses the higher rate for the entire value, not just the excess. Dutiable value is transaction-specific; an asking-price illustration is not an official assessment. Drive-away duty/transfer costs are not added again.

Insurance and service start with explicit model/class estimates and low/high sensitivity ranges. `insurance-estimates.json`, `budget-benchmarks.json` and `budget-estimate-sources.json` record the primary anchors and all planning adjustments. The insurance anchors include a published Brisbane reference profile; they are not household quotes. Anonymous public planning defaults are stored in `insurance-defaults.json`; the original Tesla Model Y RWD starts at A$1,800/year, with yellow uncertainty and an illustrative sensitivity range. These are not personal quotes. New per-car or shared browser-local inputs take priority. Service budgets explain age/plan eligibility and unknowns. Tyres use the configuration-specific set-price and assumed-life ranges in `tyre-estimates.json`, scaled by annual kilometres; repair reserves use the per-configuration defaults described below. Both are editable allowances, not expected annual bills. A home charger starts at A$2,050 for plug-ins and an inspection at A$385; users can set them to zero. Finance inputs are annual interest/fees, excluding principal. Purchase costs and depreciation remain separate from annual operating subtotals.

Electrical `Fact.energyBasis` is `wall`, `battery` or `unspecified`. WLTP mains consumption already includes charging losses. Extra assumed losses apply once to battery-side facts or explicitly labelled battery-side planning proxies. The original Tesla observed figure has an unverified metering boundary. BYD’s PHEV brochure values do not establish electric-distance versus weighted consumption. The original facts remain unverified for calculation purposes. Separate `OwnershipInfo.energyEstimate` / `depletedEstimate` ranges provide low-confidence planning proxies; owner-entered budgets take priority.

`src/scoring.ts` holds the eight public scoring rubrics and evidence factors. Category weights are integers 1–10; defaults are seating10, purchase9, running8, boot7, electric-range6, safety8, community-reviews6 and brand-support6. Adjusted score = `5 + (raw - 5) * evidenceFactor`; the overall score is its importance-weighted mean. Missing evidence is neutral5 and reduces displayed coverage. This is an editorial decision tool, not an objective safety/reliability model.

Community scores use the published /5 aggregate, count and scope. Their evidence factor is capped `n/(n+20)` times the explicit scope factor in `src/reviewScope.ts`. A single GT-Line delivery review barely influences an EV5 Air assessment; original Atto3, early Ioniq5 and XA50 RAV4 ratings do not score incompatible newer generations. Brand support uses documented Australian service access, separately from owner sentiment and mechanical failure claims. ANCAP protocol years remain visible.

Yellow styling identifies automatic estimates, uncertain purchase amounts and repair proxies; each is backed by a range or explicit basis. Actual quote inputs take priority, including zero. Future resale is a scenario, using purchase × (1 − annual depreciation rate)^years, with 8–25% BEV, 7–20% PHEV and 5–16% HEV sensitivity rates. These are assumptions informed by resale evidence, not published forecasts. Running-cost score confidence is limited by the weakest of its four core cost inputs, so filled-in estimates do not become certain evidence.

Shared URLs include weights, while cost quotes and personal fit checks remain private. Those local inputs can change a recipient’s score. The optional ownership/weight sections extend v1 notebook backups without invalidating original v1 exports.

## Ownership display and sorting

The default period is 10 years. Annual running cost is the sum of recurring energy, insurance, servicing, tyres, registration/CTP, repair reserve and finance interest/fees. The period running total is that annual budget × selected years; purchase price, setup, depreciation, resale and one-off repair scenarios do not affect either figure. The vehicle detail page presents purchase/setup and resale separately, with an explicitly labelled total ownership scenario that combines the running total + purchase − resale + upfront fees/setup + repair-scenario spending above the accumulated reserve. Future rates remain in today’s dollars, without an inflation forecast. The table keeps the component costs visible, including a combined electricity/fuel column, one annual running number and its matching period running total. It has no horizontal scrolling; container queries switch narrower layouts to labelled grids. All headings sort by their underlying numeric value (or vehicle name), toggle direction, and expose aria-sort.

## Per-car budgets

`OwnershipSettings.vehicleOverrides` accepts separate electricity/petrol, tyres, repairReserve and financeInterestAnnual amounts as well as earlier quote fields. Blank/null uses evidence-derived defaults; zero is a valid override. Legacy total-energy overrides remain valid and use the calculated electric/fuel mix for their displayed split; editing a split field clears that legacy total. Energy is counted once in annual totals. Retired roadside fields in older saved settings or backups are ignored and stripped during validation; all other saved quotes remain intact. The Energy view, vehicle details, ownership table and Compare all use the same personal ownership estimate.

Tyre budgeting defaults to `tyreMode: vehicle`. Older shared `tyres` amounts are preserved, and can be activated by explicitly selecting `shared`; a per-car tyre budget takes priority. Tyre-class assignments, fitted-set costs and mileage assumptions are low-confidence planning proxies anchored to cited Australian retail catalogs, not asserted OEM fitments or guaranteed life.

Compare has four native grouped dropdowns for direct add/replace/remove, prevents duplicate configuration IDs and preserves the four-car cap. Public URLs retain selections. Editing costs opens the exact configuration, while all personal amounts remain local.

## Detailed pricing and road-test audit — 18 October 2026

Price snapshots now support `point` and `observations`. Each observation records the amount, fee basis, model year, odometer, location, original URL, source ID, checked date and applicability note. Count distinct physical cars, using VIN/stock to remove cross-post duplicates; a manufacturer list price is not a stock sample. Exclude sold cars, expired promotions, incorrect batteries, drivetrains and seat counts. First-registration ambiguity stays an estimate with zero counted cars.

`point` is the representative purchase budget used by ownership, purchase scoring and the price/range chart. Usually this is the included sample median; explain any local-market anchor instead of a median. For an estimate without a point the midpoint is used. Personal purchase overrides take priority. The browse price band and budget filter still expose the lowest included advertised amount; these small samples are not market confidence intervals. A mixed-fee sample is highlighted yellow and its purchase-score evidence factor is reduced. Confirm fees on an actual quote before relying on the total.

Professional tests are in `professional-reviews.json` with their sources in `professional-review-sources.json`. Keep test date, exact tested configuration, local/overseas scope and original published verdict. Empty `vehicleIds` means a related-configuration reference only. Do not invent numeric ratings from qualitative labels or fold professional scores into the community aggregate. Historical warranty, price and equipment comments are not current manufacturer facts. Professional verdicts are shown separately from the importance-weighted score.

`serviceByVehicle` overrides family service budgets for documented schedule changes. For example, the MY26 X-Trail FWD uses a separate allowance around its five A$399 eligible visits and uncertain post-cap costs, rather than the older 10,000-km schedule. Personal service quotes still take priority.

## Repair reserve defaults

`repair-reserve-estimates.json` supplies an annual savings point and broad low/high range for each configuration, with source references and age/warranty assumptions. All are low-confidence analyst budgets, not observed annual repair averages or model failure rates. They exclude servicing, tyres and insured collision losses; large battery replacement is a separate stress case. A published parts/fitted offer establishes only the cost and scope of that job, not an annual probability.

Precedence: per-car repair allowance (including zero), then an explicitly selected shared repair budget, then the configuration estimate. `repairMode` defaults to `vehicle`. Existing version-1 backups with a non-default legacy shared amount retain it; a legacy unchanged A$500 default adopts the new car-specific estimates. Quotes, totals, stress scenarios and running-cost scoring use the same calculation.
