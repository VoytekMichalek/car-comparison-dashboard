import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { vehicles } from './data';
import { defaultOwnership, emptyPersonal, parseBackup } from './lib';
import { ownershipEstimate } from './ownership';
import { scoreVehicle } from './scoring';
import Ownership from './pages/Ownership';
import VehicleCosts from './components/VehicleCosts';
import { AnnualCostChart } from './components/AnnualCostChart';

const car = vehicles.find(vehicle => vehicle.id === 'model-y-rwd-2022')!;

describe('cash-purchase ownership budgets', () => {
  it('ignores both legacy finance fields across budgets, estimates, and ratings without rejecting backups', () => {
    const baseline = emptyPersonal();
    baseline.ownership = { ...defaultOwnership, vehicleOverrides: {} };
    const saved = { ...baseline, ownership: { ...defaultOwnership, financeInterestAnnual: 7500, vehicleOverrides: { [car.id]: { financeInterestAnnual: 12500 } } } };
    const restored = parseBackup(JSON.stringify(saved));
    expect(restored.ownership?.financeInterestAnnual).toBe(7500);
    expect(restored.ownership?.vehicleOverrides[car.id].financeInterestAnnual).toBe(12500);
    for (const vehicle of vehicles) {
      const expected = ownershipEstimate(vehicle, baseline);
      const actual = ownershipEstimate(vehicle, restored);
      expect(actual).toEqual(expected);
      expect(actual.components).not.toHaveProperty('finance');
      expect(scoreVehicle(vehicle, restored)).toEqual(scoreVehicle(vehicle, baseline));
    }
  });

  it('removes finance controls, columns and chart categories while retaining optional repair savings', () => {
    const personal = emptyPersonal();
    personal.ownership = { ...defaultOwnership, financeInterestAnnual: 7500, vehicleOverrides: {} };
    const renderCosts = () => renderToStaticMarkup(createElement(Ownership, {
      vehicles: [car], allVehicles: [car], personal, onUpdate: () => {}, onDetail: () => {}, onVariant: () => {},
    }));
    const annual = renderCosts();
    expect(annual).not.toMatch(/finance|loan principal/i);
    expect(annual).not.toContain('data-column="other"');
    expect(annual).toContain('Electricity / fuel');
    expect(annual).toContain('Tyres / year');
    expect(annual).toContain('Annual running budget');
    personal.ownership.includeRepairFund = true;
    const withSavings = renderCosts();
    expect(withSavings).toContain('data-column="other"');
    expect(withSavings).toContain('Optional repair savings / year');
    expect(withSavings).not.toMatch(/finance|loan principal/i);
    const detail = renderToStaticMarkup(createElement(VehicleCosts, { vehicle: car, personal, onUpdate: () => {}, onEdit: () => {} }));
    const chart = renderToStaticMarkup(createElement(AnnualCostChart, { vehicles: [car], personal, onDetail: () => {} }));
    expect(detail).not.toMatch(/finance|loan principal/i);
    expect(chart).not.toMatch(/finance|loan principal/i);
  });
});
