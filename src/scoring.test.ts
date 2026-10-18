import { describe, expect, it } from 'vitest';
import { vehicles } from './data';
import { defaultFilters, defaultOwnership, defaultWeights, emptyPersonal, parseBackup, parseHash, publicHash } from './lib';
import { formatScore, scoreVehicle, summariseScores } from './scoring';
import type { CategoryScore } from './scoring';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ScoreBreakdown } from './components/Scores';
import { reviewScope } from './reviewScope';
import type { ScoreWeights } from './types';

const v = vehicles[0];
describe('transparent importance-weighted scoring', () => {
  it('keeps every populated car’s score and coverage finite and bounded', () => {
    for (const car of vehicles) {
      const result = scoreVehicle(car, emptyPersonal());
      expect(result.total).toBeGreaterThanOrEqual(1);
      expect(result.total).toBeLessThanOrEqual(10);
      expect(result.coverage).toBeGreaterThanOrEqual(0);
      expect(result.coverage).toBeLessThanOrEqual(100);
      expect(result.categories).toHaveLength(8);
    }
  });
  it('increases the influence of a category when its importance rises', () => {
    const p = { ...emptyPersonal(), fitChecks: { [v.id]: true } };
    const weights = Object.fromEntries(Object.keys(defaultWeights).map(k => [k, 1])) as ScoreWeights;
    const base = scoreVehicle(v, p, weights);
    const changed = scoreVehicle(v, p, { ...weights, seating: 10 });
    expect(changed.total!).toBeGreaterThan(base.total!);
    expect(changed.categories.find(c => c.key === 'seating')?.weight).toBe(10);
  });
  it('keeps a single favourable community post from dominating the score', () => {
    const ev5 = vehicles.find(v => v.id === 'ev5-air-standard-2024')!;
    const owners = scoreVehicle(ev5, emptyPersonal()).categories.find(c => c.key === 'owners')!;
    expect(owners.score).toBe(10);
    expect(owners.effectiveWeight).toBeLessThan(owners.weight / 10);
    expect(owners.confidence).toBeLessThan(.1);
  });
  it('excludes missing evidence and withholds a total when nothing is known', () => {
    const unknown = { ...v, id: 'unknown', familyId: 'unknown', make: 'Unknown', familyFit: { ...v.familyFit, status: 'unverified' as const }, range: { ...v.range, value: null }, boot: { ...v.boot, value: null }, safety: { ...v.safety, stars: null } };
    const result = scoreVehicle(unknown, emptyPersonal());
    expect(result.total).toBeNull();
    expect(result.categories.every(c => c.score === null && c.effectiveWeight === 0)).toBe(true);
    expect(result.coverage).toBe(0);
    expect(result.provisional).toBe(true);
  });
  it('does not apply original-generation owner ratings to the Atto 3 EVO or new RAV4', () => {
    for (const id of ['atto3-evo-premium-2026', 'rav4-gxl-hev-2026']) {
      const car = vehicles.find(v => v.id === id)!;
      const owners = scoreVehicle(car, emptyPersonal()).categories.find(c => c.key === 'owners')!;
      expect(owners.confidence).toBe(0);
      expect(owners.score).toBeNull();
      expect(owners.effectiveWeight).toBe(0);
    }
  });
  it('limits contaminated review aggregates and further reduces unmatched updates', () => {
    const older = vehicles.find(v => v.id === 'outlander-phev-aspire-20')!;
    const updated = vehicles.find(v => v.id === 'outlander-phev-aspire-227')!;
    expect(reviewScope(older).factor).toBeLessThan(1);
    expect(reviewScope(updated).factor).toBeLessThan(reviewScope(older).factor);
    expect(reviewScope(older).note).toContain('2021 GSR');
    const air = vehicles.find(v => v.id === 'ev6-air-2022')!;
    expect(scoreVehicle(air, emptyPersonal()).categories.find(c => c.key === 'owners')!.confidence).toBeLessThan(.05);
  });
  it('excludes electric range for every fuel-only powertrain without a score penalty', () => {
    for (const powertrain of ['HEV', 'PETROL', 'DIESEL'] as const) {
      const car = vehicles.find(v => v.powertrain === powertrain)!;
      const range = scoreVehicle(car, emptyPersonal()).categories.find(c => c.key === 'range')!;
      expect(range.applicable).toBe(false);
      expect(range.score).toBeNull();
      expect(range.confidence).toBe(0);
      expect(range.effectiveWeight).toBe(0);
      const low = scoreVehicle(car, emptyPersonal(), { ...defaultWeights, range: 1 });
      const high = scoreVehicle(car, emptyPersonal(), { ...defaultWeights, range: 10 });
      expect(high.total).toEqual(low.total);
      expect(high.coverage).toEqual(low.coverage);
    }
  });
  it('scores published plug-in ranges and excludes unknown or zero figures', () => {
    for (const powertrain of ['BEV', 'PHEV'] as const) {
      const car = vehicles.find(v => v.powertrain === powertrain)!;
      const scored = scoreVehicle(car, emptyPersonal()).categories.find(c => c.key === 'range')!;
      expect(scored.applicable).toBe(true);
      expect(scored.score).toBeGreaterThanOrEqual(1);
      expect(scored.confidence).toBeGreaterThan(0);
      const unknown = scoreVehicle({ ...car, range: { ...car.range, value: null } }, emptyPersonal()).categories.find(c => c.key === 'range')!;
      expect(unknown.score).toBeNull();
      expect(unknown.effectiveWeight).toBe(0);
      const zero = scoreVehicle({ ...car, range: { ...car.range, value: 0 } }, emptyPersonal()).categories.find(c => c.key === 'range')!;
      expect(zero.score).toBeNull();
    }
  });
  it('keeps related child-seat tests usable with less influence than an exact published test', () => {
    const ioniq = vehicles.find(v => v.id === 'ioniq5-dynamiq-rwd-2023')!;
    const related = scoreVehicle(ioniq, emptyPersonal()).categories.find(c => c.key === 'seating')!;
    const exact = scoreVehicle({ ...ioniq, familyFit: { ...ioniq.familyFit, status: 'tested-three' } }, emptyPersonal()).categories.find(c => c.key === 'seating')!;
    expect(related.score).toBe(8);
    expect(related.confidence).toBe(.5);
    expect(exact.score).toEqual(related.score);
    expect(exact.effectiveWeight).toBeGreaterThan(related.effectiveWeight);
  });
  it('uses the saved deal price in scoring and clears it back to research', () => {
    const other = vehicles.find(car => car.id !== v.id)!;
    const original = scoreVehicle(v, emptyPersonal()).categories.find(c => c.key === 'price')!;
    const personal = { ...emptyPersonal(), ownership: { ...defaultOwnership, vehicleOverrides: { [v.id]: { purchase: 30000 } } } };
    const saved = scoreVehicle(v, personal).categories.find(c => c.key === 'price')!;
    expect(saved.score).toBe(10);
    expect(saved.confidence).toBe(1);
    expect(saved.reason).toContain('30,000');
    expect(scoreVehicle(other, personal).categories.find(c => c.key === 'price')).toEqual(scoreVehicle(other, emptyPersonal()).categories.find(c => c.key === 'price'));
    const cleared = { ...personal, ownership: { ...personal.ownership, vehicleOverrides: { [v.id]: { purchase: null } } } };
    expect(scoreVehicle(v, cleared).categories.find(c => c.key === 'price')).toEqual(original);
    const shared = { ...cleared, ownership: { ...cleared.ownership, purchasePrice: 60000 } };
    expect(scoreVehicle(v, shared).categories.find(c => c.key === 'price')?.score).toBe(3);
  });
  it('round-trips public weights and rejects out-of-range weights', () => {
    const ids = new Set(vehicles.map(v => v.id));
    const weights = { ...defaultWeights, owners: 10, range: 1 };
    const state = { view: 'compare' as const, compare: [v.id], filters: defaultFilters, weights };
    expect(parseHash(publicHash(state), ids)).toEqual(state);
    expect(parseHash('#weights=0,1,2,3,4,5,6,11', ids).weights).toBeUndefined();
    expect(() => parseBackup(JSON.stringify({ ...emptyPersonal(), weights: { ...weights, brand: 11 } }))).toThrow();
    expect(parseBackup(JSON.stringify({ ...emptyPersonal(), weights })).weights).toEqual(weights);
  });
});

