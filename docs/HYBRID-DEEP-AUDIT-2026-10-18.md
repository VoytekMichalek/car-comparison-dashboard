# Hybrid and PHEV deep audit — 18 October 2026

This is an evidence audit of the 11 existing configurations in six model families. It updates `hybrid-vehicles.json`, `hybrid-prices.json` and `hybrid-sources.json`, keeping vehicle and snapshot IDs stable. The actual research date is **2026-10-18**. Ownership, warranty/recall, insurance, servicing budgets, reviews and UI are being maintained separately; this audit does not assert those have all been rechecked here.

## Purchase-price results

All amounts below are Australian dollars. These are **asking prices for the selected advertisements**, not achieved sale prices, market valuations or a forecast. `point` is the median of the listed observations. Every observation records its advertised year, kilometres when exposed, location, source, checked date and identifying stock/VIN context.

| Exact configuration | Condition | Distinct stock observations | Advertised low–high | Median | Geography and limitation |
|---|---|---:|---:|---:|---|
| Outlander PHEV Aspire 20 kWh, five seats | Used | 3 | $40,840–48,500 | **$44,990** | QLD; 2022–2025 advertised years, 7,815–55,970 km. Lowest dealer's fee labels conflict; entire snapshot low confidence. |
| Updated Outlander PHEV Aspire 22.7 kWh, seven seats | New | 2 | $67,420–72,490 | **$69,955** | NSW and TAS; state-local DAP, not a QLD on-road quote. Both advertised 2026; earlier build/compliance dates are explicit. |
| Original Sealion 6 Dynamic 18.3 kWh | Used | 1 | $38,990 | **$38,990** | Hendra QLD, 9,193 km; low confidence/small sample. Essential and Extended are excluded. |
| Sealion 6 Dynamic Extended 26.6 kWh | New | 3 | $49,931 | **$49,931** | Three QLD new-stock cards on one authorised-dealer platform, not three independent sellers. VIN/odometer not exposed. |
| X-Trail Ti e-Power AWD | Used | 3 | $33,999–42,488 | **$36,990** | Three QLD 2023 cars, 44,346–60,573 km; Ti-L and petrol Ti excluded. |
| MY26 X-Trail ST-L e-Power FWD | New | 3 | $45,990 | **$45,990** | Townsville QLD plus two NSW cars; new condition and FWD explicitly checked. |
| Original RAV4 GXL Hybrid 2WD | Used | 4 | $27,989–37,895 | **$35,992.50** | QLD 2021–2022 cars, 60,132–171,230 km. Lowest price is high mileage. |
| Sixth-generation 2026 RAV4 GXL Hybrid 2WD | New | 3 | $53,565–53,873 | **$53,565** | Two QLD VINs and one NSW VIN; manufacturer test-drive/build-to-order cards excluded. |
| Kluger GX Hybrid AWD | Used | 3 | $39,990–49,990 | **$48,490** | QLD 2021–2022 cars, 12,181–106,500 km; petrol GX and higher grades excluded. |
| Dealer-declared MY26 Sorento GT-Line HEV AWD | New | 1 | $79,190 | **$79,190** | Bundaberg QLD, 15 km; seller says MY26 but VIN year character warrants Kia/order-sheet confirmation. Low confidence. |
| Original 2021–2023 Sorento PHEV GT-Line AWD | Used | 2 | $51,990–54,990 | **$53,490** | Two QLD cars. White 2023 detail is active but its price is exposed on the result advertisement, not the detail page. |

**Total: 28 distinct stock observations; seven cohorts have at least three.** The two former zero-observation new-price proxies (Extended Sealion and FWD X-Trail) are replaced with actual advertisements. Small cohorts remain small rather than mixing condition, battery, drivetrain, trim or generation to inflate the count.

### How exact stock was checked

