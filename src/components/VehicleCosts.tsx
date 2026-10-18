import { budgetBenchmarks, getPrice, qldCosts } from '../data';
import { isFuelOnly, isPlugIn, money } from '../lib';
import { ownershipEstimate, settingsFor } from '../ownership';
import type { PersonalData, Vehicle } from '../types';
import { SourceRefs } from './Shared';
import RepairEvidence from './RepairEvidence';

const amount = (value: number | null) => value === null ? 'Not available' : money(value);

export default function VehicleCosts({ vehicle: v, personal, onUpdate, onEdit }: {
  vehicle: Vehicle; personal: PersonalData; onUpdate: (p: PersonalData) => void; onEdit: () => void;
}) {
  const cost = ownershipEstimate(v, personal);
  const settings = settingsFor(personal);
  const price = getPrice(v.id);
  const annualRows = [
    { label: 'Electricity', value: cost.energyCosts.electricity, evidence: cost.evidence.electricity, note: isFuelOnly(v.powertrain) ? 'Not applicable to this powertrain' : undefined },
    { label: v.powertrain === 'DIESEL' ? 'Diesel' : 'Petrol', value: cost.energyCosts.petrol, evidence: cost.evidence.petrol, note: v.powertrain === 'BEV' ? 'Not applicable to this electric car' : undefined },
    { label: 'Comprehensive insurance', value: cost.components.insurance, evidence: cost.evidence.insurance },
    { label: 'Scheduled servicing', value: cost.components.servicing, evidence: cost.evidence.servicing },
    { label: 'Tyre replacement allowance', value: cost.components.tyres, evidence: cost.evidence.tyres },
    { label: 'QLD registration + CTP', value: cost.components.rego, evidence: cost.evidence.rego },
    { label: 'Repair reserve', value: cost.components.reserve, evidence: cost.evidence.reserve, note: cost.evidence.reserve.estimated ? 'Car-specific estimate · money set aside' : 'Your repair savings allowance' },
    { label: 'Finance interest & fees', value: cost.components.finance, note: 'Your allowance · excludes loan principal' },
  ];
  const upfrontRows = [
    { label: 'Purchase price used', value: cost.purchasePrice, note: 'Your input or the representative asking-price budget', sourceIds: price?.sourceIds },
    { label: 'Vehicle duty', value: cost.duty, note: cost.feesIncluded ? 'Included in purchase price' : 'Indicative QLD calculation', sourceIds: qldCosts.duty.sourceIds },
    { label: 'Registration transfer', value: cost.transfer, note: cost.feesIncluded ? 'Included in purchase price' : undefined, sourceIds: qldCosts.transfer.sourceIds },
    { label: 'Government PPSR search', value: cost.ppsr, sourceIds: qldCosts.ppsr.sourceIds },
    { label: 'Home charger + installation', value: isFuelOnly(v.powertrain) ? 0 : settings.charger, note: isFuelOnly(v.powertrain) ? 'Not applicable' : 'Your setup allowance' },
    { label: 'Pre-purchase inspection', value: settings.inspection, note: 'Your setup allowance' },
    { label: 'Other purchase costs', value: settings.otherUpfront, note: 'Your setup allowance' },
  ];
  return <>
    <div className="section-title vehicle-section-heading"><div><p className="eyebrow">THE COMPLETE OWNERSHIP BUDGET</p><h2>What it costs to own</h2><p>All costs for this configuration, using your saved assumptions and quotes.</p></div><button className="button secondary" onClick={onEdit}>Edit costs for this car</button></div>
    <div className="vehicle-cost-controls"><label className="cost-period"><span>Ownership period</span><select value={settings.years} onChange={e => onUpdate({ ...personal, ownership: { ...settings, years: Number(e.target.value) } })}>{[...new Set([3, 5, 10, settings.years])].sort((a, b) => a - b).map(years => <option value={years} key={years}>{years} years</option>)}</select></label><p className="micro muted">{personal.costs.annualKm.toLocaleString('en-AU')} km/year · {isFuelOnly(v.powertrain) ? (v.powertrain === 'HEV' ? 'Petrol hybrid' : v.powertrain === 'DIESEL' ? 'Diesel' : 'Petrol') : `${personal.costs.homeShare}% home charging`}{v.powertrain === 'PHEV' ? ` · ${personal.costs.electricShare}% electric driving` : ''}</p></div>
    <p className="estimate-legend"><span className="estimate-swatch" />Yellow figures are planning estimates. Your quotes replace the researched budgets.</p>
    <div className="vehicle-cost-highlights">
      <div className="panel"><span>Annual running cost</span><strong className="estimated-value">{cost.complete ? amount(cost.annual) : 'Incomplete'}</strong><small>Recurring costs, repair reserve and finance interest</small></div>
      <div className="panel"><span>{settings.years}-year running total</span><strong className="estimated-value">{amount(cost.runningTotal)}</strong><small>Annual running cost × {settings.years} years at today’s rates</small></div>
      <div className="panel"><span>Purchase & setup</span><strong>{amount(cost.purchasePrice === null || cost.duty === null ? null : cost.purchasePrice + cost.upfront)}</strong><small>One-off purchase price, fees and setup costs</small></div>
    </div>
    {cost.missing.length > 0 && <p className="notice">Missing annual costs: {cost.missing.join(', ')}. Enter your quotes to complete the total.</p>}
    <RepairEvidence familyId={v.familyId} />
    <div className="vehicle-cost-ledgers">
      <section className="panel"><h3>Everyday costs / year</h3><dl className="vehicle-ledger">{annualRows.map(row => <div key={row.label}><dt>{row.label}<small>{row.note ?? (row.evidence?.estimated ? 'Estimate' : 'Your input')}</small></dt><dd className={row.evidence?.estimated ? 'estimated-value' : ''}>{amount(row.value)}</dd></div>)}<div className="ledger-total"><dt>Annual running {cost.complete ? 'total' : 'subtotal'}</dt><dd>{money(cost.annual)}</dd></div></dl><p className="micro muted">Planning range: {money(cost.annualLow)}–{money(cost.annualHigh)} per year{cost.complete ? '.' : ' for the populated components.'}</p></section>
      <section className="panel"><h3>Purchase & setup</h3><dl className="vehicle-ledger">{upfrontRows.map(row => <div key={row.label}><dt>{row.label} {row.sourceIds && <SourceRefs ids={row.sourceIds} />}{row.note && <small>{row.note}</small>}</dt><dd>{amount(row.value)}</dd></div>)}<div className="ledger-total"><dt>Extra purchase & setup {cost.duty === null ? 'subtotal' : 'total'}<small>Excludes the purchase price</small></dt><dd>{money(cost.upfront)}</dd></div></dl></section>
      <section className="panel"><h3>Resale & depreciation</h3><dl className="vehicle-ledger"><div><dt>Resale after {settings.years} years<small>{cost.resaleEstimated ? 'Estimated scenario' : 'Your input'}</small></dt><dd className={cost.resaleEstimated ? 'estimated-value' : ''}>{amount(cost.resale)}</dd></div><div><dt>Resale planning range</dt><dd>{amount(cost.resaleLow)}–{amount(cost.resaleHigh)}</dd></div><div><dt>Depreciation / year<small>Purchase − resale, divided by {settings.years}</small></dt><dd className={cost.resaleEstimated ? 'estimated-value' : ''}>{amount(cost.depreciation)}</dd></div><div><dt>Repair scenario above reserve<small>Included once in the ownership total</small></dt><dd>{money(cost.excessRepair)}</dd></div></dl><details className="vehicle-method"><summary>Resale scenario & source</summary><p>{budgetBenchmarks.depreciation[v.powertrain].basis} <SourceRefs ids={budgetBenchmarks.depreciation[v.powertrain].sourceIds} /></p></details></section>
      <section className="panel"><h3>Total ownership scenario, including purchase</h3><dl className="vehicle-ledger"><div><dt>Running costs × {settings.years} years{!cost.complete && <small>Incomplete running budget</small>}</dt><dd>{cost.complete ? money(cost.annual * settings.years) : 'Incomplete'}</dd></div><div><dt>Purchase + extra setup{cost.duty === null && <small>Duty still needs checking</small>}</dt><dd>{cost.purchasePrice === null || cost.duty === null ? 'Incomplete' : money(cost.purchasePrice + cost.upfront)}</dd></div><div><dt>Additional repair scenario</dt><dd>{money(cost.excessRepair)}</dd></div><div><dt>Less estimated resale</dt><dd>{cost.resale === null ? 'Not available' : `−${money(cost.resale)}`}</dd></div><div className="ledger-total"><dt>{settings.years}-year ownership total</dt><dd className="estimated-value">{amount(cost.total)}</dd></div></dl><p className="micro muted">Depreciation is already reflected in purchase less resale. Loan principal is counted in the purchase price. The repair reserve is savings, not a predicted bill. Purchase, setup, depreciation and this one-off repair scenario are separate from annual running costs. Figures use today’s dollars.</p></section>
    </div>
    <details className="panel vehicle-cost-evidence"><summary>Estimate ranges, assumptions & sources</summary><p className="micro muted">Ranges are sensitivity bounds. Actual costs can fall outside them.</p><div className="estimate-basis-grid">{(['energy', 'insurance', 'servicing', 'tyres', 'rego', 'reserve'] as const).map(key => { const item = cost.evidence[key]; return <section key={key}><h4>{({ energy: 'Electricity / fuel', insurance: 'Insurance', servicing: 'Servicing', tyres: 'Tyres', rego: 'QLD registration + CTP', reserve: 'Repair reserve' })[key]}</h4><strong className={item.estimated ? 'estimated-value' : ''}>{amount(item.low)}–{amount(item.high)} / year</strong><p>{item.basis} <SourceRefs ids={item.sourceIds} /></p></section>; })}</div></details>
  </>;
}
