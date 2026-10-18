# Budget aftermarket tyre update

Checked **18 October 2026**. All amounts are AUD. The earlier defaults usually selected premium Michelin, Continental or acoustic/EV Hankook products. Those were real retail prices, but did not reflect the requested budget replacement strategy. They were not a requirement to buy genuine vehicle-branded tyres.

## Implemented budgets

| Cars / wheel reference | Four fitted, planning budget | Annual allowance at 15,000 km |
|---|---:|---:|
| Model Y, 19-inch | $1,000 | $380 |
| Atto 3 original / Essential / EVO | $660 / $580 / $716 | $250 / $220 / $270 |
| EV5 / older RAV4 / Outback, 225/60R18 | $756 | $280 |
| EV6 / Ioniq 5 / Sorento / X-Trail Ti, 235/55R19 | $900 | $340 |
| Ioniq 5 / Outlander PHEV, 255/45R20 | $1,156 | $430 |
| Sealion 6, 235/50R19 | $756 | $280 |
| New RAV4 / X-Trail e-Power FWD / petrol Outlander, 235/60R18 | $740 | $280 |
| Older / new Forester | $700 / $676 | $260 / $250 |
| Sportage / Tucson / Carnival / petrol X-Trail, 235/65R17 | $800 | $300 |
| Kluger, 235/65R18 | $900 | $340 |
| Zeekr 7X, HL255/50R19 110V | $1,516 premium fallback; budget fitment gap | $570 |

All use **40,000 km assumed life**, with 25,000–60,000 km sensitivity. This is a common planning scenario, not an empirical claim of equal tyre wear or a guarantee that a budget tyre will last 40,000 km. Annual savings allowance = fitted set × annual km ÷ life, rounded to $10. The earlier Tesla 35,000 / other EV 40,000 / many ICE 45,000 km distinctions lacked model/tyre-combination evidence and have been removed. Age, damage and actual wear can require earlier replacement independently of distance.

The original Model Y tyre allowance falls from **$870 to $380/year**. Keeping other inputs unchanged, its default running budget becomes **$5,525.15/year**, including $1,000 repair savings; costs before that fund are **$4,525.15**. The existing running-cost scoring formula now gives **6.6/10**. Personal annual tyre overrides, including zero and shared budgets, remain intact.

## Evidence and limits

- **Tesla:** [TyrePoint Nexen Nfera SU1 255/45R19 104Y](https://www.tyrepoint.com.au/tyre/nexen/NFERA-SU1/255-45R19/13524NXK) advertises $243 each / $972 for four fitted on sale, with GST, balance and disposal; regular $267 each. Its terms allow a $20/tyre SUV freight levy. [Tempe's exact-size list](https://www.tempetyres.com.au/tyres?TyreDiameter=19&TyreProfile=45&TyreWidth=255) has 104Y Nexen $205 and Goodyear $220 fitted, with 8+ displayed stock. These are not confirmed Brisbane quotes. The $1,000 default is an analyst planning value, not a supplier's offer. [Tesla's Australian original Model Y manual](https://www.tesla.com/ownersmanual/2020_2024_modely/en_au/GUID-94F63B13-EA2C-45D9-83AB-5DCA6295D587.html) permits non-specified tyres meeting or exceeding original load/speed requirements. Verify the actual car's placard and XL construction before purchase, including Juniper differences.
- **Other cars:** exact JAX fitted/GST-inclusive price anchors are used where established. Rounded $700–900 values allow some local/stock/promotion variation around published offers and are explicitly estimates. Supply-only prices, out-of-stock products and temporary four-for-three offers are not represented as guaranteed fitted defaults. Alignment is separate. Wheel size, load and speed are not interchangeable across every variant in a family.
- **Zeekr exception:** [JAX](https://www.jaxtyres.com.au/tyres/sizes/19-inch/255-50r19) provides an exact HL110 Pirelli $379 fitted reference. Cheaper 103/107-load generic tyres were rejected. [Tempe's 110W Kumho](https://www.tempetyres.com.au/tyres?Brand=Kumho&TyreDiameter=19&TyreProfile=50&TyreWidth=255) showed only one tyre, so it did not establish an available four-tyre budget set; exact HL/fitment remains pending. Retain a clearly labelled premium fallback rather than inventing a compatible budget quote.
- **Life:** [Bridgestone Australia](https://www.bridgestone.com.au/Learn/Maintenance/Age-of-a-tyre) gives broad general guidance, not model-specific averages. [Michelin Australia](https://www.michelin.com.au/auto/advice/ev-guide/electric-vehicles-faq) explains regular tyres can suit EVs when ratings match, and discusses potential wear/range/noise differences. [Tyre Stewardship Australia's review, §4.3.2](https://storage.googleapis.com/tsa_craftcms_media/assets/pdf-resources/TSA-EVs-and-End-of-Life-Tyres-Report.pdf) documents limited evidence for quantitative replacement-frequency claims. These do not establish a Tesla-only 35,000 km average.

Equal size/load/speed establishes a fitment screening criterion, not identical wet braking, comfort, efficiency or durability. The dashboard is budgeting for a price tier, not endorsing every budget tyre. No household details were submitted, quotes requested, appointments booked or tyres purchased.

## Underlying research

- [Compact SUV sizes and exact prices](BUDGET-TYRES-COMPACT-2026-10-18.md)
- [Large SUV sizes and Tesla follow-up](BUDGET-TYRES-LARGE-2026-10-18.md)
- [Petrol/diesel sizes, Queensland prices and life evidence](BUDGET-TYRES-ICE-LIFE-2026-10-18.md)

The main datasets and all existing research tyre overrides were updated together. New source records are in `src/data/budget-tyre-sources.json`. Optional `retailAnchor` records only describe exact fitted GST-inclusive quotes whose four-unit total equals the planning point; rounded planning values have no false retail anchor. Ownership and vehicle details expose the set budget, wheel reference, life assumption and annual calculation, with yellow estimates and editable annual inputs.
