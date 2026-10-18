import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CategoryEvidence, ScoreBreakdown } from './components/Scores';
import { getPrice, vehicles } from './data';
import { defaultOwnership, emptyPersonal, money } from './lib';
import { ownershipEstimate } from './ownership';
import { scoreVehicle } from './scoring';
import type { ScoreCategory } from './types';

const car = vehicles.find(v => v.id === 'model-y-rwd-2022')!;
const categoryFor = (key: ScoreCategory, personal = emptyPersonal()) => scoreVehicle(car, personal).categories.find(c => c.key === key)!;

describe('headline-first score explanations', () => {
  it('shows the actual purchase amount and the same fee treatment as Ownership costs', () => {
    const personal = emptyPersonal();
    const estimate = ownershipEstimate(car, personal);
    const category = categoryFor('price', personal);
    expect(category.headline).toBe(money(estimate.purchasePrice!));
    expect(category.headlineDetail).toContain(estimate.feesIncluded ? 'duty + transfer included' : 'QLD duty + transfer separate');
    const markup = renderToStaticMarkup(createElement(ScoreBreakdown, { score: scoreVehicle(car, personal) }));
    const purchaseRow = markup.slice(markup.indexOf('Purchase price'));
    expect(purchaseRow.indexOf(category.headline!)).toBeLessThan(purchaseRow.indexOf('</summary>'));
    expect(purchaseRow.indexOf(category.headlineDetail!)).toBeLessThan(purchaseRow.indexOf('</summary>'));
  });

  it('labels a multi-listing midpoint as representative rather than an individual asking price', () => {
    const multi = vehicles.find(v => { const p = getPrice(v.id); return p && p.sampleCount > 1 && p.kind !== 'estimate'; })!;
    expect(scoreVehicle(multi, emptyPersonal()).categories.find(c => c.key === 'price')!.headlineDetail).toMatch(/^Representative (used|new) asking price/);
  });

  it('uses saved per-car and shared deal prices, including zero, rather than the research range', () => {
    const personal = emptyPersonal();
    personal.ownership = { ...defaultOwnership, purchasePrice: 45000, vehicleOverrides: { [car.id]: { purchase: 32000, feesIncluded: 'yes' } } };
    let category = categoryFor('price', personal);
    expect(category.headline).toBe(money(32000));
    expect(category.headlineDetail).toBe('Your saved price · duty + transfer included');
    expect(category.summary).toContain('71% of your');
    personal.ownership.vehicleOverrides[car.id].purchase = null;
    category = categoryFor('price', personal);
    expect(category.headline).toBe(money(45000));
    personal.ownership.purchasePrice = 0;
    expect(categoryFor('price', personal).headline).toBe(money(0));
  });

  it('labels unknown seller charges as an assumption until the fee treatment is confirmed', () => {
    const mixed = vehicles.find(v => getPrice(v.id)?.basis === 'mixed')!;
    expect(mixed).toBeDefined();
    const personal = emptyPersonal();
    const price = () => scoreVehicle(mixed, personal).categories.find(c => c.key === 'price')!;
    expect(price().headlineDetail).toContain('Charges unconfirmed');
    expect(price().headlineDetail).toContain('budgeted separately');
    personal.ownership = { ...defaultOwnership, vehicleOverrides: { [mixed.id]: { feesIncluded: 'yes' } } };
    expect(price().headlineDetail).toContain('duty + transfer included');
    expect(price().headlineDetail).not.toContain('unconfirmed');
    personal.ownership.vehicleOverrides[mixed.id].feesIncluded = 'no';
    expect(price().headlineDetail).toContain('QLD duty + transfer separate');
    expect(price().headlineDetail).not.toContain('unconfirmed');
  });

  it('highlights uncertain price estimates, but treats a saved deal amount as a user input', () => {
    const mixed = vehicles.find(v => getPrice(v.id)?.basis === 'mixed')!;
    const personal = emptyPersonal();
    const price = () => scoreVehicle(mixed, personal).categories.find(c => c.key === 'price')!;
    expect(price().headlineEstimated).toBe(true);
    let markup = renderToStaticMarkup(createElement(CategoryEvidence, { category: price() }));
    expect(markup).toContain(`<span class="estimated-value">${price().headline}</span>`);
    personal.ownership = { ...defaultOwnership, vehicleOverrides: { [mixed.id]: { purchase: 32000 } } };
    expect(price().headlineEstimated).toBe(false);
    markup = renderToStaticMarkup(createElement(CategoryEvidence, { category: price() }));
    expect(markup).not.toContain('class="estimated-value"');
    const running = categoryFor('running');
    expect(running.headlineEstimated).toBe(true);
    expect(renderToStaticMarkup(createElement(CategoryEvidence, { category: running }))).toContain(`<span class="estimated-value">${money(ownershipEstimate(car, emptyPersonal()).annual)}</span>/year`);
    expect(scoreVehicle(mixed, personal).categories.filter(c => !['price', 'running'].includes(c.key)).every(c => !c.headlineEstimated)).toBe(true);
  });

  it('shows complete annual running costs and the repair reserve without changing the score', () => {
    const estimate = ownershipEstimate(car, emptyPersonal());
    const category = categoryFor('running');
    expect(category.headline).toBe(`${money(estimate.annual)}/year`);
    expect(category.headlineDetail).toContain(money(estimate.annualBeforeRepairFund!));
    expect(category.summary).toContain(`${money(estimate.components.reserve)} repair savings`);
    expect(category.summary).toContain('Purchase and depreciation are separate');
    expect(category.score).toBe(6.6);
  });

  it('keeps a known boot measurement visible while explaining why it is excluded', () => {
    const nonComparable = { ...car, id: 'different-manufacturer-example', boot: { ...car.boot, value: 854, basis: 'Manufacturer capacity; not VDA comparable.' } };
    const category = scoreVehicle(nonComparable, emptyPersonal()).categories.find(c => c.key === 'boot')!;
    expect(category.score).toBeNull();
    expect(category.headline).toBe('854 L · different measurement');
    expect(category.headlineDetail).toBe('Excluded from the boot score');
  });

  it('distinguishes not-applicable electric range from missing plug-in range and unsuitable owner ratings', () => {
    const petrol = vehicles.find(v => v.powertrain === 'PETROL')!;
    const range = scoreVehicle(petrol, emptyPersonal()).categories.find(c => c.key === 'range')!;
    expect(range.headline).toBe('Not applicable');
    expect(range.headlineDetail).toBe('No plug-in electric range');
    const unknown = scoreVehicle({ ...car, range: { ...car.range, value: null } }, emptyPersonal()).categories.find(c => c.key === 'range')!;
    expect(unknown.headline).toBe('Electric range unavailable');
    const ev5 = vehicles.find(v => v.id === 'ev5-air-standard-2024')!;
    const reviews = scoreVehicle(ev5, emptyPersonal()).categories.find(c => c.key === 'owners')!;
    expect(reviews.headline).toBe('No matched owner rating');
    expect(reviews.score).toBeNull();
  });

  it('puts the actual fact before provenance and keeps sources and rules in an optional disclosure', () => {
    const category = categoryFor('price');
    const markup = renderToStaticMarkup(createElement(CategoryEvidence, { category }));
    const evidence = markup.indexOf('<details class="score-evidence-detail">');
    expect(markup.indexOf(category.headline!)).toBeLessThan(evidence);
    expect(markup.indexOf(category.reason)).toBeGreaterThan(evidence);
    expect(markup).toContain('Evidence &amp; scoring');
    expect(markup).toContain('Asking price at 75% of your budget');
    expect(markup).toContain('class="source-refs"');
    expect(markup).not.toContain('<details class="score-evidence-detail" open');
  });
});
