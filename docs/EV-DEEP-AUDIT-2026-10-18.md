# EV catalogue deep audit — 18 October 2026

This audit covers the 16 BEV configurations in `ev-vehicles.json`. It records the completed research pass and its limits; the checked date means the cited material was inspected on that date, not that the underlying specification or advertisement was published that day. Dealer inventory can change after checking. No seller was contacted and no vehicle was inspected.

## What changed

- **Model Y refresh:** the Australian five-seat owner manual supports 4,790 mm length excluding the number-plate bracket, 1,920 mm body width excluding mirrors, and 822 L rear cargo with the second row up. Tesla’s cargo method is not identified as VDA; the separate 116 L front compartment is excluded. A folded-mirror width is not a body width. All three Tesla configurations now have the Australian-supported 11 kW three-phase AC limit; a 32 A single-phase supply gives about 7.4 kW.
- **New Model Y prices:** replaced the A$58,900 excluding-charges list-price proxy with three individual Tesla Queensland stock ads: 901733 at A$62,918, 901069 at A$64,448 and 902005 at A$64,448, all advertised drive-away and 12 km. The descriptions say MY27 while the ad title year is 2026. Build dates/VINs are not public; equipment must be checked. No conditional trade-in bonus was deducted.
- **ATTO 3 EVO Premium:** visually inspected the Australian brochure v3 and handbook. Filled 16.4 kWh/100 km WLTP mains-energy consumption, 11 kW AC, 4,455 × 1,875 mm body dimensions, 1,500 kg braked towing and the manufacturer’s 0–80% DC claim of 30 minutes. The older secondary 10–80% claim describes a different SOC window and is not a contradiction merely because its time differs. Three Australian brochure top-tether anchors are distinguished from a generic handbook’s configuration-dependent centre-anchor instructions.
- **EVO price:** replaced the A$46,990 excluding-charges RRP proxy with three distinct Queensland dealer allocations, stocks 8122528, 8122534 and 8122537, each A$50,461 drive-away. They are Atlantis Grey Premiums on 18-inch wheels, explicitly **in transit / Arriving Soon**. They are not three immediately deliverable cars or completed sales. VINs and odometers were not displayed; deduplication uses distinct dealer stock allocations. Prices were read from the primary dealer inventory cards, with each card’s individual configurator link retained.
- **Ioniq 5 84 kWh:** the current ANCAP page confirms the 2021 five-star rating applies to all Ioniq 5 variants except N, expiring December 2027. The MY26 sheet confirms two outer ISOFIX positions, three rear tethers and B-pillar/floor rear vents. Hyundai labels its 160.4 Wh/km consumption with inconsistent WLTP/ADR 81/02 wording. Both measurement methods use mains recharge energy, established from the primary ADR Appendix B Annex 7 method and the existing WLTP methodology source; the calculator must not add charging losses again. The test-cycle wording conflict remains visible.
- **MY23 Ioniq groups:** stable IDs remain unchanged, but both 77.4 kWh MY23 groups now include late-2022 builds. Dynamiq is 168 kW RWD / 507 km / 19-inch wheels; Techniq is 239 kW AWD / 454 km / 20-inch wheels. A title year alone does not distinguish MY22 72.6 kWh, MY23 and MY24.
- **Zeekr 7X:** replaced secondary boot attribution with the current Australian manufacturer’s 539 L rear-cargo claim, retaining the unspecified measurement-method warning. ROVER VTA-065421 declares 2,000 kg braked and 750 kg unbraked towing for both rear-drive variants; approved towbar, towball and loaded vehicle limits still apply.
- **Family-fit warnings:** the official original Model Y ANCAP report identifies a Type A capsule and one selected booster that could not be correctly installed in the centre rear position. The EV6 report identifies one selected booster with a centre-position problem. ANCAP’s installation matrix evaluates individual seats; it is not a simultaneous three-across test. These warnings now accompany, rather than replace, BabyDrive’s exact restraint-combination observations.
- **Price integrity:** confirmed excluding-charges wording for Cars4us ATTO Extended stock 72546. Direct Cars4us HTML showed EV5 SR stock 70029 at A$42,990, while an intermediary web cache showed A$43,990; the direct seller figure is retained. Added WA SR stock 37859 at A$39,990 excluding charges. Removed weak category/title-only current-price examples rather than inflating the sample count.

