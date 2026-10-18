import { useMemo, useState } from 'react';
import { ownershipEstimate } from '../ownership';
import { money, yearLabel } from '../lib';
import type { PersonalData, Vehicle } from '../types';
import { SourceRefs } from './Shared';

export const annualCostCategories = [
  { key: 'energy', label: 'Electricity / fuel', colour: '#287099' },
  { key: 'insurance', label: 'Insurance', colour: '#9b5790' },
  { key: 'rego', label: 'Rego + CTP', colour: '#a57723' },
  { key: 'servicing', label: 'Servicing', colour: '#367e68' },
  { key: 'tyres', label: 'Tyres', colour: '#be6552' },
] as const;
export type AnnualCostKey = typeof annualCostCategories[number]['key'];

/** All figures come from the same ownership calculation used elsewhere. */
export function annualCostChartRows(vehicles: Vehicle[], personal: PersonalData) {
  return vehicles.map(vehicle => {
    const estimate = ownershipEstimate(vehicle, personal);
    const categories = annualCostCategories.map(category => ({
      ...category,
      value: estimate.components[category.key],
      evidence: estimate.evidence[category.key],
    }));
    return { vehicle, estimate, categories, total: estimate.annualBeforeRepairFund };
  }).sort((a, b) => (a.total ?? Infinity) - (b.total ?? Infinity) || a.vehicle.id.localeCompare(b.vehicle.id));
}

export function AnnualCostChart({ vehicles, personal, onDetail }: { vehicles: Vehicle[]; personal: PersonalData; onDetail: (vehicle: Vehicle) => void }) {
  const [showAll, setShowAll] = useState(false);
  const rows = useMemo(() => annualCostChartRows(vehicles, personal), [vehicles, personal]);
  const complete = rows.filter(row => row.total !== null);
  const visible = showAll ? complete : complete.slice(0, 10);
  const withheld = rows.filter(row => row.total === null);
  const maximum = Math.max(1, ...visible.map(row => row.total!));
  return <section className="panel insight-panel annual-cost-panel" aria-labelledby="annual-cost-chart-heading">
    <div className="insight-panel-heading"><div><p className="eyebrow">YOUR OWNERSHIP BUDGET</p><h2 id="annual-cost-chart-heading">Annual running cost</h2><p>See what each car costs to run, and where the money goes. Repair savings are excluded.</p></div><label className="insight-horizon"><span>Cars shown</span><select value={showAll ? 'all' : 'lowest'} onChange={event => setShowAll(event.target.value === 'all')}><option value="lowest">10 lowest annual costs</option><option value="all">All filtered cars</option></select></label></div>
    <p className="annual-cost-context">{personal.costs.annualKm.toLocaleString('en-AU')} km/year · {visible.length} of {vehicles.length} filtered cars · your saved cost inputs apply</p>
    <div className="annual-cost-legend" aria-label="Annual cost categories">{annualCostCategories.map(category => <span key={category.key}><i style={{ backgroundColor: category.colour }} />{category.label}</span>)}</div>
    {visible.length ? <ol className="annual-cost-bars" aria-label="Annual cost breakdown by car">{visible.map(row => <li key={row.vehicle.id}>
      <div className="annual-cost-row-heading"><button className="text-button" onClick={() => onDetail(row.vehicle)}>{row.vehicle.make} {row.vehicle.model}</button><strong className={row.categories.some(category => category.evidence.estimated) ? 'estimated-value' : ''}>{money(row.total!)}<small>/ year</small></strong></div>
      <p className="annual-cost-configuration">{yearLabel(row.vehicle)} · {row.vehicle.variant}</p>
      <div className="annual-cost-track" role="img" aria-label={`${row.vehicle.make} ${row.vehicle.model}: ${money(row.total!)} per year. ${row.categories.map(category => `${category.label} ${category.value === null ? 'needs an input' : money(category.value)}`).join('; ')}. Repair fund excluded.`}>
        {row.categories.filter(category => category.value !== null && category.value > 0).map(category => <span key={category.key} className="annual-cost-segment" style={{ width: `${category.value! / maximum * 100}%`, backgroundColor: category.colour }} title={`${category.label}: ${money(category.value!)}/year`} />)}
        {row.total === 0 && <span className="annual-cost-zero">Your inputs total $0</span>}
      </div>
      <details className="annual-cost-breakdown"><summary>Amounts & sources</summary><dl>{row.categories.map(category => <div key={category.key}><dt><i style={{ backgroundColor: category.colour }} />{category.label}</dt><dd><strong className={category.evidence.estimated ? 'estimated-value' : ''}>{category.value === null ? 'Input needed' : money(category.value)}</strong><small>{category.evidence.estimated ? 'Estimate · ' : ''}{category.evidence.basis} <SourceRefs ids={category.evidence.sourceIds} /></small></dd></div>)}</dl></details>
    </li>)}</ol> : <p className="insight-empty">Enter the missing ownership inputs to draw the annual running-cost bars.</p>}
    {withheld.length > 0 && <p className="insight-gap-note">Costs need an input for {withheld.map(row => `${row.vehicle.make} ${row.vehicle.model} (${row.estimate.missing.join(', ')})`).join('; ')}. These cars are withheld from this graph; missing costs are not counted as $0.</p>}
    <p className="insight-footnote">Electricity / fuel, comprehensive insurance, QLD registration + CTP, servicing and tyre replacement. Purchase price, depreciation and upfront fees are separate. The repair fund stays excluded even when its optional toggle is on elsewhere. Yellow amounts are estimates, and future costs can change.</p>
  </section>;
}
