import { z } from 'zod';
import type { CostSettings, OwnershipSettings, PersonalData, PriceSnapshot, ScoreWeights, Powertrain, Vehicle } from './types';

export const CHECKED_DATE = '2026-10-18';
export const STORAGE_KEY = 'fieldnotes-family-cars:v1';
export const CURRENT_FIT_TARGET = 'one-rear-facing-two-other-restraints-v1' as const;
export const FIT_REVIEW_NOTICE = 'Older fit confirmations were cleared. Recheck one rear-facing seat plus two forward-facing seats / boosters.';
export const defaultCosts: CostSettings = { annualKm: 15000, homeRate: 0.30, publicRate: 0.65, petrolRate: 2.21, premiumPetrolRate: 2.38, dieselRate: 2.72, homeShare: 90, electricShare: 80, chargingLoss: 10 };
export const defaultOwnership: OwnershipSettings = { years: 10, insurance: null, servicing: null, tyres: 300, tyreMode: 'vehicle', repairReserve: 500, repairMode: 'vehicle', regoOverride: null, ctp: null, purchasePrice: null, dutiableValue: null, feesIncluded: 'auto', resaleValue: null, charger: 2050, inspection: 385, otherUpfront: 0, financeInterestAnnual: 0, repairScenario: 0, vehicleOverrides: {} };
export const defaultWeights: ScoreWeights = { seating: 10, price: 9, running: 8, boot: 7, range: 6, safety: 8, owners: 6, brand: 6 };
export const emptyPersonal = (): PersonalData => ({ version: 1, fitTarget: CURRENT_FIT_TARGET, favourites: [], listings: [], notes: {}, fitChecks: {}, seatModels: '', costs: { ...defaultCosts } });

export function chooseComparison(ids: string[], index: number, id: string): string[] {
  if (!Number.isInteger(index) || index < 0 || index > ids.length || index >= 4) return ids;
  if (!id) return ids.filter((_, position) => position !== index);
  if (ids.some((existing, position) => existing === id && position !== index)) return ids;
  const next = [...ids];
  next[index] = id;
  return next;
}

