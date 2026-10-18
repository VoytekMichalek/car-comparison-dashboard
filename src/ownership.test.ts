import { describe, expect, it } from 'vitest';
import { getPrice, budgetBenchmarks, insuranceFor, vehicles } from './data';
import { representativePrice, defaultOwnership, emptyPersonal, parseBackup } from './lib';
import { energyBudget, ownershipEstimate, qldDuty, registrationCost } from './ownership';

const ev = vehicles.find(v => v.id === 'model-y-rwd-2022')!;
const xtrail = vehicles.find(v => v.id === 'xtrail-ti-epower-awd')!;
const rav4 = vehicles.find(v => v.id === 'rav4-gxl-hev-2021-25')!;

describe('Queensland ownership budgeting', () => {
  it('uses the electric/three-cylinder group and adds CTP exactly once', () => {
    expect(registrationCost(ev, defaultOwnership).total).toBeCloseTo(790.15);
    expect(registrationCost(xtrail, defaultOwnership).total).toBeCloseTo(790.15);
    expect(registrationCost(rav4, defaultOwnership).total).toBeCloseTo(872.50);
  });
  it('treats a complete rego override as inclusive of CTP', () => {
    expect(registrationCost(ev, { ...defaultOwnership, ctp: 500, vehicleOverrides: { [ev.id]: { rego: 850 } } }).total).toBe(850);
  });
  it('does not infer a future hybrid’s cylinder class', () => {
    expect(registrationCost({ ...rav4, familyId: 'unknown-family' }, defaultOwnership).total).toBeNull();
  });
  it('rounds duty up per $100 and applies the high rate to the whole value', () => {
    expect(qldDuty(45000)).toBe(900);
    expect(qldDuty(45001)).toBe(902);
    expect(qldDuty(100000)).toBe(2000);
    expect(qldDuty(100000.01)).toBe(4004);
    expect(qldDuty(135600)).toBe(5424);
  });
  it('fills every researched car with explicit estimates, ranges and evidence', () => {
    for (const car of vehicles) {
      const e = ownershipEstimate(car, emptyPersonal());
      expect(e.complete, car.id).toBe(true);
      expect(e.missing).toEqual([]);
      expect(e.total, car.id).toBeGreaterThan(0);
      expect(e.annualLow).toBeLessThanOrEqual(e.annual);
      expect(e.annualHigh).toBeGreaterThanOrEqual(e.annual);
      expect(e.evidence.insurance.estimated).toBe(true);
      expect(e.evidence.insurance.sourceIds.length > 0).toBe(e.evidence.insurance.estimated);
      expect(e.runningConfidence).toBeLessThan(1);
    }
    const e = ownershipEstimate(ev, emptyPersonal());
    expect(e.components.insurance).toBe(1800);
    expect(e.evidence.energy.estimated).toBe(true);
    expect(e.energyReason).toContain('proxy');
    expect(ev.consumption.energyBasis).toBe('unspecified');
  });
  it('uses PHEV proxy bounds only where the verified calculation is incomplete', () => {
    const v = vehicles.find(v => v.id === 'sealion6-dynamic-183')!;
    const p = emptyPersonal();
    const e = energyBudget(v, p.costs);
    expect(e.proxy).toBe(true);
    expect(e.total).toBeGreaterThan(0);
    expect(e.low!).toBeLessThan(e.total!);
    expect(e.high!).toBeGreaterThan(e.total!);
    const petrolOnly = energyBudget(v, { ...p.costs, electricShare: 0 });
    expect(petrolOnly.proxy).toBe(false);
    expect(petrolOnly.total).toBeCloseTo(15000 / 100 * 4.8 * 1.9);
  });
  it('takes actual quotes ahead of auto estimates, including zero values', () => {
    const p = { ...emptyPersonal(), ownership: { ...defaultOwnership, insurance: 1500, vehicleOverrides: { [ev.id]: { insurance: 0, servicing: 0, energy: 0 } } } };
    const e = ownershipEstimate(ev, p);
    expect(e.components.insurance).toBe(0);
    expect(e.components.servicing).toBe(0);
    expect(e.evidence.insurance.estimated).toBe(false);
    expect(e.evidence.energy.estimated).toBe(false);
  });
  it('retains the public Tesla insurance budget across saved settings and allows a quote override', () => {
    const personal = emptyPersonal();
    const saved = { ...personal, ownership: { ...defaultOwnership, vehicleOverrides: { [ev.id]: { tyres: 400 } } } };
    expect(ownershipEstimate(ev, saved).components.insurance).toBe(1800);
    expect(ownershipEstimate(ev, saved).evidence.insurance.basis).toContain('Published planning default');
    const replacement = { ...personal, ownership: { ...defaultOwnership, vehicleOverrides: { [ev.id]: { insurance: 2100 } } } };
    expect(ownershipEstimate(ev, replacement).components.insurance).toBe(2100);
    const otherVariant = vehicles.find(v => v.familyId === ev.familyId && v.id !== ev.id)!;
    expect(ownershipEstimate(otherVariant, personal).components.insurance).toBe(insuranceFor(ev.familyId)!.point);
  });
  it('adds all annual items while keeping purchase outlays separate', () => {
    const p = { ...emptyPersonal(), ownership: { ...defaultOwnership, insurance: 1200, servicing: 400, tyres: 300, tyreMode: 'shared' as const, repairMode: 'shared' as const, charger: 0, inspection: 0, vehicleOverrides: { [ev.id]: { energy: 1000 } } } };
    const e = ownershipEstimate(ev, p);
    expect(e.complete).toBe(true);
    expect(e.annual).toBeCloseTo(4190.15);
    expect(e.feesIncluded).toBe(true);
    expect(e.duty).toBe(0);
    expect(e.transfer).toBe(0);
    expect(e.upfront).toBe(2);
  });
  it('estimates extra duty/transfer only when they are excluded', () => {
    const p = { ...emptyPersonal(), ownership: { ...defaultOwnership, purchasePrice: 45000, charger: 0, inspection: 0, feesIncluded: 'no' as const, vehicleOverrides: {} } };
    const e = ownershipEstimate(ev, p);
    expect(e.duty).toBe(900);
    expect(e.transfer).toBe(33.65);
    expect(e.upfront).toBeCloseTo(935.65);
  });
  it('labels compounded resale scenarios and uses repair spending beyond the reserve', () => {
    const initial = ownershipEstimate(ev, emptyPersonal());
    expect(initial.resaleEstimated).toBe(true);
    expect(initial.resale).toBe(Math.round(initial.purchasePrice! * (1 - budgetBenchmarks.depreciation.BEV.annualRate) ** defaultOwnership.years / 100) * 100);
    expect(initial.resaleLow!).toBeLessThan(initial.resale!);
    expect(initial.resaleHigh!).toBeGreaterThan(initial.resale!);
    const p = { ...emptyPersonal(), ownership: { ...defaultOwnership, purchasePrice: 45000, years: 5, repairMode: 'shared' as const, repairScenario: 7000, vehicleOverrides: { [ev.id]: { resale: 20000 } } } };
    const e = ownershipEstimate(ev, p);
    expect(e.depreciation).toBe(5000);
    expect(e.resaleEstimated).toBe(false);
    expect(e.excessRepair).toBe(4500);
  });
  it('prices tyres for each configuration and scales the allowance with distance', () => {
    const atto = vehicles.find(v => v.id === 'atto3-standard-2022')!;
    const p = emptyPersonal();
    const tesla = ownershipEstimate(ev, p);
    const byd = ownershipEstimate(atto, p);
    expect(tesla.components.tyres).toBeGreaterThan(byd.components.tyres);
    expect(tesla.evidence.tyres.sourceIds.length).toBeGreaterThan(0);
    expect(ownershipEstimate(atto, { ...p, costs: { ...p.costs, annualKm: 30000 } }).components.tyres).toBe(byd.components.tyres * 2);
    expect(ownershipEstimate(atto, { ...p, costs: { ...p.costs, annualKm: 0 } }).components.tyres).toBe(0);
  });
  it('applies per-car cost overrides without changing another car', () => {
    const p = { ...emptyPersonal(), ownership: { ...defaultOwnership, vehicleOverrides: { [ev.id]: { electricity: 700, insurance: 1400, servicing: 250, tyres: 420, repairReserve: 600, financeInterestAnnual: 100 } } } };
    const e = ownershipEstimate(ev, p);
    expect(e.energyCosts).toEqual({ electricity: 700, petrol: 0 });
    expect(e.components.tyres).toBe(420);
    expect(e.components.reserve).toBe(600);
    expect(e.evidence.tyres.estimated).toBe(false);
    expect(e.annual).toBeCloseTo(4260.15);
    expect(ownershipEstimate(rav4, p).components.tyres).toBe(ownershipEstimate(rav4, emptyPersonal()).components.tyres);
    expect(parseBackup(JSON.stringify(p))).toEqual(p);
  });
  it('sums independent PHEV fuel/electricity overrides once and accepts zero', () => {
    const phev = vehicles.find(v => v.id === 'sealion6-dynamic-183')!;
    const p = { ...emptyPersonal(), ownership: { ...defaultOwnership, vehicleOverrides: { [phev.id]: { energy: 9999, electricity: 600, petrol: 300, tyres: 0 } } } };
    const e = ownershipEstimate(phev, p);
    expect(e.components.energy).toBe(900);
    expect(e.energyCosts).toEqual({ electricity: 600, petrol: 300 });
    expect(e.components.tyres).toBe(0);
    expect(e.evidence.energy.estimated).toBe(false);
    expect(e.evidence.electricity.estimated).toBe(false);
    expect(e.evidence.petrol.estimated).toBe(false);
  });
  it('preserves legacy total-energy overrides and separates their cost mix', () => {
    const phev = vehicles.find(v => v.id === 'sealion6-dynamic-183')!;
    const p = { ...emptyPersonal(), ownership: { ...defaultOwnership, vehicleOverrides: { [phev.id]: { energy: 900 } } } };
    const e = ownershipEstimate(phev, p);
    expect(e.energyCosts.electricity! + e.energyCosts.petrol!).toBeCloseTo(900);
    expect(e.components.energy).toBeCloseTo(900);
  });
  it('backs up the extended settings while accepting original v1 backups', () => {
    const p = { ...emptyPersonal(), ownership: { ...defaultOwnership, vehicleOverrides: { [ev.id]: { insurance: 1800, energy: 1000 } } } };
    expect(parseBackup(JSON.stringify(p))).toEqual(p);
    expect(parseBackup(JSON.stringify(emptyPersonal())).ownership).toBeUndefined();
  });

  it('keeps purchase, setup, resale and repair scenarios out of recurring running costs', () => {
    const personal = emptyPersonal();
    const baseline = ownershipEstimate(ev, personal);
    const changed = ownershipEstimate(ev, { ...personal, ownership: { ...defaultOwnership,
      purchasePrice: 100000, resaleValue: 10000, charger: 5000, inspection: 1000,
      otherUpfront: 3000, feesIncluded: 'no', repairScenario: 20000,
    } });
    expect(changed.annual).toBe(baseline.annual);
    expect(changed.runningTotal).toBe(baseline.runningTotal);
    expect(changed.total).not.toBe(baseline.total);
    const shorter = ownershipEstimate(ev, { ...personal, ownership: { ...defaultOwnership, years: 5 } });
    expect(shorter.annual).toBe(baseline.annual);
    expect(shorter.runningTotal).toBeCloseTo(baseline.runningTotal! / 2);
  });
  it('can price running costs without a purchase price', () => {
    const unpriced = { ...ev, id: 'unpriced-car' };
    const cost = ownershipEstimate(unpriced, emptyPersonal());
    expect(cost.purchasePrice).toBeNull();
    expect(cost.total).toBeNull();
    expect(cost.complete).toBe(true);
    expect(cost.runningTotal).toBeGreaterThan(0);
    const incomplete = ownershipEstimate({ ...unpriced, familyId: 'unresearched-car' }, emptyPersonal());
    expect(incomplete.complete).toBe(false);
    expect(incomplete.runningTotal).toBeNull();
  });
  it('ignores retired roadside allowances in old backups and preserves explicit insurance inputs', () => {
    const legacy = { ...emptyPersonal(), ownership: { ...defaultOwnership, roadside: 300,
      vehicleOverrides: { [ev.id]: { insurance: 1800, roadside: 500 } },
    } };
    const restored = parseBackup(JSON.stringify(legacy));
    expect(restored.ownership).not.toHaveProperty('roadside');
    expect(restored.ownership!.vehicleOverrides[ev.id]).toEqual({ insurance: 1800 });
    const cost = ownershipEstimate(ev, restored);
    expect(cost.components).not.toHaveProperty('roadside');
    expect(cost.components.insurance).toBe(1800);
    expect(ownershipEstimate(ev, legacy).annual).toBe(cost.annual);
  });

  it('counts purchase once in a ten-year total and deducts resale once', () => {
    const p = { ...emptyPersonal(), ownership: { ...defaultOwnership, years: 10, insurance: 1000, servicing: 200, tyres: 100, tyreMode: 'shared' as const, repairReserve: 300, repairMode: 'shared' as const, financeInterestAnnual: 150, purchasePrice: 40000, resaleValue: 10000, charger: 2000, inspection: 400, otherUpfront: 100, feesIncluded: 'yes' as const, repairScenario: 5000, vehicleOverrides: { [ev.id]: { energy: 600, rego: 800 } } } };
    const e = ownershipEstimate(ev, p);
    expect(e.annual).toBe(3150);
    expect(e.upfront).toBe(2502);
    expect(e.excessRepair).toBe(2000);
    expect(e.runningTotal).toBe(31500);
    expect(e.total).toBe(66002);
  });
});

