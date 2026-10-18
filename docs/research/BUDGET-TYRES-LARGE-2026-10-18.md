# Budget replacement tyres: larger SUV sizes

Implementation decisions and final figures: [consolidated update](BUDGET-TYRES-UPDATE-2026-10-18.md). The integrated dashboard uses a common 40,000 km life assumption with 25,000–60,000 km sensitivity; earlier recommendations below are research notes, not the final defaults.

Checked **18 October 2026** (Queensland date). These are retailer price observations, not a personalised Queensland stock or fitment quote. No checkout, purchase or enquiry was submitted. Values are Australian dollars. Alignment is additional unless expressly included.

## Finding

The previous anchors frequently selected premium Michelin or acoustic EV tyres. They were valid retail prices but unsuitable as the only basis for a household asking for budget replacements. The existing 235/55R19 and 255/45R20 **105Y** examples do not establish that those ratings are the car's minimum requirements.

Hyundai's Australian MY23 and current Ioniq 5 specification sheets explicitly list **105W**, not 105Y, for both relevant sizes. Ordinary replacement products in matching size/load/speed exist at much lower prices. Do not infer that a lower-priced product has equal braking, noise, rolling resistance or life; the offers establish price availability, not comparative performance.

## Suggested planning allowances

Rounded Queensland planning estimates deliberately allow some room above the cheaper interstate offers. Bounds are analyst sensitivities, not observed local quotation distributions. Keep the dashboard's yellow estimate treatment and current assumed tyre life; this research supplies no defensible reason to increase life merely because tyres are cheaper.

| Configuration / size | Suggested fitted set budget | Sensitivity bounds | Basis |
|---|---:|---:|---|
| EV6 Air; Ioniq 5 Dynamiq / current 19-inch; 235/55R19 with 105W replacement | **900** | 750–1,300 | Nexen SU1 200–219 each fitted; size/load/speed suitable in principle for 105V or 105W, subject to placard and fitter confirmation. |
| Sorento HEV/PHEV 19-inch | **900** | 750–1,300 | Same 105W anchor; Michelin Australian fitment data identifies 105V for relevant hybrid variants, but verify the actual year/VIN. |
| X-Trail Ti e-Power, 235/55R19 | **900 provisional** | 750–1,300 | Same 105W price benchmark; Nissan AU brochure verifies size only. The exact Australian placard load/speed remains to be read. Do not present the existing 105Y retail SKU as its required minimum. |
| Ioniq 5 Techniq 20-inch, 255/45R20 105W | **1,000** | 800–1,400 | Kumho 230 each fitted NSW; non-OEM, non-acoustic example. A conservative national-network alternative with still-higher 105Y is Radar 289 each (1,156/set). |
| Outlander PHEV Aspire 20-inch, 255/45R20 | **1,100** | 850–1,450 | Use the national-network Radar 105Y XL anchor (1,156/set) if retaining the existing index pending VIN confirmation. Mitsubishi's original Australian brochure actually specifies 101W for 20-inch wheels, including PHEV; newer cars need their own placard check. A 105W alternative exceeds that original documented load index. |
| Sealion 6, 235/50R19 | **800** | 680–1,100 | JAX Dynamo 103W XL 189 each (756/set); exceeds existing anchor's V speed index without reducing load. |
| X-Trail e-Power FWD / petrol Outlander 18-inch, 235/60R18 | **800** | 650–1,100 | JAX Dynamo 107W XL 185 each (740/set); exceeds existing 107V anchor's speed index without reducing load. |

If the data structure requires `setCost = 4 × retailAnchor.unitPrice`, use the exact observed set (e.g. 876 Nexen, 1,156 Radar, 756 Dynamo, 740 Dynamo) and explain location/stock uncertainty in the basis. Do not label a rounded Queensland planning estimate as the retailer's quote.

## Current retail observations

### 235/55R19

| Retailer / product | Index as displayed | Per tyre / four | Inclusions and availability |
|---|---|---:|---|
| EverTyres Nexen Nfera SU1 | 105W | 200 / 800 | Fully fitted, balanced, disposal; four shown in stock. In-store / fitting-partner terms; no personalised QLD availability confirmed. |
| TyrePoint Nexen N-Fera SU1 | 105W | 219 / 876 | Explicit GST, fitting, balancing, disposal; shown in stock. Sale price vs 240; no end date verified. Alignment excluded. |
| Tempe Nexen Nfera SU1 | 105W | 180 / 720 | Fitting, balancing, disposal included; sale. **Conflicting stock:** broad size page shows 8+ but Nexen-filter page says on order. Treat as a low-price indication, not a dependable immediate four-tyre offer. |
| JAX Laufenn S Fit AS LH01 | 105W XL | 315 / 1,260 before promotion | GST, fitting, balancing, valve, disposal, shipment to selected store included. Its displayed buy-four promotion is 242.50 each (970/set); do not assume the discount persists. |

