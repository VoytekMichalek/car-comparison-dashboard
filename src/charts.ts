import { budgetBenchmarks, getPrice } from './data';
import { ownershipEstimate, settingsFor } from './ownership';
import { scoreVehicle, summariseScores } from './scoring';
import type { ScoreResult } from './scoring';
import type { PersonalData, Powertrain, ScoreWeights, Vehicle } from './types';

/** Colour identifies powertrain, never confidence or a better/worse score. */
export const powertrainColours: Record<Powertrain, string> = {
  BEV: '#287099', PHEV: '#257966', HEV: '#a37116', PETROL: '#ab5144', DIESEL: '#7e5e98',
};
export const seriesColours = ['#287099', '#ab5144', '#257966', '#8b659f', '#a37116', '#28616c', '#9c4d76', '#5c7040', '#5a66a3', '#a65d29', '#7e6c4c', '#317e88', '#7a4d37', '#546787', '#776031', '#536e58', '#81587b', '#2d5554', '#83534e'];
export interface DepreciationPoint {
  year: number;
  value: number;
  low: number;
  high: number;
  loss: number;
  /** Signed change from the actual purchase input, not the car's original new price. */
  changePercent: number | null;
}
export interface DepreciationSeries {
  vehicle: Vehicle;
  purchasePrice: number;
  points: DepreciationPoint[];
  annualRate: number | null;
  customResale: boolean;
  anchorYears: number;
  anchorValue: number;
  note: string;
  sourceIds: string[];
}
const validAmount = (amount: number | null | undefined): amount is number => amount != null && Number.isFinite(amount) && amount >= 0;
const roundResale = (value: number) => Math.max(0, Math.round(value / 100) * 100);

export function formatPurchaseChange(changePercent: number | null): string {
  if (changePercent === null || !Number.isFinite(changePercent)) return 'Percentage unavailable';
  const rounded = Math.round(changePercent * 10) / 10;
  const sign = rounded < 0 ? '−' : rounded > 0 ? '+' : '';
  return `${sign}${Math.abs(rounded).toLocaleString('en-AU', { maximumFractionDigits: 1 })}% from purchase`;
}

/**
 * This is the same reducing-balance scenario used by Ownership, not a model-level forecast.
 * A personal resale input is an anchor: derive a compound curve through it. Zero cannot
 * be reached by a finite compound rate, so use an explicitly labelled quadratic run-down.
 */
export function depreciationSeries(vehicle: Vehicle, personal: PersonalData, horizon = 10): DepreciationSeries | null {
  const estimate = ownershipEstimate(vehicle, personal);
  const settings = settingsFor(personal);
  const purchase = estimate.purchasePrice;
  const anchor = estimate.resale;
  const years = settings.years;
  if (!validAmount(purchase) || !validAmount(anchor) || !Number.isFinite(years) || years <= 0 || !Number.isFinite(horizon) || horizon < 1 || horizon > 15) return null;
  if (purchase === 0 && anchor > 0) return null; // A compound rate cannot be derived from a zero purchase price.
  const end = Math.floor(horizon);
  const scenario = budgetBenchmarks.depreciation[vehicle.powertrain];
  const customResale = !estimate.resaleEstimated;
  const rate = customResale ? purchase > 0 && anchor > 0 ? 1 - (anchor / purchase) ** (1 / years) : null : scenario.annualRate;
  if (rate !== null && !Number.isFinite(rate)) return null;
  const valueAt = (year: number) => {
    if (year === 0) return purchase;
    if (year === years) return anchor; // Preserve the exact saved anchor, including a non-$100 amount.
    if (purchase === 0) return 0;
    if (customResale && anchor === 0) return roundResale(purchase * Math.max(0, 1 - year / years) ** 2);
    return roundResale(purchase * (1 - (rate ?? scenario.annualRate)) ** year);
  };
  const points = Array.from({ length: end + 1 }, (_, year) => {
    const value = valueAt(year);
    const low = customResale || year === 0 ? value : roundResale(purchase * (1 - scenario.highRate) ** year);
    const high = customResale || year === 0 ? value : roundResale(purchase * (1 - scenario.lowRate) ** year);
    const relativeChange = purchase > 0 ? (value / purchase - 1) * 100 : null;
    const changePercent = relativeChange !== null && Number.isFinite(relativeChange) ? relativeChange : null;
    return { year, value, low: Math.min(low, value), high: Math.max(high, value), loss: purchase - value, changePercent };
  });
  if (points.some(point => ![point.value, point.low, point.high, point.loss].every(Number.isFinite))) return null;
  const afterAnchor = end > years ? ` Beyond year ${years}, the same implied rate continues; this is an extrapolation.` : '';
  const note = customResale
    ? anchor === 0
      ? `Your A$0 resale assumption at year ${years}. A gradual curve reaches zero at that year and remains zero; a compound rate cannot reach zero.`
      : purchase === 0
        ? `Your zero purchase and resale inputs produce a flat zero-value scenario.`
        : `Curve through your resale assumption at year ${years}; annual implied ${rate! < 0 ? 'gain' : 'loss'} ${Math.abs(rate! * 100).toFixed(1)}%.${afterAnchor}`
    : scenario.basis;
  return { vehicle, purchasePrice: purchase, points, annualRate: rate, customResale, anchorYears: years, anchorValue: anchor, note, sourceIds: customResale ? [] : scenario.sourceIds };
}

export interface PriceScorePoint {
  vehicle: Vehicle;
  price: number;
  score: ScoreResult;
  personalPrice: boolean;
  priceEstimated: boolean;
  priceBasis: string;
  sourceIds: string[];
}
/** Price is the horizontal axis, so omit it from both the score and evidence denominator. */
export function priceIndependentScore(score: ScoreResult): ScoreResult {
  return summariseScores(score.categories.filter(category => category.key !== 'price'));
}

/** Use saved purchase inputs, with the remaining dashboard categories and their user weights. */
export function priceScorePoints(vehicles: Vehicle[], personal: PersonalData, weights: ScoreWeights, budget: number): PriceScorePoint[] {
  return vehicles.flatMap(vehicle => {
    const estimate = ownershipEstimate(vehicle, personal);
    const score = priceIndependentScore(scoreVehicle(vehicle, personal, weights, budget));
    if (!validAmount(estimate.purchasePrice) || score.total === null || !Number.isFinite(score.total)) return [];
    const price = getPrice(vehicle.id);
    const personalPrice = (personal.ownership?.vehicleOverrides?.[vehicle.id]?.purchase ?? personal.ownership?.purchasePrice) != null;
    return [{ vehicle, price: estimate.purchasePrice, score, personalPrice,
      priceEstimated: !personalPrice && (price?.kind === 'estimate' || price?.confidence === 'low' || price?.basis === 'unverified' || price?.basis === 'mixed'),
      priceBasis: personalPrice ? `Your purchase price. ${estimate.feesIncluded ? 'Duty and transfer included.' : 'Duty and transfer additional.'}` : price?.basis === 'drive-away' ? 'Drive-away asking price' : price?.basis === 'excludes-charges' ? 'Asking price excluding on-road charges' : 'Asking price; fee basis varies or is unverified',
      sourceIds: personalPrice ? [] : price?.sourceIds ?? [],
    }];
  });
}

/** null means all current page results; explicit family choices survive variant and page-filter changes. */
export function depreciationCars(vehicles: Vehicle[], selectedFamilies: string[] | null): Vehicle[] {
  return selectedFamilies === null ? vehicles : vehicles.filter(vehicle => selectedFamilies.includes(vehicle.familyId));
}
