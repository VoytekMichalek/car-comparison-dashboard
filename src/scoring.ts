import { brandFor, getPrice, reviewFor } from './data';
import { defaultWeights, rangeStandard, isFuelOnly, money } from './lib';
import { ownershipEstimate } from './ownership';
import { reviewScope } from './reviewScope';
import { fitAssessmentFor } from './research';
import { calculateFamilyFit } from './familyFit';
import type { PersonalData, ScoreCategory, ScoreWeights, Vehicle } from './types';

export const categoryLabels: Record<ScoreCategory, string> = { seating: 'Child-seat fit', price: 'Purchase price', running: 'Running budget', boot: 'Boot space', range: 'Electric range', safety: 'Safety rating', owners: 'People’s reviews', brand: 'Brand support' };
export const categoryRules: Record<ScoreCategory, string> = {
  seating: 'Target: one rear-facing plus two forward-facing seats/boosters. Detailed family fit: three-seat arrangement 45%, booster buckles 25%, cabin/clearance 20%, loading/access 10%. Evidence grades: good = 9, workable with constraints = 6, restricted = 2. Unknown criteria add no score or weight and reduce coverage. A documented arrangement restriction caps the score at 2; no established arrangement means no score. Exact published evidence factor = 80% × known criteria; related = 50% × known criteria. Your confirmed fit = 10. These are editorial practicality scores, not safety certification.',
  price: 'Asking price at 75% of your budget or less = 10; at the budget = 7; at 150% = 1. Linear between these points. Fees may be additional. Uncertain prices have less influence; missing prices are excluded.',
  running: 'Complete annual running budget: A$4,000 or less = 10; A$8,000 or more = 1; linear between. These fixed reference points are calibrated to the catalogue’s roughly A$4,500–8,100 default budgets, not a percentile rank. Filters and comparison selections do not change the scale. Includes repair savings and interest; excludes purchase and depreciation. The weakest automatic cost estimate limits its influence. Incomplete budgets are excluded.',
  boot: 'VDA five-seat boot: 300 L = 1, 600 L = 10, linear between. Missing or non-comparable measurements are excluded.',
  range: 'Plug-in electric range: 50 km or less = 1, 600 km or more = 10; linear between. WLTP has a 90% evidence factor; NEDC 50%. This category does not apply to conventional hybrids, petrol or diesel cars and is excluded for them.',
  safety: 'Applicable ANCAP stars × 2. Assessment years and protocols differ; this is a rating summary, not a collision-risk prediction. Unknown ratings are excluded.',
  owners: 'Community aggregate converted to /10. Evidence factor = n/(n+20), capped at 80%, multiplied by the scope-match factor. Small or poorly matched samples have less influence. Missing ratings, unknown sample sizes and incompatible generations are excluded.',
  brand: 'Australian service-support evidence: established = 8; developing = 6; limited = 3. Unverified support is excluded. This is support access, not a prediction of reliability.',
};
export interface CategoryScore { key: ScoreCategory; score: number | null; weight: number; confidence: number; effectiveWeight: number; applicable: boolean; reason: string; sourceIds: string[]; breakdown?: { label: string; score: number | null; share: number; detail: string; sourceIds: string[] }[] }
export interface ScoreResult { total: number | null; coverage: number; provisional: boolean; categories: CategoryScore[] }
const clamp = (value: number) => Math.max(1, Math.min(10, value));
export const formatScore = (value: number | null) => value === null ? '—' : value.toFixed(1);

export function runningBudgetScore(annual: number | null): number | null {
  return annual === null || !Number.isFinite(annual) || annual < 0 ? null : clamp(10 - (annual - 4000) * 9 / 4000);
}

/** Unknown categories reduce coverage, but never add a fabricated score to the average. */
export function summariseScores(categories: CategoryScore[]): ScoreResult {
  const applicableWeight = categories.reduce((sum, c) => sum + (c.applicable ? c.weight : 0), 0);
  const evidenced = categories.filter(c => c.applicable && c.score !== null && c.confidence > 0);
  const effectiveWeight = evidenced.reduce((sum, c) => sum + c.effectiveWeight, 0);
  const total = effectiveWeight > 0 ? Math.round(evidenced.reduce((sum, c) => sum + c.score! * c.effectiveWeight, 0) / effectiveWeight * 10) / 10 : null;
  const coverage = applicableWeight > 0 ? Math.round(effectiveWeight / applicableWeight * 100) : 0;
  return { total, coverage, provisional: total === null || coverage < 60, categories };
}

