import type { FamilyFitAssessment, FamilyFitCriterionKey } from './types';

export const familyFitTarget = '1 rear-facing + 2 forward-facing seats / boosters';
export const fitCriterionLabels: Record<FamilyFitCriterionKey, string> = { arrangement: 'Mixed three-seat arrangement', buckles: 'Booster buckle access', space: 'Cabin & restraint clearance', access: 'Loading & row access' };
export const fitCriterionWeights: Record<FamilyFitCriterionKey, number> = { arrangement: .45, buckles: .25, space: .2, access: .1 };
export const fitRatingLabels = { good: 'Good practicality', workable: 'Fits with constraints', restricted: 'Restricted', unknown: 'Not established' };
export const fitRatingScores = { good: 9, workable: 6, restricted: 2, unknown: null };

/** A positive door/space observation alone cannot establish room for three restraints. */
export function calculateFamilyFit(assessment: FamilyFitAssessment) {
  const criteria = Object.entries(assessment.criteria) as [FamilyFitCriterionKey, FamilyFitAssessment['criteria'][FamilyFitCriterionKey]][];
  const known = criteria.filter(([, c]) => c.rating !== 'unknown' && c.sourceIds.length > 0);
  const coverage = known.reduce((sum, [key]) => sum + fitCriterionWeights[key], 0);
  const established = assessment.scope !== 'unknown' && assessment.criteria.arrangement.rating !== 'unknown' && assessment.criteria.arrangement.sourceIds.length > 0;
  const weighted = known.reduce((sum, [key, c]) => sum + fitRatingScores[c.rating]! * fitCriterionWeights[key], 0);
  const score = !established || !coverage ? null : assessment.criteria.arrangement.rating === 'restricted' ? 2 : Math.round(weighted / coverage * 10) / 10;
  const confidence = score === null ? 0 : coverage * (assessment.scope === 'exact' ? .8 : .5);
  const sourceIds = [...new Set(criteria.flatMap(([, c]) => c.sourceIds))];
  const breakdown = criteria.map(([key, c]) => ({ label: fitCriterionLabels[key], share: fitCriterionWeights[key], score: c.rating === 'unknown' || !c.sourceIds.length ? null : fitRatingScores[c.rating], detail: c.detail, sourceIds: c.sourceIds }));
  return { score, confidence, coverage, sourceIds, breakdown, reason: `${assessment.summary} ${assessment.scope === 'related' ? 'Related-configuration evidence has less influence.' : assessment.scope === 'unknown' ? 'No matched arrangement test; excluded from the overall score.' : 'Published evidence for the matched configuration.'} Unknown criteria are not established; excluded from the score and reduce its influence. Your own three-seat arrangement is still pending.` };
}
