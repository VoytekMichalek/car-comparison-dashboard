import { describe, expect, it } from 'vitest';
import { vehicles, sourceMap, validateReferences } from './data';
import { aggregateReviewCohorts, canonicalReviewUrl, reviewEvidenceFor } from './reviewEvidence';
import { reviewCohorts, reviewCoverage } from './reviewData';
import type { ReviewCohort } from './reviewData';
import { defaultFilters, defaultWeights, parseHash, publicHash } from './lib';

const cohort = (patch: Partial<ReviewCohort> = {}): ReviewCohort => ({ id: 'a', familyId: 'car', publisher: 'Site A', region: 'Australia', kind: 'owner', rating: 4, outOf: 5, count: 100, countKind: 'ratings', scope: 'Matching generation', summary: 'Owner aggregate', positiveThemes: [], negativeThemes: [], limitations: 'Self-selected', sourceIds: ['a'], matches: [{ vehicleId: 'car', factor: .8, note: 'Matched' }], overlapGroup: 'a', checked: '2026-10-18', ...patch });
const urls = new Map([['a', 'https://a.example/car'], ['a-year', 'https://www.a.example/car/2023'], ['b', 'https://b.example/car']]);

describe('multi-publisher review evidence', () => {
  it('uses original rating scales and sample/scope evidence without counting overlapping publisher pages twice', () => {
    const result = aggregateReviewCohorts('car', [cohort(), cohort({ id: 'year', count: 60, rating: 5, sourceIds: ['a-year'], overlapGroup: 'year' }), cohort({ id: 'b', rating: 6, outOf: 10, count: 50, sourceIds: ['b'], overlapGroup: 'b', region: 'United States', matches: [{ vehicleId: 'car', factor: .5, note: 'Related international car' }] })], urls);
    expect(result.contributing).toHaveLength(2);
    expect(result.count).toBe(150);
    expect(result.australianCount).toBe(100);
    expect(result.confidence).toBeCloseTo(.64);
    expect(result.score).toBeCloseTo((8 * .64 + 6 * (50 / 70) * .5) / (.64 + (50 / 70) * .5));
  });
  it('does not inflate confidence when more sites are added', () => {
    const one = aggregateReviewCohorts('car', [cohort()], urls);
    const two = aggregateReviewCohorts('car', [cohort(), cohort({ id: 'b', sourceIds: ['b'], overlapGroup: 'b' })], urls);
    expect(two.confidence).toEqual(one.confidence);
    expect(two.count).toBe(200); // contributions, deliberately not distinct owners
  });
  it('excludes unknown denominators, unmatched generations and professional/survey ratings', () => {
    for (const patch of [{ count: null }, { count: 0 }, { rating: null }, { kind: 'professional' as const }, { kind: 'reliability' as const }, { matches: [{ vehicleId: 'car', factor: 0, note: 'Wrong generation' }] }]) {
      const result = aggregateReviewCohorts('car', [cohort(patch)], urls);
      expect(result.score).toBeNull(); expect(result.count).toBe(0); expect(result.confidence).toBe(0);
      expect(result.assessed).toHaveLength(1);
    }
  });
  it('uses the numeric rating denominator rather than a larger number of text posts', () => {
    const result = aggregateReviewCohorts('car', [cohort({ count: 4, summary: '63 posts, but only 4 numeric ratings' })], urls);
    expect(result.count).toBe(4);
    expect(result.confidence).toBeCloseTo(4 / 24 * .8);
  });
  it('also prevents repeats across explicitly overlapping groups on different sites', () => {
    const result = aggregateReviewCohorts('car', [cohort(), cohort({ id: 'b', sourceIds: ['b'] })], urls);
    expect(result.contributing).toHaveLength(1);
  });
  it('does not label mixed international cohorts wholly Australian', () => {
    const result = aggregateReviewCohorts('car', [cohort({ region: 'Australia / New Zealand' })], urls);
    expect(result.count).toBe(100); expect(result.australianCount).toBe(0);
  });
  it('canonicalises source URLs for replacement checks', () => {
    expect(canonicalReviewUrl('https://www.example.com/car/?sort=recent#reviews')).toBe(canonicalReviewUrl('https://example.com/car'));
  });
  it('validates expanded cohorts and keeps all catalogue review scores bounded', () => {
    expect(validateReferences()).toEqual([]);
    for (const car of vehicles) {
      const result = reviewEvidenceFor(car);
      expect(result.confidence).toBeGreaterThanOrEqual(0); expect(result.confidence).toBeLessThanOrEqual(.8);
      if (result.score !== null) { expect(result.score).toBeGreaterThanOrEqual(0); expect(result.score).toBeLessThanOrEqual(10); }
      expect(result.contributing.some(e => e.cohort.id.startsWith('legacy-')), car.id).toBe(false);
      const publishers = result.contributing.map(e => e.publisherKey);
      expect(new Set(publishers).size).toBe(publishers.length);
      const freshUrls = new Set(reviewCohorts.filter(c => c.familyId === car.familyId && c.kind === 'owner').flatMap(c => c.sourceIds).map(id => canonicalReviewUrl(sourceMap.get(id)!.url)));
      const legacy = result.assessed.find(e => e.cohort.id.startsWith('legacy-'));
      if (legacy) expect(legacy.cohort.sourceIds.some(id => freshUrls.has(canonicalReviewUrl(sourceMap.get(id)!.url)))).toBe(false);
    }
    expect(new Set(reviewCoverage.map(c => c.familyId))).toEqual(new Set(vehicles.map(v => v.familyId)));
    for (const car of vehicles) expect(reviewCohorts.some(c => c.familyId === car.familyId && c.matches.some(m => m.vehicleId === car.id)), car.id).toBe(true);
  });
  it('withholds known contaminated legacy cohorts even when the fresh replacement has zero influence', () => {
    for (const id of ['model-y-rwd-juniper-2025', 'ev6-air-2022', 'ioniq5-dynamiq-rwd-2023', 'outback-awd-25-2021', 'sorento-gtline-hev-awd-2026', 'rav4-gxl-hev-2021-25', 'sealion6-dynamic-183']) {
      const result = reviewEvidenceFor(vehicles.find(v => v.id === id)!);
      expect(result.assessed.some(e => e.cohort.id.startsWith('legacy-')), id).toBe(false);
      expect(result.assessed.some(e => e.cohort.publisher === 'ProductReview.com.au' && e.factor === 0), id).toBe(true);
    }
  });
  it('restores chart URLs with public filters, comparisons and weights only', () => {
    const ids = new Set(vehicles.map(v => v.id));
    const state = { view: 'charts' as const, compare: [vehicles[0].id], filters: { ...defaultFilters, powertrains: ['BEV', 'HEV'] as const }, weights: defaultWeights };
    const publicState = { ...state, filters: { ...state.filters, powertrains: [...state.filters.powertrains] } };
    expect(parseHash(publicHash(publicState), ids)).toEqual(publicState);
    expect(publicHash(publicState)).not.toMatch(/notes|seatModels|insurance|resale/);
  });
});
