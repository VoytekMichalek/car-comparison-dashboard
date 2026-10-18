import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { getPrice, vehicles } from './data';
import { emptyPersonal } from './lib';
import { fitAssessmentFor } from './research';
import { scoreVehicle } from './scoring';
import { ScoreBreakdown } from './components/Scores';
import { energyBudget, ownershipEstimate } from './ownership';

describe('useful evidence coverage across the whole catalogue', () => {
  it('has sourced occupied-row cargo, a fit assessment and a complete running budget for every car', () => {
    for (const car of vehicles) {
      for (const fact of [car.boot, car.bootAllRows]) {
        expect(fact.value, car.id).toBeGreaterThan(0);
        expect(fact.sourceIds.length, car.id).toBeGreaterThan(0);
      }
      expect(fitAssessmentFor(car.id), car.id).toBeDefined();
      expect(car.familyFit.row2.length, car.id).toBeGreaterThan(15);
      expect(car.familyFit.testedSeats.length, car.id).toBeGreaterThan(15);
      expect(car.familyFit.sourceIds.length, car.id).toBeGreaterThan(0);
      expect(getPrice(car.id)?.point, car.id).toBeGreaterThan(0);
      expect(ownershipEstimate(car, emptyPersonal()).complete, car.id).toBe(true);
      const score = scoreVehicle(car, emptyPersonal());
      expect(score.categories.find(c => c.key === 'boot')?.score, car.id).not.toBeNull();
      const markup = renderToStaticMarkup(createElement(ScoreBreakdown, { score }));
      expect(markup, car.id).not.toMatch(/No [dD]ata/);
    }
  });
  it('keeps weighted PHEV petrol claims out of charge-depleted and EV-only energy calculations', () => {
    const phevs = vehicles.filter(v => v.powertrain === 'PHEV' && v.weightedFuelConsumption);
    expect(phevs.length).toBeGreaterThanOrEqual(6);
    for (const car of phevs) {
      expect(car.weightedFuelConsumption!.unit).toBe('L/100km');
      expect(car.consumption.unit).toBe('kWh/100km');
      const settings = emptyPersonal().costs;
      const actual = energyBudget(car, settings);
      const changed = energyBudget({ ...car, weightedFuelConsumption: { ...car.weightedFuelConsumption!, value: 99 } }, settings);
      expect(changed.total, car.id).toBe(actual.total);
      expect(energyBudget(car, { ...settings, electricShare: 0 }).total, car.id).toBeGreaterThan(0);
      expect(energyBudget(car, { ...settings, electricShare: 100 }).total, car.id).toBeGreaterThan(0);
    }
  });
});
