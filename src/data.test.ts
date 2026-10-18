import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { repairReserves, expertReviews, images, imageGaps, ownershipInfo, insuranceEstimates, tyreEstimates, prices, sources, validateReferences, vehicles, energyAssumptions } from './data';
import { defaultCosts, rangeStandard } from './lib';

describe('researched catalogue integrity', () => {
  it('matches dated fuel benchmarks and keeps conflicting grade guidance explicit', () => {
    expect(defaultCosts.petrolRate).toBe(energyAssumptions.regularRate);
    expect(defaultCosts.premiumPetrolRate).toBe(energyAssumptions.premiumRate);
    expect(vehicles.find(v => v.id === 'sealion6-dynamic-183')?.fuel?.minimumRon).toBe(95);
    expect(vehicles.find(v => v.id === 'xtrail-ti-epower-awd')?.fuel?.minimumRon).toBe(91);
    expect(vehicles.find(v => v.id === 'rav4-gxl-hev-2021-25')?.fuel?.planningRon).toBe(91);
    expect(vehicles.find(v => v.id === 'rav4-gxl-hev-2026')?.fuel?.planningRon).toBe(95);
    expect(vehicles.find(v => v.id === 'sorento-phev-gtline-2021-23')?.fuel).toMatchObject({ planningRon: 91, minimumRon: 91, confidence: 'medium' });
  });
  it('preserves the original catalogue and includes researched petrol and diesel alternatives', () => {
    const families = new Set(vehicles.map(v => v.familyId));
    for (const family of ['tesla-model-y', 'byd-atto-3', 'kia-ev6', 'kia-ev5', 'hyundai-ioniq-5', 'zeekr-7x', 'mitsubishi-outlander-phev', 'byd-sealion-6', 'nissan-x-trail-epower', 'toyota-rav4-hybrid', 'toyota-kluger-hybrid', 'kia-sorento', 'subaru-forester', 'subaru-outback', 'kia-sportage', 'hyundai-tucson', 'kia-carnival', 'mitsubishi-outlander-petrol', 'nissan-x-trail-petrol']) expect(families.has(family), family).toBe(true);
    expect(vehicles.length).toBeGreaterThanOrEqual(35);
    expect(validateReferences()).toEqual([]);
  });
  it('covers every family with scoped professional tests and preserves original verdicts', () => {
    expect(new Set(expertReviews.map(r => r.familyId))).toEqual(new Set(vehicles.map(v => v.familyId)));
    expect(new Set(expertReviews.map(r => r.id)).size).toBe(expertReviews.length);
    for (const r of expertReviews) {
      expect(r.scope.length).toBeGreaterThan(30);
      expect(r.rating !== null || r.verdict.length > 0).toBe(true);
      if (r.rating !== null) expect(r.rating).toBeLessThanOrEqual(r.outOf);
      for (const id of r.vehicleIds) expect(vehicles.find(v => v.id === id)?.familyId).toBe(r.familyId);
    }
    expect(expertReviews.find(r => r.id === 'sorento-hev')?.vehicleIds).toEqual([]);
    expect(expertReviews.find(r => r.id === 'ioniq84-rwd-local')?.outOf).toBe(5);
  });
  it('uses defined units and source evidence for verified numeric facts', () => {
    for (const v of vehicles) {
      for (const [key, unit] of [['range', 'km'], ['battery', 'kWh'], ['boot', 'L'], ['bootAllRows', 'L'], ['length', 'mm'], ['width', 'mm'], ['towing', 'kg'], ['acCharging', 'kW'], ['dcCharging', 'kW']] as const) {
        if (v[key].value !== null) { expect(v[key].unit, `${v.id}:${key}`).toBe(unit); expect(v[key].sourceIds.length).toBeGreaterThan(0); }
      }
      if (v.consumption.value !== null) expect(v.consumption.unit).toBe(['HEV','PETROL','DIESEL'].includes(v.powertrain) ? 'L/100km' : 'kWh/100km');
      if (v.observedConsumption?.value != null) {
        expect(v.observedConsumption.unit).toBe(['HEV','PETROL','DIESEL'].includes(v.powertrain) ? 'L/100km' : 'kWh/100km');
        expect(v.observedConsumption.sourceIds.length).toBeGreaterThan(0);
      }
      if (v.observedRange?.value != null) {
        expect(v.observedRange.unit).toBe('km');
        expect(v.observedRange.sourceIds.length).toBeGreaterThan(0);
        expect(v.observedRange.basis).toMatch(/observed|measured|test/i);
      }
    }
  });
  it('preserves the practical distinctions central to this purchase', () => {
    const originalY = vehicles.find(v => v.id === 'model-y-rwd-2022')!;
    expect(originalY.years).toContain(2023);
    expect(originalY.familyFit.testedSeats.toLowerCase()).toContain('infasecure');
    const atto = vehicles.find(v => v.id === 'atto3-standard-2022')!;
    expect(atto.familyFit.status).toBe('tested-related');
    expect(atto.familyFit.testedSeats).toMatch(/rear.facing|capsule/i);
    expect(vehicles.find(v => v.familyId === 'toyota-kluger-hybrid')?.familyFit.row3.toLowerCase()).toMatch(/no|not/);
    expect(rangeStandard(vehicles.find(v => v.id === 'outlander-phev-aspire-20')!.range)).toBe('NEDC');
  });
  it('keeps MY23 Ioniq 5 powertrains separate from the earlier battery and price samples', () => {
    const rwd = vehicles.find(v => v.id === 'ioniq5-dynamiq-rwd-2023')!;
    const awd = vehicles.find(v => v.id === 'ioniq5-techniq-awd-2023')!;
    expect(rwd.years).toContain(2023);
    expect(awd.years).toContain(2023);
    expect(Math.min(...rwd.years)).toBeGreaterThanOrEqual(2022);
    expect(Math.min(...awd.years)).toBeGreaterThanOrEqual(2022);
    expect(rwd.battery.value).toBe(77.4);
    expect(awd.battery.value).toBe(77.4);
    expect(rwd.range.value).toBe(507);
    expect(awd.range.value).toBe(454);
    expect(rwd.consumption.value).toBe(17);
    expect(awd.consumption.value).toBe(19.1);
    expect(rwd.familyFit.status).toBe('tested-related');
    expect(awd.familyFit.status).toBe('tested-related');
    expect(rwd.safety.sourceIds).toContain('ev-ioniq-ancap');
    const guide = prices.find(p => p.vehicleId === rwd.id)!;
    expect(guide.point).toBeGreaterThan(0);
    if (guide.kind === 'estimate') {
      expect(guide.sampleCount).toBe(0);
      expect(guide.confidence).toBe('low');
    } else {
      expect(guide.sampleCount).toBe(guide.observations?.length);
      expect(guide.observations!.every(o => o.year !== null && rwd.years.includes(o.year))).toBe(true);
    }
    expect(prices.find(p => p.vehicleId === awd.id)?.observations?.[0].year).toBe(2023);
    expect(expertReviews.find(r => r.id === 'ioniq5-techniq-2023')?.vehicleIds).toEqual([awd.id]);
  });
  it('distinguishes sourced asking observations from explicit planning estimates', () => {
    for (const p of prices) {
      expect(p.note.length).toBeGreaterThan(15);
      expect(['2026-10-18', '2026-10-19']).toContain(p.observed);
      if (p.low !== null) { if (p.kind === 'estimate') { expect(p.sampleCount).toBe(0); expect(p.estimateBasis).toBeTruthy(); } else expect(p.sampleCount).toBeGreaterThan(0); expect(p.sourceIds.length).toBeGreaterThan(0); expect(p.high).toBeGreaterThanOrEqual(p.low); }
    }
  });
  it('has insurance and service budgets, distinguishing repair prices from quote-only gaps', () => {
    expect(new Set(insuranceEstimates.map(i => i.familyId))).toEqual(new Set(vehicles.map(v => v.familyId)));
    for (const info of ownershipInfo) {
      expect(info.serviceLow!).toBeLessThanOrEqual(info.serviceAnnual!);
      expect(info.serviceHigh!).toBeGreaterThanOrEqual(info.serviceAnnual!);
      expect(info.serviceConfidence).toBeTruthy();
      for (const risk of info.risks) {
        if (risk.low === null) {
          expect(risk.high).toBeNull();
          expect(risk.priceBasis).toMatch(/quote|unavailable|not.*verif|not.*price/i);
        } else expect(risk.high!).toBeGreaterThanOrEqual(risk.low);
        expect(risk.sourceIds.length).toBeGreaterThan(0);
        expect(risk.confidence).toBeTruthy();
      }
    }
  });
  it('keeps fuel-only specifications separate from electric battery and range fields', () => {
    const fuelCars = vehicles.filter(v => ['PETROL', 'DIESEL'].includes(v.powertrain));
    expect(fuelCars.length).toBeGreaterThanOrEqual(8);
    for (const v of fuelCars) {
      expect(v.range.value).toBeNull();
      expect(v.battery.value).toBeNull();
      expect(v.consumption.value).toBeGreaterThan(0);
      expect(v.acCharging.value).toBeNull();
      if (v.powertrain === 'DIESEL') expect(v.fuel).toBeUndefined();
    }
  });
  it('has sourced tyre budgets and ordered assumptions for every configuration', () => {
    expect(new Set(tyreEstimates.map(t => t.vehicleId))).toEqual(new Set(vehicles.map(v => v.id)));
    for (const t of tyreEstimates) {
      expect(t.size.length).toBeGreaterThan(0);
      expect(['budget-aftermarket', 'budget-unverified']).toContain(t.strategy);
      expect(t.sourceIds).toContain('budget-value-ev-wear-evidence');
      expect(t.setLow).toBeLessThanOrEqual(t.setCost);
      expect(t.setHigh).toBeGreaterThanOrEqual(t.setCost);
      expect(t.lifeLowKm).toBeLessThanOrEqual(t.lifeKm);
      expect(t.lifeHighKm).toBeGreaterThanOrEqual(t.lifeKm);
      expect(t.sourceIds.length).toBeGreaterThan(0);
      if (t.retailAnchor) {
        expect(t.setCost).toBeCloseTo(t.retailAnchor.unitPrice * t.retailAnchor.quantity, 2);
        expect(t.sourceIds).toContain(t.retailAnchor.sourceId);
      }
      if (t.strategy === 'budget-unverified') expect(t.basis).toMatch(/gap|fallback/i);
    }
  });
  it('bundles genuine local image assets and license attribution', () => {
    for (const image of images) {
      const file = resolve('public', image.path.slice(1));
      expect(existsSync(file), file).toBe(true);
      expect(readFileSync(file).length).toBeGreaterThan(5000);
      expect(image.credit.length).toBeGreaterThan(0);
      expect(image.sourceUrl).toContain('commons.wikimedia.org');
      expect(image.licenseUrl).toMatch(/^https:/);
    }
    for (const family of new Set(vehicles.map(v => v.familyId))) expect(images.some(i => i.familyId === family) || imageGaps.some(g => g.familyId === family && g.reason.length > 20)).toBe(true);
  });
  it('dates evidence and retains sources for further reading', () => {
    expect(sources.length).toBeGreaterThan(90);
    for (const source of sources) { expect(['2026-10-18', '2026-10-19']).toContain(source.checked); expect(source.url).toMatch(/^https:/); }
    for (const vehicle of vehicles) expect(vehicle.sourceIds.length).toBeGreaterThan(0);
  });
});

