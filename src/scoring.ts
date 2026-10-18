import { brandFor, getPrice } from './data';
import { defaultWeights, rangeStandard, isFuelOnly, money, formatDate } from './lib';
import { ownershipEstimate } from './ownership';
import { reviewEvidenceFor } from './reviewEvidence';
import { fitAssessmentFor } from './research';
import { calculateFamilyFit, familyFitTarget } from './familyFit';
import type { PersonalData, ScoreCategory, ScoreWeights, Vehicle } from './types';

export const categoryLabels: Record<ScoreCategory, string> = { seating: 'Child-seat fit', price: 'Purchase price', running: 'Running budget', boot: 'Boot space', range: 'Electric range', safety: 'Safety rating', owners: 'People’s reviews', brand: 'Brand support' };
export const categoryRules: Record<ScoreCategory, string> = {
  seating: 'Target: one rear-facing plus two forward-facing seats/boosters. Detailed family fit: three-seat arrangement 45%, booster buckles 25%, cabin/clearance 20%, loading/access 10%. Evidence grades: good = 9, workable with constraints = 6, restricted = 2. Unknown criteria add no score or weight and reduce coverage. A documented arrangement restriction caps the score at 2; no established arrangement means no score. Exact published evidence factor = 80% × known criteria; related = 50% × known criteria. Your confirmed fit = 10. These are editorial practicality scores, not safety certification.',
  price: 'Asking price at 75% of your budget or less = 10; at the budget = 7; at 150% = 1. Linear between these points. Fees may be additional. Uncertain prices have less influence; missing prices are excluded.',
  running: 'Complete annual running budget: A$4,000 or less = 10; A$8,000 or more = 1; linear between. These fixed reference points are calibrated to the catalogue’s roughly A$4,500–8,100 default budgets, not a percentile rank. Filters and comparison selections do not change the scale. Includes repair savings and interest; excludes purchase and depreciation. The weakest automatic cost estimate limits its influence. Incomplete budgets are excluded.',
  boot: 'VDA five-seat boot: 300 L = 1, 600 L = 10, linear between. Missing or non-comparable measurements are excluded.',
  range: 'Plug-in electric range: 50 km or less = 1, 600 km or more = 10; linear between. WLTP has a 90% evidence factor; NEDC 50%. This category does not apply to conventional hybrids, petrol or diesel cars and is excluded for them.',
  safety: 'Applicable ANCAP stars × 2. Assessment years and protocols differ; this is a rating summary, not a collision-risk prediction. Unknown ratings are excluded.',
  owners: 'Owner ratings converted to /10 and averaged using source evidence. Each source factor = min(80%, n/(n+20)) × configuration-match factor. Only the strongest applicable cohort per publisher and overlap group contributes. Category evidence equals the strongest contributing source, so more sites do not inflate confidence. Cross-site counts are contributions, not unique people. Overseas samples have reduced relevance. Professional ratings and reliability surveys remain separate. Unknown counts and incompatible generations are excluded.',
  brand: 'Australian service-support evidence: established = 8; developing = 6; limited = 3. Unverified support is excluded. This is support access, not a prediction of reliability.',
};
export interface CategoryScore { key: ScoreCategory; score: number | null; weight: number; confidence: number; effectiveWeight: number; applicable: boolean; reason: string; sourceIds: string[]; headline?: string; headlineDetail?: string; headlineEstimated?: boolean; summary?: string; breakdown?: { label: string; score: number | null; share: number; detail: string; sourceIds: string[] }[] }
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
  const owners = reviewEvidenceFor(v);
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
  add('owners', owners.score, owners.confidence, owners.score === null ? 'No suitable numeric owner aggregate with a verified sample size and matching scope; excluded.' : `${owners.contributing.length} publisher cohort${owners.contributing.length === 1 ? '' : 's'} · ${owners.count.toLocaleString('en-AU')} review/rating contributions (${owners.australianCount.toLocaleString('en-AU')} Australian). Counts across sites are not unique people. Ratings are averaged using sample-and-scope evidence; one cohort per publisher. Category evidence is limited to the strongest source (${Math.round(owners.confidence * 100)}%). Overseas and mixed-variant samples have reduced relevance.`, owners.sourceIds);
  const supportScore = { established: 8, developing: 6, limited: 3, unverified: null };
  add('brand', brand ? supportScore[brand.support] : null, !brand || brand.support === 'unverified' ? 0 : .7, brand?.summary ?? 'Australian service-support evidence unverified; excluded.', brand?.sourceIds ?? []);

  // Put the fact being scored ahead of its provenance. These labels never change a score.
  const explain = (key: ScoreCategory, headline: string, headlineDetail: string, summary: string, headlineEstimated = false) => Object.assign(categories.find(c => c.key === key)!, { headline, headlineDetail, summary, headlineEstimated });
  const arrangement = fitAudit && fitAudit.scope !== 'unknown' && fitAudit.criteria.arrangement.sourceIds.length ? fitAudit.criteria.arrangement.rating : 'unknown';
  const arrangementHeadlines = { good: 'Three-seat arrangement demonstrated', workable: 'Three seats, with constraints', restricted: 'Three-seat arrangement restricted', unknown: 'Three-seat fit not established' };
  explain('seating', confirmed ? 'Your three-seat fit confirmed' : arrangementHeadlines[arrangement], familyFitTarget, confirmed ? 'Your saved fit confirmation applies to this configuration.' : fitAudit?.summary ?? v.familyFit.summary);

  const researchedPriceType = price?.condition === 'new' ? 'new asking price' : 'used asking price';
  const priceType = hasSavedPrice ? 'Your saved price' : price?.kind === 'estimate' ? 'Planning estimate' : price && price.sampleCount > 1 ? `Representative ${researchedPriceType}` : `${researchedPriceType[0].toUpperCase()}${researchedPriceType.slice(1)}`;
  const savedFees = personal.ownership?.vehicleOverrides?.[v.id]?.feesIncluded ?? personal.ownership?.feesIncluded;
  const uncertainFees = savedFees !== 'yes' && savedFees !== 'no' && (!price || price.basis === 'mixed' || price.basis === 'unverified');
  const fees = uncertainFees ? 'Charges unconfirmed · duty + transfer budgeted separately' : costs.feesIncluded ? 'duty + transfer included' : 'QLD duty + transfer separate';
  const rangeText = price?.low != null && price.high != null && price.low !== price.high ? `Research range ${money(price.low)}–${money(price.high)}. ` : '';
  const sampleText = price && !hasSavedPrice ? `${price.sampleCount > 0 ? `${price.sampleCount} asking-price observation${price.sampleCount === 1 ? '' : 's'}` : 'No verified asking-price sample'} · ${formatDate(price.observed)}. ` : '';
  explain('price', asking === null ? 'Price unavailable' : money(asking), asking === null ? 'No researched or saved purchase price' : `${priceType} · ${fees}`, asking === null ? 'Excluded until a purchase price is available.' : `${hasSavedPrice ? 'Used in Ownership costs. ' : rangeText + sampleText}${Math.round(asking / budget * 100)}% of your ${money(budget)} budget.`, asking !== null && !hasSavedPrice && (price?.kind === 'estimate' || price?.confidence === 'low' || price?.basis === 'mixed' || price?.basis === 'unverified'));

  explain('running', costs.complete ? `${money(costs.annual)}/year` : 'Annual budget incomplete', costs.complete ? `${money(costs.annualBeforeRepairFund!)} before repair savings` : `Missing: ${costs.missing.join(', ')}`, costs.complete ? `Includes electricity/fuel, insurance, rego, servicing, tyres, ${money(costs.components.reserve)} repair savings and interest. Purchase and depreciation are separate.` : 'Excluded until every running-cost component is available. Add missing amounts in Ownership costs.', costs.complete && Object.values(costs.evidence).some(e => e.estimated));
  explain('boot', v.boot.value === null ? 'Boot capacity unavailable' : `${v.boot.value.toLocaleString('en-AU')} L${comparableBoot ? ' VDA' : ' · different measurement'}`, comparableBoot ? 'Comparable five-seat boot figure' : 'Excluded from the boot score', comparableBoot ? v.boot.basis : v.boot.value === null ? 'No verified comparable capacity is recorded.' : 'The available measurement is shown for reference. It cannot be scored against five-seat VDA figures.');
  explain('range', !rangeApplicable ? 'Not applicable' : rangeKnown ? `${v.range.value!.toLocaleString('en-AU')} km ${rangeStandard(v.range)}` : 'Electric range unavailable', !rangeApplicable ? 'No plug-in electric range' : v.powertrain === 'PHEV' ? 'Electric-only range · not total driving range' : 'Published test-cycle range', !rangeApplicable ? 'Excluded from the score and evidence coverage for this powertrain.' : rangeKnown ? 'A laboratory figure. Weather, speed, load and battery condition change real driving range. WLTP and NEDC use different tests.' : 'No comparable published WLTP or NEDC figure is recorded; excluded from scoring.');
  explain('safety', v.safety.stars === null ? 'Safety rating unavailable' : `${v.safety.stars} ANCAP stars`, v.safety.year === null ? 'Assessment year unverified' : `${v.safety.year} assessment`, v.safety.stars === null ? 'No applicable ANCAP rating is verified; excluded from scoring.' : v.safety.applicability);
  const soleOwnerSource = owners.contributing.length === 1 ? owners.contributing[0].cohort : null;
  const ownerDetail = soleOwnerSource ? `${soleOwnerSource.rating}/${soleOwnerSource.outOf} on ${soleOwnerSource.publisher} · ${owners.count.toLocaleString('en-AU')} ${soleOwnerSource.countKind}` : `${owners.count.toLocaleString('en-AU')} review/rating contributions · ${owners.contributing.length} sites`;
  explain('owners', owners.score === null ? 'No matched owner rating' : `${owners.score.toFixed(1)}/10${soleOwnerSource ? ' owner rating' : ' combined owner rating'}`, owners.score === null ? 'No usable rating with a known sample size' : ownerDetail, owners.score === null ? 'Available comments remain visible under Reviews. Unsuitable or uncounted ratings do not contribute to this score.' : `${owners.australianCount.toLocaleString('en-AU')} Australian contributions. ${soleOwnerSource ? 'Converted to a ten-point scale.' : 'Ratings are averaged using sample size and configuration relevance.'} Contributions across sites are not unique people; overseas and related-variant evidence has less influence.`);
  const supportLabels = { established: 'Established Australian support', developing: 'Developing Australian support', limited: 'Limited verified Australian support', unverified: 'Australian support unverified' };
  explain('brand', brand ? supportLabels[brand.support] : 'Australian support unverified', 'Service access · not a reliability rating', brand?.summary ?? 'No verified local service-support assessment is recorded; excluded from scoring.');
  return summariseScores(categories);
}
