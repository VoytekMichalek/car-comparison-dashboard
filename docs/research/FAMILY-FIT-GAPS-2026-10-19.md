# Family-fit evidence gap review — 19 October 2026

Coverage: all 35 existing configurations, 19 families. Target: one rear-facing Maxi-Cosi (exact model unknown) plus two forward-facing harnessed seats or boosters. Research does not confirm the household installation.

## Material additions

- Sealion 6: a first-person 2026 Essential mixed-facing photograph closes the previous three-across evidence gap. Dynamic and Extended remain related applications.
- Zeekr 7X: a New Zealand Performance review observed rear-facing clearance; it does not establish three-across in either Australian rear-drive grade.
- Atto 3 Evo: added related European rear-door loading evidence; Australian anchors come from the Australian documents. Front-seat ISOFIX advertised overseas is not assumed Australian.
- Sixth-generation Forester: added related UK rear-door access evidence, with the Australian Hybrid Sport installation retained.
- Refreshed 84-kWh Ioniq 5: put the verified three-tether layout and earlier mixed-seat test into the assessment. Revised seats remain untested as a three-seat arrangement; adult room is not converted into restraint clearance.

## Integration

`src/data/family-fit-gap-updates.json` contains seven full `FamilyFitAssessment` replacements and five `Vehicle.familyFit` patches. Apply these **after** existing research-pack merges, keyed by `vehicleId` / `id`. Do not append duplicate assessment IDs. Register `src/data/family-fit-gap-sources.json` in the source registry. Both files are separate to avoid collisions with simultaneous boot, repair and new-PHEV work.

The Sealion 6 research-pack summary and `gaps` still contain the superseded wording that no mixed-facing Australian trial was found. Remove that stale sentence or replace it with the exact remaining limitation: related Essential evidence; actual Dynamic/Extended restraint models, daily booster buckles and the household fitting remain unconfirmed. The primary vehicle summary can likewise lead with the newly observed related combination.

## Coverage audit

Known arrangement ratings refer to the published test and its scope, not universal restraint compatibility. A source-backed physical fit can coexist with a manual conflict or incompatible ANCAP sample restraint.

| Configuration | Scope | Arrangement | Clearance | Loading/access | Booster buckles |
|---|---|---|---|---|---|
| zeekr7x-rwd-2025 | related | unknown | workable | good | unknown |
| zeekr7x-long-range-2025 | related | unknown | workable | good | unknown |
| kluger-gx-hev-awd | related | workable | good | workable | unknown |
| carnival-s-diesel-2021 | related | good | good | workable | unknown |
| tucson-base-petrol-2021 | related | workable | good | good | unknown |
| outlander-ls-petrol-fwd-2022 | related | unknown | workable | workable | unknown |
| ev6-air-2022 | related | unknown | good | workable | restricted |
| rav4-gxl-hev-2021-25 | related | workable | workable | good | unknown |
| rav4-gxl-hev-2026 | related | good | good | workable | unknown |
| outback-awd-25-2021 | related | workable | good | good | unknown |
| ioniq5-awd-2021 | exact | good | good | good | unknown |
| ioniq5-dynamiq-rwd-2023 | related | good | good | workable | unknown |
| ioniq5-techniq-awd-2023 | related | good | good | workable | unknown |
| ioniq5-rwd-84-2025 | related | unknown | unknown | unknown | unknown |
| forester-25il-2021 | related | good | good | good | unknown |
| forester-awd-petrol-2025 | related | good | good | workable | unknown |
| sportage-s-petrol-2022 | related | unknown | good | good | unknown |
| xtrail-st-petrol-awd-2023 | related | good | good | good | unknown |
| outlander-phev-aspire-20 | related | unknown | good | workable | unknown |
| outlander-phev-aspire-227 | unknown | unknown | unknown | unknown | unknown |
| model-y-rwd-2022 | exact | good | good | workable | unknown |
| model-y-long-range-2023 | related | good | good | workable | unknown |
| model-y-rwd-juniper-2025 | exact | good | good | good | unknown |
| sealion6-dynamic-183 | related | good | good | unknown | unknown |
| sealion6-dynamic-extended | related | good | good | unknown | unknown |
| xtrail-ti-epower-awd | related | workable | good | good | unknown |
| xtrail-stl-epower-fwd-2026 | related | workable | workable | workable | unknown |
| atto3-standard-2022 | related | good | workable | good | unknown |
| atto3-extended-2022 | related | good | workable | good | unknown |
| atto3-essential-2025 | related | good | workable | good | unknown |
| atto3-evo-premium-2026 | related | unknown | unknown | workable | unknown |
| sorento-phev-gtline-2021-23 | exact | good | good | workable | unknown |
| sorento-gtline-hev-awd-2026 | related | good | good | workable | unknown |
| ev5-air-standard-2024 | related | unknown | good | workable | unknown |
| ev5-air-long-2024 | related | unknown | good | workable | unknown |

