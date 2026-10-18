import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { cargoCapacitySchema, cargoFor, cargoRecords, cargoTotals } from './cargo';
import { CargoCapacity } from './components/CargoCapacity';
import { ScoreBreakdown } from './components/Scores';
import { sourceMap, vehicles } from './data';
import { emptyPersonal } from './lib';
import { scoreVehicle } from './scoring';

describe('Tesla cargo figures and measurement scope', () => {
  it('keeps rear, front and combined capacities separate across the two body generations', () => {
    for (const id of ['model-y-rwd-2022', 'model-y-long-range-2023']) {
      const cargo = cargoFor(id)!;
      expect(cargo.rearSeatsUpLitres).toBe(854);
      expect(cargo.frontLitres).toBe(117);
      expect(cargo.rearSeatsFoldedLitres).toBe(2041);
      expect(cargoTotals(cargo)).toEqual({ seatsUpLitres: 971, seatsFoldedLitres: 2158 });
    }
    const updated = cargoFor('model-y-rwd-juniper-2025')!;
    expect(updated.rearSeatsUpLitres).toBe(822);
    expect(updated.frontLitres).toBe(116);
    expect(updated.rearSeatsFoldedLitres).toBe(2022);
    expect(cargoTotals(updated)).toEqual({ seatsUpLitres: 938, seatsFoldedLitres: 2138 });
    expect(updated.scope).toContain('Excludes the six-seat Model Y L');
    expect(cargoFor('unknown')).toBeUndefined();
  });

  it('rejects mismatched units, duplicate configuration applicability and impossible capacities', () => {
    const original = cargoRecords[0];
    expect(cargoCapacitySchema.safeParse([{ ...original, rearSeatsUpLitres: '854 L' }]).success).toBe(false);
    expect(cargoCapacitySchema.safeParse([{ ...original, rearSeatsUpLitres: -1 }]).success).toBe(false);
    expect(cargoCapacitySchema.safeParse([{ ...original, rearSeatsFoldedLitres: 100 }]).success).toBe(false);
    expect(cargoCapacitySchema.safeParse([original, { ...original, id: 'different-record' }]).success).toBe(false);
    expect(cargoCapacitySchema.safeParse([{ ...original, unverifiedVda: true }]).success).toBe(false);
  });

  it('applies every figure to existing five-seat Tesla configurations with primary sources', () => {
    for (const cargo of cargoRecords) {
      for (const id of cargo.vehicleIds) {
        const vehicle = vehicles.find(v => v.id === id)!;
        expect(vehicle.make).toBe('Tesla');
        expect(vehicle.seats).toBe(cargo.seats);
        expect(vehicle.boot.value).toBe(cargo.rearSeatsUpLitres);
      }
      for (const id of cargo.sourceIds) expect(sourceMap.get(id)?.kind).toBe('manufacturer');
    }
  });

  it('leads with the usable rear capacity and labels added front storage rather than treating it as rear boot', () => {
    const original = vehicles.find(v => v.id === 'model-y-rwd-2022')!;
    const markup = renderToStaticMarkup(createElement(CargoCapacity, { vehicle: original }));
    expect(markup.indexOf('854 L')).toBeLessThan(markup.indexOf('117 L'));
    expect(markup).toContain('Rear boot · rear seats up');
    expect(markup).toContain('All 5 seats available');
    expect(markup).toContain('Front storage (frunk)');
    expect(markup).toContain('854 L rear + 117 L front');
    expect(markup).toContain('does not identify a VDA method');
    const other = vehicles.find(v => v.make !== 'Tesla')!;
    expect(renderToStaticMarkup(createElement(CargoCapacity, { vehicle: other }))).toBe('');
  });

  it('keeps manufacturer cargo visible and uses a labelled independent scoring proxy', () => {
    const original = vehicles.find(v => v.id === 'model-y-rwd-2022')!;
    const score = scoreVehicle(original, emptyPersonal());
    const boot = score.categories.find(c => c.key === 'boot')!;
    expect(boot.headline).toBe('854 L rear boot');
    expect(boot.headlineDetail).toBe('525 L independent rear-storage scoring proxy');
    expect(boot.summary).toContain('Separate front storage: 117 L');
    expect(boot.score).toBe(7.8);
    expect(boot.confidence).toBe(.7);
    expect(boot.headlineEstimated).toBe(true);
    expect(boot.reason).toContain('525');
    expect(renderToStaticMarkup(createElement(ScoreBreakdown, { score }))).toContain('525 L independent rear-storage scoring proxy');
    const unknown = { ...original, id: 'unknown-cargo', boot: { ...original.boot, value: null } };
    const unknownBoot = scoreVehicle(unknown, emptyPersonal()).categories.find(c => c.key === 'boot')!;
    expect(unknownBoot.unscoredLabel).toBeUndefined();
    expect(unknownBoot.headline).toBe('Capacity needs verification');
  });
});
