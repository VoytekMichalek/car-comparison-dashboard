# Validation record — 18 October 2026

## Weight reset feedback

- Reset restored the original weights during reproduction, but gave no confirmation and remained enabled when defaults were already active.
- Renamed the action to Reset to defaults, added an explicit default/custom status and reset confirmation, and disabled the button when already using defaults.
- Changed local weights, opened a link with different shared weights, reset, and verified all eight sliders and rankings returned to defaults. Reloaded and opened Scores without URL weights to verify persistence. Production build and all 65 tests pass.

## Dedicated car pages

- Removed the Family Fit navigation page; child-seat evidence, seat models and configuration-specific fit confirmations remain on each car’s page.
- Browse cards are links to exact configuration URLs. Verified full-page navigation, year/variant changes, reload restoration, browser Back and the direct category-score link.
- Each page shows costs, all eight category scores, reviews, specifications, child-seat information, warranty/repair exposure, source evidence and private notes. Added route tests for valid vehicle links, invalid IDs, unknown sections and retired Family Fit URLs.
- Verified Edit costs opens the exact selected variant. Entered a temporary insurance quote, checked the matching amount on its car page, then cleared the test quote.
- Checked electric, hybrid and plug-in hybrid pages at desktop and 390×844 mobile sizes. Cost and score sections fit without horizontal page overflow.
- Final verification: all 62 tests pass and the TypeScript/production build succeeds.

## Automated checks

- TypeScript strict compilation and production build.
- 52 Vitest tests: source/reference integrity, 12-family coverage, per-fact units, price evidence, local licensed image presence, combined filters, fit/favourite distinctions, four-car selection cap, URL restoration and privacy, EV/HEV/PHEV energy scenarios, invalid/malicious/unknown-version backups, duplicate IDs and unavailable/full browser storage.
- Production assets split into application, React, validation and research chunks.
- Dependencies updated to the patched Vitest release; npm reported zero known vulnerabilities after installation.

## Browser walkthrough

Checked the local application in the in-app browser at desktop and 390×844 mobile sizes:

- Combined 2023 and electric filters returned the expected researched families.
- Seven-seat filtering separated the Kluger, Outlander and Sorento configurations appropriately.
- Saved a favourite, reloaded and verified persistence; removed the test favourite afterwards.
- Selected three configurations, opened the comparison, copied its link and reloaded it with all selections and filters intact.
- Opened the Model Y detail dialog, inspected named restraint-test evidence and dismissed it with Escape.
- Saved a clearly labelled temporary listing, reloaded, exported a real JSON backup, rejected an invalid backup without replacing data, and restored the exported backup.
- Verified the in-page import/deletion review dialogs and removed the temporary listing afterwards.
- Changed annual kilometres, reloaded to verify persistence and restored default assumptions.
- Verified mobile navigation, readable single-column cards and no page-wide horizontal overflow on Browse or Running costs. The comparison table scrolls within its own container.

## Practical limits

This verifies application behavior, not physical child-seat fit or the condition/availability of an advertised car. Not every trim/year is populated. Some sources expose only indexed listing snapshots and some specifications remain explicitly unverified. Source links can change and asking prices are not live.

Browser-storage denial and quota exhaustion are covered by isolated storage-failure tests; browser UI testing used normal local storage. There is no backend or cross-device synchronization to test. Live hosting remains a later action.

## Ownership and score extensions

- Verified official QLD registration groups, CTP added once, inclusive overrides, $100 duty rounding and the whole-value higher rate above $100,000.
- Checked all annual components, populated estimate ranges, quote precedence including zero, drive-away fee exclusions, compounded depreciation and repair-reserve shortfalls.
- Corrected WLTP consumption to include mains losses once; unknown electrical measurement boundaries remain excluded from verified-fact calculations. A separate tested planning-proxy layer fills all 25 configurations without relabelling the underlying facts.
- Changed electric-range importance with the keyboard, verified immediate score/ranking changes and restored the saved weight after reload. Reset defaults afterwards.
- Entered temporary car-specific insurance/service budgets, checked the complete annual total and reload persistence, then cleared the temporary quotes.
- Owner-review scope tests exclude incompatible newer generations and prevent a single favourable post from dominating a score.

## Simplified cost and comparison updates

- Verified recurring annual running costs and the matching period running total. Purchase, setup, depreciation, resale and repair-event scenarios are separate; the full ownership scenario is explicitly labelled on the car detail page.
- Verified ascending/descending annual cost, alphabetical vehicle sorting, numeric insurance sorting and Enter-key activation. Hiding a sorted detail column resets sorting to visible annual cost.
- Verified all eight evidence-adjusted category scores at the top of Compare. Photos/names remain fixed while the comparison scrolls vertically; the first label column stays fixed horizontally.
- Checked mobile page overflow at 390px, the compact car headers and the simplified ownership table. Removed the large Model Y feature banner.

## Visible costs and direct comparison selection

