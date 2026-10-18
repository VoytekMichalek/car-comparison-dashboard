import { describe, expect, it } from 'vitest';
import { calculateEnergy, chooseComparison, defaultCosts, defaultFilters, emptyPersonal, filterVehicles, parseBackup, parseHash, priceGroup, publicHash, rangeStandard, readPersonal, STORAGE_KEY, toggleComparison, writePersonal } from './lib';
import { vehicles, vehicleIds, getPrice } from './data';
import type { Fact, Vehicle } from './types';

const fact = (value: number | null, unit: string): Fact => ({ value, unit, basis: 'Test fixture', sourceIds: [], energyBasis: 'battery' });
const ev: Vehicle = { ...vehicles[0], powertrain: 'BEV', consumption: fact(18, 'kWh/100km') };
const hev: Vehicle = { ...vehicles[0], powertrain: 'HEV', consumption: fact(5, 'L/100km') };
const phev: Vehicle = { ...vehicles[0], powertrain: 'PHEV', consumption: fact(18, 'kWh/100km'), depletedConsumption: fact(6, 'L/100km') };
const known = vehicles[0].id;

describe('energy costs under actual shopping scenarios', () => {
  const scenarioCosts = { ...defaultCosts, petrolRate: 1.9, premiumPetrolRate: 1.9 };
  it('uses premium petrol for the required grade and preserves older single-rate settings', () => {
    const premium = { ...hev, fuel: { planningRon: 95 as const, minimumRon: 95 as const, basis: 'Test fixture', confidence: 'high' as const, sourceIds: [], checked: '2026-10-18' } };
    const rates = { ...defaultCosts, petrolRate: 2, premiumPetrolRate: 2.4 };
    expect(calculateEnergy(hev, rates).petrol).toBe(1500);
    expect(calculateEnergy(premium, rates).petrol).toBe(1800);
    const { premiumPetrolRate: _unused, ...legacy } = rates;
    expect(calculateEnergy(premium, legacy).petrol).toBe(1500);
    expect(calculateEnergy(premium, { ...rates, premiumPetrolRate: 0 }).petrol).toBe(0);
    expect(calculateEnergy(premium, { ...rates, premiumPetrolRate: -1 }).total).toBeNull();
    const backup = { ...emptyPersonal(), costs: legacy };
    expect(parseBackup(JSON.stringify(backup)).costs).toEqual(legacy);
  });
  it('accounts for electricity bought at the wall and a home/public mix', () => {
    // 2,700 kWh at battery /90% charging efficiency × $0.335 blended rate.
    expect(calculateEnergy(ev, scenarioCosts).total).toBeCloseTo(1005);
  });
  it('does not treat a non-plug-in hybrid as publicly chargeable', () => {
    expect(calculateEnergy(hev, { ...scenarioCosts, publicRate: 9, homeShare: 0 }).total).toBe(1425);
  });
  it('applies no extra loss to rated mains consumption and withholds an unknown boundary', () => {
    const wall = { ...ev, consumption: { ...ev.consumption, energyBasis: 'wall' as const } };
    expect(calculateEnergy(wall, scenarioCosts).total).toBeCloseTo(904.5);
    expect(calculateEnergy(wall, { ...scenarioCosts, chargingLoss: 40 }).total).toBeCloseTo(904.5);
    expect(calculateEnergy({ ...ev, consumption: { ...ev.consumption, energyBasis: 'unspecified' } }, scenarioCosts).total).toBeNull();
  });
  it('splits PHEV distance before applying electric and depleted petrol use', () => {
    const result = calculateEnergy(phev, scenarioCosts);
    expect(result.electric).toBeCloseTo(804);
    expect(result.petrol).toBeCloseTo(342);
    expect(result.total).toBeCloseTo(1146);
  });
  it('withholds a PHEV estimate rather than use weighted fuel use', () => {
    expect(calculateEnergy({ ...phev, depletedConsumption: fact(null, 'L/100km') }, scenarioCosts).total).toBeNull();
    expect(calculateEnergy({ ...phev, consumption: fact(1.1, 'L/100km') }, scenarioCosts).total).toBeNull();
  });
  it('supports electric-only or petrol-only PHEV scenarios with just the needed evidence', () => {
    expect(calculateEnergy({ ...phev, depletedConsumption: fact(null, 'L/100km') }, { ...scenarioCosts, electricShare: 100 }).total).toBeCloseTo(1005);
    expect(calculateEnergy({ ...phev, consumption: fact(null, 'kWh/100km') }, { ...scenarioCosts, electricShare: 0 }).total).toBeCloseTo(1710);
  });
  it('handles zero distance, missing efficiency and invalid settings', () => {
    expect(calculateEnergy(ev, { ...scenarioCosts, annualKm: 0 }).total).toBe(0);
    expect(calculateEnergy({ ...ev, consumption: fact(null, 'kWh/100km') }, scenarioCosts).total).toBeNull();
    expect(calculateEnergy(ev, { ...scenarioCosts, homeShare: 101 }).total).toBeNull();
    expect(calculateEnergy(ev, { ...scenarioCosts, annualKm: NaN }).total).toBeNull();
  });
});