Where accessible, current seller HTML and structured `InStock` / `SoldOut` data took precedence over search-index text. Exact detail pages, official Toyota dealer stock feeds and seller-posted CarsGuide/carsales advertisements were used. Stock numbers/VINs were compared across cross-posts; duplicate pages were not counted as additional cars. Dynamic pages sometimes expose a detail page but not its price; those limitations are stated in the observation.

For new Sealion Extended, the inventory explicitly marks stock **8125424 / 8125425 / 8125426** as new, 2026 Dynamic Extended, Arctic White, available now with QLD pickup/registration and $49,931 DAP. Each has a distinct stock card and actual DOM carousel anchor (`carousel941461/462/463`). Observation links target those published anchors. The unique configurator links were opened too, but initially render a generic client-side shell rather than an independently priced detail; they were not used to invent additional price evidence. The [source inventory](https://evdealergroup-byd.com.au/inventory?model=sealion-6&state=QLD&type=n) remains linked. Cashback and finance benefits are **not subtracted again** from its displayed DAP. VIN allocation still requires confirmation.

New Toyota prices depend on dealer postcode and buyer assumptions, including CTP. Interstate DAP examples are labelled as such; no unobserved Queensland fee conversion or transport allowance has been silently added. Different paint and dealer charges can affect nominally identical configurations.

### Material price corrections

- Removed sold Motorama Outlander U226401 ($42,888). Added exact Ross Gray 00040414 and Hendra H31146, producing a $44,990 median. [Ross Gray detail](https://www.rossgray.com.au/all-stock/view/2022-Mitsubishi-Outlander/34692924) and inventory/prose advertise **$40,840 DAP**, but its detail header also displays **$40,040 EGC** and strikes through DAP. The dataset retains the explicitly advertised $40,840 DAP with visible low confidence; it does not treat $40,040 as an on-road total.
- Updated new Launceston Aspire from indexed $72,990 / 10 km to current HTML **$72,490 / 15 km**. NSW Alto stock remains $67,420 / 15 km; exact seven seats and 22.7 kWh checked. Median falls to $69,955.
- Removed blue H30165 Sealion because current cross-post says SoldOut. Grey H31098 now **$38,990**, superseding indexed $39,490 / $39,990. An old 18.3 kWh used price is never applied to the new 26.6 kWh car.
- Sunshine Coast X-Trail U61979 is now **$33,999**, was $39,999. Added exact current Motorama Ti e-Power U229441 at $42,488 rather than a removed lower-priced car. Gatton 76188 remains $36,990; “sold by us” is its original sale history, not current sold status.
- Removed Robina RAV4 RU46310 because its URL now redirects to stock search. Four current exact GXL Hybrid FWD cars replace it, with their large mileage spread visible. Geebung S13107 is now $36,995; Kedron U011098 has a different VIN despite almost identical mileage, so it is a separate car.
- Old Southside new-RAV4 VIN JTM5DABV90D338174 was replaced with current **JTM5DABV60D339542**, $53,565. Motorama JTM5DABV50D339094 is also $53,565; current Sydney stock JTM5DABV40D339121 is $53,873.
- Kluger Gympie U13155 is now **$49,990 / 12,181 km**, superseding $51,990 / 9,852 km. Booval U675461 current direct HTML is $48,490, below indexed $49,490; Kedron 15437 remains $39,990.

### Excluded or unresolved examples

| Example | Why it is excluded from the statistical sample |
|---|---|
| Outlander Motorama U226401 | Current page explicitly sold, despite an active cached price. |
| Blue Sealion H30165 / VIN LGXC74C41R0295589 | Current CarsGuide structured data SoldOut conflicts with stale active cross-posts. |
| Sealion Salisbury U227871 | Old exact URL now redirects to the general inventory; exact VIN not recovered. |
| Sealion Moorooka U227462 | Cached Dynamic car absent from current stock; the current Premium car is a different AWD grade. |
| Lower-priced Yeerongpilly Sealion | EGC; not silently pooled into the DAP cohort or converted to DAP. |
| 2025 Sealion “Dynamic” advertisements | Some seller descriptions explicitly say Extended; year/badge alone is insufficient to assign original 18.3 kWh. |
| Old Extended Sealion stock 8100543 | No longer appears in the current platform inventory; replaced with currently published stock records. |
| McRae new-FWD X-Trail candidate 56895, VIN ending 0310 | Actual dealer HTML says Demo and shows registration 2AT1AH. Its $45,490 is not a new-car price. |
| Auto Request Ti X-Trail 15430 | Cached exact ad remains discoverable, but absent from the current Nissan stock; not counted as current. |
| Pacific X-Trail U13010 | Exact detail redirects to general stock; no active exact car recovered. |
| RAV4 Redcliffe MG U3944 | AXAH54R AWD, not this card's AXAH52R FWD. |
| RAV4 MXAA52R / 2.0L candidates | Petrol-only, even when GXL and “2WD” match. |
| RAV4 Ken Mills 114761 | Cached price/stock found, but exact current primary inventory not recovered; not assumed still available. |
| Old Sunshine/Black/Torque new-RAV4 VINs | Current URLs/inventory no longer expose those exact physical stock records. Generic “make it your own” examples are also excluded. |
| Sorento Wayne Phillis 5520236 / 1056631 | Current brand-dealer page sold. |
| Sorento Wayne Phillis 1035457 | Current car is registered Demo with more than 2,000 km; not new MY26 stock. |
| Sorento Pakenham C5187 / VIN KNARM81HSP5220782 | carsales explicitly sold or unavailable despite active Gumtree search text. |
| Sorento Rocklea B10495 | Exact primary detail redirects to the general inventory; old August promotion not treated as current. |
| Blue Kedron Sorento, 50,412 km | Sold/unavailable; not another current PHEV sample. |
| Sorento ACT stock PDF 3935151 | 404 in this recheck; not a current observed price. |
| Mornington UFH2185 / VIN KNARH81GSP5211999 | Primary HEV title/VIN series conflicts with PHEV seller prose and cross-post title. Do not assign its cheaper price to PHEV without vehicle evidence. |

The Bundaberg Sorento HEV is retained **with low confidence**, rather than silently reclassified: the seller explicitly says 26 Model Year / May 2026 build, while VIN KNARH81GSV5531684 has a V year character. Kia/order documentation is needed to resolve that discrepancy. No MY27 data has been assigned to the existing MY26 configuration.

## Manufacturer and practicality audit

### Mitsubishi Outlander

Downloaded original Australian **MY24** and updated **MY25** brochures. The former MY23 link now fails, so original 20 kWh facts use the verified MY24 original-generation document where applicable.

- Original five-seat Aspire: 20 kWh, 84 km ADR 81/02/NEDC, **494 L VDA**, 4,710 × 1,862 mm, 1,600 kg braked towing. Approximate charge claims are **6.5 h suitable 15 A AC / 9.5 h 240 V 10 A / 38 min DC to 80%**.
- Updated seven-seat Aspire: **22.7 kWh**, 103 km ADR 81/02/NEDC, **468 L VDA with third row folded / 191 L all seven seats upright**, **4,720 × 1,862 mm**, 1,600 kg braked / 160 kg maximum ball load. Charge claims **6.5 h 15 A AC / 10 h 240 V 10 A / 32 min DC to 80%**. Type 2 AC / CHAdeMO DC is verified; brochure peak AC/DC kW and exact AC SOC window are not stated.
- The April 2025 BabyDrive test is the original **five-seat 20 kWh ES**, not Aspire. Three restraints included a rear-facing capsule, but all make/models are not named. The related-grade limitation is now explicit. Updated seven-seat Aspire has no exact three-across test verified.
- Third-row top tethers are absent; seven seats do not establish suitability for tethered restraints. Applicable 2022 versus July-2025-onward 2025 ANCAP safety specifications are separated by build, not registration year.

Key sources: `hy-out-24`, `hy-out-25`, `hy-out-fit`, `hy-out-safe-old`, `hy-out-safe-new`.

### BYD Sealion 6

Visually inspected the technical page of the live September 2025 Australian brochure because its PDF text extraction is corrupted. Essential 18.3 kWh and original Dynamic are not assumed equipment-identical.

- Original Dynamic: **18.3 kWh / 92 km NEDC (SOC 25–100%)**, published electrical 169 Wh/km, low-SOC fuel **4.8 L/100 km at SOC below 25%**. Its period AC rating is 7 kW; current brochure rounds/specifies 6.6 kW. The original 2024 brochure URL currently returns no usable PDF, although previously captured period claims remain distinguished from the later Essential.
- Dynamic Extended: **26.6 kWh / 140 km NEDC (SOC 20–100%)**, 147 Wh/km, low-SOC fuel **4.8 L/100 km at SOC below 20%**, 6.6 kW Type 2 AC / 18 kW CCS2 DC. Current Essential's **4.72** is not assigned to the old Dynamic.
- Electrical 16.9 / 14.7 kWh/100 km is retained as a **published specification with unspecified energy boundary and weighting**. ADR 81/02 is named, but the document does not resolve wall-versus-battery or weighted-versus-electric-distance consumption. It is not promoted to verified pure-electric cost input. Weighted 1.1 / 0.8 L/100 km is not charge-depleted fuel use.
- Both have 425 L stated minimum load space; manufacturer does not state VDA or height boundary. Exact three-across Australian fit and buckle-clearance measurements remain unverified.
- Original 2WD owner handbook pp108–109 verifies **750 kg braked/unbraked towing**. Its figure is not automatically transferred to the later 26.6 kWh variant. Exact Extended towing and supported charge-time/SOC window remain gaps.

Key sources: `hy-sl6-24`, `hy-sl6-25`, `hy-sl6-safe`, `hy-deep-sl6-handbook`.

### Nissan X-Trail e-Power

Compared launch/period specification, current web table and the dated **August 2026 MY26** sheet.

- Ti AWD remains **6.1 L/100 km ADR combined**, 1,650 kg braked towing; new ST-L FWD is **670 kg**. Both have 575 L boot **measured to roof**, not a VDA shelf-height figure.
- **Unresolved manufacturer conflict:** MY26 dated PDF gives FWD **5.4 L/100 km**; undated live web table gives **5.3**. Dataset uses 5.4 conservatively, showing both sources and requesting the actual car's fuel label.
- MY26 service intervals increase to **15,000 km / 12 months**, versus earlier 10,000 km / 12 months. The grouped Ti card explicitly notes this rather than claiming all years share a schedule. Official source: `hy-deep-xt-my26-service`.
- Two rear outboard ISOFIX pairs / three top tethers and rear ventilation verified. BabyDrive's 2023 exact tested grade was **Ti-L**, so its reported three-across combination is related-grade evidence for Ti. Exact seats and booster access remain pending.
- Current ANCAP model page says all variants, but downloaded technical applicability table names e-Power 4WD and does not explicitly extend to the newly arrived FWD. FWD safety rating remains unverified rather than inheriting the AWD score or a dealer claim.

Key sources: `hy-xt-spec`, `hy-deep-xt-my26`, `hy-xt-current`, `hy-deep-xt-ancap`, `hy-xt-fit`.

### Toyota RAV4

- Original GXL FWD HEV: **4.7 L/100 km**, 480 kg braked towing, 4,600 × 1,855 mm. Manufacturer 542 L boot claim uses **upper boot-floor position**; spare/floor variations need the individual car. Toyota dealer primary specs corroborate dimensions and 225/60 R18 tyres.
- New GXL FWD HEV: **4.5 L/100 km**, 800 kg braked towing, 4,600 × 1,855 mm. Toyota's current page claims **up to 705 L with seats upright**, without defining a comparable VDA/height boundary. Do not rank that as a like-for-like increase over the old 542 L. Initial/overseas 749/514 figures were not substituted.
- New 2026 PHEV sibling BabyDrive test reports three forward- or rear-facing restraints, but does not name every seat. It is **related-powertrain evidence**, not an exact GXL HEV result; fit status stays unverified. Old generation retains applicable 2019 ANCAP result; new generation remains unrated as checked.
- 2023 multimedia/safety equipment changes remain explicit in the original year group. New GXL exact tyre size has no primary confirmation in the sources read here; “2026” generic specification pages that still show old 131 kW/old consumption are not evidence for the sixth generation.

Key sources: `hy-rav-spec-25`, `hy-deep-rav-old-dealer`, `hy-rav-spec-26`, `hy-rav-launch-26`, `hy-deep-rav-current`, `hy-deep-rav-fit-phev`, `hy-toyota-safety`.

### Toyota Kluger

Recovered a **live 23 February 2026** official specification PDF through the current grade page's Download Specifications link, replacing reliance on broken April-2025/February-5-2026 URLs for current corroboration.

GX Hybrid AWD confirms **5.6 L/100 km**, **552 L third row folded / 241 L all three rows upright**, 4,966 × 1,930 mm and 2,000 kg braked towing. Original April 2021 launch also corroborates hybrid fuel requirement and consumption. Hybrid battery kWh remains unverified.

The 2021 BabyDrive test is **Grande**, not every GX year. Second row has three tethered positions; third row lacks top tethers/ISOFIX. The test's untethered folding booster observation is not general permission for a tethered child seat in row three. ANCAP's curtain protection covers all three rows; exact manual instructions and adult access still control the proposed arrangement.

Key sources: `hy-deep-kluger-spec-26`, `hy-deep-kluger-launch-21`, `hy-deep-kluger-dealer`, `hy-kluger-fit`, `hy-kluger-safe`.

### Kia Sorento

Recovered and visually checked Kia Australia's original **MY23 HEV/PHEV brochure** (January 2023 printing, hosted by an Australian dealer). This closes major original-PHEV gaps:

- **68 km WLTP electric**, manufacturer rounded **14 kWh**, 161 Wh/km published WLTP energy claim; gross/usable and energy boundary must not be invented. The 16.1 kWh/100 km display is a unit conversion, not verified pure-electric distance consumption.
- **3.3 kW single-phase Type 2 AC**, **15–95% in 3 h 25 min**; AC-only, no DC. This is not a 0–100% time.
- **604 L VDA five seats / 175 L all seven**, 4,810 × 1,900 mm, **1,350 kg braked towing**. Current facelift/PHEV 1,010 kg, HEV 1,650 kg and HEV boot 608/179 L must not be substituted.
- Current MY26 HEV AWD sheet remains **5.7 L/100 km**, 608/179 L VDA, 4,815 × 1,900 mm, 1,650 kg braked. Australian sheet rounds HEV battery to 1 kWh; more precise overseas values are not silently assigned.
- Reopened both relevant BabyDrive tests. Five rear tether positions / four ISOFIX positions and exact reported combinations are recorded; 2025 HEV test is related-year evidence for MY26. With three across, removal is needed for practical third-row access in the reported test. **Curtain airbags cover first and second rows only**, despite row-three restraint anchors.
- Original-PHEV charge-depleted fuel use is still missing; **weighted 1.6 L/100 km is not substituted**. MY23 mechanical coverage does not prove identical equipment in every 2021/2022 car.

Key sources: `hy-deep-sorento-my23`, `hy-sorento-spec`, `hy-sorento-fit-phev`, `hy-sorento-fit-hev`, `hy-sorento-technical`.

## Fuel-grade findings for ownership budgeting

| Configuration group | Verified Australian guidance | Source IDs / caution |
|---|---|---|
| Outlander original and updated | Minimum 91 RON recommended | `hy-out-24`, `hy-out-25` |
| Sealion original | Handbook says 95-grade or higher; E10 or below | `hy-deep-sl6-handbook`, p109 |
| Sealion Extended | Current model page links that same Australian handbook | Use 95 guidance, verify delivered VIN handbook; later battery applicability noted. |
| X-Trail AWD and MY26 FWD | Minimum 91 / recommended 95 RON | `hy-xt-spec`, `hy-deep-xt-my26`; recommendation is not an absolute minimum95 claim. |
| Old RAV4 | Recommended 91 RON | `hy-rav-spec-25` |
| New 2026 RAV4 | Recommended 95 or more | `hy-rav-spec-26` |
| Kluger Hybrid, original 2021 and current | Minimum 95 RON | `hy-deep-kluger-launch-21`, `hy-deep-kluger-spec-26`; no demonstrated 91-to95 year change. |
| MY26 Sorento HEV | Regular 91, E10 compatible | `hy-deep-kia-fuel`, current Australian FAQ |
| Original Sorento PHEV | **Unresolved period/current guidance conflict** | MY23 brochure says Regular Unleaded; current Kia AU FAQ says PHEV requires95. A 95-rate planning budget is conservative; exact period VIN manual/fuel flap remains needed. |

[BYD handbook](https://bydautomotive.com.au/brochures/BYD-SEALION-6-Owners-Handbook-2024.pdf), [live Kluger specification](https://www.toyota.com.au/-/media/toyota/main-site/vehicle-hubs/kluger/files/20260223_kluger_spec_table-_gto009639.pdf?rev=221d4e90078d4986993973ca39042df0), [Kia Australian fuel guidance](https://www.kia.com/au/cars/hybrid-cars.html). Petrol prices remain editable; a published consumption figure does not establish the pump price the buyer will pay.

## Remaining evidence gaps and practical checks

1. Exact three child-seat models, facing direction, booster buckle access, driver/passenger positions and third-row access still need the family's physical trial. A related-grade/generation test is not a confirmed personal fit.
2. Manufacturer energy boundaries/weighting remain unresolved for BYD and original Sorento electrical figures. Outlander electric-distance consumption and Outlander/Sorento charge-depleted petrol figures remain unavailable in the verified documents. Separate labelled planning proxies must not be presented as measured manufacturer facts.
3. Outlander peak charge kW/phase and exact AC SOC windows; Sealion supported charge-time window and exact Extended towing remain unverified. Do not back-calculate a peak charger rating from a full-charge time.
4. New FWD X-Trail ANCAP applicability and conflicting 5.3/5.4 consumption need written manufacturer or actual-car-label evidence.
5. New RAV4 705 L measurement boundary and exact GXL HEV restraint fit/tyre placard remain gaps. Old RAV4 floor/spare differences and annual equipment require listing-level checks.
6. Hybrid battery kWh for X-Trail, RAV4 and Kluger is not filled from recalled/overseas values. This does not stop fuel-cost calculations for those non-plug-in cars.
7. Exact new MY26 Sorento stock count/applicability, original Sorento PHEV fuel grade, and the lowest Outlander DAP fee conflict remain visibly qualified.
8. The 2021 ZL Outlander predecessor, unprofiled AWD RAV4/higher trims, early Sorento HEVs and facelift Sorento PHEVs are not silently folded into an incompatible configuration. They remain coverage gaps or need separate future cards.

## Source access and validation

The audit used actual opened/read evidence, not date-only refreshes. Manufacturer period PDFs were read alongside current pages; where extraction failed, relevant pages were rendered and inspected. Some old brochure URLs now return 404/empty content, and some dealers block direct downloads; cached/indexed seller evidence is identified rather than called a new dealer quote. Current seller HTML often differs from search snapshots, so the selected figures and superseded values are recorded above.

Own-file assertions passed for all 11 configurations, 11 snapshots, 28 stock observations and 107 source records: unique IDs, source references, supported years, numerical units, exact counts, distinct observation URLs and source-URL identity, price bounds, and median arithmetic. After the concurrent fuel-metadata files arrived, `npm run validate:data` passed **13 tests**. The root task performs the final integrated type/build/browser validation.