## Honest remaining limits

After the additions, 24 configurations have a rated published arrangement; 11 still require a matched arrangement or resolved manufacturer permission. All 35 have nonempty family summaries, row/anchor descriptions, tested-seat context, buckle context, access and ventilation text. They should display those known facts even when a numeric score is withheld.

The 11 arrangement cases are: `zeekr7x-rwd-2025`, `zeekr7x-long-range-2025`, `outlander-ls-petrol-fwd-2022`, `ev6-air-2022`, `ioniq5-rwd-84-2025`, `sportage-s-petrol-2022`, `outlander-phev-aspire-20`, `outlander-phev-aspire-227`, `atto3-evo-premium-2026`, `ev5-air-standard-2024`, `ev5-air-long-2024`.

34 configurations lack a verified repeatable daily booster-buckling assessment with three restraints installed. EV6 has an actual documented centre-buckle difficulty, so its existing restriction is retained. A harnessed-seat installation, individual ANCAP restraint pass, external body width, or an adult fitting between two seats cannot establish booster buckle usability. Do not replace these pending criteria with made-up scores.

Outlander caution: the June first-person CarExpert list restricts child seats to two, but BabyDrive’s subsequent direct Mitsubishi investigation reports conflicting customer/media interpretations. The latter still says formal reconciliation is outstanding. Keep the existing written-clarification/fitter requirement for all affected Outlander entries; a physically fitting photograph is insufficient permission.

For the user interface, use “Fit check required” or “Not yet tested” with known anchors and test context. Unverified parts remain outside the numeric average. “No data” would hide useful evidence that already exists.

## Sources re-opened and new material

All new sources have checked date 2026-10-19 in the companion source registry. Existing source records retain their prior checked dates; opening a page is not evidence that every claim on it was newly audited.

