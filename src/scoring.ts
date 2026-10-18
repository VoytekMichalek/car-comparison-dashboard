import { brandFor, getPrice, reviewFor } from './data';
import { defaultWeights, rangeStandard, representativePrice } from './lib';
import { ownershipEstimate } from './ownership';
import { reviewScope } from './reviewScope';
import type { PersonalData, ScoreCategory, ScoreWeights, Vehicle } from './types';

export const categoryLabels: Record<ScoreCategory, string> = { seating: 'Child-seat fit', price: 'Purchase price', running: 'Running costs', boot: 'Boot space', range: 'Electric range', safety: 'Safety rating', owners: 'People’s reviews', brand: 'Brand support' };
export const categoryRules: Record<ScoreCategory, string> = {
  seating: 'Your confirmed fit = 10; published combination = 8; documented limitations = 3; unverified = neutral 5. Published tests still require your own seat check.',
  price: 'Asking price at 75% of your budget or less = 10; at the budget = 7; at 150% = 1. Linear between these points. Fees may be additional.',
  running: 'Complete annual running budget: A$2,000 or less = 10; A$6,500 or more = 1; linear between. Uses quotes or yellow planning estimates. Confidence is limited by the weakest automatic estimate; missing costs = neutral 5.',
  boot: 'VDA five-seat boot: 300 L = 1, 600 L = 10, linear between. Non-comparable or unspecified measurement = neutral 5.',
  range: 'Plug-in electric range: 50 km or less = 1, 600 km or more = 10; linear between. HEVs = 1 for this specific criterion. NEDC evidence gets lower confidence than WLTP. Reduce this weight if petrol backup matters more.',
  safety: 'Applicable ANCAP stars × 2. Assessment years and protocols differ; this is a rating summary, not a collision-risk prediction. Unknown = neutral 5.',
  owners: 'Community aggregate converted to /10. Evidence factor = n/(n+20), capped at 80%, multiplied by the stated scope-match factor. Incompatible generations are excluded. The adjusted score moves towards neutral 5 when evidence is weak.',
  brand: 'Australian service-support evidence: established = 8; developing = 6; limited = 3; unverified = neutral 5. This is support access, not a prediction of reliability.',
};
export interface CategoryScore { key: ScoreCategory; score: number; adjusted: number; weight: number; confidence: number; applicable: boolean; reason: string; sourceIds: string[] }
export interface ScoreResult { total: number; coverage: number; provisional: boolean; categories: CategoryScore[] }
const clamp = (value: number) => Math.max(1, Math.min(10, value));
export function scoreVehicle(v: Vehicle, personal: PersonalData, weights: ScoreWeights = defaultWeights, budget = 45000): ScoreResult {
  const price = getPrice(v.id);
  const owners = reviewFor(v.familyId);
  const brand = brandFor(v.make);
  const costs = ownershipEstimate(v, personal);
  const categories: CategoryScore[] = [];
  const add = (key: ScoreCategory, score: number, confidence: number, reason: string, sourceIds: string[], applicable = true) => { const raw = Math.round(clamp(score) * 10) / 10; categories.push({ key, score: raw, adjusted: Math.round((5 + (raw - 5) * confidence) * 10) / 10, confidence, weight: weights[key], reason, sourceIds, applicable }); };
  const confirmed = Boolean(personal.fitChecks[v.id]);
  const tested = v.familyFit.status.startsWith('tested');
  add('seating', confirmed ? 10 : tested ? 8 : v.familyFit.status === 'limitations' ? 3 : 5, confirmed ? 1 : tested ? .8 : v.familyFit.status === 'limitations' ? 1 : 0, confirmed ? 'Your fit confirmation for this configuration.' : v.familyFit.summary, v.familyFit.sourceIds);
  const asking = representativePrice(price);
  const priceScore = asking == null ? 5 : asking / budget <= .75 ? 10 : asking <= budget ? 10 - (asking / budget - .75) * 12 : 7 - (asking / budget - 1) * 12;
  add('price', priceScore, asking == null ? 0 : price?.kind === 'estimate' || price?.confidence === 'low' || price?.basis === 'unverified' || price?.basis === 'mixed' ? .35 : .8, asking == null ? 'No price evidence.' : `${price?.kind === 'estimate' ? 'Planning estimate' : 'Representative dated asking price'}; ${price?.basis}. ${price?.note}`, price?.sourceIds ?? []);
  add('running', costs.complete ? 10 - (costs.annual - 2000) / 500 : 5, costs.complete ? costs.runningConfidence : 0, costs.complete ? `Annual budget including reserves and interest; excludes depreciation. ${Math.round(costs.runningConfidence * 100)}% evidence factor; automatic estimates reduce confidence.` : `Missing: ${costs.missing.join(', ')}. Neutral score until priced.`, v.consumption.sourceIds);
  const comparableBoot = v.boot.value !== null && /\bVDA\b/i.test(v.boot.basis) && !/non.?VDA|not.*VDA|not verified|unverified/i.test(v.boot.basis);
  add('boot', comparableBoot ? 1 + (v.boot.value! - 300) * .03 : 5, comparableBoot ? 1 : 0, comparableBoot ? `${v.boot.value} L. ${v.boot.basis}` : `Measurement not comparable for scoring. ${v.boot.basis}`, v.boot.sourceIds);
  const rangeKnown = v.range.value !== null && ['WLTP', 'NEDC'].includes(rangeStandard(v.range));
  add('range', v.powertrain === 'HEV' ? 1 : rangeKnown ? 1 + (v.range.value! - 50) * 9 / 550 : 5, v.powertrain === 'HEV' ? 1 : rangeKnown ? rangeStandard(v.range) === 'WLTP' ? .9 : .5 : 0, v.powertrain === 'HEV' ? 'No plug-in electric range. Reduce this category’s weight if petrol backup matters more.' : `${v.range.value ?? 'Unverified'} km. ${v.range.basis}`, v.range.sourceIds);
  add('safety', v.safety.stars === null ? 5 : v.safety.stars * 2, v.safety.stars === null ? 0 : 1, `${v.safety.year ?? 'Unverified assessment year'}. ${v.safety.applicability}`, v.safety.sourceIds);
  const scope = reviewScope(v);
  add('owners', owners?.rating == null ? 5 : owners.rating / owners.outOf * 10, owners?.rating == null ? 0 : Math.min(.8, (owners.count ?? 0) / ((owners.count ?? 0) + 20)) * scope.factor, owners?.rating == null ? 'No suitable model-level aggregate verified.' : `${owners.rating}/${owners.outOf} · ${owners.count ?? 'unverified'} contributions. Scope factor ${Math.round(scope.factor * 100)}%. ${scope.note} ${owners.scope}`, owners?.sourceIds ?? []);
  const supportScore = { established: 8, developing: 6, limited: 3, unverified: 5 };
  add('brand', brand ? supportScore[brand.support] : 5, !brand || brand.support === 'unverified' ? 0 : .7, brand?.summary ?? 'Australian service-support evidence unverified.', brand?.sourceIds ?? []);
  const active = categories.filter(c => c.applicable);
  const sum = active.reduce((total, c) => total + c.weight, 0);
  const total = active.reduce((total, c) => total + c.adjusted * c.weight, 0) / sum;
  const coverage = Math.round(active.reduce((total, c) => total + c.confidence * c.weight, 0) / sum * 100);
  return { total: Math.round(total * 10) / 10, coverage, provisional: coverage < 60, categories };
}
