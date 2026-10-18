import { describe, expect, it } from 'vitest';
import { calculateFamilyFit } from './familyFit';
import type { FamilyFitAssessment } from './types';

const criterion = (rating: 'good' | 'workable' | 'restricted' | 'unknown') => ({ rating, detail: 'Scoped practical observation', sourceIds: rating === 'unknown' ? [] : ['practical-test'] });
const assessment = (): FamilyFitAssessment => ({ vehicleId: 'test', scope: 'exact', summary: 'A named restraint combination was tested.', criteria: { arrangement: criterion('good'), buckles: criterion('unknown'), space: criterion('good'), access: criterion('good') } });

describe('evidence-led family practicality', () => {
  it('distinguishes a spacious demonstrated fit from a constrained one', () => {
    const spacious = calculateFamilyFit(assessment());
    const tighter = calculateFamilyFit({ ...assessment(), criteria: { ...assessment().criteria, arrangement: criterion('workable'), space: criterion('workable') } });
    expect(spacious.score).toBe(9);
    expect(tighter.score).toBe(6.4);
    expect(spacious.confidence).toBeCloseTo(.6);
    expect(tighter.confidence).toBeCloseTo(.6);
  });
  it('excludes unknown booster access and reduces influence without making up a score', () => {
    const incomplete = calculateFamilyFit(assessment());
    const full = calculateFamilyFit({ ...assessment(), criteria: { ...assessment().criteria, buckles: criterion('good') } });
    expect(incomplete.score).toBe(full.score);
    expect(incomplete.coverage).toBeCloseTo(.75);
    expect(incomplete.confidence).toBeLessThan(full.confidence);
    expect(incomplete.reason).toContain('not established; excluded');
  });
  it('reduces related-variant influence but preserves the observed practicality score', () => {
    const exact = calculateFamilyFit(assessment());
    const related = calculateFamilyFit({ ...assessment(), scope: 'related' });
    expect(related.score).toBe(exact.score);
    expect(related.confidence).toBeCloseTo(.375);
  });
  it('does not infer a three-seat fit from roomy doors and seats', () => {
    const noArrangement = calculateFamilyFit({ ...assessment(), criteria: { ...assessment().criteria, arrangement: criterion('unknown') } });
    expect(noArrangement.score).toBeNull();
    expect(noArrangement.confidence).toBe(0);
    expect(calculateFamilyFit({ ...assessment(), scope: 'unknown' }).score).toBeNull();
  });
  it('cannot hide a documented arrangement failure behind good access', () => {
    const limited = calculateFamilyFit({ ...assessment(), criteria: { ...assessment().criteria, arrangement: criterion('restricted'), buckles: criterion('good') } });
    expect(limited.score).toBe(2);
  });
  it('cannot score a positive criterion without its source', () => {
    const invalid = calculateFamilyFit({ ...assessment(), criteria: { ...assessment().criteria, arrangement: { ...criterion('good'), sourceIds: [] } } });
    expect(invalid.score).toBeNull();
    expect(invalid.confidence).toBe(0);
  });
});
