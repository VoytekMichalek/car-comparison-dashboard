import { describe, expect, it } from 'vitest';
import { depreciationSeries, initialChartSelection, priceScorePoints } from './charts';
import { budgetBenchmarks, vehicles } from './data';
import { defaultOwnership, defaultWeights, emptyPersonal } from './lib';
import { ownershipEstimate } from './ownership';
import { scoreVehicle } from './scoring';

const ev = vehicles.find(v => v.id === 'model-y-rwd-2022')!;
const hybrid = vehicles.find(v => v.id === 'rav4-gxl-hev-2021-25')!;

describe('Chart scenarios and score data', () => {
  it('plots annual reducing-balance values and aligns its ownership-period value exactly', () => {
    for (const car of vehicles) {
      const personal = emptyPersonal();
      const estimate = ownershipEstimate(car, personal);
      const series = depreciationSeries(car, personal, 10)!;
      expect(series.points).toHaveLength(11);
      expect(series.points.map(p => p.year)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(series.purchasePrice).toBe(estimate.purchasePrice);
      expect(series.points[0].value).toBe(estimate.purchasePrice);
      expect(series.points[10].value).toBe(estimate.resale);
      const rate = budgetBenchmarks.depreciation[car.powertrain].annualRate;
      expect(series.points[1].value).toBe(Math.round(estimate.purchasePrice! * (1 - rate) / 100) * 100);
      for (const point of series.points) {
        expect(point.low).toBeLessThanOrEqual(point.value);
        expect(point.high).toBeGreaterThanOrEqual(point.value);
        expect(point.loss).toBe(estimate.purchasePrice! - point.value);
        expect(point.value).toBeGreaterThanOrEqual(0);
      }
    }
  });
  it('keeps bounds in their correct direction and a hybrid’s slower scenario distinct from an EV', () => {
    const p = emptyPersonal();
    p.ownership = { ...defaultOwnership, purchasePrice: 45000, vehicleOverrides: {} };
    const electric = depreciationSeries(ev, p, 5)!;
    const petrolHybrid = depreciationSeries(hybrid, p, 5)!;
    expect(electric.points[5].value).toBeLessThan(petrolHybrid.points[5].value);
    expect(electric.points[5].low).toBeLessThan(electric.points[5].value);
    expect(electric.points[5].high).toBeGreaterThan(electric.points[5].value);
    expect(electric.customResale).toBe(false);
    expect(electric.sourceIds.length).toBeGreaterThan(0);
  });
  it('honours per-car purchase and resale inputs, including a non-rounded anchor', () => {
    const p = emptyPersonal();
    p.ownership = { ...defaultOwnership, years: 3, purchasePrice: 50000, resaleValue: 25000, vehicleOverrides: { [ev.id]: { purchase: 40000, resale: 23456 } } };
    const series = depreciationSeries(ev, p, 10)!;
    expect(series.purchasePrice).toBe(40000);
    expect(series.points[3].value).toBe(23456);
    expect(series.points[3].value).toBe(ownershipEstimate(ev, p).resale);
    expect(series.annualRate).toBeCloseTo(1 - (23456 / 40000) ** (1 / 3));
    expect(series.points[1].value).toBe(Math.round(40000 * (23456 / 40000) ** (1 / 3) / 100) * 100);
    expect(series.points[4].value).toBeLessThan(series.points[3].value);
    expect(series.note).toContain('extrapolation');
    expect(series.sourceIds).toEqual([]);
    expect(depreciationSeries(hybrid, p, 3)!.points[3].value).toBe(25000);
  });
  it('reaches an explicit zero resale without NaN, a sudden immediate zero or negative future values', () => {
    const p = emptyPersonal();
    p.ownership = { ...defaultOwnership, years: 5, purchasePrice: 40000, resaleValue: 0, vehicleOverrides: {} };
    const series = depreciationSeries(ev, p, 10)!;
    expect(series.customResale).toBe(true);
    expect(series.annualRate).toBeNull();
    expect(series.points[1].value).toBeGreaterThan(0);
    expect(series.points[4].value).toBeGreaterThan(0);
    expect(series.points.slice(5).every(point => point.value === 0)).toBe(true);
    expect(series.points[5].value).toBe(ownershipEstimate(ev, p).resale);
    expect(series.note).toContain('compound rate cannot reach zero');
  });
  it('handles zero purchase, appreciation and invalid numeric scenarios explicitly', () => {
    const p = emptyPersonal();
    p.ownership = { ...defaultOwnership, purchasePrice: 0, vehicleOverrides: {} };
    expect(depreciationSeries(ev, p, 3)!.points.every(point => point.value === 0)).toBe(true);
    p.ownership.resaleValue = 1000;
    expect(depreciationSeries(ev, p, 3)).toBeNull();
    p.ownership.purchasePrice = 40000;
    p.ownership.resaleValue = 50000;
    const appreciation = depreciationSeries(ev, p, 10)!;
    expect(appreciation.annualRate!).toBeLessThan(0);
    expect(appreciation.points[10].loss).toBe(-10000);
    expect(appreciation.note).toContain('gain');
    p.ownership.purchasePrice = -1;
    expect(depreciationSeries(ev, p, 3)).toBeNull();
    p.ownership.purchasePrice = Number.NaN;
    expect(depreciationSeries(ev, p, 3)).toBeNull();
    expect(depreciationSeries(ev, emptyPersonal(), Number.NaN)).toBeNull();
    expect(depreciationSeries(ev, emptyPersonal(), 0)).toBeNull();
  });
  it('uses the identical weighted scores, purchase overrides and confidence flags as the dashboard', () => {
    const p = emptyPersonal();
    p.ownership = { ...defaultOwnership, vehicleOverrides: { [ev.id]: { purchase: 32123, feesIncluded: 'no', insurance: 1234 } } };
    const weights = { ...defaultWeights, seating: 10, price: 1, owners: 8 };
    const points = priceScorePoints([ev, hybrid], p, weights, 39000);
    expect(points).toHaveLength(2);
    const point = points.find(point => point.vehicle.id === ev.id)!;
    expect(point.price).toBe(32123);
    expect(point.personalPrice).toBe(true);
    expect(point.priceEstimated).toBe(false);
    expect(point.priceBasis).toContain('additional');
    expect(point.score).toEqual(scoreVehicle(ev, p, weights, 39000));
    expect(point.sourceIds).toEqual([]);
    expect(points[1].score).toEqual(scoreVehicle(hybrid, p, weights, 39000));
  });
  it('withholds invalid prices and missing prices instead of plotting a zero placeholder', () => {
    const p = emptyPersonal();
    p.ownership = { ...defaultOwnership, purchasePrice: Number.NaN, vehicleOverrides: {} };
    expect(priceScorePoints([ev], p, defaultWeights, 45000)).toEqual([]);
    const unknown = { ...ev, id: 'chart-missing-price' };
    expect(priceScorePoints([unknown], emptyPersonal(), defaultWeights, 45000)).toEqual([]);
    expect(depreciationSeries(unknown, emptyPersonal())).toBeNull();
  });
  it('starts with selected comparison cars, otherwise a small budget-relevant set', () => {
    expect(initialChartSelection([ev, hybrid], [hybrid.id])).toEqual([hybrid.id]);
    expect(initialChartSelection([], [ev.id])).toEqual([]);
    const initial = initialChartSelection(vehicles);
    expect(initial).toHaveLength(5);
    expect(new Set(initial).size).toBe(5);
    expect(initial.every(id => vehicles.some(v => v.id === id))).toBe(true);
  });
});