it('keeps physical listing counts distinct from list-price proxies', () => {
  for (const p of prices) {
    expect(p.point).toBeGreaterThan(0);
    if (p.kind === 'estimate') expect(p.observations ?? []).toHaveLength(0);
    else expect(p.observations?.length).toBe(p.sampleCount);
    const urls = new Set<string>();
    for (const o of p.observations ?? []) {
      expect(urls.has(o.url)).toBe(false);
      urls.add(o.url);
      const sourceUrl = new URL(sources.find(s => s.id === o.sourceId)!.url);
      const observationUrl = new URL(o.url);
      sourceUrl.hash = '';
      observationUrl.hash = '';
      expect(sourceUrl.href).toBe(observationUrl.href);
    }
  }
});


it('has one transparent repair reserve for every researched configuration', () => {
  expect(new Set(repairReserves.map(r => r.vehicleId))).toEqual(new Set(vehicles.map(v => v.id)));
  for (const r of repairReserves) {
    expect(r.low).toBeLessThanOrEqual(r.point);
    expect(r.high).toBeGreaterThanOrEqual(r.point);
    expect(r.confidence).toBe('low');
    expect(r.basis).toMatch(/allowance|reserve|savings|fund/i);
    expect(r.basis).toMatch(/\b(?:not|no)\b.*(?:average|annual|failure|predict)/i);
  }
});
