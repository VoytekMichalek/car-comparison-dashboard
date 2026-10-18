import { z } from 'zod';
import { cargoRecords } from './cargo';
import { reviewCohorts, reviewCoverage, reviewExpansionPacks, reviewExpansionSources } from './reviewData';
import { applyResearchUpdates, familyFitAssessments, researchPacks, researchSources } from './research';
import rawRepairReserves from './data/repair-reserve-estimates.json';
import repairReserveSources from './data/repair-reserve-sources.json';
import rawRepairResearch from './data/repair-research.json';
import rawExpertReviews from './data/professional-reviews.json';
import expertSources from './data/professional-review-sources.json';
import evVehicles from './data/ev-vehicles.json';
import iceSubaru from './data/ice-subaru.json';
import iceKorean from './data/ice-korean.json';
import iceJapanese from './data/ice-japanese.json';
const icePacks: Record<string, unknown[]>[] = [iceSubaru, iceKorean, iceJapanese];
import hybridVehicles from './data/hybrid-vehicles.json';
import evSources from './data/ev-sources.json';
import hybridSources from './data/hybrid-sources.json';
import evPrices from './data/ev-prices.json';
import hybridPrices from './data/hybrid-prices.json';
import rawImages from './data/images.json';
import evOwnership from './data/ev-ownership.json';
import hybridOwnership from './data/hybrid-ownership.json';
import evOwnershipSources from './data/ev-ownership-sources.json';
import hybridOwnershipSources from './data/hybrid-ownership-sources.json';
import rawQldCosts from './data/qld-costs.json';
import qldSources from './data/qld-cost-sources.json';
import rawBrands from './data/brands.json';
import brandSources from './data/brand-sources.json';
import evReviews from './data/ev-reviews.json';
import hybridReviews from './data/hybrid-reviews.json';
import evReviewSources from './data/ev-review-sources.json';
import hybridReviewSources from './data/hybrid-review-sources.json';
import rawTyres from './data/tyre-estimates.json';
import rawInsurance from './data/insurance-estimates.json';
import rawBenchmarks from './data/budget-benchmarks.json';
import budgetSources from './data/budget-estimate-sources.json';
import rawFuelRequirements from './data/fuel-requirements.json';
import rawEnergyAssumptions from './data/energy-assumptions.json';
import type { ExpertReview, BrandInfo, ImageAsset, InsuranceEstimate, OwnerReview, OwnershipInfo, PriceSnapshot, Source, Vehicle } from './types';

