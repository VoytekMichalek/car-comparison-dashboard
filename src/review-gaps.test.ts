import { describe, expect, it } from 'vitest';
import { vehicles } from './data';
import { emptyPersonal } from './lib';
import { reviewEvidenceFor } from './reviewEvidence';
import { scoreVehicle } from './scoring';

describe('new-generation owner evidence gaps', () => {
  it('uses the new RAV4 cohort without importing preceding-generation ratings', () => {
    const car = vehicles.find(v => v.id === 'rav4-gxl-hev-2026')!;
    const result = reviewEvidenceFor(car);
    expect(result.score).toBeCloseTo(8.4);
    expect(result.count).toBe(14);
    expect(result.australianCount).toBe(0);
    expect(result.confidence).toBeCloseTo(14 / 34 * .4);
    expect(result.contributing.map(entry => entry.cohort.id)).toEqual(['review-gap-rav4-xa60-edmunds']);
    expect(scoreVehicle(car, emptyPersonal()).categories.find(c => c.key === 'owners')?.score).toBe(8.4);
  });

  it('counts five individually rated Zeekr owners once, rather than eleven index posts or reader votes', () => {
    const long = reviewEvidenceFor(vehicles.find(v => v.id === 'zeekr7x-long-range-2025')!);
    const short = reviewEvidenceFor(vehicles.find(v => v.id === 'zeekr7x-rwd-2025')!);
    expect(long.score).toBeCloseTo((7 + 9.5 + 8 + 8 + 9.5) / 5);
    expect(long.count).toBe(5);
    expect(long.australianCount).toBe(0);
    expect(long.confidence).toBeCloseTo(.1);
    expect(short.confidence).toBeCloseTo(.05);
    expect(long.contributing.map(entry => entry.cohort.id)).toEqual(['review-gap-zeekr-autoweek-rwd-five']);
    expect(long.contributing[0].cohort.overlapGroup).toBe('autoweek-zeekr7x-export');
  });
});
