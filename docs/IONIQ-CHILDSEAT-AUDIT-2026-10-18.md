# Ioniq 5 child-seat evidence audit

Checked 18 October 2026 for Australian-delivered vehicles. This audit reviews the published fit evidence; it does not confirm the family's own seats.

The user remembered correctly: BabyDrive fitted three child restraints in an Australian original-generation Ioniq 5 AWD. The dashboard already records that direct test for the 72.6 kWh AWD, but calling the MY23 77.4 kWh cars simply “Fit evidence needed” hides useful related-model evidence. Show that evidence prominently, with its model-year boundary.

## What was actually tested

[BabyDrive's 2022 AWD review](https://babydrive.com.au/reviews/electric-cars/2022-hyundai-ioniq-5-ev/) identifies two InfaSecure Attain More restraints with an InfaSecure Achieve More in the centre. It reports forward- and rear-facing Achieve More / Attain More arrangements without an exhaustive position-by-position list of every combination. It does not establish three boosters' buckle access. A separate two-restraint example combines a rear-facing Attain More with a forward-facing Roamer II; do not present that as a three-seat trial. Existing source ID: `ev-ioniq-family`.

The corresponding [BabyDrive YouTube review](https://www.youtube.com/watch?v=1oDsmnO0ACA) is titled *Family car review: 2022 Hyundai Ioniq 5 AWD | BabyDrive child seat and pram space test*, published 25 November 2021. Its identity and date were verified from the primary video's indexed description; the article supplies the detailed findings above. No independent transcript was obtained. Optional new source ID: `ev-ioniq-family-video`.

BabyDrive's [current three-seat EV roundup](https://babydrive.com.au/articles/which-5-seat-fully-electric-family-cars-fit-3-child-seats/) still includes the Ioniq 5, links that original review, and labels the image as a 2022 AWD. This is corroboration of the earlier test, not a separate MY23 or refreshed-car fit trial. Optional source ID: `ev-ioniq-three-across-roundup`.

## How far the result can reasonably carry

| Dashboard configuration | Evidence and recommendation |
| --- | --- |
| `ioniq5-awd-2021`, original 72.6 kWh AWD | Retain `tested-three`. The named BabyDrive AWD test directly supports it. Keep “Your seat fit pending” until the family's own arrangement is checked. |
| `ioniq5-dynamiq-rwd-2023`, MY23 77.4 kWh | Use a distinct `tested-related` status and the label “Three across · related test”. Explain that the actual restraint trial was the earlier AWD. |
| `ioniq5-techniq-awd-2023`, MY23 77.4 kWh | Same related-test treatment. Matching drivetrain layout strengthens relevance, but does not turn the earlier trial into a direct MY23 test. |
| `ioniq5-rwd-84-2025`, refreshed 84 kWh | Retain `unverified` for an exact refresh-specific three-seat combination. Put the earlier-model result in the summary as useful context. Manufacturer measurements alone cannot establish identical seat contour, trim, belt geometry or buckle access. |

The [Australian MY23 launch release](https://www.hyundai.com/au/en/news/electrified/2023-ioniq-5-more-power-increased-range-for-flagship-ev) explicitly says that the larger battery remains under the flat floor and does not affect cabin space or practicality. Its changes centre on battery, motors, ride tuning, service intervals and the new Epiq grade. This supports treating the earlier fit as relevant to MY23; it does not explicitly certify identical restraint fit or every seat component. Existing source ID: `ev-ioniq-2023-release`.

The [July 2022 Australian specification sheet](https://www.hyundai.com/content/dam/hyundai/au/en/models/ioniq5/images/IONIQ5_Spec-Table_July_2022.pdf), page 2, and the [MY23 specification guide](https://www.hyundai.com/content/dam/hyundai/au/en/ecomm/ioniq5v3/IONIQ5_Specification_Guide_version3.pdf), pages 2, 5 and 6, document substantial continuity:

| Published measurement / layout | July 2022 and MY23 |
| --- | --- |
| Wheelbase | 3,000 mm |
| Rear legroom | 1,002 mm |
| Rear hip room | 1,362 mm |
| Rear shoulder room | 1,470 mm Dynamiq / 1,465 mm Techniq, as printed in each sheet |
| Rear seating | 60:40 reclining and sliding bench; manual slide on Dynamiq, powered on Techniq |
| Anchors | Two rear outer ISOFIX positions and three rear top tethers |

These are published cabin measurements, not usable installation widths. Existing source IDs: `ev-ioniq-old-spec`, `ev-ioniq-2023-spec`.

The [current Australian 84 kWh specification sheet](https://www.hyundai.com/content/dam/hyundai/au/en/models/ioniq5/docs/2026-IONIQ-5-Specification-Sheet.pdf), pages 3, 5 and 6, retains the 1,002 mm rear legroom, 1,362 mm rear hip room, two outer ISOFIX positions, three tethers and sliding/reclining 60:40 bench. This is encouraging related evidence, but a refresh-specific simultaneous fit remains a gap. No separate Australian BabyDrive MY23, MY25 or MY26 Ioniq 5 fit review was located in this audit. Existing source ID: `ev-ioniq-new-spec`.

## Booster and installation limits that must stay visible

The [ANCAP 2021 Ioniq 5 report](https://s3.amazonaws.com/cdn.ancap.com.au/app/public/assets/58e5822855174c125b22e2947d8b099770480648/original.pdf?1695096088=), pages 3–4, is more specific than a general “three anchors” claim. Its individual-installation table shows:

- The tested **Type E booster (4–8 years)** could not be fitted correctly in the centre rear position; the tested Type F booster (4–10 years) passed there.
- One tested rear-facing convertible could not be correctly installed using either outer ISOFIX position; belted installation of the tested convertibles passed.

ANCAP assessed each restraint separately, so its table does not establish simultaneous three-across installation. Do not generalise either failure to every restraint. The centre has a top tether and vehicle belt, **not a third ISOFIX pair**. Existing source ID: `ev-ioniq-ancap`. Its PDF table was visually checked because text extraction loses coloured pass/fail markers.

Suggested short buckle text: “Check every booster buckle. ANCAP's tested Type E booster did not install correctly in the centre; its Type F booster did. BabyDrive's three-restraint result does not establish your boosters' buckle access.”

## Product integration

Include `tested-related` in the published-evidence filter, while retaining the exact test year and restraints on the detail page. Use a lower editorial scoring evidence factor than a direct test: raw seating criterion 8 with factor 0.5, versus 0.8 for `tested-three`. These factors express evidence relevance, not the probability that seats fit. Personal fit confirmation remains the stronger state and must never be auto-set from this research.

Suggested MY23 summary: “Three across in BabyDrive's earlier AWD test. Hyundai retained MY23 cabin space and the anchor layout; check your seats and booster buckles in this car.”

Only this audit document was changed by the child-seat research task; root integrates the data and interface changes.