it('uses the researched representative purchase price until a personal quote replaces it', () => {
  expect(ownershipEstimate(ev, emptyPersonal()).purchasePrice).toBe(representativePrice(getPrice(ev.id)));
  const p = emptyPersonal();
  p.ownership = { ...defaultOwnership, vehicleOverrides: { [ev.id]: { purchase: 39000 } } };
  expect(ownershipEstimate(ev, p).purchasePrice).toBe(39000);
});

it('uses configuration service budgets when available and preserves quote precedence', () => {
  expect(ownershipEstimate(vehicles.find(v => v.id === 'xtrail-stl-epower-fwd-2026')!, emptyPersonal()).components.servicing).toBe(500);
  for (const car of vehicles) {
    const scoped = ownershipEstimate(car, emptyPersonal()).info?.serviceByVehicle?.[car.id];
    if (scoped) {
      expect(ownershipEstimate(car, emptyPersonal()).components.servicing).toBe(scoped.serviceAnnual);
      const p = emptyPersonal();
      p.ownership = { ...defaultOwnership, vehicleOverrides: { [car.id]: { servicing: 333 } } };
      expect(ownershipEstimate(car, p).components.servicing).toBe(333);
    }
  }
});


describe('car-specific repair savings', () => {
  it('varies the default by configuration while exposing estimate ranges', () => {
    const original = ownershipEstimate(ev, emptyPersonal());
    const newer = ownershipEstimate(vehicles.find(v => v.id === 'model-y-rwd-juniper-2025')!, emptyPersonal());
    const hybrid = ownershipEstimate(rav4, emptyPersonal());
    expect(original.components.reserve).toBeGreaterThan(hybrid.components.reserve);
    expect(original.components.reserve).toBeGreaterThan(newer.components.reserve);
    expect(original.evidence.reserve.estimated).toBe(true);
    expect(original.evidence.reserve.low).toBeLessThan(original.components.reserve);
    expect(original.evidence.reserve.high).toBeGreaterThan(original.components.reserve);
    expect(original.evidence.reserve.sourceIds.length).toBeGreaterThan(0);
  });
  it('lets zero or a car allowance override the shared/default reserve', () => {
    const p = { ...emptyPersonal(), ownership: { ...defaultOwnership, repairMode: 'shared' as const, repairReserve: 950, vehicleOverrides: { [ev.id]: { repairReserve: 0 } } } };
    expect(ownershipEstimate(ev, p).components.reserve).toBe(0);
    expect(ownershipEstimate(ev, p).evidence.reserve.estimated).toBe(false);
    expect(ownershipEstimate(rav4, p).components.reserve).toBe(950);
    expect(parseBackup(JSON.stringify(p))).toEqual(p);
  });
  it('preserves non-default legacy shared allowances without freezing old defaults', () => {
    const custom = { ...emptyPersonal(), ownership: { ...defaultOwnership, repairMode: undefined, repairReserve: 875 } };
    expect(ownershipEstimate(ev, custom).components.reserve).toBe(875);
    const oldDefault = { ...custom, ownership: { ...custom.ownership, repairReserve: 500 } };
    expect(ownershipEstimate(ev, oldDefault).components.reserve).toBe(1800);
  });
  it('counts a fund once and adds only a stress repair above that fund', () => {
    const p = { ...emptyPersonal(), ownership: { ...defaultOwnership, years: 5, repairScenario: 9000, vehicleOverrides: {} } };
    const e = ownershipEstimate(ev, p);
    expect(e.excessRepair).toBe(9000 - e.components.reserve * 5);
    expect(e.runningTotal).toBe(e.annual * 5);
    expect(e.annual).toBe(Object.values(e.components).reduce<number>((sum, n) => sum + (n ?? 0), 0));
  });
});
