import { brandFor, getPrice, repairReserveFor } from './data';
import { defaultWeights, rangeStandard, money, formatDate } from './lib';
import { ownershipEstimate } from './ownership';
import { reviewEvidenceFor } from './reviewEvidence';
import { fitAssessmentFor } from './research';
import { calculateFamilyFit, familyFitTarget } from './familyFit';
import { bootEvidenceFor, cargoFor, cargoTotals } from './cargo';
import type { PersonalData, ScoreCategory, ScoreWeights, Vehicle } from './types';

export const categoryLabels: Record<ScoreCategory, string> = { seating: 'Child-seat fit', price: 'Purchase price', running: 'Running budget', boot: 'Boot space', range: 'Electric range', safety: 'Safety rating', owners: 'People’s reviews', brand: 'Brand support', repairs: 'Future repair exposure' };
export const categoryRules: Record<ScoreCategory, string> = {
  seating: 'Target: one rear-facing plus two forward-facing seats/boosters. Detailed family fit: three-seat arrangement 45%, booster buckles 25%, cabin/clearance 20%, loading/access 10%. Evidence grades: good = 9, workable with constraints = 6, restricted = 2. Unknown criteria add no score or weight and reduce coverage. A documented arrangement restriction caps the score at 2; no established arrangement means no score. Exact published evidence factor = 80% × known criteria; related = 50% × known criteria. Your confirmed fit = 10. These are editorial practicality scores, not safety certification.',
  price: 'Asking price at 75% of your budget or less = 10; at the budget = 7; at 150% = 1. Linear between these points. Fees may be additional. Uncertain prices have less influence; missing prices are excluded.',
  running: 'Complete annual running budget: A$4,000 or less = 10; A$8,000 or more = 1; linear between. These fixed reference points are calibrated to the catalogue’s roughly A$4,500–8,100 default budgets, not a percentile rank. Filters and comparison selections do not change the scale. Includes finance interest; excludes repair savings, purchase and depreciation. The optional savings display does not change this score. The weakest automatic cost estimate limits its influence. Incomplete budgets are excluded.',
  boot: 'Rear boot with the second row available: 300 L = 1, 600 L = 10, linear between. Verified VDA measurements have full evidence weight; other declared capacities are approximate utility comparisons with reduced influence. Measurement methods, roof loading and sliding seats can change the number. No conversion to VDA is invented; separate front storage is not added.',
  range: 'Battery-only EVs (BEVs) only: 50 km or less = 1, 600 km or more = 10; linear between. WLTP has a 90% evidence factor; NEDC 50%. PHEV electric-only range is shown for planning, not scored against BEVs. PHEVs, conventional hybrids, petrol and diesel cars are excluded from this category in both the overall score and evidence coverage. PHEV energy costs still use your electric-driving share.',
  safety: 'Applicable ANCAP stars × 2. Assessment years and protocols differ; this is a rating summary, not a collision-risk prediction. Unknown ratings are excluded.',
  owners: 'Owner ratings converted to /10 and averaged using source evidence. Each source factor = min(80%, n/(n+20)) × configuration-match factor. Only the strongest applicable cohort per publisher and overlap group contributes. Category evidence equals the strongest contributing source, so more sites do not inflate confidence. Cross-site counts are contributions, not unique people. Overseas samples have reduced relevance. Professional ratings and reliability surveys remain separate. Unknown counts and incompatible generations are excluded.',
  repairs: 'Provisional relative repair-exposure score, not a predicted bill or failure probability. Uses the researched configuration allowance as an editorial proxy for age, warranty exposure and uncovered component costs: A$500 reference = 10; A$1,500 = 1, linear between and capped. Only a 25% evidence factor because comparable Australian paid-repair frequencies are unavailable. Insured crash, fire, flood and glass damage, covered defects, free recall remedies, servicing and tyres are excluded. Your chosen savings contribution and the optional running-budget toggle never change this score.',
  brand: 'Australian service-support evidence: established = 8; developing = 6; limited = 3. Unverified support is excluded. This is support access, not a prediction of reliability.',
};
export interface CategoryScore { key: ScoreCategory; score: number | null; weight: number; confidence: number; effectiveWeight: number; applicable: boolean; reason: string; sourceIds: string[]; headline?: string; headlineDetail?: string; headlineEstimated?: boolean; unscoredLabel?: string; summary?: string; breakdown?: { label: string; score: number | null; share: number; detail: string; sourceIds: string[] }[] }
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
  const cargo = cargoFor(v.id);
  const bootEvidence = bootEvidenceFor(v.id);
  const categories: CategoryScore[] = [];
  const add = (key: ScoreCategory, score: number | null, confidence: number, reason: string, sourceIds: string[], applicable = true, breakdown?: CategoryScore['breakdown']) => {
    const evidence = applicable && score !== null && Number.isFinite(score) && Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0;
    const raw = evidence > 0 ? Math.round(clamp(score!) * 10) / 10 : null;
    categories.push({ key, score: raw, confidence: evidence, weight: weights[key] ?? defaultWeights[key], effectiveWeight: (weights[key] ?? defaultWeights[key]) * evidence, reason, sourceIds, applicable, ...(breakdown ? { breakdown } : {}) });
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
  add('running', costs.complete ? runningBudgetScore(costs.annualBeforeRepairFund) : null, costs.complete ? costs.runningConfidence : 0, costs.complete ? `${money(costs.annualBeforeRepairFund!)}/year, excluding repair savings and including finance interest. Score = 10 − (annual budget − A$4,000) × 9 ÷ A$4,000, limited to 1–10. Fixed scale across the catalogue; not a percentile rank. Excludes purchase and depreciation. ${Math.round(costs.runningConfidence * 100)}% evidence factor; estimates reduce its influence.` : `Missing: ${costs.missing.join(', ')}. Excluded until the budget is complete.`, [...new Set((['energy', 'insurance', 'servicing', 'rego', 'tyres'] as const).flatMap(key => costs.evidence[key].sourceIds))]);
  const comparableBoot = v.boot.value !== null && /\bVDA\b/i.test(v.boot.basis) && !/non.?VDA|not.*VDA|not verified|unverified/i.test(v.boot.basis);
  const knownBoot = v.boot.value !== null && v.boot.sourceIds.length > 0;
  const bootScoreLitres = bootEvidence?.scoreLitres ?? v.boot.value;
  const bootConfidence = bootEvidence?.evidenceFactor ?? (/estimate|proxy/i.test(v.boot.basis) ? .25 : comparableBoot ? 1 : .45);
  add('boot', knownBoot ? 1 + (bootScoreLitres! - 300) * .03 : null, knownBoot ? bootConfidence : 0, knownBoot ? `${v.boot.value} L published rear boot. Scoring input: ${bootScoreLitres} L. ${bootEvidence?.scoreBasis ?? v.boot.basis} ${bootEvidence?.caveat ?? (comparableBoot ? '' : 'Approximate utility comparison; different loading heights and methods are not equivalent to VDA.')}` : `Capacity needs verification. ${v.boot.basis}`, [...new Set([...v.boot.sourceIds, ...(bootEvidence?.sourceIds ?? [])])]);
  const hasRangeFact = v.range.value !== null && v.range.value > 0;
  const rangeKnown = hasRangeFact && ['WLTP', 'NEDC'].includes(rangeStandard(v.range));
  const rangeApplicable = v.powertrain === 'BEV';
  const isPhev = v.powertrain === 'PHEV';
  add('range', rangeApplicable && rangeKnown ? 1 + (v.range.value! - 50) * 9 / 550 : null, rangeApplicable && rangeKnown ? rangeStandard(v.range) === 'WLTP' ? .9 : .5 : 0, isPhev ? `PHEV electric-only range is not scored against battery-only EV range. Petrol backup makes it a different measure of driving capability. Excluded from both the overall score and evidence coverage; energy costs still use your electric-driving share. ${v.range.basis}` : !rangeApplicable ? 'Not applicable: this car has no plug-in electric range. Excluded from both the overall score and evidence coverage.' : rangeKnown ? `${v.range.value} km. ${v.range.basis}` : `No comparable published electric-range figure; excluded. ${v.range.basis}`, v.range.sourceIds, rangeApplicable);
  if (isPhev) categories.find(c => c.key === 'range')!.unscoredLabel = 'Not scored';
  add('safety', v.safety.stars === null ? null : v.safety.stars * 2, v.safety.stars === null ? 0 : 1, `${v.safety.year ?? 'Unverified assessment year'}. ${v.safety.applicability}`, v.safety.sourceIds);
  add('owners', owners.score, owners.confidence, owners.score === null ? 'No suitable numeric owner aggregate with a verified sample size and matching scope; excluded.' : `${owners.contributing.length} publisher cohort${owners.contributing.length === 1 ? '' : 's'} · ${owners.count.toLocaleString('en-AU')} review/rating contributions (${owners.australianCount.toLocaleString('en-AU')} Australian). Counts across sites are not unique people. Ratings are averaged using sample-and-scope evidence; one cohort per publisher. Category evidence is limited to the strongest source (${Math.round(owners.confidence * 100)}%). Overseas and mixed-variant samples have reduced relevance.`, owners.sourceIds);
  const supportScore = { established: 8, developing: 6, limited: 3, unverified: null };
  add('brand', brand ? supportScore[brand.support] : null, !brand || brand.support === 'unverified' ? 0 : .7, brand?.summary ?? 'Australian service-support evidence unverified; excluded.', brand?.sourceIds ?? []);

  const repairReference = repairReserveFor(v.id);
  add('repairs', repairReference ? 10 - (repairReference.point - 500) * 9 / 1000 : null, repairReference ? .25 : 0, repairReference ? `Relative planning exposure only. ${repairReference.basis} The annual allowance is used only as a low-confidence comparison proxy, not forecast expenditure. Excludes insured damage, covered warranty/recall work, servicing and tyres; no failure rate is inferred.` : 'Uncovered repair exposure needs a model-specific assessment.', repairReference?.sourceIds ?? []);

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

  explain('running', costs.complete ? `${money(costs.annualBeforeRepairFund!)}/year` : 'Annual budget incomplete', 'Everyday costs · repair savings excluded', costs.complete ? 'Electricity/fuel, insurance, rego, servicing, tyres and finance interest. Repair savings, purchase and depreciation are separate.' : 'Add the missing amounts in Ownership costs.', costs.complete && (['energy', 'insurance', 'servicing', 'rego', 'tyres'] as const).some(key => costs.evidence[key].estimated));
  explain('boot', knownBoot ? `${v.boot.value!.toLocaleString('en-AU')} L rear boot` : 'Capacity needs verification', bootEvidence?.measurement === 'independent-proxy' ? `${bootScoreLitres} L independent rear-storage scoring proxy` : comparableBoot ? 'VDA · second row available' : 'Declared capacity · approximate score', `${v.boot.basis} ${bootEvidence?.practicalSummary ?? ''}${cargo ? ` Separate front storage: ${cargo.frontLitres} L; combined ${cargoTotals(cargo).seatsUpLitres} L, not used in the boot score.` : ''}${comparableBoot ? '' : ' Different measurement methods can overstate comparisons. The score has less influence; no VDA conversion is assumed.'}`, knownBoot && (bootEvidence?.estimated ?? !comparableBoot));
  explain('repairs', repairReference ? repairReference.point <= 600 ? 'Lower planning exposure' : repairReference.point <= 900 ? 'Moderate planning exposure' : 'Higher planning exposure' : 'Assessment pending', 'Editorial estimate · 25% evidence · higher score = lower exposure', 'A cautious comparison of age, warranty exposure and component costs. Not a forecast of failures or annual spending. Insured damage and covered remedies are excluded; only 25% evidence weight.', true);
  const rangeHeadline = hasRangeFact ? `${v.range.value!.toLocaleString('en-AU')} km${rangeKnown ? ` ${rangeStandard(v.range)}` : ''}` : 'Electric range unavailable';
  explain('range', isPhev || rangeApplicable ? rangeHeadline : 'Not applicable', isPhev ? 'Electric-only range · not scored' : !rangeApplicable ? 'No plug-in electric range' : 'Published test-cycle range', isPhev ? 'A PHEV also uses petrol. Its shorter electric-only range does not lower the overall score or evidence coverage. Your electric-driving share affects the running-cost budget.' : !rangeApplicable ? 'Excluded from the score and evidence coverage for this powertrain.' : rangeKnown ? 'A laboratory figure. Weather, speed, load and battery condition change real driving range. WLTP and NEDC use different tests.' : 'No comparable published WLTP or NEDC figure is recorded; excluded from scoring.');
  if (v.safety.stars === null) categories.find(c => c.key === 'safety')!.unscoredLabel = 'Unrated';
  if (categories.find(c => c.key === 'seating')!.score === null) categories.find(c => c.key === 'seating')!.unscoredLabel = 'Fit check required';
  if (owners.score === null) categories.find(c => c.key === 'owners')!.unscoredLabel = 'Not yet rated';
  explain('safety', v.safety.stars === null ? 'No applicable ANCAP rating' : `${v.safety.stars} ANCAP stars`, v.safety.year === null ? 'Assessment year unverified' : `${v.safety.year} assessment`, v.safety.stars === null ? 'No applicable ANCAP rating is verified; excluded from scoring.' : v.safety.applicability);
  const soleOwnerSource = owners.contributing.length === 1 ? owners.contributing[0].cohort : null;
  const ownerDetail = soleOwnerSource ? `${soleOwnerSource.rating}/${soleOwnerSource.outOf} on ${soleOwnerSource.publisher} · ${owners.count.toLocaleString('en-AU')} ${soleOwnerSource.countKind}` : `${owners.count.toLocaleString('en-AU')} review/rating contributions · ${owners.contributing.length} sites`;
  explain('owners', owners.score === null ? 'No matched owner rating' : `${owners.score.toFixed(1)}/10${soleOwnerSource ? ' owner rating' : ' combined owner rating'}`, owners.score === null ? 'No usable rating with a known sample size' : ownerDetail, owners.score === null ? 'Available comments remain visible under Reviews. Unsuitable or uncounted ratings do not contribute to this score.' : `${owners.australianCount.toLocaleString('en-AU')} Australian contributions. ${soleOwnerSource ? 'Converted to a ten-point scale.' : 'Ratings are averaged using sample size and configuration relevance.'} Contributions across sites are not unique people; overseas and related-variant evidence has less influence.`);
  const supportLabels = { established: 'Established Australian support', developing: 'Developing Australian support', limited: 'Limited verified Australian support', unverified: 'Australian support unverified' };
  explain('brand', brand ? supportLabels[brand.support] : 'Australian support unverified', 'Service access · not a reliability rating', brand?.summary ?? 'No verified local service-support assessment is recorded; excluded from scoring.');
  return summariseScores(categories);
}
