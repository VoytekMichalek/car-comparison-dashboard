# Family-car review expansion — 18 October 2026

Read 50 publisher pages and recorded 46 separately scoped cohorts across the 13 assigned model families. These comprise 43 public owner-review cohorts, one professional assessment and two reliability/quality records. Twenty owner cohorts have a positive configuration match; the rest remain visible reference evidence. Nine positive-match owner cohorts have at least 50 displayed submissions. Those nine are international, related-model samples, not Australian variant-specific samples.

The machine-readable evidence is in `src/data/review-expansion/family-cars.json`. Every cohort records the original rating denominator, displayed count, region, limitations, matching configuration IDs and a checked date. The first source always belongs to the publisher supplying that cohort's rating.

## What changed

| Family | Broader evidence verified | Main limit |
|---|---|---|
| Forester S5 | Edmunds 4.3/5 from 79; Cars.com 4.9/5 from 113 | US 2.5 petrol trims; Cars.com comments include another SK model year |
| Forester S6 | Edmunds 4.3/5 from 80 | Early US ownership, separate generation from S5 |
| Outback BT | Edmunds 3.8/5 from 93; Cars.com 4.6/5 from 90 | Both large pools include XT turbo; identified 2.5 Touring subset has eight reviews |
| RAV4 XA50 Hybrid | Edmunds 4.2/5 from 71; Cars.com 4.8/5 from 62 | US AWD-heavy pools, not AU GXL 2WD; no XA60 inheritance |
| Kluger Hybrid | Related Highlander Hybrid: Edmunds 4.1/5 from 57; Cars.com 4.8/5 from 32 | Different local trims, drive and seating options |
| Sorento HEV | Edmunds 3.7/5 from 42 | Generation-pooled earlier years; US captain-chair layouts |
| Sorento PHEV | Edmunds 4.0/5 from 22 | Different market, small overlapping redesign-era sample |
| Outlander PHEV | Edmunds 4.2/5 from 20; Cars.com 4.0/5 from six | Updated 22.7 kWh battery is not isolated |
| Sealion 6 | Carsales 4.8/5 from five | Original/Premium/Dynamic/Extended split unavailable |
| X-Trail e-POWER | AU Ti ProductReview 4.2/5 from four; UK professional Carbuyer 3.9/5 | New ST-L FWD not established; editorial rating separate from owners |
| Outlander petrol | Edmunds 3.5/5 from 67; Cars.com 3.5/5 from 46 | US 2.5 petrol variants and launch-year cohort |
| X-Trail petrol | Related 2021 Rogue 2.5: Edmunds 3.3/5 from 134; Cars.com 4.4/5 from 118 | Earlier US five-seat cars; not later 1.5 VC-turbo |
| Sportage 2.0 petrol | AU model-level and US rating pools checked | Large US pool is 2.5/eight-speed; no verified large AU 2.0/six-speed cohort |
| Tucson 2.0 petrol | AU model-level and US rating pools checked | US 2.5/hybrid differs; Australian aggregate includes non-owner reviews |
| Carnival S diesel | AU and US pools checked | US V6 and higher-trim powered doors differ; no clean large S-diesel pool |

## Integrity checks that matter

