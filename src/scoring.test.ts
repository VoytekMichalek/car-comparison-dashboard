import { describe, expect, it } from 'vitest';
import { vehicles } from './data';
import { defaultFilters, defaultOwnership, defaultWeights, emptyPersonal, parseBackup, parseHash, publicHash } from './lib';
import { scoreVehicle } from './scoring';
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
    expect(changed.total).toBeGreaterThan(base.total);
    expect(changed.categories.find(c => c.key === 'seating')?.weight).toBe(10);
  });
  it('keeps a single favourable community post from dominating the score', () => {
    const ev5 = vehicles.find(v => v.id === 'ev5-air-standard-2024')!;
    const owners = scoreVehicle(ev5, emptyPersonal()).categories.find(c => c.key === 'owners')!;
    expect(owners.score).toBe(10);
    expect(owners.adjusted).toBeLessThan(5.5);
    expect(owners.confidence).toBeLessThan(.1);
  });
  it('treats missing evidence as neutral and exposes it in coverage', () => {
    const unknown = { ...v, id: 'unknown', familyId: 'unknown', make: 'Unknown', familyFit: { ...v.familyFit, status: 'unverified' as const }, range: { ...v.range, value: null }, boot: { ...v.boot, value: null }, safety: { ...v.safety, stars: null } };
    const result = scoreVehicle(unknown, emptyPersonal());
    expect(result.total).toBe(5);
    expect(result.coverage).toBe(0);
    expect(result.provisional).toBe(true);
  });
  it('does not apply original-generation owner ratings to the Atto 3 EVO or new RAV4', () => {
    for (const id of ['atto3-evo-premium-2026', 'rav4-gxl-hev-2026']) {
      const car = vehicles.find(v => v.id === id)!;
      const owners = scoreVehicle(car, emptyPersonal()).categories.find(c => c.key === 'owners')!;
      expect(owners.confidence).toBe(0);
      expect(owners.adjusted).toBe(5);
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
  it('respects electric-range preference without pretending HEVs are plug-ins', () => {
    const hybrid = vehicles.find(v => v.powertrain === 'HEV')!;
    const range = scoreVehicle(hybrid, emptyPersonal()).categories.find(c => c.key === 'range')!;
    expect(range.score).toBe(1);
    expect(range.confidence).toBe(1);
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