Sources:

- [EverTyres Nexen SU1](https://www.evertyres.com.au/product/nexen-tyre-nfera-su1-235-55r19-105w)
- [TyrePoint Nexen SU1](https://www.tyrepoint.com.au/tyre/NEXEN/N-FERA-SU1/235-55R19/13052NXK?rel=0&showinfo=0)
- [Tempe size page](https://www.tempetyres.com.au/tyres?TyreDiameter=19&TyreProfile=55&TyreWidth=235), [Nexen filtered page](https://www.tempetyres.com.au/tyres?Brand=Nexen&TyreDiameter=19&TyreProfile=55&TyreWidth=235)
- [JAX 235/55R19](https://www.jaxtyres.com.au/tyres/sizes/19-inch/235-55r19)

A separate 105Y fallback exists: [Autosport / TYREPLUS Magill Continental PremiumContact 7 235/55R19 105Y XL](https://autostw.com.au/products/continental-235-55r19-105y-xl-fr-premiumcontact-7) displays 295 each / 1,180 per set, fitted and balanced with GST, against 365 previously; stock requires confirmation. Adelaide, not a Queensland quote. Disposal is not explicitly itemised on that product page. It avoids downgrading the existing 105Y SKU but remains an interstate promotional benchmark.

### 255/45R20

| Retailer / product | Index | Per tyre / four | Inclusions and availability |
|---|---|---:|---|
| JAX Radar Dimax R8+ | 105Y XL | 289 / 1,156 | Fitted/balanced/GST/valve/disposal/shipping to selected store. No product promotion shown. Store must be selected to confirm availability. |
| Tempe Kumho Ecsta PS71 | 105W | 230 / 920 | Sale, 8+ stock, fitting/balancing/disposal; NSW benchmark. |
| Tempe Nexen Nfera RU1 | 105W | 219 / 876 | Five stock, fitting/balancing/disposal; NSW benchmark. |

Sources: [JAX 255/45R20](https://www.jaxtyres.com.au/tyres/sizes/20-inch/255-45r20), [Tempe 255/45R20](https://www.tempetyres.com.au/tyres?TyreDiameter=20&TyreProfile=45&TyreWidth=255).

The very cheapest examples are not necessary to justify a reduction: the same Tempe list has Winrun R330 105W at 135 fitted. This establishes a low-price floor, not a quality recommendation. The 101T Audi-marked JAX EV tyre is **not** a substitute for a documented 105W Ioniq fitment. A 105H JAX budget tyre similarly cannot simply replace W without a legally permissible and vehicle-approved fitment check.

### 235/50R19

| Retailer / product | Index | Per tyre / four | Inclusions and availability |
|---|---|---:|---|
| JAX Dynamo Hiscend-H MSU02 | 103W XL | 189 / 756 | Fitted/balanced/GST/valve/disposal/shipping to selected store; local stock unconfirmed. |
| Tempe Roadstone Nfera RU5 | 103V | 170 / 680 | Eight-plus stock; fitting/balancing/disposal, NSW. |

Sources: [JAX 235/50R19](https://www.jaxtyres.com.au/tyres/sizes/19-inch/235-50r19), [Tempe 235/50R19](https://www.tempetyres.com.au/tyres?TyreDiameter=19&TyreProfile=50&TyreWidth=235). The [JAX March 2026 manufacturer-branded catalogue](https://www.jaxtyres.com.au/globalassets/products/product-promotions/online-catalogue/jax-catalogue-mar26.pdf) independently identifies the Hiscend-H MSU02 as **Dynamo**; its old 199 tariff is not used as today's price.

The JAX size page's cheaper-looking Laufenn 99V and Goodyear 99W are not equivalent to the existing 103 load-index reference. Do not reduce load index to obtain a headline saving. [Brisbane-based Tyre Blitz Kumho PS71 103V](https://tyreblitz.com.au/product/kumho-ecsta-ps71-235-50r19-103v-2/) has 134 inc GST, eight stock, **tyre only**: fitting is charged separately and its unselected fitting-service page's 0.00 is not a free-fitting offer. Not used as a fitted quote.

### 235/60R18

| Retailer / product | Index | Per tyre / four | Inclusions and availability |
|---|---|---:|---|
| JAX Dynamo Hiscend-H MSU01 | 107W XL | 185 / 740 | Fitted/balanced/GST/valve/disposal/shipping to selected store; local stock unconfirmed. |
| Tempe Kumho Crugen KL33 | 107V | 179 / 716 | Eight-plus stock; fitting/balancing/disposal, NSW. |

Sources: [JAX 235/60R18](https://www.jaxtyres.com.au/tyres/sizes/18-inch/235-60r18), [Tempe 235/60R18 107V](https://www.tempetyres.com.au/tyres?TyreDiameter=18&TyreProfile=60&TyreSpeed=V&TyreWidth=235). The latter also shows Yokohama Geolandar CV G058 107V at 185 and Winrun R380 107V at 125, both fitted with eight-plus stock. The same retailer returns 129 for the Winrun through a different unfiltered URL; do not anchor the budget to the absolute minimum inconsistent offer.

## Configuration evidence and limits

- [Hyundai Australian MY23 Ioniq 5 guide, p3](https://www.hyundai.com/content/dam/hyundai/au/en/ecomm/ioniq5v3/IONIQ5_Specification_Guide_version3.pdf): Dynamiq 235/55R19 **105W**, Techniq/Epiq 255/45R20 **105W**. [Current AU guide p3](https://www.hyundai.com/content/dam/hyundai/au/en/models/ioniq5/docs/2026-IONIQ-5-Specification-Sheet.pdf) repeats both indices. No evidence that branded acoustic foam or Michelin branding is compulsory. Verify actual placard before purchase.
- [Kia Australian EV6 MY24 sheet, p3](https://resource.digitaldealer.com.au/pdf/45505888866f3780287a48309089661.pdf) confirms Air 235/55R19 but does not print load/speed. [Michelin Australia EV6 Air RWD 2022](https://www.michelin.com.au/auto/manufacturers/kia/ev6/ev6-air-rwd/2022/1sp-auto-electric) identifies 105V. This supports the alternative's index, not a VIN-specific guarantee.
- [Kia AU Sorento hybrid brochure](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/sorento/kia-sorento-hybrid-brochure.pdf) confirms the 19-inch size but omits indices. Michelin AU identifies [2022 GT-Line AWD HEV](https://www.michelin.com.au/auto/browse-tyres/by-vehicle/kia/2022/sorento/sorento-gt-line-awd-hybrid/6sp-auto-1.6l-4cyl-t-slash-petrol-electric/235---55R19-105V), [2024 GT-Line hybrid](https://www.michelin.com.au/auto/manufacturers/kia/sorento/sorento-gt-line/2024/6sp-auto-1.6l-4cyl-t-slash-petrol-electric), and [2025 PHEV AWD GT-Line](https://www.michelin.com.au/auto/manufacturers/kia/sorento/sorento-phev-awd-gt-line/2025/6sp-auto-1.6l-4cyl-t-slash-petrol-electric) as 105V. Its own fitment disclaimer says the vehicle label and tyre professional govern. Exact older PHEV placard remains unverified.
- [Nissan Australia X-Trail launch sheet](https://www.nissan.com.au/content/dam/Nissan/AU/Files/Brochures/Models/Specsheet/NIS4609_T33_X-TRAIL_eSpec_ePOWER_Desktop_Web.pdf) confirms 235/55R19 but omits indices. [Costco's Bridgestone OE listing](https://www.costco.com.au/c/Bridgestone-23555R19-101V-BS-ALENZA-SPORT-AS-101V-ALENZA-SPORT-AS/tire/p/7007108) identifies 101V as original equipment on the 2023 X-Trail. Overseas Nissan T33 data agree, but must not be substituted silently for an Australian Ti placard. Proposed 105W exceeds this corroborative 101V reference, with the actual placard still pending.
- Mitsubishi's [Australian August 2022 Outlander brochure, wheel table p56](https://resource.digitaldealer.com.au/pdf/203895577962fd6ed950a45250775024.pdf) includes petrol and PHEV; 18-inch tyre 235/60R18 **103H**, 20-inch 255/45R20 **101W**. Search extraction exposes the table; direct browser tool could not open the large document (10MB limit), so do not treat column alignment as visually audited. [Bridgestone Australia 255/45R20 Alenza 001 101W](https://www.bridgestone.com.au/tyres/au/bridgestone/alenza/001/11008107) also identifies it as OE on 2025 Outlander. These challenge the previous premium retail anchor's implied minimum, but do not establish the MY26 updated PHEV placard.

No new Australian manufacturer placard image was verified for Sealion 6 or MY26 X-Trail FWD. Using 103W XL and 107W XL respectively preserves or exceeds the old retail references' indices while requiring a real placard check. A retailer's load/speed description is not itself proof of a manufacturer's minimum.

## Follow-up: Tesla 255/45R19 104W XL or higher

Checked the same day. These exact-size **104Y** alternatives establish that the 509-per-tyre acoustic Hankook is not a necessary cost assumption:

| Retailer / product | Each / four | Details |
|---|---:|---|
| [Tempe Goodyear Assurance ComfortTred](https://www.tempetyres.com.au/tyres?TyreDiameter=19&TyreProfile=45&TyreWidth=255) | 220 / 880 | 104Y; eight-plus stock; fitting, balancing, disposal. Alternate Goodyear-filter page shows 230, so treat 220–230 as an inconsistent online snapshot, not a universal tariff. |
| [Tempe Nexen Nfera SU1](https://www.tempetyres.com.au/tyres?Brand=Nexen&RunFlat=&TyreDiameter=19&TyreLoad=104&TyrePattern=&TyreProfile=45&TyreSpeed=&TyreWidth=255) | 205 / 820 | 104Y; eight-plus stock; fitted, balanced, disposal. No Tesla marking or acoustic premium listed. |
| [TyrePoint Nexen Nfera SU1, SKU 13524NXK](https://www.tyrepoint.com.au/tyre/nexen/NFERA-SU1/255-45R19/13524NXK) | 243 / 972 | 104Y; in stock; GST, valve, fitting, balancing, disposal. Sale versus 267. Their general freight terms allow a 20-per-tyre levy on some SUV products, despite the product summary saying delivery included: confirm final local price. No postcode selected or checkout submitted. |
| [Autosport / TYREPLUS Magill Winrun R330](https://autostw.com.au/products/winrun-255-45r19-104w-xl-r330) | 195 / 780 | Exact 104W XL; GST, fitted, balanced, disposal; Adelaide. Stock confirm required. This is a budget-price reference, not proof of equal wet performance or tread life. |

**Recommendation:** a **1,000-per-set Queensland planning estimate (800–1,300 bounds)** is defensible for the standard 19-inch Model Y, subject to placard/XL/pressure and local final quotation. Keep tyre-life assumptions separate; annual allowance at 15,000 km / 35,000 km life is approximately **429/year**, rather than 873/year from a 2,036 set. No lower load/speed rating is needed to explain this reduction.

The Australian retailer product headings above omit the XL suffix for Goodyear/Nexen. [Goodyear's manufacturer Assurance ComfortTred sheet](https://www.goodyear.com.sg/wp-content/uploads/Assurance%20ComfortTred%20SG.pdf), p2, explicitly lists **255/45R19 104Y XL**; Singapore specification, so confirm the delivered Australian SKU. Nexen SKU 13524NXK is corroborated as XL by multiple overseas retailers, but an Australian manufacturer listing was not verified; do not silently add XL to an unverified retailer quote. Exact XL Winrun evidence is explicit but less useful as a quality baseline.

[Tyre Blitz Goodyear ComfortTred 104Y](https://tyreblitz.com.au/product/goodyear-assurance-comforttred-255-45r19-104y/) search extraction shows 190 inc GST / 16 stock (root's earlier observation was 214 / 8). Both are **supply-only**, not fitted. Its [fitting service](https://tyreblitz.com.au/product/tyre-fitting-and-balancing/) requires a location selection and payment to the fitter; the unselected 0.00 cannot support free fitting. A clear fully fitted retailer observation is preferable to fabricating a local fitting surcharge.

Reject cheap **100V**, **100Y**, **104V**, out-of-stock or single-remaining-tyre offers as an immediate comparable replacement set for the current 104W XL reference. Optional 20-inch Model Y wheels require their own price and cannot inherit this 19-inch estimate.