- Verified 25 sourced tyre-class planning budgets and distance scaling; tested per-car override precedence, zero inputs, independent PHEV electricity/fuel values, legacy energy overrides and backup round trips.
- Verified native comparison dropdown add/replace, duplicate prevention, exact-variant Edit costs navigation, persistence after reload and matching manual values in comparison totals. Temporary quote inputs were restored after the check.
- Combined Electricity / fuel into one cost column/row. All core costs remain visible. Desktop table width matches its container; at 390px, labelled grids fit inside the page with no sideways scrolling.


## Recurring running costs and retired roadside allowance

- The current build passes strict TypeScript and 63 automated tests, including purchase/setup/resale/repair-scenario independence from recurring budgets, totals without a purchase price, and old-backup compatibility after roadside removal.
- Verified matching annual and period running figures on Ownership, Compare and the Tesla detail page. Switching from ten years to five halves the period running total while leaving the annual amount unchanged.
- Verified the original Tesla Model Y RWD uses the published A$1,800 insurance planning default, including after reload, and later explicit browser-local inputs still take priority.
- Verified purchase and setup appear separately from the running-cost highlights, the purchase column is absent from the annual table, and roadside is absent from inputs, breakdowns, comparison rows and the detail cost ledger.
- Checked desktop tables and 390px mobile car-detail/ownership views without page-wide horizontal overflow. Column help describes the running-only calculation.

## Research audit — 18 October 2026

- Validated source/URL provenance for individual asking observations, physical sample counts, ordered representative points and configuration-year applicability. Manufacturer list-price anchors retain zero physical-car samples.
- Tested representative purchase-point precedence and personal quote overrides; checked that ownership and scoring consume the same researched point. Mixed-fee pricing receives a yellow uncertainty treatment.
- Validated professional road-test coverage across all 12 families and exact configuration/reference-only scope. Published qualitative verdicts remain qualitative.
- Walked through the updated EV5 Long Range listing examples and professional review panels. At 390px viewport width, listing cards fit the page and the ownership table has matching 335px client/scroll widths, with its combined Electricity / fuel column retained.
- Research details and pricing corrections are recorded in `RESEARCH-AUDIT-2026-10-18.md`.

Final research integration: **65 tests passed**; TypeScript and production build passed. New MY26 X-Trail FWD service-budget applicability and personal-quote precedence are covered.

## Car-specific repair-fund follow-up

- Added 25 low-confidence configuration allowances with ranges and age/warranty assumptions. Tests cover coverage/source integrity, default variation, explicit shared mode, zero overrides, backup round trips, legacy custom budgets and repair-fund/scenario double-count prevention.
- Browser check: Model Y RWD default A$1,200/year and A$12,000 over ten years; a temporary zero override reduced annual and ten-year running budgets by exactly A$1,200 and A$12,000. Restored the original blank override. Basis/source details and estimate highlighting were visible.
- Data maintenance also corrected MY25 Atto 3 Essential’s 17-inch tyre class using the Australian specification sheet.

Final repair-fund checks: **70 tests passed**, TypeScript and production build passed. At 390px, the repair-reference panel is 293px wide and the cost table has equal 335px client/scroll widths.

Public-source preparation: the original Model Y insurance amount is an anonymous, yellow planning budget (not a personal quote). Personal notebooks, browser data and preview screenshots are excluded from the GitHub upload.

## Mobile overhaul and MY23 Ioniq 5 — 18 October 2026

- Browser walkthrough at 320×740 and 390×844 phone sizes: Browse filters, comparison, Scores & reviews, Notebook, the research dialog, every ownership tab and every vehicle detail section. No page-wide horizontal overflow was found in these checks. Research dialog content also fits its own width.
- Comparison displays two readable car columns on phones/tablets, with category labels above both values and photos/names sticking below the app header. Tested left/right selection with a four-car shortlist, including a nonadjacent pair and correct visual ordering. Reload preserved all four public configuration IDs. Desktop still shows all selected columns.
- Ownership cards show yearly and period totals first, followed by all cost components; mobile sorting uses the same column state as desktop headers. Checked insurance sorting and the desktop table width at 1440×1000.
- Tested 768×1024 tablet layouts and navigation. The mobile layout now applies through 1000px, avoiding the narrow content left by a permanent sidebar on portrait tablets. Desktop comparison was inspected at 1440×1000.
- Category weights are collapsible on phones; keyboard arrows changed and restored the purchase-price weight. Selecting a ranking scrolls to its score details. Inputs use 16px text to avoid automatic input zoom on mobile Safari; physical iOS/Android hardware was not available for testing.
- Checked MY23 Dynamiq and Techniq in the 2023 year filter, variant selector, vehicle page and comparison. New data tests verify the battery/range/consumption split, unconfirmed restraint evidence, scoped professional review and zero-observation valuation proxy.
- Existing browser-local notes and overrides retain their storage format; no personal data or preview screenshots are included in the published source.