describe('public comparison links', () => {
  it('restores an exact vehicle page and section with public browse context', () => {
    const state = { view: 'vehicle' as const, vehicleId: known, section: 'scores' as const, compare: vehicles.slice(0, 2).map(v => v.id), filters: { ...defaultFilters, search: 'Tesla', year: '2023' } };
    expect(parseHash(publicHash(state), vehicleIds)).toEqual(state);
  });
  it('returns invalid vehicle links and the retired family page to Browse cars', () => {
    for (const hash of ['#view=vehicle', '#view=vehicle&vehicle=unknown', '#view=family']) {
      const parsed = parseHash(hash, vehicleIds);
      expect(parsed.view).toBe('browse');
      expect(parsed.vehicleId).toBeUndefined();
    }
  });
  it('keeps a valid vehicle when an unknown section is requested', () => {
    const parsed = parseHash(`#view=vehicle&vehicle=${known}&section=unknown`, vehicleIds);
    expect(parsed.view).toBe('vehicle');
    expect(parsed.vehicleId).toBe(known);
    expect(parsed.section).toBeUndefined();
  });
  it('does not attach a stale vehicle selection to comparison links', () => {
    const hash = publicHash({ view: 'compare', vehicleId: known, section: 'costs', compare: [known], filters: defaultFilters });
    expect(hash).not.toContain('vehicle=');
    expect(hash).not.toContain('section=');
  });
  it('round-trips selected configuration IDs, filters and static-host routes', () => {
    const state = { view: 'compare' as const, compare: vehicles.slice(0, 4).map(v => v.id), filters: { ...defaultFilters, powertrain: 'BEV' as const, year: '2023', budget: 40000, search: 'Model Y', seats: '7' as const } };
    expect(parseHash(publicHash(state), vehicleIds)).toEqual(state);
  });
  it('ignores unknown IDs, duplicates, extra cars and malformed filters', () => {
    const hash = `#view=bad&budget=NaN&year=1900&power=petrol&cars=${known},${known},bad,${vehicles.slice(1, 8).map(v => v.id).join(',')}`;
    const parsed = parseHash(hash, vehicleIds);
    expect(parsed.compare).toHaveLength(4);
    expect(parsed.compare[0]).toBe(known);
    expect(parsed.filters.budget).toBe(45000);
    expect(parsed.filters.year).toBe('all');
    expect(parsed.view).toBe('browse');
  });
  it('does not serialize private confirmation or favourite filters', () => {
    const hash = publicHash({ view: 'compare', compare: [known], filters: { ...defaultFilters, fit: 'confirmed', favourites: true } });
    expect(hash).not.toContain('confirmed');
    expect(hash).not.toContain('favourite');
    expect(parseHash(hash, vehicleIds).filters.fit).toBe('all');
  });
  it('caps comparison selection and supports removal', () => {
    const ids = ['a', 'b', 'c', 'd'];
    expect(toggleComparison(ids, 'e')).toEqual({ ids, full: true });
    expect(toggleComparison(ids, 'b')).toEqual({ ids: ['a', 'c', 'd'], full: false });
  });
});

describe('catalogue filtering and evidence', () => {
  it('combines year, powertrain, search and seven-seat requirements', () => {
    const filtered = filterVehicles(vehicles, { ...defaultFilters, search: 'Kluger', year: '2023', powertrain: 'HEV', seats: '7' }, [], {});
    expect(filtered).toHaveLength(1);
    expect(filtered[0].familyId).toBe('toyota-kluger-hybrid');
  });
  it('keeps published tests separate from personal confirmation', () => {
    const filtered = filterVehicles(vehicles, { ...defaultFilters, fit: 'confirmed' }, [], { [known]: true });
    expect(filtered.map(v => v.id)).toEqual([known]);
    expect(filterVehicles(vehicles, { ...defaultFilters, favourites: true }, [], {})).toEqual([]);
  });
  it('does not confuse a reference to another range standard with the reported one', () => {
    expect(rangeStandard({ basis: 'Electric only · NEDC claim; not WLTP' })).toBe('NEDC');
    expect(rangeStandard({ basis: 'WLTP combined; 480 km NEDC is a separate claim' })).toBe('WLTP');
  });
  it('groups numeric price estimates while keeping true missing prices separate', () => {
    const snapshot = { ...getPrice(known)!, low: 45000, high: 45000 };
    expect(priceGroup(snapshot, 45000)).toBe('budget');
    expect(priceGroup({ ...snapshot, low: 45001, high: 45001 }, 45000)).toBe('benchmark');
    expect(priceGroup({ ...snapshot, basis: 'unverified', confidence: 'low' }, 45000)).toBe('budget');
    expect(priceGroup({ ...snapshot, low: null, high: null }, 45000)).toBe('unknown');
    expect(priceGroup(undefined, 45000)).toBe('unknown');
  });
});

