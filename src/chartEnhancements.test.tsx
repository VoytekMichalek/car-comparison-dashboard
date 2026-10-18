import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { annualCostCategories, annualCostChartRows, AnnualCostChart } from './components/AnnualCostChart';
import { PriceScorePlot, PriceScoreTooltip } from './pages/Charts';
import { powertrainColours, priceScorePoints } from './charts';
import { vehicles } from './data';
import { defaultOwnership, defaultWeights, emptyPersonal, money, yearLabel } from './lib';
import { ownershipEstimate } from './ownership';

const ev = vehicles.find(vehicle => vehicle.id === 'model-y-rwd-2022')!;

describe('annual running-cost breakdown chart', () => {
  it('totals the six displayed ownership amounts and always excludes repair savings', () => {
    const personal = emptyPersonal();
    personal.ownership = { ...defaultOwnership, includeRepairFund: true, vehicleOverrides: { [ev.id]: { electricity: 1000, insurance: 1100, rego: 800, servicing: 300, tyres: 200, financeInterestAnnual: 100, repairReserve: 5000 } } };
    const row = annualCostChartRows([ev], personal)[0];
    expect(row.total).toBe(3500);
    expect(row.categories.reduce((sum, category) => sum + category.value!, 0)).toBe(row.total);
    expect(row.estimate.annual).toBe(8500);
    personal.ownership.includeRepairFund = false;
    expect(annualCostChartRows([ev], personal)[0].total).toBe(3500);
    expect(annualCostCategories.some(category => (category.key as string) === 'reserve')).toBe(false);
  });

  it('uses the same researched values as Ownership and preserves explicit zero inputs', () => {
    const personal = emptyPersonal();
    const researched = annualCostChartRows([ev], personal)[0];
    expect(researched.total).toBe(ownershipEstimate(ev, personal).annualBeforeRepairFund);
    expect(researched.categories.find(category => category.key === 'insurance')!.evidence.sourceIds.length).toBeGreaterThan(0);
    personal.ownership = { ...defaultOwnership, vehicleOverrides: { [ev.id]: { electricity: 0, insurance: 0, rego: 0, servicing: 0, tyres: 0, financeInterestAnnual: 0 } } };
    const zero = annualCostChartRows([ev], personal)[0];
    expect(zero.total).toBe(0);
    expect(zero.categories.every(category => category.value === 0)).toBe(true);
    expect(renderToStaticMarkup(createElement(AnnualCostChart, { vehicles: [ev], personal, onDetail: () => {} }))).toContain('Your inputs total $0');
  });

  it('withholds incomplete cars instead of treating missing costs as zero', () => {
    const unresearched = { ...ev, id: 'unresearched-chart-example', familyId: 'unresearched-chart-family', powertrain: 'PETROL' as const, consumption: { ...ev.consumption, value: null } };
    const row = annualCostChartRows([unresearched], emptyPersonal())[0];
    expect(row.total).toBeNull();
    expect(row.estimate.missing).toContain('energy');
    const markup = renderToStaticMarkup(createElement(AnnualCostChart, { vehicles: [unresearched], personal: emptyPersonal(), onDetail: () => {} }));
    expect(markup).toContain('missing costs are not counted as $0');
    expect(markup).not.toContain('class="annual-cost-track"');
  });

  it('shows ten lowest complete rows initially and provides an all-filtered-cars option', () => {
    const personal = emptyPersonal();
    const rows = annualCostChartRows(vehicles, personal).filter(row => row.total !== null);
    expect(rows.length).toBeGreaterThan(10);
    expect(rows.every((row, index) => index === 0 || row.total! >= rows[index - 1].total!)).toBe(true);
    const markup = renderToStaticMarkup(createElement(AnnualCostChart, { vehicles, personal, onDetail: () => {} }));
    expect((markup.match(/class="annual-cost-track"/g) ?? []).length).toBe(10);
    expect(markup).toContain('All filtered cars');
    expect(markup).toContain('Amounts &amp; sources');
  });
});

describe('price-score dots and transient details', () => {
  it('fills provisional dots with their powertrain colour and distinguishes them by a dashed outline', () => {
    const original = priceScorePoints([ev], emptyPersonal(), defaultWeights, 45000)[0];
    const provisional = { ...original, score: { ...original.score, provisional: true } };
    const markup = renderToStaticMarkup(createElement(PriceScorePlot, { points: [provisional], budget: 45000, fullScale: false, onSelect: () => {} }));
    const dot = markup.match(/<circle class="insight-score-dot"[^>]+>/)?.[0];
    expect(dot).toContain(`fill="${powertrainColours.BEV}"`);
    expect(dot).toContain('stroke-dasharray="2 2"');
    expect(markup).toContain('aria-pressed="false"');
    expect(markup).not.toContain('role="tooltip"');
  });

  it('leads the tooltip with actual price and price-independent score, including scope and evidence', () => {
    const personal = emptyPersonal();
    personal.ownership = { ...defaultOwnership, purchasePrice: 32123, vehicleOverrides: {} };
    const point = priceScorePoints([ev], personal, defaultWeights, 45000)[0];
    const markup = renderToStaticMarkup(createElement(PriceScoreTooltip, { point: { ...point, score: { ...point.score, provisional: true } }, id: 'point-detail' }));
    expect(markup).toContain('role="tooltip"');
    expect(markup).toContain(money(32123));
    expect(markup).toContain('Score · price excluded');
    expect(markup).toContain(yearLabel(ev));
    expect(markup).toContain(ev.variant);
    expect(markup).toContain(`${point.score.coverage}% evidence coverage`);
    expect(markup).toContain('Provisional score');
    expect(point.score.categories.some(category => category.key === 'price')).toBe(false);
  });
});