const refs = z.array(z.string());
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const confidence = z.enum(['high', 'medium', 'low']);
export const repairResearch = z.object({ checked: date, method: z.string().min(1), findings: z.array(z.object({ familyIds: z.array(z.string()).min(1), title: z.string(), text: z.string(), sourceIds: refs.min(1) })) }).parse(rawRepairResearch);
const estimateSchema = z.object({ low: z.number().finite().nonnegative(), high: z.number().finite().nonnegative(), point: z.number().finite().nonnegative(), basis: z.string().min(1), confidence, sourceIds: refs.min(1) }).refine(e => e.low <= e.point && e.point <= e.high, 'Estimate must have an ordered low / point / high range.');
const fact = z.object({ value: z.number().finite().nonnegative().nullable(), unit: z.string(), basis: z.string().min(1), sourceIds: refs, energyBasis: z.enum(['battery', 'wall', 'unspecified']).optional() }).superRefine((f, ctx) => { if (f.value !== null && !f.sourceIds.length) ctx.addIssue({ code: 'custom', message: 'A numeric fact needs a source.' }); });
const vehicleSchema = z.object({
  id: z.string().min(1), familyId: z.string().min(1), make: z.string(), model: z.string(), variant: z.string(), years: z.array(z.number().int().min(2021).max(2026)).min(1), generation: z.string(), powertrain: z.enum(['BEV', 'PHEV', 'HEV', 'PETROL', 'DIESEL']), seats: z.number().int().min(4).max(9), drive: z.string(), headline: z.string(), summary: z.string(),
  range: fact, battery: fact, consumption: fact, observedConsumption: fact.optional(), observedRange: fact.optional(), depletedConsumption: fact, acCharging: fact, dcCharging: fact, boot: fact, bootAllRows: fact, length: fact, width: fact, towing: fact,
  chargeTime: z.string(), connector: z.string(), warranty: z.string(), batteryWarranty: z.string(), servicing: z.string(),
  safety: z.object({ stars: z.number().int().min(0).max(5).nullable(), year: z.number().int().nullable(), applicability: z.string(), sourceIds: refs }),
  familyFit: z.object({ status: z.enum(['tested-three', 'tested-multirow', 'tested-related', 'unverified', 'limitations']), summary: z.string(), row2: z.string(), row3: z.string(), testedSeats: z.string(), buckleAccess: z.string(), access: z.string(), ventilation: z.string(), sourceIds: refs }),
  pros: z.array(z.string()), cons: z.array(z.string()), inspection: z.array(z.string()), changes: z.array(z.object({ period: z.string(), text: z.string(), sourceIds: refs })), gaps: z.array(z.string()), sourceIds: refs, checked: date,
});
const sourceSchema = z.object({ id: z.string(), title: z.string(), url: z.url(), publisher: z.string(), kind: z.enum(['manufacturer', 'safety', 'family-test', 'review', 'market', 'recall']), checked: date });
const priceSchema = z.object({ id: z.string(), vehicleId: z.string(), low: z.number().nonnegative().nullable(), high: z.number().nonnegative().nullable(), condition: z.enum(['used', 'new']), basis: z.enum(['drive-away', 'excludes-charges', 'mixed', 'unverified']), sampleCount: z.number().int().nonnegative(), geography: z.string(), kilometres: z.string(), observed: date, note: z.string(), sourceIds: refs, kind: z.enum(['observation', 'estimate']).optional(), confidence: confidence.optional(), estimateBasis: z.string().optional(), point: z.number().finite().nonnegative().optional(), observations: z.array(z.object({ price: z.number().finite().nonnegative(), basis: z.enum(['drive-away', 'excludes-charges', 'mixed', 'unverified']), year: z.number().int().min(2021).max(2026).nullable(), kilometres: z.number().nonnegative().nullable(), location: z.string(), url: z.url(), sourceId: z.string(), checked: date, note: z.string() })).optional() }).superRefine((p, ctx) => { if (p.point !== undefined && (p.low === null || p.high === null || p.point < p.low || p.point > p.high)) ctx.addIssue({ code: 'custom', message: 'Representative price must be inside its range.' }); if (p.low !== null && (p.high === null || p.high < p.low || p.kind !== 'estimate' && p.sampleCount < 1 || !p.sourceIds.length)) ctx.addIssue({ code: 'custom', message: 'A price needs an ordered range, sources and either an observed sample or an explicit estimate label.' }); });
const imageSchema = z.object({ familyId: z.string(), path: z.string().startsWith('/images/'), alt: z.string(), credit: z.string(), license: z.string(), licenseUrl: z.url(), sourceUrl: z.url(), generation: z.string(), note: z.string() });

