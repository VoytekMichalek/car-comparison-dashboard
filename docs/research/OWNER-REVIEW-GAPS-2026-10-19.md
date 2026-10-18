# Owner-review gap follow-up — 19 October 2026

Five existing families checked: new RAV4, Zeekr 7X, Kia EV5, Atto 3 Evo and refreshed Ioniq 5. Two usable related cohorts were added in `src/data/review-expansion/gaps-2026-10-19.json`; coverage is intentionally empty to avoid duplicate family coverage records.

## Added

- **New-generation RAV4 HEV:** [Edmunds 2026 SUV cohort](https://www.edmunds.com/toyota/rav4/2026/suv/consumer-reviews/) shows 4.2/5 from 14 self-selected reviews. Related US FWD/AWD equipment; factor 0.4 for Australian XA60 GXL. No preceding-generation match added. Category evidence is about 16.5%, rather than treating fourteen reports as a representative survey.
- **Zeekr 7X:** calculated 8.4/10 from the five export reviews explicitly titled Long Range RWD. This is our transparent subset mean, not a publisher-wide aggregate. Related Australian Long Range factor 0.5 gives 10% evidence; smaller-battery RWD factor 0.25 gives 5%. The existing eleven-post index remains unscored reference material. Same `autoweek-zeekr7x-export` overlap group prevents double counting.

| Included Zeekr report | Vehicle rating / 10 | Latest reported km |
|---|---:|---:|
| [Long Range RWD #4](https://www.autoweek.nl/reviews/artikel/zeekr-7x-long-range-rwd-2025-4/) | 7.0 | 13,000 |
| [Long Range RWD #3](https://www.autoweek.nl/reviews/artikel/zeekr-7x-long-range-rwd-2025-3/) | 9.5 | 23,052 |
| [Long Range RWD #5](https://www.autoweek.nl/reviews/artikel/zeekr-7x-long-range-rwd-2025-5/) | 8.0 | 15,000 |
| [Long Range RWD #2](https://www.autoweek.nl/reviews/artikel/zeekr-7x-long-range-rwd-2025-2/) | 8.0 | 24,500 |
| [Long Range RWD](https://www.autoweek.nl/reviews/artikel/zeekr-7x-long-range-rwd-2025/) | 9.5 | 1,000 |

Mean: (7 + 9.5 + 8 + 8 + 9.5) / 5 = **8.4**. Each original page labels the numeric value beside reliability/performance/comfort/cost criteria. Reader usefulness percentages and comment counts are separate and were not used. Reports are self-described ownership, without a VIN ownership audit. One covers only a week; lease use, left-hand drive, local software and support differ. Other index entries without an explicitly matched RWD title were not silently included.

## Still unsuitable for a matched numeric owner score

- **EV5 Air:** [Australian ProductReview page](https://www.productreview.com.au/listings/kia-ev5) still has the GT-Line delivery/sales-focused contribution. It cannot establish an Air vehicle score. European owner reports in the existing pack concern the different 81.4-kWh specification; no clean Australian Air aggregate found.
- **Atto 3 Evo Premium:** [one Dutch Design owner report](https://www.autoweek.nl/reviews/artikel/byd-atto-3-evo-design-2026/) has an actual 8.5/10 vehicle rating and 8,000 km. It remains useful reference material already in the dataset; no new duplicate cohort added and no Australian Premium mean invented.
- **Refreshed Ioniq 5:** [Edmunds 2025](https://www.edmunds.com/hyundai/ioniq-5/2025/consumer-reviews/) shows 54 reviews and [2026](https://www.edmunds.com/hyundai/ioniq-5/2026/consumer-reviews/) shows 39, but both explicitly include other model years since the last redesign. Neither is a clean facelift pool. [Cars.com 2025](https://www.cars.com/research/hyundai-ioniq_5-2025/consumer-reviews/) has six self-reported owner accounts; its accessible text exposes subcategory ratings but no verifiable overall numeric mean. No conversion of those subratings into a claimed published overall score was made. The 2026 CARFAX candidate could not be retrieved beyond the search result, so its snippet count was not promoted into the dataset.

Professional reviews may be shown separately as references; they must not be relabelled owner feedback. No claim of 50 or more matching owners was added.

## Validation

The new file supplies four unique source URLs, two unique cohort IDs and no coverage entries. Existing sources for two re-read Zeekr pages are reused, preserving provenance without duplicate records. New records checked 2026-10-19. The existing test requiring an empty new-RAV4 owner category was updated intentionally, while tests continue excluding unsuitable preceding-generation Evo/Ioniq ratings. Added tests verify the new RAV4 scope, both Zeekr relevance factors, arithmetic mean, sample count and overlap group. Focused review/scoring suites: **32 tests passed**.