## Final price cohorts

The table is the saved JSON snapshot, not a claim to have found every car for sale. `n` counts distinct advertised vehicle stocks, including the three explicitly in-transit EVO allocations. Used, new and demo examples are not pooled in a single cohort. A point is the median headline ask (rounded where necessary), or the explicitly labelled valuation guide; mixed-fee medians are not normalised drive-away costs. Queensland is preferred, but small interstate samples are labelled.

| Configuration ID | Cohort | n | Headline asking interval | Point | Fee basis |
|---|---|---:|---:|---:|---|
| `model-y-rwd-2022` | used / observation | 2 | A$35,990–42,991 | A$39,491 | drive-away |
| `model-y-long-range-2023` | used / observation | 2 | A$42,500–48,998 | A$45,749 | mixed |
| `model-y-rwd-juniper-2025` | new / observation | 3 | A$62,918–64,448 | A$64,448 | drive-away |
| `atto3-standard-2022` | used / observation | 2 | A$27,490–28,690 | A$28,090 | excludes-charges |
| `atto3-extended-2022` | used / observation | 2 | A$30,990 | A$30,990 | mixed |
| `atto3-essential-2025` | used / observation | 1 | A$36,990 | A$36,990 | drive-away |
| `atto3-evo-premium-2026` | new / observation | 3 | A$50,461 | A$50,461 | drive-away |
| `ev6-air-2022` | used / observation | 3 | A$40,000–48,980 | A$41,990 | mixed |
| `ev5-air-standard-2024` | used / observation | 3 | A$39,990–42,999 | A$42,990 | excludes-charges |
| `ev5-air-long-2024` | used / observation | 4 | A$42,490–42,990 | A$42,990 | drive-away |
| `ioniq5-awd-2021` | used / observation | 1 | A$44,990 | A$44,990 | drive-away |
| `ioniq5-rwd-84-2025` | new / observation | 2 | A$69,990–70,990 | A$70,490 | drive-away |
| `zeekr7x-rwd-2025` | new / observation | 1 | A$64,109 | A$64,109 | drive-away |
| `zeekr7x-long-range-2025` | new / observation | 2 | A$71,805 | A$71,805 | drive-away |
| `ioniq5-dynamiq-rwd-2023` | used / estimate | 0 | A$26,300–35,800 | A$31,050 | excludes-charges |
| `ioniq5-techniq-awd-2023` | used / observation | 1 | A$46,950 | A$46,950 | excludes-charges |

There are **32 EV stock observations in 15 observed cohorts**, including **three in-transit EVO dealer allocations**, and **one zero-sample valuation estimate**. The EV source registry contains **110 entries** after this pass. Historical unused source entries remain in the registry for traceability; registry size is not the number of sources freshly reopened or the number of independent cars.

Cohort cautions:

- Original Model Y RWD now has two individual Queensland drive-away asks, A$35,990 at 87,987 km and A$42,991 at 26,101 km. The rounded A$39,491 midpoint is not adjusted for mileage.
- Original Model Y Long Range retains two separately identified examples with mixed drive-away/excluding-charges bases. It is a small sample with no inferred transaction discount.
- Original ATTO Standard and Extended each retain two samples. Extended prices have mixed fee bases even though both headline asks are A$30,990.
- Essential retains one individual Hendra advertisement. Two additional Hendra cars could be identified in indexed ads, but current primary-page price/year confirmation was insufficient to add them.
- EV6 Air retains three specific 77.4 kWh examples. The 84 kWh facelift, GT-Line and GT are excluded from this cohort.
- EV5 SR has three ads across QLD, SA and WA (503–25,972 km); interstate freight and registration costs are extra. EV5 LR retains four distinct stocks, not four pages for one VIN.
- Early Ioniq AWD retains one verified MY22 72.6 kWh / 225 kW NSW advertisement at A$44,990 drive-away and 33,657 km. That is low-confidence market coverage, not a statewide price guide.
- MY23 Dynamiq remains a yellow valuation estimate with **zero physical asking examples**. The estimate is not promoted to observed pricing because numerous indexed ads proved sold, removed, mismatched or unverifiable.
- MY23 Techniq retains one exact 77.4 kWh / 239 kW example. Belconnen/Goulburn cross-posts of stock 234362 / VIN KMHKR81FRPU215236 count once.
- Ioniq 84 kWh RWD retains two new Queensland examples; 63/72.6/77.4 kWh, AWD and higher-wheel variants are not substituted.
- Zeekr RWD retains one new Queensland sample; Long Range retains two distinct new Queensland stocks. Demo asks were not added to these new-car cohorts.