describe('private notebook backup and storage', () => {
  it('round-trips notes, fit checks, listings, child seats and settings', () => {
    const personal = { ...emptyPersonal(), favourites: [known], notes: { [known]: 'Try the booster buckles' }, fitChecks: { [known]: true }, seatModels: 'Three forward-facing seats', listings: [{ id: 'listing-1', vehicleId: known, title: 'Local car', url: 'https://example.com/car', price: 42000, kilometres: 40000, location: 'Brisbane', status: 'test-drive' as const, notes: 'Ask for service history' }] };
    expect(parseBackup(JSON.stringify(personal), vehicleIds)).toEqual(personal);
  });
  it('rejects malformed JSON, unsupported versions and unsafe links', () => {
    expect(() => parseBackup('{')).toThrow('valid JSON');
    expect(() => parseBackup(JSON.stringify({ ...emptyPersonal(), version: 2 }))).toThrow('supported');
    const unsafe = { ...emptyPersonal(), listings: [{ id: 'x', vehicleId: known, title: 'x', url: 'javascript:alert(1)', price: 0, kilometres: null, location: '', status: 'saved', notes: '' }] };
    expect(() => parseBackup(JSON.stringify(unsafe))).toThrow('https://');
  });
  it('rejects unknown vehicle references and duplicate listing IDs', () => {
    expect(() => parseBackup(JSON.stringify({ ...emptyPersonal(), notes: { unknown: 'note' } }), vehicleIds)).toThrow('not in this catalogue');
    const listing = { id: 'x', vehicleId: known, title: '', url: '', price: null, kilometres: null, location: '', status: 'saved', notes: '' };
    expect(() => parseBackup(JSON.stringify({ ...emptyPersonal(), listings: [listing, listing] }), vehicleIds)).toThrow('duplicate');
  });
  it('reports disabled/full browser storage without discarding session data', () => {
    expect(readPersonal(null).error).not.toBeNull();
    const broken = { getItem: () => '{bad', setItem: () => { throw new Error('Quota exceeded'); } };
    expect(readPersonal(broken).data).toEqual(emptyPersonal());
    const personal = { ...emptyPersonal(), seatModels: 'Our seats' };
    expect(writePersonal(broken, personal)).toContain('session only');
    expect(personal.seatModels).toBe('Our seats');
  });
  it('persists through a storage reload', () => {
    const map = new Map<string, string>();
    const storage = { getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => { map.set(key, value); } };
    const personal = { ...emptyPersonal(), favourites: [known] };
    expect(writePersonal(storage, personal)).toBeNull();
    expect(map.has(STORAGE_KEY)).toBe(true);
    expect(readPersonal(storage, vehicleIds)).toEqual({ data: personal, error: null });
  });
});

describe('direct comparison dropdown selection', () => {
  it('adds, replaces and removes specific configurations without duplicates', () => {
    expect(chooseComparison([], 0, 'a')).toEqual(['a']);
    expect(chooseComparison(['a', 'b'], 1, 'c')).toEqual(['a', 'c']);
    expect(chooseComparison(['a', 'b'], 0, '')).toEqual(['b']);
    expect(chooseComparison(['a', 'b'], 1, 'a')).toEqual(['a', 'b']);
    expect(chooseComparison(['a', 'b', 'c', 'd'], 4, 'e')).toEqual(['a', 'b', 'c', 'd']);
    expect(chooseComparison([], 2, 'c')).toEqual([]);
    expect(chooseComparison(['a'], -1, 'b')).toEqual(['a']);
  });
});

import { representativePrice } from './lib';
import { prices } from './data';
it('uses the representative purchase point rather than the cheapest example', () => {
  const base = { ...prices[0], low: 30000, high: 40000, point: 36500 };
  expect(representativePrice(base)).toBe(36500);
  expect(representativePrice({ ...base, point: undefined, kind: 'estimate' })).toBe(35000);
  expect(representativePrice(undefined)).toBeNull();
});
