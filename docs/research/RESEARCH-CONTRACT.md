# Per-model deep audit, 18 October 2026

Each model family has a dedicated research agent. Read the existing entries, ownership, prices, reviews, tyre/insurance/repair estimates and source registry before browsing. Audit every populated configuration, including scope changes between years. Do not invent evidence, silently generalise an overseas variant, or change values to match a desired ranking.

Write only `src/data/research/<familyId>.json` and `docs/research/<familyId>.md`. Other agents own other families; the root integrates the packs. Do not edit shared data/code. Do not spawn other research agents.

JSON contract (omit empty update arrays):

```json
{
  "familyId": "exact-existing-family-id", "checked": "2026-10-18",
  "sources": [], "vehicleUpdates": [], "priceUpdates": [],
  "ownershipUpdates": [], "reviewUpdates": [], "expertReviews": [],
  "insuranceUpdates": [], "tyreUpdates": [], "repairReserveUpdates": [],
  "fitAssessments": [],
  "audit": {"summary": "Concise material findings.", "items": []}
}
```

Updates use existing schemas in `src/types.ts` / `src/data.ts`. `vehicleUpdates`, tyres and repair reserves identify records by `id` or `vehicleId` as appropriate; ownership, reviews and insurance by `familyId`. Updates merge recursively, arrays replace. Provide complete fact objects for numerical changes. Price updates must be complete, internally consistent snapshots; preserve actual physical-car counts, exclude sold cars/cross-post duplicates, distinguish charges and observation dates. Expert reviews are complete new entries with unique IDs. Prefix new source IDs `audit-<familyId>-...`; only mark sources checked after actually reading them. Every new material claim needs a source ID. When estimates cannot be improved honestly, keep them and describe the gap.

`OwnershipInfo.energyByVehicle` permits a configuration-specific electrical planning estimate ahead of the family fallback, with the same low/point/high/basis/confidence/sourceIds schema. These proxies use an explicitly assumed battery-side boundary and are adjusted for charging losses; disclose that assumption. Do not substitute PHEV weighted use per total kilometre for electric-distance consumption.

Optional `fuelUpdates` (key `vehicleId`) and `brandUpdates` (key `make`) can carry precisely scoped corrections. Avoid brand-wide changes if another agent owns that make; report proposed changes to root instead.

AAA Real-World Testing can close missing observed EV consumption. The Annex IV BEV protocol defines energy consumption from mains recharge, so use `energyBasis: "wall"` where that protocol applies; do not add charging losses again. Preserve tested variant/year and actual observed range versus lab/WLTP, and read both the result and protocol before applying it. The Tesla agent found https://realworld.org.au/wp-protected/9c5bc2b93c32/uploads/2025/03/250303-RWT-Annex-IV-PEV-Test-Procedure-ver1_1-March-2025.pdf .

`Vehicle` now also supports optional `observedConsumption` and `observedRange` complete Fact objects. Keep observed results separate from official range/consumption claims. Matched BEV observed consumption with a documented wall/battery boundary informs the ownership energy budget; household overrides still win. Do not substitute another trim, wheel or battery variant as an exact match. PHEV weighted fuel results must never become depleted fuel figures.

`fitAssessments` contains one entry per existing configuration:

```json
{
  "vehicleId": "stable-id", "scope": "exact", "summary": "What the test really establishes.",
  "criteria": {
    "arrangement": {"rating": "good", "detail": "Exact tested seats/facing/positions; three across or an anchored multirow arrangement.", "sourceIds": ["source-id"]},
    "buckles": {"rating": "unknown", "detail": "Booster buckle access not tested.", "sourceIds": []},
    "space": {"rating": "workable", "detail": "Independent observations of restraint, leg/headroom and front-seat clearance.", "sourceIds": ["source-id"]},
    "access": {"rating": "workable", "detail": "Door opening, getting children in, and occupied-third-row access.", "sourceIds": ["source-id"]}
  }
}
```

Allowed `scope`: `exact`, `related`, `unknown`. Allowed criterion `rating`: `good`, `workable`, `restricted`, `unknown`. These are editorial evidence assessments, not safety certification. `good` requires positive practical evidence, `workable` means a demonstrated fit with meaningful constraints, `restricted` means a documented failure/serious constraint. Unverified is always `unknown`, with zero scoring influence. A narrow three-seat combination does not establish daily booster buckle access. **USER UPDATE: target is three restraints INCLUDING ONE REAR-FACING, plus two forward-facing seats or boosters; exact models unspecified.** Rate arrangement for this mixed target and front-seat clearance with the rear-facing seat installed. Failure of three forward-facing seats alone does not mean this mixed arrangement fails. A single fit test does not imply any three seats fit. Do not use car body width alone to rate cabin fit. Distinguish related-trim/generation tests and original versus facelift.

`audit.items` must cover ALL these keys exactly once, with `status` (`verified`, `estimate`, `gap`, `conflict`), `finding` (concise, specific), `sourceIds`, and `vehicleIds` (all applicable configuration IDs):

1. `pricing` — dated current asking observations/new pricing, fee/km/location and thin-sample caveats.
2. `powertrain` — battery/range standards, observed vs rated use, charging, fuel grade, drivetrain/year applicability.
3. `family` — test combination, anchors/row access, booster buckles, dimensions/boot/vents.
4. `warranty` — original delivery terms, battery retention, service/transfer eligibility, exceptions.
5. `servicing` — interval, actual scheduled costs, expensive fluid work, estimate inclusions.
6. `insurance` — model-specific public quote/premium evidence and explicit household-quote limitations.
7. `tyres` — correct placard/wheel sizes, fitted retail anchor, assumed life, annualised estimate.
8. `repairs` — official recalls, documented fault/component costs, warranty remedies vs out-of-pocket, reserve uncertainty. No annual failure probability from anecdotes.
9. `reviews` — scoped community aggregate/sample count and professional verdicts; variant and generation mismatch.
10. `ownership` — towing, safety applicability, QLD fee group, depreciation/other material costs, inspection questions.

Use manufacturer AU PDFs/manuals, ANCAP and official Australian recall records for facts. Use Australian BabyDrive and other independent practical tests for observations, credible Australian retail/dealer/repair sources for prices. Browse beyond the existing sources where gaps matter; read pages, not just search snippets. Aim for thorough item-by-item verification, not a source-count target. Check at least manufacturer/safety/family/market/ownership/reviews where available. Record blocked/contradictory evidence as such. Prefer concise paraphrases over extensive quotation.

The Markdown report records important changes, unchanged values that were verified, search/coverage limitations, original source URLs and reasons for any proposed score distinction. If there is no better empirical annual repair average, say so. Return a compact summary with changed numbers and strongest family-fit finding, plus output paths.