## Excluded or insufficient listing evidence

| Evidence | Decision |
|---|---|
| Cars4us ATTO Standard stock 72389 / VIN LGXCE4CB5P2092579, A$25,990 / 145,012 km | **Excluded: fresh primary HTML says Sold.** Its Product structured data still says InStock, so that machine-readable status is not accepted over the seller’s visible status. |
| Original Model Y Salisbury / Bigbox stock U229557 / VIN LRWYHCFS1PC043290, A$41,989 / 70,185 km | Removed from the saved cohort. Previous source was a category page; indexed individual advertising identifies the car, but its current individual asking price/availability was not sufficiently reverified. It is not asserted to be sold. |
| Early Ioniq AWD Kedron Autotrader 15281349, A$36,990 / 72,000 km | Removed: price could not be confirmed in the current individual page body. A retained SEO-title price alone is insufficient. It is not asserted to be sold. |
| MY23 Dynamiq Carsales OAG-AD-26282541 and OAG-AD-26356288 | Explicitly sold/unavailable on opened evidence; excluded. |
| Highland Prestige MY23 Dynamiq stock 574910, A$41,888 | Opened primary page explicitly says already sold, despite generic dealer comments saying advertised cars are available. Excluded. |
| Dynamiq CarsGuide 15254840 (Ringwood) | Redirected/removed, excluded. |
| Maughan Thiem MY23 Dynamiq lead stock 54976 / OAG-AD-24944306 | Old indexed listing led to the current general stock page; not counted as current asking stock. |
| Peninsula U9553 Dynamiq / 30,502 km | Sold and/or MY24 configuration, excluded from MY23. |
| Apparent A$39,888 Dynamiq lead UFM5408 | Opened seller page was a Volkswagen Arteon; rejected search-result mismatch. |
| Techniq OAG-AD-26316343 / stock 108713 / VIN KMHKR81FRPU212615 | Opened evidence indicated sold; original dealer path redirected to inventory. Cross-posts do not create a new active example. |
| Juniper OAG-AD-26279517 / dealer stock 292 | Sold; excluded. Dealer body-kit modifications also needed separate price context. |
| Zeekr Long Range HZ1969 | Seller page explicitly sold, excluded. |
| Zeekr Long Range HZ2151 / OAG-AD-26341367, A$70,275 | Indexed exact seller details existed, but the opened primary URL redirected to general stock. Not added. |
| Carsales SHRM generic new-car-to-order entries | Not physical stock observations; excluded from n even when similar-car asking prices are displayed nearby. |
| Used EVO Premium S705460 (VIC) and B239683 (NSW) | Exact examples were found, but not pooled with the new Queensland in-transit cohort. They do not supply extra new-car samples. |

## Specification and applicability checks

Primary documents reopened or inspected in this pass: Australian Hyundai Ioniq 5 MY22, MY23 and MY26 specification PDFs; original Australian EV6 brochure; current EV5 MY26 brochure; ATTO 3 MY25 and EVO v3 brochures; EVO Premium handbook; Zeekr Australian launch brochure and current model page; relevant Tesla Australian manuals/support; ANCAP pages and the original Model Y / EV6 technical reports; ROVER Zeekr tyre and variant records; ADR 81/02 Appendix B Annex 7.