const numberOrNull = z.number().finite().nonnegative().nullable();
const weight = z.number().int().min(1).max(10);
export const weightsSchema = z.object({ seating: weight, price: weight, running: weight, boot: weight, range: weight, safety: weight, owners: weight, brand: weight });
const amount = z.number().finite().min(0).max(10_000_000);
const optionalAmount = amount.nullable();
export const ownershipSchema = z.object({ years: z.number().int().min(1).max(15), insurance: optionalAmount, servicing: optionalAmount, tyres: amount, tyreMode: z.enum(['vehicle', 'shared']).optional(), repairReserve: amount, repairMode: z.enum(['vehicle', 'shared']).optional(), regoOverride: optionalAmount, ctp: optionalAmount, purchasePrice: optionalAmount, dutiableValue: optionalAmount, feesIncluded: z.enum(['auto', 'yes', 'no']), resaleValue: optionalAmount, charger: amount, inspection: amount, otherUpfront: amount, financeInterestAnnual: amount, repairScenario: amount, vehicleOverrides: z.record(z.string(), z.object({ insurance: optionalAmount.optional(), servicing: optionalAmount.optional(), rego: optionalAmount.optional(), resale: optionalAmount.optional(), energy: optionalAmount.optional(), electricity: optionalAmount.optional(), petrol: optionalAmount.optional(), tyres: optionalAmount.optional(), repairReserve: optionalAmount.optional(), financeInterestAnnual: optionalAmount.optional(), purchase: optionalAmount.optional(), dutiableValue: optionalAmount.optional(), feesIncluded: z.enum(['auto', 'yes', 'no']).optional() })) });
const costsSchema = z.object({ annualKm: z.number().min(0).max(200000), homeRate: z.number().min(0).max(10), publicRate: z.number().min(0).max(10), petrolRate: z.number().min(0).max(10), premiumPetrolRate: z.number().min(0).max(10).optional(), dieselRate: z.number().min(0).max(10).optional(), homeShare: z.number().min(0).max(100), electricShare: z.number().min(0).max(100), chargingLoss: z.number().min(0).max(50) });
export const personalSchema = z.object({
  version: z.literal(1),
  fitTarget: z.literal(CURRENT_FIT_TARGET).optional(),
  fitReviewNeeded: z.boolean().optional(),
  favourites: z.array(z.string()).max(500),
  listings: z.array(z.object({
    id: z.string().min(1), vehicleId: z.string().min(1), title: z.string().max(300),
    url: z.string().max(3000).refine(s => !s || /^https?:\/\//i.test(s) && URL.canParse(s), 'Listing links must start with https:// or http://'),
    price: numberOrNull, kilometres: numberOrNull, location: z.string().max(300),
    status: z.enum(['saved', 'contacted', 'test-drive', 'inspected', 'passed']), notes: z.string().max(20000),
  })).max(1000),
  notes: z.record(z.string(), z.string().max(20000)),
  fitChecks: z.record(z.string(), z.boolean()),
  seatModels: z.string().max(5000), costs: costsSchema, ownership: ownershipSchema.optional(), weights: weightsSchema.optional(),
});

export function parseBackup(raw: string, validIds?: Set<string>): PersonalData {
  if (raw.length > 5_000_000) throw new Error('This backup is too large (maximum 5 MB).');
  let json: unknown;
  try { json = JSON.parse(raw); } catch { throw new Error('This file is not valid JSON. Choose a Fieldnotes backup.'); }
  const parsed = personalSchema.safeParse(json);
  if (!parsed.success) throw new Error(`This is not a supported Fieldnotes v1 backup. ${parsed.error.issues[0]?.message ?? ''}`);
  const data = parsed.data;
  if (new Set(data.listings.map(l => l.id)).size !== data.listings.length) throw new Error('This backup contains duplicate listing IDs.');
  const ids = [...data.favourites, ...data.listings.map(l => l.vehicleId), ...Object.keys(data.notes), ...Object.keys(data.fitChecks), ...Object.keys(data.ownership?.vehicleOverrides ?? {})];
  if (validIds && ids.some(id => !validIds.has(id))) throw new Error('This backup references a vehicle that is not in this catalogue. No data was replaced.');
  const needsFitMigration = data.fitTarget === undefined;
  const hadConfirmations = Object.values(data.fitChecks).some(Boolean);
  return {
    ...data,
    fitTarget: CURRENT_FIT_TARGET,
    favourites: [...new Set(data.favourites)],
    ...(needsFitMigration ? { fitChecks: {}, ...(hadConfirmations ? { fitReviewNeeded: true } : {}) } : {}),
  };
}

export interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void }
export function readPersonal(storage: StorageLike | null, ids?: Set<string>): { data: PersonalData; error: string | null } {
  try {
    if (!storage) throw new Error('Browser storage unavailable');
    const raw = storage.getItem(STORAGE_KEY);
    return { data: raw ? parseBackup(raw, ids) : emptyPersonal(), error: null };
  } catch {
    return { data: emptyPersonal(), error: 'Saved data could not be loaded. You can still use Fieldnotes and export a backup. Existing browser data has not been replaced.' };
  }
}
export function writePersonal(storage: StorageLike | null, data: PersonalData): string | null {
  try { if (!storage) throw new Error(); storage.setItem(STORAGE_KEY, JSON.stringify(data)); return null; }
  catch { return 'Browser storage is unavailable or full. Your changes are in this session only. Export a backup before closing.'; }
}