**Large samples are available for some models, but a headline count can describe a different car.** The [KBB 2024 Outlander PHEV page](https://www.kbb.com/mitsubishi/outlander-phev/2024/consumer-reviews/) shows 4.1/5 and 46 reviews, yet includes an explicitly identified 2022 petrol ES AWC and a 181 hp petrol SE. That aggregate has factor zero for both shortlisted PHEVs. It is not added to the twenty Edmunds PHEV reviews to manufacture a larger PHEV count.

The [Carbuyer X-Trail owner page](https://www.carbuyer.co.uk/nissan/x-trail/owner-reviews) displays five stars beneath a current T33 editorial introduction. Its only identified owner car is a **2017 Acenta SE dCi diesel**. The owner stars therefore have factor zero for either e-POWER. The [professional assessment](https://www.carbuyer.co.uk/nissan/x-trail) remains a separate editorial benchmark.

[Sealion 6 ProductReview](https://www.productreview.com.au/listings/byd-sealion-6) includes an entry solely praising a novated-lease adviser. Its nine-review headline is not a clean vehicle-owner count. [Carsales](https://www.carsales.com.au/owner-reviews/byd/sealion-6/) provides a separate five-review Australian model aggregate, with four entries labelled 2024 and one labelled 2025.

The Australian [Tucson NX4](https://www.productreview.com.au/listings/hyundai-tucson-nx4) and [Carnival KA4](https://www.productreview.com.au/listings/kia-carnival-ka4) ProductReview pages include explicitly disclosed professional reviews of borrowed test cars within the model stream. They also combine powertrains and materially different equipment/years. The headline aggregates are retained for reference, with factor zero; their individual substantive comments can inform inspection questions. The directly opened Tucson page showed **2.5/5 from 25**, versus 2.6 in a search cache. The dataset uses the opened page and flags the discrepancy.

[Sportage US reviews](https://www.edmunds.com/kia/sportage/2023/consumer-reviews/) identify 2.5 petrol/eight-speed vehicles. [Tucson US reviews](https://www.edmunds.com/hyundai/tucson/2022/consumer-reviews/) visibly include both 2.5/eight-speed and 1.6 hybrid vehicles. Those are substantial samples, but they cannot supply an Australian 2.0 MPi/six-speed owner score. Similarly, [Carnival US reviews](https://www.edmunds.com/kia/carnival/2022/consumer-reviews/) concern V6 petrol cars; their fuel-system reports are not diesel evidence, and powered-door issues should not automatically be assigned to a manual-door S.

The large [Outback Edmunds](https://www.edmunds.com/subaru/outback/2021/consumer-reviews/) and [Cars.com](https://www.cars.com/research/subaru-outback-2021/) pools contain both non-XT and XT engines. Both are reference only for the shortlisted non-XT. The [identified Touring 2.5 subset](https://www.edmunds.com/subaru/outback/2021/st-401867662/consumer-reviews/) has eight reviews and remains related US evidence. It shares the parent pool's overlap group; it is not eight extra unique reviews.

The refreshed Australian [Outback 6GEN aggregate](https://www.productreview.com.au/listings/subaru-outback-6gen) is 3.1/5 from 25; it mixes XT/non-XT and a borrowed Sport XT professional review. The [Sorento MQ4 aggregate](https://www.productreview.com.au/listings/kia-sorento-mq4) is 3.4/5 from 31, mixing petrol, diesel, HEV/PHEV, professional tests and even an identified 2018 car. Both new factor-zero cohorts replace the corresponding legacy aggregates so those cannot continue influencing the score through an older data path.

The [Australian RAV4 FWD Hybrid pool](https://www.productreview.com.au/listings/toyota-rav4-xa50-fwd-25l-hybrid), 3.9/5 from 18, includes two explicit rental reports, a borrowed professional test, and an incentivised dashcam review. Its new factor-zero cohort suppresses the old aggregate. In contrast, all seven visible [Kluger AWD Hybrid posts](https://www.productreview.com.au/listings/toyota-kluger-awd-hybrid) identify the correct hybrid generation. Their 3.0/5 aggregate is retained at limited applicability: most are Grande/GXL and one is labelled Fair Incentive; no Grande sunroof claim is treated as a GX fault.

The [Forester S5 AU parent](https://www.productreview.com.au/listings/subaru-forester-sk-2019-present), 3.1/5 from 57, includes a hybrid description under a petrol trim tag and a borrowed professional review. Its [2.5i-L child pool](https://www.productreview.com.au/listings/subaru-forester-s5-25i-l), 3.5/5 from eleven, also includes a 2019 Premium and a 2018 Special Edition report explicitly lacking Apple CarPlay. Both are reference only. The [Outlander petrol LS FWD pool](https://www.productreview.com.au/listings/mitsubishi-outlander-4th-gen-zm-petrol-ls-fwd), 2.8/5 from five, explicitly includes a temporary loan-car driver. Individual stars are not exposed, so no clean owner-only mean can be recovered by subtracting that person. These refreshed cohorts suppress the final mixed/non-owner legacy numeric exceptions.

## Reliability evidence stays separate

[J.D. Power's 2023 Outlander page](https://www.jdpower.com/cars/2023/mitsubishi/outlander) gives **74/100 for Quality & Reliability**, with an explicit previous-year data warning and no model-specific respondent denominator. This is a quality index with early ownership context. It does not mean a 74% chance of avoiding a fault, and it does not enter an owner-star average. The overall 79/100 score combines other concepts and is not substituted for the quality result.

The two directly opened What Car? fifth-generation RAV4 pages disagree: the [main used review](https://www.whatcar.com/toyota/rav4/4x4/used-review/n22427) shows 98.3%, while the [reliability page](https://www.whatcar.com/toyota/rav4/4x4/used-review/n22427/reliability) shows 99.2%. Both are favourable qualitative evidence, but the current HEV/PHEV split and numeric result are unresolved. The cohort withholds a numeric reliability result. A search result also surfaced a different HEV percentage; the associated article could not be opened successfully, so it was not treated as a verified scoring source.

## Counting and scoring rules

- Counts describe publisher submissions, not verified unique people or confirmed long-term owners. No identities were harvested.
- A model-year URL does not guarantee a model-year-only pool. Edmunds explicitly broadens several small samples to other years since redesign; KBB broadens years too.
- One publisher's model pool, year pages and trim subset must not all contribute independently. `overlapGroup` records this relationship; the app selects a single eligible source contribution per publisher.
- Cross-site repeat authors cannot be ruled out. Display per-site counts; never claim their sum is a count of distinct owners.
- Australian exact/closely matched evidence is capped at 0.8 applicability; international related evidence at 0.5. These are transparent evidence-weight assumptions, not statistical correction factors.
- Unresolved engine/generation matches, mixed incompatible powertrains and contaminated aggregates receive factor zero, even when their headline count is large. Missing evidence should not lower the underlying car's score by itself.
- Owner satisfaction, professional road tests and reliability surveys measure different things. A Cars.com perceived-reliability subscore is not the overall satisfaction rating. Neither is an empirical Australian repair-cost probability.

## Remaining work for later updates

50-plus exact Australian configuration reviews were not established for every car. The largest honest gaps are the newer batteries/generations, e-POWER FWD, Sealion 6 Extended and the original AU Sportage/Tucson 2.0 and Carnival S diesel subsets. Individual restraint fit still needs the household's exact Maxi-Cosi model and a physical trial; owner stars cannot establish three-restraint compatibility.

Validation performed on this pack: unique source/cohort IDs, all source references resolve, all vehicle matches belong to their stated families, rating/count bounds and applicability caps pass, and all thirteen assigned families have explicit coverage/gaps. Main app tests/build and UI verification are performed by the integrating agent.
