import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { repairReserves, expertReviews, images, ownershipInfo, insuranceEstimates, tyreEstimates, prices, sources, validateReferences, vehicles } from './data';
import { rangeStandard } from './lib';

describe('researched catalogue integrity', () => {
  it('covers all twelve agreed model families with distinct configurations', () => {
    expect(new Set(vehicles.map(v => v.familyId))).toEqual(new Set(['tesla-model-y', 'byd-atto-3', 'kia-ev6', 'kia-ev5', 'hyundai-ioniq-5', 'zeekr-7x', 'mitsubishi-outlander-phev', 'byd-sealion-6', 'nissan-x-trail-epower', 'toyota-rav4-hybrid', 'toyota-kluger-hybrid', 'kia-sorento']));
    expect(vehicles.length).toBeGreaterThanOrEqual(24);
    expect(validateReferences()).toEqual([]);
  });
  it('covers every family with scoped professional tests and preserves original verdicts', () => {
    expect(new Set(expertReviews.map(r => r.familyId))).toEqual(new Set(vehicles.map(v => v.familyId)));
    expect(new Set(expertReviews.map(r => r.id)).size).toBe(expertReviews.length);
    for (const r of expertReviews) {
      expect(r.scope.length).toBeGreaterThan(30);
      expect(r.rating !== null || r.verdict.length > 0).toBe(true);
      for (const id of r.vehicleIds) expect(vehicles.find(v => v.id === id)?.familyId).toBe(r.familyId);
    }
    expect(expertReviews.find(r => r.id === 'sorento-hev')?.vehicleIds).toEqual([]);
  });
  it('uses defined units and source evidence for verified numeric facts', () => {
    for (const v of vehicles) {
      for (const [key, unit] of [['range', 'km'], ['battery', 'kWh'], ['boot', 'L'], ['bootAllRows', 'L'], ['length', 'mm'], ['width', 'mm'], ['towing', 'kg'], ['acCharging', 'kW'], ['dcCharging', 'kW']] as const) {
        if (v[key].value !== null) { expect(v[key].unit, `${v.id}:${key}`).toBe(unit); expect(v[key].sourceIds.length).toBeGreaterThan(0); }
      }
      if (v.consumption.value !== null) expect(v.consumption.unit).toBe(v.powertrain === 'HEV' ? 'L/100km' : 'kWh/100km');
    }
  });
  it('preserves the practical distinctions central to this purchase', () => {
    const originalY = vehicles.find(v => v.id === 'model-y-rwd-2022')!;
    expect(originalY.years).toContain(2023);
    expect(originalY.familyFit.testedSeats.toLowerCase()).toContain('infasecure');
    expect(vehicles.find(v => v.id === 'atto3-standard-2022')?.familyFit.status).toBe('limitations');
    expect(vehicles.find(v => v.familyId === 'toyota-kluger-hybrid')?.familyFit.row3.toLowerCase()).toMatch(/no|not/);
    expect(rangeStandard(vehicles.find(v => v.id === 'outlander-phev-aspire-20')!.range)).toBe('NEDC');
  });
  it('keeps MY23 Ioniq 5 powertrains separate from the earlier battery and price samples', () => {
    const rwd = vehicles.find(v => v.id === 'ioniq5-dynamiq-rwd-2023')!;
    const awd = vehicles.find(v => v.id === 'ioniq5-techniq-awd-2023')!;
    expect(rwd.years).toEqual([2023]);
    expect(awd.years).toEqual([2023]);
    expect(rwd.battery.value).toBe(77.4);
    expect(awd.battery.value).toBe(77.4);
    expect(rwd.range.value).toBe(507);
    expect(awd.range.value).toBe(454);
    expect(rwd.consumption.value).toBe(17);
    expect(awd.consumption.value).toBe(19.1);
    expect(rwd.familyFit.status).toBe('unverified');
    expect(awd.familyFit.status).toBe('unverified');
    expect(rwd.safety.sourceIds).toContain('ev-ioniq-ancap');
    const guide = prices.find(p => p.vehicleId === rwd.id)!;
    expect(guide.kind).toBe('estimate');
    expect(guide.sampleCount).toBe(0);
    expect(guide.confidence).toBe('low');
    expect(prices.find(p => p.vehicleId === awd.id)?.observations?.[0].year).toBe(2023);
    expect(expertReviews.find(r => r.id === 'ioniq5-techniq-2023')?.vehicleIds).toEqual([awd.id]);
  });
  it('distinguishes sourced asking observations from explicit planning estimates', () => {
    for (const p of prices) {
      expect(p.note.length).toBeGreaterThan(15);
      expect(p.observed).toBe('2026-10-18');
      if (p.low !== null) { if (p.kind === 'estimate') { expect(p.sampleCount).toBe(0); expect(p.estimateBasis).toBeTruthy(); } else expect(p.sampleCount).toBeGreaterThan(0); expect(p.sourceIds.length).toBeGreaterThan(0); expect(p.high).toBeGreaterThanOrEqual(p.low); }
    }
  });
  it('has priced insurance, service and repair ranges for all twelve families', () => {
    expect(insuranceEstimates).toHaveLength(12);
    for (const info of ownershipInfo) {
      expect(info.serviceLow!).toBeLessThanOrEqual(info.serviceAnnual!);
      expect(info.serviceHigh!).toBeGreaterThanOrEqual(info.serviceAnnual!);
      expect(info.serviceConfidence).toBeTruthy();
      for (const risk of info.risks) {
        expect(risk.low).not.toBeNull();
        expect(risk.high!).toBeGreaterThanOrEqual(risk.low!);
        expect(risk.confidence).toBeTruthy();
      }
    }
  });
  it('has sourced tyre budgets and ordered assumptions for every configuration', () => {
    expect(new Set(tyreEstimates.map(t => t.vehicleId))).toEqual(new Set(vehicles.map(v => v.id)));
    for (const t of tyreEstimates) {
      expect(t.setLow).toBeLessThanOrEqual(t.setCost);
      expect(t.setHigh).toBeGreaterThanOrEqual(t.setCost);
      expect(t.lifeLowKm).toBeLessThanOrEqual(t.lifeKm);
      expect(t.lifeHighKm).toBeGreaterThanOrEqual(t.lifeKm);
      expect(t.sourceIds.length).toBeGreaterThan(0);
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
    for (const family of new Set(vehicles.map(v => v.familyId))) expect(images.some(i => i.familyId === family)).toBe(true);
  });
  it('dates evidence and retains sources for further reading', () => {
    expect(sources.length).toBeGreaterThan(90);
    for (const source of sources) { expect(source.checked).toBe('2026-10-18'); expect(source.url).toMatch(/^https:/); }
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
      expect(sources.find(s => s.id === o.sourceId)?.url).toBe(o.url);
    }
  }
});


it('has one transparent repair reserve for every researched configuration', () => {
  expect(new Set(repairReserves.map(r => r.vehicleId))).toEqual(new Set(vehicles.map(v => v.id)));
  for (const r of repairReserves) {
    expect(r.low).toBeLessThanOrEqual(r.point);
    expect(r.high).toBeGreaterThanOrEqual(r.point);
    expect(r.confidence).toBe('low');
    expect(r.basis).toContain('not an observed average');
  }
});