export function scoreVehicle(v: Vehicle, personal: PersonalData, weights: ScoreWeights = defaultWeights, budget = 45000): ScoreResult {
  const price = getPrice(v.id);
  const owners = reviewFor(v.familyId);
  const brand = brandFor(v.make);
  const costs = ownershipEstimate(v, personal);
  const categories: CategoryScore[] = [];
  const add = (key: ScoreCategory, score: number | null, confidence: number, reason: string, sourceIds: string[], applicable = true, breakdown?: CategoryScore['breakdown']) => {
    const evidence = applicable && score !== null && Number.isFinite(score) && Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0;
    const raw = evidence > 0 ? Math.round(clamp(score!) * 10) / 10 : null;
    categories.push({ key, score: raw, confidence: evidence, weight: weights[key], effectiveWeight: weights[key] * evidence, reason, sourceIds, applicable, ...(breakdown ? { breakdown } : {}) });
  };
  const confirmed = Boolean(personal.fitChecks[v.id]);
  const fitAudit = fitAssessmentFor(v.id);
  const detailedFit = fitAudit ? calculateFamilyFit(fitAudit) : null;
  add('seating', confirmed ? 10 : detailedFit?.score ?? null, confirmed ? 1 : detailedFit?.confidence ?? 0, confirmed ? 'Your fit confirmation for this configuration.' : detailedFit?.reason ?? `No detailed assessment for the current mixed-seat target; excluded from the score. ${v.familyFit.summary}`, detailedFit?.sourceIds ?? v.familyFit.sourceIds, true, confirmed ? undefined : detailedFit?.breakdown);
  const savedPrice = personal.ownership?.vehicleOverrides?.[v.id]?.purchase ?? personal.ownership?.purchasePrice;
  const hasSavedPrice = savedPrice != null;
  const asking = costs.purchasePrice;
  const priceScore = asking == null ? null : asking / budget <= .75 ? 10 : asking <= budget ? 10 - (asking / budget - .75) * 12 : 7 - (asking / budget - 1) * 12;
  add('price', priceScore, asking == null ? 0 : hasSavedPrice ? 1 : price?.kind === 'estimate' || price?.confidence === 'low' || price?.basis === 'unverified' || price?.basis === 'mixed' ? .35 : .8, asking == null ? 'No price evidence; excluded from the overall score.' : hasSavedPrice ? `Your saved purchase price / budget: A$${asking.toLocaleString('en-AU')}. ${costs.feesIncluded ? 'Duty and transfer treated as included.' : 'Duty and transfer may be additional.'}` : `${price?.kind === 'estimate' ? 'Planning estimate' : 'Representative dated asking price'}; ${price?.basis}. ${price?.note}`, hasSavedPrice ? [] : price?.sourceIds ?? []);
  add('running', costs.complete ? runningBudgetScore(costs.annual) : null, costs.complete ? costs.runningConfidence : 0, costs.complete ? `${money(costs.annual)}/year including repair savings and interest; ${money(costs.annualBeforeRepairFund!)} before the repair fund. Score = 10 − (annual budget − A$4,000) × 9 ÷ A$4,000, limited to 1–10. Fixed scale across the catalogue; not a percentile rank. Excludes purchase and depreciation. ${Math.round(costs.runningConfidence * 100)}% evidence factor; estimates reduce its influence.` : `Missing: ${costs.missing.join(', ')}. Excluded until the budget is complete.`, [...new Set(Object.values(costs.evidence).flatMap(e => e.sourceIds))]);
  const comparableBoot = v.boot.value !== null && /\bVDA\b/i.test(v.boot.basis) && !/non.?VDA|not.*VDA|not verified|unverified/i.test(v.boot.basis);
  add('boot', comparableBoot ? 1 + (v.boot.value! - 300) * .03 : null, comparableBoot ? 1 : 0, comparableBoot ? `${v.boot.value} L. ${v.boot.basis}` : `Measurement unavailable or not comparable; excluded. ${v.boot.basis}`, v.boot.sourceIds);
  const rangeKnown = v.range.value !== null && v.range.value > 0 && ['WLTP', 'NEDC'].includes(rangeStandard(v.range));
  const rangeApplicable = !isFuelOnly(v.powertrain);
  add('range', rangeApplicable && rangeKnown ? 1 + (v.range.value! - 50) * 9 / 550 : null, rangeKnown ? rangeStandard(v.range) === 'WLTP' ? .9 : .5 : 0, !rangeApplicable ? 'Not applicable: this car has no plug-in electric range. Excluded from both the overall score and evidence coverage.' : rangeKnown ? `${v.range.value} km. ${v.range.basis}` : `No comparable published electric-range figure; excluded. ${v.range.basis}`, v.range.sourceIds, rangeApplicable);
  add('safety', v.safety.stars === null ? null : v.safety.stars * 2, v.safety.stars === null ? 0 : 1, `${v.safety.year ?? 'Unverified assessment year'}. ${v.safety.applicability}`, v.safety.sourceIds);
  const scope = reviewScope(v);
  const reviewConfidence = owners?.rating == null ? 0 : Math.min(.8, (owners.count ?? 0) / ((owners.count ?? 0) + 20)) * scope.factor;
  add('owners', owners?.rating == null ? null : owners.rating / owners.outOf * 10, reviewConfidence, owners?.rating == null ? 'No suitable model-level aggregate verified; excluded.' : `${owners.rating}/${owners.outOf} · ${owners.count ?? 'unverified'} contributions. Scope factor ${Math.round(scope.factor * 100)}%. ${scope.note} ${owners.scope}${reviewConfidence === 0 ? ' Excluded from the overall score.' : ''}`, owners?.sourceIds ?? []);
  const supportScore = { established: 8, developing: 6, limited: 3, unverified: null };
  add('brand', brand ? supportScore[brand.support] : null, !brand || brand.support === 'unverified' ? 0 : .7, brand?.summary ?? 'Australian service-support evidence unverified; excluded.', brand?.sourceIds ?? []);
  return summariseScores(categories);
}
