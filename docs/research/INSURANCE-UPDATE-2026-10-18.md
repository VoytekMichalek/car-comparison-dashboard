# Catalogue-wide comprehensive insurance review

Checked **18 October 2026** across all **35 configurations / 19 families**. Annual AUD comprehensive insurance; CTP remains a separate registration component. No quote forms or household details were submitted.

## Result

| Family | Previous annual default → revised | Planning sensitivity | Evidence used |
|---|---:|---:|---|
| Model Y original RWD | **$2,000 unchanged** | $1,200–3,500 | Preserve explicit user-set default; not a verified household quote |
| Model Y LR / Juniper fallback | $3,200 → **$2,260** | $1,540–4,500 | Youi observed Model Y mean $2,261; not variant-specific |
| Atto 3 | **$1,370 unchanged** | $990–2,800 | Midpoint of Youi $988–1,753 band; not a published mean; EVO is related-nameplate evidence only |
| EV6 | **$1,570 unchanged** | $980–3,500 | Youi model mean $1,569 |
| EV5 | **$1,920 unchanged** | $1,300–3,000 | Brisbane Standard Range profile mean $1,921; Long Range remains related evidence |
| Ioniq 5 | **$1,850 unchanged** | $1,140–3,500 | Youi model mean $1,851; years/variants pooled |
| Zeekr 7X | **$2,270 unchanged** | $1,520–4,000 | Midpoint of $1,520–3,026 band; not a published mean |
| Outlander PHEV | $1,900 → **$1,700** | **$800–2,900** | Unadjusted hybrid/PHEV class mean $1,709; no SUV uplift; model quote still a gap |
| Sealion 6 | **$1,820 unchanged** | **$1,000–2,800** | Brisbane Essential profile mean $1,821; Dynamic/Extended related |
| X-Trail e-POWER | $1,850 → **$1,300** | **$750–2,800** | Budget Direct new-X-Trail policy median; e-POWER not separately isolated |
| RAV4 Hybrid | **$1,840 unchanged** | **$800–2,800** | Brisbane GX HEV profile mean $1,844; GXL/new-generation related |
| Kluger Hybrid | **$1,620 unchanged** | **$900–3,200** | NRMA GX Hybrid five-year insurance $8,111 ÷ 5; NSW profile |
| Sorento HEV/PHEV | $2,100 → **$1,700** | **$900–3,300** | Unadjusted hybrid/PHEV class mean $1,709; no large-SUV multiplier |
| Forester, both generations | **$1,070 unchanged** | $690–2,500 | Youi mean $1,069; newer Budget Direct/NRMA checks retain generation limitations |
| Outback | **$1,140 unchanged** | $750–2,500 | Youi mean $1,138; Budget Direct median $1,115 is a separate cohort |
| Sportage petrol | **$1,180 unchanged** | $760–2,500 | Youi model mean $1,175; not petrol-only |
| Tucson petrol | **$1,190 unchanged** | $770–2,500 | Youi model mean $1,191; years/powertrains pooled |
| Carnival diesel | **$1,580 unchanged** | $1,070–3,200 | Youi model mean $1,584; diesel/KA4 not isolated |
| Outlander petrol | **$1,160 unchanged** | $780–2,500 | Calculated midpoint of mixed-model band; not a published mean |
| X-Trail petrol | **$1,180 unchanged** | $740–2,500 | Youi model mean $1,181; years/powertrains pooled |

The ranges are **analyst planning sensitivities**, not statistical confidence intervals, insurer minimum/maximum prices or guaranteed offers. Lower priced suitable policies can exist. A reported $1,100 annual premium for a 2025 Outlander PHEV is plausible; it does not by itself establish a household quote or model mean. No friend's identity or policy details were added to the public dataset.

## Why the Outlander default changed

The earlier $1,900 was a hybrid/PHEV class average multiplied by an assumed 10% SUV loading. That loading was unsupported. The new $1,700 remains a clearly labelled class proxy, not a claim that all Outlander policies cost that much. The lower sensitivity is widened from $1,300 to $800.

[The Car Guy's May 2024 PHEV review](https://thecarguy.com.au/review-mitsubishi-outlander-exceed-tourer-phev-may-2024/) reports Suncorp $1,541 and RACQ $1,800 comprehensive comparisons for an Exceed Tourer. The article does not disclose a comparable driver/excess profile; these are dated contextual quotes, not current Aspire offers. [Youi's Outlander band](https://www.youi.com.au/car-insurance/insurance-by-make/mitsubishi) is $785–1,531 across mixed years/powertrains. Neither can establish an exact 2025 PHEV household premium. The app now exposes the default, range and scope beside the editable annual input.

## Source handling and implementation

- Youi figures are one insurer's national policies sold **22 Nov 2025–22 May 2026**. Model-specific sample counts and risk distributions are undisclosed. Its stated 80% falls within **or below** the band, not a central 80% interval. Midpoints remain labelled calculated planning choices.
- Compare the Market's March 2026 Brisbane study covers **11 insurers / six underwriters**, with model availability varying. Its profile is a 34-year-old man, garaged, clean record, 15,000 km/year, market value and about $900 excess. The separate 908-person survey is not the premium-study sample size.
- NRMA's August 2026 figures separate five-year comprehensive from registration/CTP. Division by five is an arithmetic study average, not a forecast of each renewal. The NSW profile differs from this household.
- RAC WA/RACQ combined standing-cost columns were **not** copied into insurance or added again on top of rego. No overseas premium or invented generation/trim/SUV multiplier was used.
- `insuranceReferenceFor(vehicle)` resolves the published car/family default independently of private inputs. Precedence remains car amount (including zero) → shared amount → configuration default → family estimate. Helpers keep the default scope visible even when a saved amount replaces it.
- Raw records and existing research overrides were updated together. New references are in `insurance-audit-sources.json`; every family has a short `scope`. Estimates retain yellow styling; annual/period totals, score bars and charts all use the same ownership calculation.

[ASIC Moneysmart](https://moneysmart.gov.au/car-insurance/choosing-car-insurance) explains why cover, excess, inclusions and discounts matter when comparing premiums. Quotes should be compared on the same terms; a published aggregate is not a substitute for the buyer's quote.

Detailed audit evidence: [EVs](INSURANCE-EVS-2026-10-18.md), [hybrids/PHEVs](INSURANCE-HYBRIDS-2026-10-18.md), [petrol/diesel](INSURANCE-ICE-2026-10-18.md).