- The Ioniq and EV6 **350 kW** numbers describe the compatible charging station used for an **18-minute 10–80%** claim, not an independently verified vehicle input peak. Those vehicle-peak fields stay null.
- EV5 MY26 Air SR is **64.2 kWh / 400 km / 18.2 kWh per 100 km / 6.6 kW AC / 300 kg braked**. Air LR is **88.1 kWh / 555 km / 18.0 / 11 kW AC / 1,250 kg braked**. Manufacturer year applicability warnings remain for earlier cars.
- Ioniq MY22/MY23 rear cargo is **527 L VDA minimum**; MY26 is **520 L VDA minimum**. Rear and front compartments are not silently added into a comparable rear-boot figure.
- Zeekr’s launch brochure and model page still label the **480/615 km** claims as **WLTP target**. They are not presented as road-tested ranges. RWD is **75 kWh LFP**, LR **100 kWh NCM**; published pack numbers are not asserted usable.
- Original ATTO Standard/Extended claims distinguish **345/420 km WLTP** from **410/480 km NEDC**. The available MY25 manufacturer reference is not proof of every launch-build detail. A historical Australian MY24 brochure is indexed, but live fetching returned 404/empty; no fresh full-document verification is claimed.
- Atto ANCAP applicability explicitly names Standard/Extended and the relevant build/VIN or anchorage-remedy conditions. Essential and EVO are not awarded an inherited rating without exact applicability evidence.
- Exact BabyDrive restraint combinations remain attached to their tested generations/grades. Original Ioniq AWD and Kia GT-Line/Earth tests are contextual evidence for other grades, not confirmed fit in a different variant or refresh.

Factory tyre evidence was supplied to the separate tyre-cost workstream: original and five-seat refreshed Model Y 19-inch **255/45R19 XL**; EV6 Air **235/55R19**; both EV5 Air grades **225/60R18**; early Ioniq AWD and MY23 Techniq **255/45R20 105W**; MY23 Dynamiq and MY26 base 84 kWh RWD **235/55R19 105W**; Essential **215/60R17**; EVO Premium **235/50R18**; ROVER Zeekr RWD/LR **255/50R19 front and rear**. Zeekr ROVER does not establish the minimum load/speed rating; the placard still governs. Original Atto launch/later wheel fitments vary, so one tyre profile must not be applied to every 2022–24 build.

## Remaining limits

- **Late-2023 Australian Model Y:** no primary VIN/build cutover for RWD comfort suspension, China’s ambient-light/dashboard update or HW4 was established. The February 2023 independent Australian report confirms a Performance-specific suspension observation; it does not establish the RWD cutover. The October 2023 China announcement explicitly left Australian plans unclear. Inspect the exact car and verify parts/build/equipment rather than infer an Australian change from an overseas announcement.
- Tesla does not provide a verified Australian pack-capacity figure in the cited launch material. Tesla range/energy and towing uncertainties stay explicit; unsupported pack estimates are not relabelled manufacturer specifications.
- Gross-versus-usable pack capacity is absent from several manufacturer tables. Manufacturer battery capacity divided by rated range is a planning proxy, not a measured energy-consumption result.
- No matched three-forward-facing/booster combination is established for every grade. Two ISOFIX positions plus three tethers does not prove three restraints fit, allow booster buckling or meet child-restraint instructions. Your actual three-seat fit remains pending.
- EVO safety applicability, generic-handbook centre-anchor wording, exact independent seat fit and some boot-method details remain unresolved.
- Listings inaccessible to fresh direct fetching are not silently stamped as primary live confirmations. A batch of additional direct dealer reads stalled and was stopped; it produced no additional accepted observations. Previously opened exact advertisements remain dated snapshots, not an assurance of availability.
- Warranty, servicing, repair risk, insurance, recall and owner-review datasets are owned by separate workstreams. This note does not claim that every historical source in those files, every image licence, or every untouched prose claim was freshly reverified by this EV pass. Tesla’s personal A$2,000 insurance and A$1,800 repair-reserve defaults were not altered.

## Validation

Final data validation command: `npm run validate:data`. Its result is reported to the integrating agent. Whole-app tests, build and deployment are owned by the root integration workstream. No Git commit, push, purchase, seller enquiry or deployment was performed by this audit.
