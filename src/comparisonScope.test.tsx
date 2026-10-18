import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import Compare from './pages/Compare';
import { prices, vehicleIds, vehicles } from './data';
import { comparisonVehicles, defaultFilters, defaultWeights, emptyPersonal, filterVehicles, parseHash, publicHash } from './lib';
import type { CompareScope } from './lib';
import type { Vehicle } from './types';

const selected = [vehicles[2], vehicles[0]];
const selectedIds = selected.map(vehicle => vehicle.id);
const noop = () => {};
function comparisonMarkup(filtered: Vehicle[] = vehicles, scope: CompareScope = 'all', selection: Vehicle[] = selected) {
  return renderToStaticMarkup(<Compare vehicles={comparisonVehicles(filtered, selection.map(vehicle => vehicle.id), scope)} allVehicles={filtered} selectedVehicles={selection} scope={scope} onScope={noop} personal={emptyPersonal()} weights={defaultWeights} budget={45000} onChoose={noop} onEditCosts={noop} onRemove={noop} onBrowse={noop} onDetail={noop} onShare={noop} onStart={noop} onWeights={noop} onScores={noop} />);
}

describe('comparison catalogue and optional selection', () => {
  it('shows every configuration by default, without requiring a selection', () => {
    const initial = parseHash('#view=compare', vehicleIds);
    expect(comparisonVehicles(vehicles, initial.compare, initial.compareScope)).toHaveLength(vehicles.length);
    const markup = comparisonMarkup(vehicles, 'all', []);
    expect(markup.match(/class="compare-identity"/g)).toHaveLength(vehicles.length);
    expect(markup).toContain(`${vehicles.length} configurations`);
    expect(markup).toContain('All matching cars');
    expect(markup).not.toContain('No cars selected yet.');
    expect(markup).toContain('Select up to four cars (optional)');
  });

  it('applies catalogue filters to rows in both modes without discarding hidden selections', () => {
    const filters = { ...defaultFilters, powertrains: ['BEV' as const, 'PHEV' as const], year: '2023', withinBudgetOnly: true };
    const filtered = filterVehicles(vehicles, filters, [], {}, prices);
    expect(comparisonVehicles(filtered, selectedIds)).toEqual(filtered);
    const result = comparisonVehicles(filtered, selectedIds, 'selected');
    expect(result.map(vehicle => vehicle.id)).toEqual(selectedIds.filter(id => filtered.some(vehicle => vehicle.id === id)));
    expect(selected.map(vehicle => vehicle.id)).toEqual(selectedIds);
    expect(comparisonVehicles(vehicles, selectedIds, 'selected').map(vehicle => vehicle.id)).toEqual(selectedIds);
    const markup = comparisonMarkup([], 'selected');
    expect(markup).toContain('Your selected cars are saved.');
    expect(markup).toContain('2 / 4 selected');
    expect(markup).toContain(`value="${selected[0].id}" selected=""`);
    expect(markup).not.toContain('No cars selected yet.');
  });

  it('gives an empty selected-only view a route back to all cars', () => {
    const markup = comparisonMarkup(vehicles, 'selected', []);
    expect(markup).toContain('No cars selected yet.');
    expect(markup).toContain('Show all cars');
    expect(markup).not.toContain('class="compare-identity"');
    expect(comparisonVehicles(vehicles, ['unknown', selectedIds[0], selectedIds[0]], 'selected').map(vehicle => vehicle.id)).toEqual([selectedIds[0]]);
  });

  it('round-trips view scope, selected order and filters in public links', () => {
    for (const scope of ['all', 'selected'] as const) {
      const state = { view: 'compare' as const, compare: selectedIds, compareScope: scope, filters: { ...defaultFilters, powertrains: ['BEV' as const, 'PHEV' as const], year: '2023' }, weights: defaultWeights };
      expect(parseHash(publicHash(state), vehicleIds)).toEqual(state);
      expect(publicHash(state)).toContain(`compareScope=${scope}`);
    }
    expect(parseHash('#view=compare&compareScope=invalid', vehicleIds).compareScope).toBeUndefined();
    const legacy = { view: 'compare' as const, compare: selectedIds, filters: defaultFilters };
    expect(parseHash(publicHash(legacy), vehicleIds)).toEqual(legacy);
  });

  it('retains neutral unscored categories when all cars are compared', () => {
    const hybrid = vehicles.find(vehicle => vehicle.powertrain === 'HEV')!;
    const markup = comparisonMarkup([hybrid], 'all', []);
    expect(markup).toContain('Not applicable');
    expect(markup).toContain('Excluded');
    expect(markup).not.toMatch(/Electric range: 0(?:\.0)? out of 10/);
    expect(markup).toContain('aria-pressed="false"');
  });
});