const category = (key: CategoryScore['key'], score: number | null, weight: number, confidence: number, applicable = true): CategoryScore => ({ key, score, weight, confidence, effectiveWeight: applicable && score !== null ? weight * confidence : 0, applicable, reason: 'Test evidence', sourceIds: [] });

describe('evidence-weighted aggregation', () => {
  it('does not pull a known score towards five when a high-importance category is unknown', () => {
    const known = category('boot', 9, 2, 1);
    const result = summariseScores([known, category('owners', null, 10, 0)]);
    expect(result.total).toBe(9);
    expect(result.total).toBe(summariseScores([known]).total);
    expect(summariseScores([known, category('owners', 1, 10, 0)]).total).toBe(9);
    expect(result.coverage).toBe(17);
    expect(result.provisional).toBe(true);
  });
  it('uses low-confidence outliers at a fraction of their selected importance', () => {
    const known = category('boot', 10, 5, 1);
    const weak = summariseScores([known, category('owners', 1, 5, .1)]);
    const strong = summariseScores([known, category('owners', 1, 5, 1)]);
    expect(weak.total).toBe(9.2);
    expect(strong.total).toBe(5.5);
    expect(weak.coverage).toBe(55);
    expect(strong.coverage).toBe(100);
    expect(weak.categories[1].score).toBe(1);
  });
  it('removes non-applicable importance from both the average and coverage', () => {
    const known = category('boot', 8, 2, 1);
    const result = summariseScores([known, category('range', null, 10, 0, false)]);
    expect(result.total).toBe(8);
    expect(result.coverage).toBe(100);
    expect(result.provisional).toBe(false);
  });
  it('withholds empty or wholly unknown totals and labels them without a fabricated number', () => {
    for (const categories of [[], [category('owners', null, 10, 0)], [category('range', null, 10, 0, false)]]) {
      const score = summariseScores(categories);
      expect(score.total).toBeNull();
      expect(score.coverage).toBe(0);
      expect(score.provisional).toBe(true);
      expect(formatScore(score.total)).toBe('—');
      expect(renderToStaticMarkup(createElement(ScoreBreakdown, { score }))).toContain('Insufficient data');
    }
    const markup = renderToStaticMarkup(createElement(ScoreBreakdown, { score: summariseScores([category('owners', null, 10, 0), category('range', null, 10, 0, false)]) }));
    expect(markup).toContain('No data');
    expect(markup).toContain('Not applicable');
    expect(markup).not.toContain('neutral 5');
  });
  it('marks coverage below 60% provisional at the boundary', () => {
    expect(summariseScores([category('price', 8, 10, .59)]).provisional).toBe(true);
    expect(summariseScores([category('price', 8, 10, .6)]).provisional).toBe(false);
    expect(summariseScores([category('price', 8, 10, .6)]).total).toBe(8);
  });
  it('clamps raw price and boot criteria to the displayed 1–10 scale', () => {
    const personal = { ...emptyPersonal(), ownership: { ...defaultOwnership, vehicleOverrides: { [v.id]: { purchase: 100000 } } } };
    expect(scoreVehicle(v, personal).categories.find(c => c.key === 'price')!.score).toBe(1);
    for (const [litres, expected] of [[100, 1], [300, 1], [600, 10], [1000, 10]]) {
      const car = { ...v, boot: { ...v.boot, value: litres, basis: 'VDA, rear seats raised' } };
      expect(scoreVehicle(car, emptyPersonal()).categories.find(c => c.key === 'boot')!.score).toBe(expected);
    }
  });
});