const fuelSchema = z.object({ vehicleId: z.string(), planningRon: z.union([z.literal(91), z.literal(95)]), minimumRon: z.union([z.literal(91), z.literal(95)]).nullable(), basis: z.string(), confidence, sourceIds: refs.min(1), checked: date });
export const fuelRequirements = z.array(fuelSchema).parse(applyResearchUpdates([...rawFuelRequirements, ...icePacks.flatMap(p => p.fuelRequirements)], 'fuelUpdates', 'vehicleId'));
export const energyAssumptions = z.object({ checked: date, regularRate: z.number().nonnegative(), premiumRate: z.number().nonnegative(), dieselRate: z.number().nonnegative(), dieselBasis: z.string(), regularBasis: z.string(), premiumBasis: z.string(), homeBasis: z.string(), publicBasis: z.string(), sourceIds: refs.min(1) }).parse(rawEnergyAssumptions);
export const vehicles: Vehicle[] = z.array(vehicleSchema).parse(applyResearchUpdates([...evVehicles, ...hybridVehicles, ...icePacks.flatMap(p => p.vehicles)], 'vehicleUpdates', 'id')).map(v => ({ ...v, fuel: fuelRequirements.find(f => f.vehicleId === v.id) }));
export const sources: Source[] = z.array(sourceSchema).parse([...evSources, ...hybridSources, ...evOwnershipSources, ...hybridOwnershipSources, ...qldSources, ...brandSources, ...evReviewSources, ...hybridReviewSources, ...budgetSources, ...expertSources, ...repairReserveSources, ...icePacks.flatMap(p => p.sources), ...researchSources, ...reviewExpansionSources]);
export const prices: PriceSnapshot[] = z.array(priceSchema).parse(applyResearchUpdates([...evPrices, ...hybridPrices, ...icePacks.flatMap(p => p.prices)], 'priceUpdates', 'id'));
export const images: ImageAsset[] = z.array(imageSchema).parse([...rawImages, ...icePacks.flatMap(p => p.images)]);
export const vehicleIds = new Set(vehicles.map(v => v.id));
export const sourceMap = new Map(sources.map(s => [s.id, s]));
export const vehicleMap = new Map(vehicles.map(v => [v.id, v]));
const ownershipInfoSchema = z.object({ serviceByVehicle: z.record(z.string(), z.object({ serviceAnnual: z.number().nonnegative(), serviceLow: z.number().nonnegative(), serviceHigh: z.number().nonnegative(), serviceBasis: z.string(), serviceConfidence: confidence }).refine(s => s.serviceLow <= s.serviceAnnual && s.serviceAnnual <= s.serviceHigh, 'Service bounds must be ordered.')).optional(), familyId: z.string(), serviceInterval: z.string(), serviceAnnual: z.number().nonnegative().nullable(), serviceBasis: z.string(), serviceLow: z.number().nonnegative().optional(), serviceHigh: z.number().nonnegative().optional(), serviceConfidence: confidence.optional(), energyEstimate: estimateSchema.optional(), energyByVehicle: z.record(z.string(), estimateSchema).optional(), fuelEstimate: estimateSchema.optional(), fuelByVehicle: z.record(z.string(), estimateSchema).optional(), depletedEstimate: estimateSchema.optional(), warrantyCautions: z.array(z.string()), risks: z.array(z.object({ title: z.string(), detail: z.string(), low: z.number().nonnegative().nullable(), high: z.number().nonnegative().nullable(), priceBasis: z.string(), warranty: z.string(), sourceIds: refs, confidence: confidence.optional() })), sourceIds: refs, checked: date });
export const ownershipInfo: OwnershipInfo[] = z.array(ownershipInfoSchema).parse(applyResearchUpdates([...evOwnership, ...hybridOwnership, ...icePacks.flatMap(p => p.ownership)], 'ownershipUpdates', 'familyId'));
export const insuranceEstimates: InsuranceEstimate[] = z.array(estimateSchema.safeExtend({ familyId: z.string(), checked: date })).parse(applyResearchUpdates([...rawInsurance, ...icePacks.flatMap(p => p.insurance)], 'insuranceUpdates', 'familyId'));
const depreciationSchema = z.object({ annualRate: z.number().min(0).max(1), lowRate: z.number().min(0).max(1), highRate: z.number().min(0).max(1), basis: z.string(), sourceIds: refs.min(1) }).refine(e => e.lowRate <= e.annualRate && e.annualRate <= e.highRate, 'Depreciation rates must be ordered.');
export const budgetBenchmarks = z.object({ tyresAnnual: estimateSchema, charger: estimateSchema, inspection: estimateSchema, depreciation: z.object({ BEV: depreciationSchema, PHEV: depreciationSchema, HEV: depreciationSchema, PETROL: depreciationSchema, DIESEL: depreciationSchema }) }).parse(rawBenchmarks);
const tyreSchema = z.object({ vehicleId: z.string(), setCost: z.number().positive(), setLow: z.number().nonnegative(), setHigh: z.number().positive(), lifeKm: z.number().positive(), lifeLowKm: z.number().positive(), lifeHighKm: z.number().positive(), basis: z.string(), confidence, sourceIds: refs.min(1), checked: date, retailAnchor: z.object({ size: z.string(), product: z.string(), unitPrice: z.number().positive(), quantity: z.literal(4), sourceId: z.string(), fitted: z.literal(true), gstIncluded: z.literal(true) }).optional() }).refine(e => e.setLow <= e.setCost && e.setCost <= e.setHigh && e.lifeLowKm <= e.lifeKm && e.lifeKm <= e.lifeHighKm, 'Tyre bounds must be ordered.');
export const tyreEstimates = z.array(tyreSchema).parse(applyResearchUpdates([...rawTyres, ...icePacks.flatMap(p => p.tyres)], 'tyreUpdates', 'vehicleId'));
export const repairReserves = z.array(estimateSchema.safeExtend({ vehicleId: z.string(), checked: date })).parse(applyResearchUpdates([...rawRepairReserves, ...icePacks.flatMap(p => p.repairReserves)], 'repairReserveUpdates', 'vehicleId'));
export function repairReserveFor(vehicleId: string) { return repairReserves.find(r => r.vehicleId === vehicleId); }
export function tyreFor(vehicleId: string) { return tyreEstimates.find(e => e.vehicleId === vehicleId); }
export function insuranceFor(familyId: string) { return insuranceEstimates.find(e => e.familyId === familyId); }
export const brands: BrandInfo[] = z.array(z.object({ make: z.string(), support: z.enum(['established', 'developing', 'limited', 'unverified']), summary: z.string(), network: z.string(), warrantyNote: z.string(), sourceIds: refs, checked: date })).parse(applyResearchUpdates([...rawBrands, ...icePacks.flatMap(p => p.brands)], 'brandUpdates', 'make'));
export const reviews: OwnerReview[] = z.array(z.object({ familyId: z.string(), rating: z.number().min(0).max(5).nullable(), outOf: z.number().positive(), count: z.number().int().nonnegative().nullable(), scope: z.string(), summary: z.string(), positiveThemes: z.array(z.string()), negativeThemes: z.array(z.string()), sourceIds: refs, checked: date })).parse(applyResearchUpdates([...evReviews, ...hybridReviews, ...icePacks.flatMap(p => p.reviews)], 'reviewUpdates', 'familyId'));
export const expertReviews: ExpertReview[] = z.array(z.object({ id: z.string(), familyId: z.string(), vehicleIds: refs, tested: z.string(), scope: z.string(), publisher: z.string(), published: date, checked: date, rating: z.number().min(0).max(10).nullable(), outOf: z.union([z.literal(5), z.literal(10)]), verdict: z.string(), positiveThemes: refs, negativeThemes: refs, sourceIds: refs.min(1) })).parse(applyResearchUpdates([...rawExpertReviews, ...icePacks.flatMap(p => p.expertReviews)], 'expertReviews', 'id', true));
const regoGroupSchema = z.object({ registration: z.number().positive(), trafficFee: z.number().nonnegative(), ctpLow: z.number().nonnegative(), ctpHigh: z.number().nonnegative(), sourceIds: refs });
const qldSchema = z.object({ checked: date, effective: date, bev: regoGroupSchema, fourCylinder: regoGroupSchema, transfer: z.object({ amount: z.number().nonnegative(), sourceIds: refs }), duty: z.object({ threshold: z.number().positive(), lowerRatePer100: z.number().positive(), higherRatePer100: z.number().positive(), conventionalFourCylinder: z.object({ lowerRatePer100: z.number().positive(), higherRatePer100: z.number().positive() }), sourceIds: refs }), ppsr: z.object({ amount: z.number().nonnegative(), sourceIds: refs }), insuranceNote: z.string(), sourceIds: refs });
export const qldCosts = qldSchema.parse(rawQldCosts);
export function ownershipFor(familyId: string) { return ownershipInfo.find(o => o.familyId === familyId); }
export function reviewFor(familyId: string) { return reviews.find(r => r.familyId === familyId); }
export function brandFor(make: string) { return brands.find(b => b.make.toLowerCase() === make.toLowerCase()); }
export function getPrice(id: string) { return prices.find(p => p.vehicleId === id); }
export function imageFor(v: Vehicle) {
  let key = v.familyId;
  if (key === 'tesla-model-y' && Math.min(...v.years) >= 2025) key += '-juniper';
  if (key === 'byd-atto-3' && /evo/i.test(v.generation + v.variant)) key += '-evo';
  if (key === 'kia-ev6' && Math.min(...v.years) >= 2025) key += '-facelift';
  if (key === 'hyundai-ioniq-5' && Math.min(...v.years) >= 2025) key += '-facelift';
  if (key === 'subaru-forester' && /sixth|S6|2025.*new/i.test(v.generation)) key += '-2025';
  if (key === 'toyota-rav4-hybrid' && /sixth|xa60|new generation|new-generation/i.test(v.generation)) key += '-2026';
  if (key === 'kia-sorento' && /facelift/i.test(v.generation)) key += '-facelift';
  return images.find(i => i.familyId === key);
}
export function validateReferences(): string[] {
  const errors: string[] = [];
  for (const cargo of cargoRecords) {
    for (const id of cargo.sourceIds) if (!sourceMap.has(id)) errors.push(`${cargo.id}: missing cargo source ${id}`);
    for (const id of cargo.vehicleIds) {
      const v = vehicleMap.get(id);
      if (!v) errors.push(`${cargo.id}: unknown cargo configuration ${id}`);
      else if (v.seats !== cargo.seats || v.boot.unit !== 'L' || v.boot.value !== cargo.rearSeatsUpLitres) errors.push(`${id}: cargo detail disagrees with vehicle rear-boot capacity/seats`);
    }
  }
  for (const family of new Set(vehicles.map(v => v.familyId))) if (!reviewCoverage.some(c => c.familyId === family)) errors.push(`${family}: missing expanded review coverage`);
  for (const v of vehicles) if (!reviewCohorts.some(c => c.familyId === v.familyId && c.matches.some(m => m.vehicleId === v.id))) errors.push(`${v.id}: missing expanded review applicability`);
  if (new Set(reviewCohorts.map(c => c.id)).size !== reviewCohorts.length) errors.push('Duplicate expanded review cohort');
  if (new Set(reviewCoverage.map(c => c.familyId)).size !== reviewCoverage.length) errors.push('Duplicate review coverage family');
  for (const pack of reviewExpansionPacks) {
    for (const source of pack.sources) if (source.checked !== pack.checked) errors.push(`${source.id}: review check date mismatch`);
    for (const c of pack.cohorts) {
      if (!vehicles.some(v => v.familyId === c.familyId)) errors.push(`Unknown review family ${c.familyId}`);
      if (c.checked !== pack.checked) errors.push(`${c.id}: review check date mismatch`);
      for (const match of c.matches) if (vehicleMap.get(match.vehicleId)?.familyId !== c.familyId) errors.push(`${c.id}: review match outside family ${match.vehicleId}`);
      for (const id of c.sourceIds) if (!sourceMap.has(id)) errors.push(`${c.id}: missing review source ${id}`);
    }
    for (const c of pack.coverage) {
      if (!vehicles.some(v => v.familyId === c.familyId)) errors.push(`Unknown review coverage ${c.familyId}`);
      for (const id of c.sourceIds) if (!sourceMap.has(id)) errors.push(`${c.familyId}: missing review coverage source ${id}`);
    }
  }
  if (new Set(researchPacks.map(p => p.familyId)).size !== researchPacks.length) errors.push('Duplicate research family');
  if (new Set(familyFitAssessments.map(a => a.vehicleId)).size !== familyFitAssessments.length) errors.push('Duplicate family-fit assessment');
  for (const pack of researchPacks) {
    const scopedIds = vehicles.filter(v => v.familyId === pack.familyId).map(v => v.id);
    if (!scopedIds.length) errors.push(`Unknown research family ${pack.familyId}`);
    if (new Set(pack.audit.items.map(i => i.key)).size !== 10) errors.push(`${pack.familyId}: incomplete research checklist`);
    for (const id of scopedIds) if (!pack.fitAssessments.some(a => a.vehicleId === id)) errors.push(`${id}: missing detailed fit assessment`);
    for (const item of pack.audit.items) {
      if (!item.sourceIds.length && item.status === 'verified') errors.push(`${pack.familyId}/${item.key}: verified without evidence`);
      for (const id of item.vehicleIds) if (!scopedIds.includes(id)) errors.push(`${pack.familyId}/${item.key}: incorrect configuration ${id}`);
      for (const id of item.sourceIds) if (!sourceMap.has(id)) errors.push(`${pack.familyId}/${item.key}: missing source ${id}`);
    }
    for (const assessment of pack.fitAssessments) {
      if (!scopedIds.includes(assessment.vehicleId)) errors.push(`${pack.familyId}: incorrect fit configuration ${assessment.vehicleId}`);
      for (const c of Object.values(assessment.criteria)) for (const id of c.sourceIds) if (!sourceMap.has(id)) errors.push(`${assessment.vehicleId}: missing fit criterion source ${id}`);
    }
    for (const update of pack.vehicleUpdates) if (!scopedIds.includes(String(update.id))) errors.push(`${pack.familyId}: vehicle update outside family`);
    for (const update of [...pack.tyreUpdates, ...pack.repairReserveUpdates, ...pack.fuelUpdates, ...pack.priceUpdates]) if (!scopedIds.includes(String(update.vehicleId))) errors.push(`${pack.familyId}: cost update outside family`);
    for (const update of [...pack.ownershipUpdates, ...pack.reviewUpdates, ...pack.insuranceUpdates, ...pack.expertReviews]) if (update.familyId !== pack.familyId) errors.push(`${pack.familyId}: update has incorrect family`);
    for (const source of pack.sources) if (source.checked !== pack.checked) errors.push(`${pack.familyId}: source check date does not match audit`);
  }
  if (new Set(fuelRequirements.map(f => f.vehicleId)).size !== fuelRequirements.length) errors.push('Duplicate fuel requirements');
  for (const f of fuelRequirements) {
    if (!vehicleIds.has(f.vehicleId) || vehicleMap.get(f.vehicleId)?.powertrain === 'BEV') errors.push(`Invalid fuel configuration ${f.vehicleId}`);
    for (const id of f.sourceIds) if (!sourceMap.has(id)) errors.push(`${f.vehicleId}: missing fuel source ${id}`);
  }
  for (const v of vehicles) if (v.powertrain !== 'BEV' && v.powertrain !== 'DIESEL' && !v.fuel) errors.push(`${v.id}: missing fuel-grade research`);
  for (const id of energyAssumptions.sourceIds) if (!sourceMap.has(id)) errors.push(`Energy assumption missing source ${id}`);
  for (const finding of repairResearch.findings) {
    for (const id of finding.sourceIds) if (!sourceMap.has(id)) errors.push(`Repair research missing source ${id}`);
    for (const id of finding.familyIds) if (!vehicles.some(v => v.familyId === id)) errors.push(`Repair research unknown family ${id}`);
  }
  for (const [name, items] of [['vehicle', vehicles], ['source', sources], ['price', prices]] as const) if (new Set(items.map(i => i.id)).size !== items.length) errors.push(`Duplicate ${name} IDs`);
  for (const v of vehicles) {
    const allRefs = [...v.sourceIds, ...v.familyFit.sourceIds, ...v.safety.sourceIds, ...v.changes.flatMap(c => c.sourceIds), ...[v.range, v.battery, v.consumption, v.depletedConsumption, v.acCharging, v.dcCharging, v.boot, v.bootAllRows, v.length, v.width, v.towing, ...(v.observedConsumption ? [v.observedConsumption] : []), ...(v.observedRange ? [v.observedRange] : [])].flatMap(f => f.sourceIds)];
    allRefs.filter(id => !sourceMap.has(id)).forEach(id => errors.push(`${v.id}: missing source ${id}`));
    if (v.familyFit.status.startsWith('tested') && !v.familyFit.sourceIds.length) errors.push(`${v.id}: fit claim missing evidence`);
  }
  for (const p of prices) {
    if (!vehicleIds.has(p.vehicleId)) errors.push(`${p.id}: unknown vehicle`);
    p.sourceIds.filter(id => !sourceMap.has(id)).forEach(id => errors.push(`${p.id}: missing source ${id}`));
    for (const o of p.observations ?? []) {
      if (!sourceMap.has(o.sourceId)) errors.push(`${p.id}: observation source missing ${o.sourceId}`);
      if (o.year !== null && !vehicleMap.get(p.vehicleId)?.years.includes(o.year)) errors.push(`${p.id}: observation outside configuration years`);
      if (p.low !== null && (o.price < p.low || o.price > p.high!)) errors.push(`${p.id}: observation outside price band`);
    }
    if (p.observations?.length && p.kind !== 'estimate' && p.observations.length !== p.sampleCount) errors.push(`${p.id}: observation count mismatch`);
  }
  for (const e of expertReviews) {
    if (!vehicles.some(v => v.familyId === e.familyId)) errors.push(`${e.id}: unknown review family`);
    for (const id of e.vehicleIds) if (vehicleMap.get(id)?.familyId !== e.familyId) errors.push(`${e.id}: incorrect review configuration`);
    for (const id of e.sourceIds) if (!sourceMap.has(id)) errors.push(`${e.id}: missing review source ${id}`);
  }
  for (const item of [...ownershipInfo, ...reviews, ...brands]) {
    item.sourceIds.filter(id => !sourceMap.has(id)).forEach(id => errors.push(`Ownership/review missing source ${id}`));
  }
  for (const item of ownershipInfo) for (const id of [...Object.keys(item.serviceByVehicle ?? {}), ...Object.keys(item.energyByVehicle ?? {}), ...Object.keys(item.fuelByVehicle ?? {})]) if (vehicleMap.get(id)?.familyId !== item.familyId) errors.push(`${item.familyId}: ownership override for incorrect configuration ${id}`);
  for (const item of ownershipInfo) for (const risk of item.risks) {
    risk.sourceIds.filter(id => !sourceMap.has(id)).forEach(id => errors.push(`${item.familyId}: repair missing source ${id}`));
    if (risk.low !== null && (risk.high === null || risk.high < risk.low || !risk.sourceIds.length)) errors.push(`${item.familyId}: invalid repair quote range`);
  }
  for (const item of [...repairReserves, ...tyreEstimates, ...insuranceEstimates, ...ownershipInfo.flatMap(o => [o.energyEstimate, ...Object.values(o.energyByVehicle ?? {}), o.fuelEstimate, o.depletedEstimate, ...Object.values(o.fuelByVehicle ?? {})].filter(e => e !== undefined)), budgetBenchmarks.tyresAnnual, budgetBenchmarks.charger, budgetBenchmarks.inspection, ...Object.values(budgetBenchmarks.depreciation)]) {
    item.sourceIds.filter(id => !sourceMap.has(id)).forEach(id => errors.push(`Budget estimate missing source ${id}`));
  }
  for (const r of repairReserves) if (!vehicleIds.has(r.vehicleId)) errors.push(`Repair reserve has unknown configuration ${r.vehicleId}`);
  if (new Set(repairReserves.map(r => r.vehicleId)).size !== repairReserves.length) errors.push('Duplicate repair reserve configurations');
  if (new Set(tyreEstimates.map(t => t.vehicleId)).size !== tyreEstimates.length) errors.push('Duplicate tyre estimate configurations');
  for (const t of tyreEstimates) {
    if (!vehicleIds.has(t.vehicleId)) errors.push(`Tyre estimate has unknown configuration ${t.vehicleId}`);
    if (t.retailAnchor && (!t.sourceIds.includes(t.retailAnchor.sourceId) || !sourceMap.has(t.retailAnchor.sourceId))) errors.push(`${t.vehicleId}: tyre retail anchor missing source`);
    if (t.retailAnchor && Math.abs(t.retailAnchor.unitPrice * t.retailAnchor.quantity - t.setCost) > .01) errors.push(`${t.vehicleId}: tyre set does not match fitted unit prices`);
  }
  for (const id of qldCosts.sourceIds) if (!sourceMap.has(id)) errors.push(`QLD cost missing source ${id}`);
  return errors;
}
