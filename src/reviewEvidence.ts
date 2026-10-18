import { reviewFor, sourceMap } from './data';
import { reviewCohorts, reviewCoverage } from './reviewData';
import type { ReviewCohort } from './reviewData';
import { reviewScope } from './reviewScope';
import type { Vehicle } from './types';

export function canonicalReviewUrl(raw: string): string {
  const url = new URL(raw);
  return `${url.hostname.replace(/^www\./, '')}${url.pathname.replace(/\/+$/, '')}`;
}
export interface AssessedCohort { cohort: ReviewCohort; factor: number; confidence: number; score: number | null; note: string; included: boolean; publisherKey: string }
export function aggregateReviewCohorts(vehicleId: string, cohorts: ReviewCohort[], sourceUrls: Map<string, string>) {
  const assessed: AssessedCohort[] = cohorts.map(cohort => {
    const match = cohort.matches.find(m => m.vehicleId === vehicleId);
    const factor = match?.factor ?? 0;
    const hasAggregate = cohort.kind === 'owner' && cohort.rating !== null && cohort.count !== null && cohort.count > 0;
    const confidence = hasAggregate ? Math.min(.8, cohort.count! / (cohort.count! + 20)) * factor : 0;
    const rawUrl = cohort.sourceIds.map(id => sourceUrls.get(id)).find(Boolean);
    const publisherKey = rawUrl ? new URL(rawUrl).hostname.replace(/^www\./, '') : cohort.publisher.toLowerCase();
    return { cohort, factor, confidence, score: confidence > 0 ? cohort.rating! / cohort.outOf * 10 : null, note: match?.note ?? 'No matched configuration; reference only.', included: false, publisherKey };
  });
  // Use the strongest applicable cohort per publisher AND overlap group. Model/year pages often repeat the same reviews.
  const publishers = new Set<string>(), groups = new Set<string>();
  for (const entry of [...assessed].sort((a, b) => b.confidence - a.confidence || a.cohort.id.localeCompare(b.cohort.id))) {
    if (entry.confidence <= 0 || publishers.has(entry.publisherKey) || groups.has(entry.cohort.overlapGroup)) continue;
    entry.included = true;
    publishers.add(entry.publisherKey); groups.add(entry.cohort.overlapGroup);
  }
  const contributing = assessed.filter(e => e.included);
  const weight = contributing.reduce((sum, e) => sum + e.confidence, 0);
  return {
    assessed, contributing,
    score: weight > 0 ? contributing.reduce((sum, e) => sum + e.score! * e.confidence, 0) / weight : null,
    // Multiple sites may contain the same people. More platforms do not inflate the category's confidence.
    confidence: Math.max(0, ...contributing.map(e => e.confidence)),
    count: contributing.reduce((sum, e) => sum + (e.cohort.count ?? 0), 0),
    australianCount: contributing.filter(e => /^(Australia|AU)$/i.test(e.cohort.region.trim())).reduce((sum, e) => sum + (e.cohort.count ?? 0), 0),
    sourceIds: [...new Set(contributing.flatMap(e => e.cohort.sourceIds))],
  };
}

export function reviewEvidenceFor(v: Vehicle) {
  const fresh = reviewCohorts.filter(c => c.familyId === v.familyId);
  const legacy = reviewFor(v.familyId);
  const urls = new Map([...sourceMap].map(([id, s]) => [id, s.url]));
  const freshUrls = new Set(fresh.filter(c => c.kind === 'owner').flatMap(c => c.sourceIds).map(id => urls.get(id)).filter((s): s is string => Boolean(s)).map(canonicalReviewUrl));
  const replaced = legacy?.sourceIds.some(id => { const url = urls.get(id); return url && freshUrls.has(canonicalReviewUrl(url)); });
  const scope = reviewScope(v);
  const legacyCohort: ReviewCohort[] = legacy && !replaced ? [{
    id: `legacy-${v.familyId}`, familyId: v.familyId, publisher: legacy.sourceIds.map(id => sourceMap.get(id)?.publisher).find(Boolean) ?? 'Australian review site', region: 'Australia', kind: 'owner', rating: legacy.rating, outOf: legacy.outOf, count: legacy.count, countKind: 'reviews', scope: legacy.scope, summary: legacy.summary, positiveThemes: legacy.positiveThemes, negativeThemes: legacy.negativeThemes, limitations: scope.note, sourceIds: legacy.sourceIds, matches: [{ vehicleId: v.id, factor: scope.factor, note: scope.note }], overlapGroup: `legacy-${v.familyId}`, checked: legacy.checked,
  }] : [];
  return { ...aggregateReviewCohorts(v.id, [...fresh, ...legacyCohort], urls), coverage: reviewCoverage.find(c => c.familyId === v.familyId) };
}
