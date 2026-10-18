import { describe, expect, it } from 'vitest';
import { ownershipFor, vehicles } from './data';
import { defaultFilters, defaultOwnership, defaultWeights, emptyPersonal, parseBackup, parseHash } from './lib';
import { ownershipEstimate, repairScenarioEligible } from './ownership';
import { scoreVehicle } from './scoring';

describe('repair savings, spending and exposure remain separate', () => {
  it('keeps optional savings out of spending, score and confidence for every car', () => {
    for (const car of vehicles) {
      const base = emptyPersonal();
      const off = ownershipEstimate(car, base);
      const onPersonal = { ...base, ownership: { ...defaultOwnership, includeRepairFund: true, vehicleOverrides: { [car.id]: { repairReserve: 5000 } } } };
      const on = ownershipEstimate(car, onPersonal);
      expect(off.includesRepairFund).toBe(false);
      expect(on.annual - off.annual).toBeCloseTo(5000);
      expect(on.runningTotal! - off.runningTotal!).toBeCloseTo(5000 * defaultOwnership.years);
      expect(on.annualBeforeRepairFund).toBeCloseTo(off.annual);
      expect(on.total).toBeCloseTo(off.total!);
      expect(on.runningConfidence).toBe(off.runningConfidence);
      expect(scoreVehicle(car, onPersonal)).toEqual(scoreVehicle(car, base));
      const repair = scoreVehicle(car, base).categories.find(c => c.key === 'repairs')!;
      expect(repair.score, car.id).not.toBeNull();
      expect(repair.confidence).toBe(.25);
      expect(repair.reason).toMatch(/insured|covered/);
    }
  });
  it('keeps insured glass and routine brake wear out of mechanical scenario autofill', () => {
    for (const family of ['hyundai-ioniq-5', 'kia-ev6']) {
      const excluded = ownershipFor(family)!.risks.filter(r => /windscreen|brake pads/i.test(r.title));
      expect(excluded.length).toBeGreaterThan(0);
      expect(excluded.every(r => !repairScenarioEligible(r))).toBe(true);
    }
  });
  it('restores old eight-category links/backups with the new repair weight', () => {
    const original = [10, 9, 8, 7, 6, 8, 6, 6];
    const state = parseHash('#view=compare&weights=' + original.join(','), new Set(vehicles.map(v => v.id)));
    expect(state.weights).toEqual(defaultWeights);
    const { repairs: _retired, ...old } = defaultWeights;
    const personal = parseBackup(JSON.stringify({ ...emptyPersonal(), weights: old, ownership: { ...defaultOwnership, includeRepairFund: undefined } }));
    expect(personal.weights).toEqual(defaultWeights);
    expect(ownershipEstimate(vehicles[0], personal).includesRepairFund).toBe(false);
    expect(state.filters).toEqual(defaultFilters);
  });
});