export interface Filters {
  search: string;
  powertrains: Powertrain[];
  make: string;
  condition: 'all' | 'new' | 'used';
  withinBudgetOnly: boolean;
  year: string;
  seats: 'all' | '7';
  fit: 'all' | 'published' | 'confirmed' | 'unverified';
  budget: number;
  favourites: boolean;
}
export const powertrainTypes: Powertrain[] = ['BEV', 'PHEV', 'HEV', 'PETROL', 'DIESEL'];
export const normalisePowertrains = (values: string[]): Powertrain[] => powertrainTypes.filter(type => values.includes(type));
export const defaultFilters: Filters = { search: '', powertrains: [], make: 'all', condition: 'all', withinBudgetOnly: false, year: 'all', seats: 'all', fit: 'all', budget: 45000, favourites: false };
export const activeFilterCount = (filters: Filters): number => Object.entries(defaultFilters).filter(([key, value]) => key === 'powertrains' ? filters.powertrains.length > 0 : filters[key as keyof Filters] !== value).length;
export type View = 'browse' | 'compare' | 'vehicle' | 'costs' | 'notebook' | 'scores' | 'charts';
export const vehicleSections = ['overview', 'costs', 'scores', 'specs', 'family', 'ownership', 'sources', 'notes'] as const;
export type VehicleSection = typeof vehicleSections[number];
export interface PublicState { view: View; compare: string[]; filters: Filters; weights?: ScoreWeights; vehicleId?: string; section?: VehicleSection }
export function parseHash(hash: string, validIds: Set<string>): PublicState {
  const p = new URLSearchParams(hash.replace(/^#/, ''));
  const allowedViews = ['browse', 'compare', 'vehicle', 'costs', 'notebook', 'scores', 'charts'];
  const vehicleId = p.get('vehicle') ?? '';
  const requestedView = allowedViews.includes(p.get('view') ?? '') ? p.get('view') as View : 'browse';
  const view = requestedView === 'vehicle' && !validIds.has(vehicleId) ? 'browse' : requestedView;
  const section = vehicleSections.find(section => section === p.get('section'));
  const powertrains = normalisePowertrains(p.getAll('power').flatMap(value => value.split(',')));
  const fit = ['published', 'confirmed', 'unverified'].includes(p.get('fit') ?? '') ? p.get('fit') as Filters['fit'] : 'all';
  const year = /^202[1-6]$/.test(p.get('year') ?? '') ? p.get('year')! : 'all';
  const rawBudget = Number(p.get('budget') ?? 45000);
  const budget = Number.isFinite(rawBudget) && rawBudget >= 10000 && rawBudget <= 150000 ? rawBudget : 45000;
  const rawWeights = p.get('weights')?.split(',').map(Number);
  const parsedWeights = rawWeights?.length === 8 ? weightsSchema.safeParse(Object.fromEntries(Object.keys(defaultWeights).map((key, i) => [key, rawWeights[i]]))) : null;
  return { view, compare: [...new Set((p.get('cars') ?? '').split(',').filter(id => validIds.has(id)))].slice(0, 4), filters: { ...defaultFilters, search: (p.get('q') ?? '').slice(0, 150), powertrains, make: (p.get('make') ?? 'all').slice(0, 50), condition: p.get('condition') === 'new' ? 'new' : p.get('condition') === 'used' ? 'used' : 'all', withinBudgetOnly: p.get('budgetOnly') === '1', year, seats: p.get('seats') === '7' ? '7' : 'all', fit, budget }, ...(parsedWeights?.success ? { weights: parsedWeights.data } : {}), ...(view === 'vehicle' ? { vehicleId, ...(section ? { section } : {}) } : {}) };
}
export function publicHash(state: PublicState): string {
  const p = new URLSearchParams();
  p.set('view', state.view);
  if (state.view === 'vehicle' && state.vehicleId) {
    p.set('vehicle', state.vehicleId);
    if (state.section) p.set('section', state.section);
  }
  if (state.compare.length) p.set('cars', state.compare.join(','));
  const f = state.filters;
  if (f.search) p.set('q', f.search);
  if (f.make !== 'all') p.set('make', f.make);
  if (f.condition !== 'all') p.set('condition', f.condition);
  if (f.withinBudgetOnly) p.set('budgetOnly', '1');
  if (f.powertrains.length) p.set('power', normalisePowertrains(f.powertrains).join(','));
  if (f.year !== 'all') p.set('year', f.year);
  if (f.seats !== 'all') p.set('seats', f.seats);
  if (f.fit !== 'all' && f.fit !== 'confirmed') p.set('fit', f.fit);
  if (f.budget !== 45000) p.set('budget', String(f.budget));
  if (state.weights) p.set('weights', Object.keys(defaultWeights).map(key => state.weights![key as keyof ScoreWeights]).join(','));
  return `#${p.toString()}`;
}
export function toggleComparison(ids: string[], id: string): { ids: string[]; full: boolean } {
  if (ids.includes(id)) return { ids: ids.filter(v => v !== id), full: false };
  if (ids.length === 4) return { ids, full: true };
  return { ids: [...ids, id], full: false };
}
export function filterVehicles(vehicles: Vehicle[], filters: Filters, favourites: string[], fitChecks: Record<string, boolean>, snapshots: PriceSnapshot[] = []): Vehicle[] {
  const query = filters.search.toLowerCase().trim();
  return vehicles.filter(v =>
    (!query || `${v.make} ${v.model} ${v.variant} ${v.years.join(' ')}`.toLowerCase().includes(query)) &&
    (!filters.powertrains.length || filters.powertrains.includes(v.powertrain)) &&
    (filters.make === 'all' || v.make === filters.make) &&
    (filters.condition === 'all' || snapshots.find(p => p.vehicleId === v.id)?.condition === filters.condition) &&
    (!filters.withinBudgetOnly || priceGroup(snapshots.find(p => p.vehicleId === v.id), filters.budget) === 'budget') &&
    (filters.year === 'all' || v.years.includes(Number(filters.year))) &&
    (filters.seats === 'all' || v.seats >= 7) &&
    (!filters.favourites || favourites.includes(v.id)) &&
    (filters.fit === 'all' || filters.fit === 'published' && ['tested-three', 'tested-multirow', 'tested-related'].includes(v.familyFit.status) || filters.fit === 'confirmed' && fitChecks[v.id] || filters.fit === 'unverified' && !['tested-three', 'tested-multirow', 'tested-related'].includes(v.familyFit.status))
  );
}
export type PriceGroup = 'budget' | 'benchmark' | 'unknown';
export function priceGroup(price: PriceSnapshot | undefined, budget: number): PriceGroup {
  if (!price || price.low === null) return 'unknown';
  return price.low <= budget ? 'budget' : 'benchmark';
}
export function calculateEnergy(vehicle: Vehicle, settings: CostSettings): { total: number | null; electric: number; petrol: number; reason: string; estimated: boolean } {
  const checked = costsSchema.safeParse(settings);
  const unavailable = (reason: string) => ({ total: null, electric: 0, petrol: 0, reason, estimated: true });
  if (!checked.success) return unavailable('Check the calculator inputs.');
  const { annualKm: km, homeRate, publicRate, homeShare, electricShare, chargingLoss } = settings;
  // Older backups retain their single saved petrol rate until premium is explicitly set.
  const petrolRate = vehicle.powertrain === 'DIESEL' ? settings.dieselRate ?? settings.petrolRate : vehicle.fuel?.planningRon === 95 ? settings.premiumPetrolRate ?? settings.petrolRate : settings.petrolRate;
  const rate = homeRate * homeShare / 100 + publicRate * (1 - homeShare / 100);
  const electricCost = (distance: number, consumption: number) => distance / 100 * consumption / (vehicle.consumption.energyBasis === 'wall' ? 1 : 1 - chargingLoss / 100) * rate;
  if (vehicle.powertrain === 'BEV') {
    if (vehicle.consumption.value === null || vehicle.consumption.unit !== 'kWh/100km') return unavailable('Verified electric consumption is not available for this configuration.');
    if (!vehicle.consumption.energyBasis || vehicle.consumption.energyBasis === 'unspecified') return unavailable('The consumption measurement boundary is unverified; battery and wall energy cannot be mixed. Enter your annual energy budget in Ownership costs to include it.');
    const electric = electricCost(km, vehicle.consumption.value);
    return { total: electric, electric, petrol: 0, reason: vehicle.consumption.energyBasis === 'wall' ? 'Rated mains consumption; charging losses are already included.' : 'Verified battery-side consumption, adjusted once for charging losses.', estimated: true };
  }
  if (isFuelOnly(vehicle.powertrain)) {
    if (vehicle.consumption.value === null || vehicle.consumption.unit !== 'L/100km') return unavailable('Verified fuel consumption is not available for this configuration.');
    const petrol = km / 100 * vehicle.consumption.value * petrolRate;
    return { total: petrol, electric: 0, petrol, reason: 'Published combined fuel consumption; actual local driving will differ.', estimated: true };
  }
  const share = electricShare / 100;
  if (share > 0 && (vehicle.consumption.value === null || vehicle.consumption.unit !== 'kWh/100km')) return unavailable('PHEV electric consumption is unverified. Weighted fuel use cannot substitute for it.');
  if (share > 0 && (!vehicle.consumption.energyBasis || vehicle.consumption.energyBasis === 'unspecified')) return unavailable('The PHEV electrical figure is not verified as consumption per electric kilometre. Enter an annual energy budget to include it.');
  if (share < 1 && (vehicle.depletedConsumption.value === null || vehicle.depletedConsumption.unit !== 'L/100km')) return unavailable('Charge-depleted fuel use is unverified. The low weighted PHEV figure is not used as petrol-only consumption.');
  const electric = electricCost(km * share, vehicle.consumption.value ?? 0);
  const petrol = km * (1 - share) / 100 * (vehicle.depletedConsumption.value ?? 0) * petrolRate;
  return { total: electric + petrol, electric, petrol, reason: `${electricShare}% electric-distance assumption, then sourced charge-depleted fuel use; see the test basis.`, estimated: true };
}

export const money = (value: number, compact = false) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0, ...(compact ? { notation: 'compact' as const, maximumFractionDigits: 1 } : {}) }).format(value);
export const number = (value: number) => new Intl.NumberFormat('en-AU', { maximumFractionDigits: 1 }).format(value);
export const yearLabel = (v: Vehicle) => v.years.length > 1 ? `${Math.min(...v.years)}–${String(Math.max(...v.years)).slice(2)}` : String(v.years[0]);
export const isPlugIn = (power: Powertrain) => power === 'BEV' || power === 'PHEV';
export const isFuelOnly = (power: Powertrain) => !isPlugIn(power);
export const powerLabel = (power: string) => ({ BEV: 'Electric', PHEV: 'Plug-in hybrid', HEV: 'Hybrid', PETROL: 'Petrol', DIESEL: 'Diesel' }[power] ?? power);
export const fitLabel = (v: Vehicle) => ({ 'tested-three': 'Three across tested', 'tested-multirow': 'Multiple rows tested', 'tested-related': 'Related variant fit test', unverified: 'Fit evidence needed', limitations: 'Fit limitations' }[v.familyFit.status]);
export function rangeStandard(fact: { basis: string }): string { return fact.basis.split(/\bnot\b/i)[0].match(/WLTP|NEDC/i)?.[0].toUpperCase() ?? 'Basis in details'; }
export const formatDate = (date: string) => new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Australia/Brisbane' }).format(new Date(date + 'T00:00:00+10:00'));

export function representativePrice(price: PriceSnapshot | undefined): number | null {
  if (!price || price.low === null) return null;
  return price.point ?? (price.kind === 'estimate' && price.high !== null ? (price.low + price.high) / 2 : price.low);
}