- [Tace Clifford first-person 2026 family PHEV tests: Sealion 6 three-across and 182-cm clearance](https://www.carexpert.com.au/car-news/top-10-mid-size-phev-family-suvs-in-2026) — CarExpert / Tace Clifford, checked 19 October 2026.
- [Sealion 6 Essential photograph: rear-facing capsule plus two forward-facing harnessed seats](https://images.carexpert.com.au/resize/960/-/cms/v1/media/2026bydsealion6childseats.jpg) — CarExpert / Tace Clifford, checked 19 October 2026.
- [NZ 2026 Zeekr 7X Performance trial: rear-facing toddler seat with front passenger seat unchanged](https://www.kiwigt.co.nz/post/2026-zeekr-7x-performance-whats-the-catch) — KIWI GT, checked 19 October 2026.
- [European RWD Atto 3 Evo first drive: rear-door access, not Australian restraint certification](https://www.completecar.ie/car-reviews/article/BYD/Atto_3/Atto_3_Evo_(2026)/2668/14712/1970-BYD-Atto-3-Evo-(2026)-review.html) — CompleteCar.ie / Matt Robinson, checked 19 October 2026.
- [Sixth-generation UK Forester review: rear-door openings for bulky child seats](https://www.carwow.co.uk/subaru/forester) — Carwow, checked 19 October 2026.
- [Australian refreshed Epiq Ioniq 5 road test: anchors, rear lighting and grab handles](https://www.carexpert.com.au/car-reviews/2025-hyundai-ioniq-5-review) — CarExpert / Matt Campbell, checked 19 October 2026.

Selected existing independent tests and manufacturer documents re-opened for the gap audit:

- byd-atto-3: [2024 original-body Atto 3: named mixed-facing restraint test and shoulder-width limitation](https://babydrive.com.au/reviews/suvs/2024-byd-atto-3-ev-review/).
- hyundai-ioniq-5: [BabyDrive 2022 AWD practical restraint and family test](https://babydrive.com.au/reviews/electric-cars/2022-hyundai-ioniq-5-ev/).
- hyundai-tucson: [BabyDrive 2021 Elite: named rear-facing / forward-facing / slim-booster combination and 184 cm clearance](https://babydrive.com.au/reviews/suvs/2021-hyundai-tucson-elite/).
- kia-carnival: [BabyDrive 2021 Carnival SLi: five restraints, mixed-facing legroom and tether extensions](https://babydrive.com.au/reviews/suvs/2021-kia-carnival-sli/).
- kia-ev5: [2025 EV5 Earth AWD family test — tight three-across and front-seat clearance](https://babydrive.com.au/reviews/suvs/2025-kia-ev5-review/).
- kia-ev6: [2022 EV6 GT-Line RWD: specific three-restraint test and clearance](https://babydrive.com.au/reviews/electric-cars/2022-kia-ev6-gt-line-rwd/).
- kia-sorento: [2021 Australian Sorento PHEV: mixed-facing restraints and driver clearance](https://babydrive.com.au/reviews/suvs/2021-kia-sorento-phev/).
- kia-sportage: [BabyDrive 2022 Sportage GT-Line: named restraints and rear-facing clearance](https://babydrive.com.au/reviews/suvs/2022-kia-sportage-gt-line/).
- mitsubishi-outlander-petrol: [BabyDrive 2022 petrol Exceed: three rear-facing and three forward-facing combinations, driver-clearance constraint](https://babydrive.com.au/reviews/suvs/2022-mitsubishi-outlander-exceed-seven-seater/).
- mitsubishi-outlander-phev: [BabyDrive April 2025 ES 20 kWh test: three across including rear-facing capsule, adult clearance](https://babydrive.com.au/reviews/electric-cars/2025-mitsubishi-outlander-phev-review/).
- nissan-x-trail-epower: [BabyDrive 2023 Ti-L AWD: restraints, rear-facing clearance and access](https://babydrive.com.au/reviews/suvs/2023-nissan-x-trail-e-power-hybrid-launch-review/).
- nissan-x-trail-petrol: [BabyDrive 2023 seven-seat T33: two forward-facing restraints plus rear-facing capsule](https://babydrive.com.au/reviews/suvs/2023-nissan-x-trail-seven-seater-review/).
- subaru-forester: [2024 Forester Sport: two forward-facing seats plus a rear-facing capsule; 184 cm driver](https://babydrive.com.au/reviews/suvs/2024-subaru-forester-sport-review/).
- subaru-outback: [BabyDrive 2021 Sport: two forward-facing plus one rear-facing seat; roof-mounted centre belt and clearance discrepancy](https://babydrive.com.au/reviews/suvs/all-new-2021-subaru-outback-sport/).
- tesla-model-y: [2023 RWD family test: restraint models, front clearance and loading](https://babydrive.com.au/reviews/electric-cars/2023-tesla-model-y/).
- toyota-kluger-hybrid: [BabyDrive 2021 Grande Hybrid: named mixed-facing seats, 180 cm front clearance and occupied boot](https://babydrive.com.au/reviews/suvs/2021-toyota-kluger-hybrid-grande/).
- toyota-rav4-hybrid: [BabyDrive 2021 Cruiser: three-across arrangements, 180 cm driver clearance and anchor access](https://babydrive.com.au/reviews/suvs/2021-toyota-rav4-hybrid-cruiser/).

- [Outlander manual/conflicting official interpretations](https://babydrive.com.au/news/mitsubishi-outlander-child-seat-confusion-and-why-the-nissan-x-trail-matters/).
- [Australian Sealion 6 owner handbook](https://bydautomotive.com.au/brochures/BYD-SEALION-6-Owners-Handbook-2024.pdf), pp 25–27: rear positions/tethers and cover access.
- [Australian Atto 3 Evo specification](https://bydautomotive.com.au/brochures/BYD-ATTO-3-EVO.pdf?v=3) and [Premium handbook](https://bydautomotive.com.au/brochures/BYD-ATTO-3-EVO-Premium-Owners-Handbook.pdf?v=1), pp 23–28: market-dependent anchor cautions.
- [Australian MY26 Ioniq 5 specification](https://www.hyundai.com/content/dam/hyundai/au/en/models/ioniq5/docs/2026-IONIQ-5-Specification-Sheet.pdf): two rear outboard ISOFIX positions and three rear tethers.

## Validation

Companion JSON parsed; IDs unique and existing; assessment schema keys/rating enums checked; all source references resolve against the existing dataset plus six new sources; five vehicle patches contain only the ID and complete family-fit object. No private fit confirmations or seat-model guesses were added.
