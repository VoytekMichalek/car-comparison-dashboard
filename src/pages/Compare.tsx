import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpRight, Check, Columns3, Plus, Share2, X } from 'lucide-react';
import { getPrice } from '../data';
import { isFuelOnly, money, powerLabel, yearLabel } from '../lib';
import type { CompareScope } from '../lib';
import type { Fact, PersonalData, ScoreCategory, ScoreWeights, Vehicle } from '../types';
import { FactValue, FitBadge, Photo, Price, SourceRefs } from '../components/Shared';
import { categoryLabels, formatScore, scoreVehicle } from '../scoring';
import type { CategoryScore } from '../scoring';
import { ownershipEstimate } from '../ownership';
import { CategoryEvidence } from '../components/Scores';
import { ComparisonScoreBar } from '../components/ComparisonScoreBar';
import { familyFitTarget } from '../familyFit';
import { cargoFor, cargoTotals } from '../cargo';
import '../compare.css';

type SortKey = 'selection' | 'vehicle' | 'overall' | ScoreCategory;
type CompareProps = {
  filterBar?: ReactNode;
  allVehicles: Vehicle[];
  vehicles: Vehicle[];
  selectedVehicles: Vehicle[];
  scope: CompareScope;
  onScope: (scope: CompareScope) => void;
  personal: PersonalData;
  weights: ScoreWeights;
  budget: number;
  onChoose: (index: number, id: string) => void;
  onEditCosts: (v: Vehicle) => void;
  onRemove: (id: string) => void;
  onBrowse: () => void;
  onDetail: (v: Vehicle) => void;
  onShare: () => void;
  onStart: () => void;
  onWeights: () => void;
  onScores: (v: Vehicle) => void;
};
const carName = (v: Vehicle) => `${v.make} ${v.model}`;
const variant = (v: Vehicle) => `${yearLabel(v)} · ${v.variant}`;
const categoryKeys = Object.keys(categoryLabels) as ScoreCategory[];
const emptyScoreLabel = (c: CategoryScore) => c.unscoredLabel ?? (!c.applicable ? 'Not applicable' : 'No data');

function ScoreEvidenceDialog({ vehicle, category, onClose }: { vehicle: Vehicle; category: CategoryScore; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const trigger = document.activeElement;
    ref.current?.showModal();
    return () => { if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={ref} className="compare-score-dialog" aria-labelledby={titleId} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <button className="icon-button dialog-close" aria-label="Close score evidence" onClick={onClose}><X size={20} /></button>
    <p className="eyebrow">{carName(vehicle)} · {variant(vehicle)}</p>
    <h2 id={titleId}>{categoryLabels[category.key]}</h2>
    <ComparisonScoreBar score={category.applicable ? category.score : null} label={`${carName(vehicle)} ${categoryLabels[category.key]}`} emptyLabel={emptyScoreLabel(category)} />
    <p className="compare-score-influence">{!category.applicable ? 'Not weighted · excluded from score and evidence coverage' : <>Importance {category.weight}/10 · {Math.round(category.confidence * 100)}% evidence · {category.effectiveWeight > 0 ? `effective weight ${category.effectiveWeight.toFixed(2)}` : 'excluded from the overall score'}</>}</p>
    <CategoryEvidence category={category} />
    <button className="button secondary" onClick={onClose}>Back to comparison</button>
  </dialog>;
}

function ResearchFact({ label, children, note }: { label: string; children: ReactNode; note?: ReactNode }) {
  return <div><dt>{label}</dt><dd>{children}{note && <small>{note}</small>}</dd></div>;
}

function VehicleResearch({ vehicle: v, personal, onEditCosts, onDetail }: { vehicle: Vehicle; personal: PersonalData; onEditCosts: (v: Vehicle) => void; onDetail: (v: Vehicle) => void }) {
  const e = ownershipEstimate(v, personal);
  const cargo = cargoFor(v.id);
  const warrantySources = v.sourceIds.filter(id => /warranty|service/i.test(id));
  const facts: [string, Fact][] = [
    ...(!isFuelOnly(v.powertrain) ? [['Electric range', v.range], ['Battery capacity', v.battery], ['AC charging', v.acCharging], ['DC charging', v.dcCharging]] as [string, Fact][] : []),
    ['Published consumption', v.consumption],
    ...(v.observedConsumption ? [['Observed consumption', v.observedConsumption] as [string, Fact]] : []),
    ...(v.observedRange ? [['Road-test electric range', v.observedRange] as [string, Fact]] : []),
    [v.seats > 5 ? 'Boot, third row folded' : 'Rear boot, seats up', v.boot], ['Boot, all rows occupied', v.bootAllRows], ['Length', v.length], ['Width', v.width], ['Braked towing', v.towing],
  ];
  return <details className="compare-car-research">
    <summary><strong>{carName(v)}</strong><span>{variant(v)}</span></summary>
    <div className="compare-research-grid">
      <section><h3>Specifications</h3><dl>
        <ResearchFact label="Price snapshot"><Price price={getPrice(v.id)} /></ResearchFact>
        <ResearchFact label="Powertrain / drive">{powerLabel(v.powertrain)} · {v.drive}</ResearchFact>
        <ResearchFact label="Seats">{v.seats}</ResearchFact>
        {v.fuel && <ResearchFact label="Petrol grade" note={<>{v.fuel.basis} <SourceRefs ids={v.fuel.sourceIds} /></>}>{v.fuel.minimumRon === null ? `${v.fuel.planningRon} RON planning` : `${v.fuel.minimumRon} RON minimum`}</ResearchFact>}
        {facts.map(([label, fact]) => <ResearchFact key={label} label={label} note={<>{fact.basis} <SourceRefs ids={fact.sourceIds} /></>}><FactValue fact={fact} /></ResearchFact>)}
        {cargo && <>
          <ResearchFact label="Front storage" note={<>Tesla published capacity; VDA method unverified. <SourceRefs ids={cargo.sourceIds} /></>}>{cargo.frontLitres.toLocaleString('en-AU')} L</ResearchFact>
          <ResearchFact label="Rear + front, seats up">{cargoTotals(cargo).seatsUpLitres.toLocaleString('en-AU')} L</ResearchFact>
          <ResearchFact label="Rear boot, seats folded">{cargo.rearSeatsFoldedLitres.toLocaleString('en-AU')} L</ResearchFact>
        </>}
      </dl></section>
      <section><h3>Child-seat fit</h3><FitBadge vehicle={v} confirmed={personal.fitChecks[v.id]} /><dl>
        {(['summary', 'row2', 'row3', 'testedSeats', 'buckleAccess', 'access', 'ventilation'] as const).map((key, i) => <ResearchFact key={key} label={['Fit evidence', 'Second-row anchors', 'Third-row anchors', 'Tested seats', 'Booster buckles', 'Access', 'Rear ventilation'][i]}>{v.familyFit[key]}</ResearchFact>)}
        <ResearchFact label="Your own fit check">{personal.fitChecks[v.id] ? 'Confirmed by you' : 'Pending — try your seats'}</ResearchFact>
      </dl><p className="compare-research-sources">Fit sources <SourceRefs ids={v.familyFit.sourceIds} /></p></section>
      <section><div className="compare-research-heading"><h3>Running costs / year</h3><button className="text-button" onClick={() => onEditCosts(v)}>Edit costs <ArrowUpRight size={14} /></button></div><dl>
        {(['energy', 'insurance', 'rego', 'servicing', 'tyres', 'reserve', 'finance'] as const).map(key => <ResearchFact key={key} label={{ energy: 'Electricity / fuel', insurance: 'Insurance', rego: 'QLD rego + CTP', servicing: 'Servicing', tyres: 'Tyres', reserve: 'Repair savings', finance: 'Finance interest' }[key]} note={key === 'finance' ? 'Your allowance · excludes loan principal' : <>{e.evidence[key].estimated ? 'Estimate' : 'Your input'} <SourceRefs ids={e.evidence[key].sourceIds} /></>}><strong className={key !== 'finance' && e.evidence[key].estimated ? 'estimated-value' : undefined}>{e.components[key] === null ? 'Unavailable' : money(e.components[key])}</strong></ResearchFact>)}
        <ResearchFact label="Annual running budget" note={e.annualBeforeRepairFund === null ? 'Costs incomplete' : `${money(e.annualBeforeRepairFund)} before repair savings`}>{e.complete ? money(e.annual) : 'Unavailable'}</ResearchFact>
        <ResearchFact label={`${personal.ownership?.years ?? 10}-year running budget`} note="Annual budget × years. Includes repair savings; purchase and depreciation are separate.">{e.runningTotal === null ? 'Unavailable' : money(e.runningTotal)}</ResearchFact>
      </dl><details className="compare-reserve-basis"><summary>Repair fund: basis & range</summary><p>{money(e.evidence.reserve.low)}–{money(e.evidence.reserve.high)} / year. {e.evidence.reserve.basis} <SourceRefs ids={e.evidence.reserve.sourceIds} /></p></details></section>
      <section><h3>Warranty & safety</h3><dl>
        <ResearchFact label="Vehicle warranty" note={<SourceRefs ids={warrantySources} />}>{v.warranty}</ResearchFact>
        <ResearchFact label="Battery warranty" note={<SourceRefs ids={warrantySources} />}>{v.batteryWarranty}</ResearchFact>
        <ResearchFact label="Servicing" note={<SourceRefs ids={warrantySources} />}>{v.servicing}</ResearchFact>
        <ResearchFact label="Safety rating" note={<>{v.safety.applicability} <SourceRefs ids={v.safety.sourceIds} /></>}>{v.safety.stars === null ? 'Not verified' : `${v.safety.stars} ANCAP stars · ${v.safety.year}`}</ResearchFact>
      </dl><h4>Evidence gaps</h4><ul>{v.gaps.map(gap => <li key={gap}>{gap}</li>)}</ul><button className="text-button" onClick={() => onDetail(v)}>Car details & all sources <ArrowUpRight size={14} /></button></section>
    </div>
  </details>;
}

export default function Compare({ filterBar, vehicles, allVehicles, selectedVehicles, scope, onScope, personal, onChoose, onEditCosts, onRemove, onBrowse, onDetail, onShare, onStart, onWeights, onScores, weights, budget }: CompareProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'selection', direction: 'desc' });
  const [evidence, setEvidence] = useState<{ vehicleId: string; category: ScoreCategory } | null>(null);
  const pickerVehicles = [...allVehicles, ...selectedVehicles.filter(v => !allVehicles.some(o => o.id === v.id))];
  const families = [...new Set(pickerVehicles.map(v => carName(v)))].sort();
  const scored = new Map(vehicles.map(v => [v.id, scoreVehicle(v, personal, weights, budget)]));
  function scoreFor(v: Vehicle, key: 'overall' | ScoreCategory) {
    const score = scored.get(v.id)!;
    return key === 'overall' ? score.total : score.categories.find(c => c.key === key)?.score ?? null;
  }
  const sortedVehicles = [...vehicles].sort((a, b) => {
    if (sort.key === 'selection') return 0;
    const direction = sort.direction === 'asc' ? 1 : -1;
    if (sort.key === 'vehicle') return `${carName(a)} ${variant(a)}`.localeCompare(`${carName(b)} ${variant(b)}`) * direction;
    const left = scoreFor(a, sort.key), right = scoreFor(b, sort.key);
    if (left === null) return right === null ? 0 : 1;
    if (right === null) return -1;
    return (left - right) * direction;
  });
  function sortBy(key: SortKey) { setSort(current => ({ key, direction: current.key === key && current.direction === 'desc' ? 'asc' : current.key === key ? 'desc' : key === 'vehicle' ? 'asc' : 'desc' })); }
  const sortIcon = (key: SortKey) => sort.key === key ? sort.direction === 'asc' ? <ArrowUp size={13} aria-hidden="true" /> : <ArrowDown size={13} aria-hidden="true" /> : null;
  const ariaSort = (key: SortKey) => sort.key === key ? sort.direction === 'asc' ? 'ascending' as const : 'descending' as const : 'none' as const;
  const evidenceVehicle = vehicles.find(v => v.id === evidence?.vehicleId);
  const evidenceCategory = evidenceVehicle && scored.get(evidenceVehicle.id)?.categories.find(c => c.key === evidence?.category);
  return <div className="page-content compare-page">
    <div className="page-heading"><div><p className="eyebrow">SIDE BY SIDE</p><h1>Compare cars<span className="heading-dot">.</span></h1><p>Vehicles in rows. Available category scores out of 10.</p></div><div className="button-group"><button className="text-button" onClick={onBrowse}>Browse cars <ArrowUpRight size={14} /></button>{vehicles.length > 0 && <button className="button primary" onClick={onShare}><Share2 size={16} />Share comparison</button>}</div></div>
    {filterBar}
    <div className="compare-view-controls"><label className="field"><span>Show in comparison</span><select value={scope} onChange={e => onScope(e.target.value as CompareScope)}><option value="all">All cars</option><option value="selected">Selected cars only</option></select></label><p role="status"><strong>{vehicles.length} {vehicles.length === 1 ? 'configuration' : 'configurations'} shown</strong><span>{selectedVehicles.length} / 4 selected · filters apply to both views</span></p></div>
    <details className="panel compare-pickers" open={scope === 'selected' && !selectedVehicles.length || pickerOpen} onToggle={e => setPickerOpen(e.currentTarget.open)}>
      <summary className="compare-picker-heading"><strong>Select up to four cars (optional)</strong><span>{selectedVehicles.length} / 4 selected</span></summary>
      <p className="compare-picker-help">Use the dropdowns or Select on a row. Switch to Selected cars only to narrow the comparison.</p>
      <div className="compare-picker-grid">{[0, 1, 2, 3].map(index => <label className="field" key={index}><span>Car {index + 1} (optional)</span><select value={selectedVehicles[index]?.id ?? ''} disabled={index > selectedVehicles.length} onChange={e => onChoose(index, e.target.value)}><option value="">{selectedVehicles[index] ? 'Remove this car' : 'Choose a car…'}</option>{families.map(family => <optgroup label={family} key={family}>{pickerVehicles.filter(v => carName(v) === family).map(v => <option key={v.id} value={v.id} disabled={selectedVehicles.some((selected, position) => position !== index && selected.id === v.id)}>{carName(v)} · {variant(v)}</option>)}</optgroup>)}</select></label>)}</div>
    </details>
    {!vehicles.length ? <div className="panel empty-state compare-empty"><Columns3 size={44} strokeWidth={1.1} /><h2>{scope === 'selected' && !selectedVehicles.length ? 'No cars selected yet.' : 'No cars match these filters.'}</h2><p>{scope === 'selected' && !selectedVehicles.length ? 'Select up to four cars above, or compare the full catalogue.' : scope === 'selected' ? 'Your selected cars are saved. Widen the filters to show them.' : 'Widen or reset the filters to see more cars.'}</p><div className="button-group">{scope === 'selected' && <button className="button primary" onClick={() => onScope('all')}>Show all cars <ArrowUpRight size={16} /></button>}{scope === 'selected' && !selectedVehicles.length && <button className="button secondary" onClick={onStart} disabled={!allVehicles.length}>Select three starting options</button>}<button className="button secondary" onClick={onBrowse}>Browse cars</button></div></div> : <>
      <div className="compare-matrix-toolbar"><div><h2>{scope === 'all' ? 'All matching cars' : 'Your selected cars'}</h2><p>Click a bar for its figure and evidence. Sort by heading or menu.</p></div><button className="button secondary" onClick={onWeights}>Change importance</button></div>
      <div className="compare-score-legend"><span>Bars: 0–10 · higher is better</span><span><i className="green" />7–10</span><span><i className="amber" />4–6.9</span><span><i className="red" />0–3.9</span><span className="compare-neutral-key">Unscored = excluded</span></div>
      <p className="compare-target">Child-seat target: {familyFitTarget}. Yellow figures are estimates; bar colours indicate scores.</p>
      <div className="compare-matrix-container">
        <div className="compare-mobile-sort"><label className="field"><span>Sort cars by</span><select value={sort.key} onChange={e => { const key = e.target.value as SortKey; setSort({ key, direction: key === 'vehicle' ? 'asc' : 'desc' }); }}><option value="selection">{scope === 'all' ? 'Catalogue order' : 'Chosen order'}</option><option value="vehicle">Vehicle name</option><option value="overall">Overall score</option>{categoryKeys.map(key => <option key={key} value={key}>{categoryLabels[key]}</option>)}</select></label><button className="button secondary" disabled={sort.key === 'selection'} onClick={() => setSort(current => ({ ...current, direction: current.direction === 'asc' ? 'desc' : 'asc' }))}>{sort.key === 'vehicle' ? sort.direction === 'asc' ? 'A to Z' : 'Z to A' : sort.direction === 'asc' ? 'Lowest first' : 'Highest first'}{sort.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}</button></div>
        <table className="compare-score-table">
          <caption className="sr-only">Vehicles in rows, overall and category scores in columns. Each bar spans zero to ten. Activate a score to read its evidence.</caption>
          <colgroup><col className="compare-identity-column" /><col className="compare-overall-column" />{categoryKeys.map(key => <col key={key} />)}</colgroup>
          <thead><tr><th scope="col" aria-sort={ariaSort('vehicle')}><button onClick={() => sortBy('vehicle')}>Vehicle {sortIcon('vehicle')}</button></th><th scope="col" aria-sort={ariaSort('overall')}><button onClick={() => sortBy('overall')}>Overall {sortIcon('overall')}</button><small>Weighted · /10</small></th>{categoryKeys.map(key => <th key={key} scope="col" aria-sort={ariaSort(key)}><button onClick={() => sortBy(key)}>{categoryLabels[key]} {sortIcon(key)}</button><small>{key === 'range' ? 'BEVs only · ' : ''}Importance {weights[key]}/10</small></th>)}</tr></thead>
          <tbody>{sortedVehicles.map(v => { const score = scored.get(v.id)!; const isSelected = selectedVehicles.some(selected => selected.id === v.id); return <tr key={v.id}>
            <th scope="row" className="compare-identity"><div className="compare-identity-top"><div className="compare-identity-photo"><Photo vehicle={v} /></div><button className="compare-select-toggle" aria-pressed={isSelected} aria-label={`${isSelected ? 'Unselect' : 'Select'} ${carName(v)} ${variant(v)}`} disabled={!isSelected && selectedVehicles.length >= 4} title={!isSelected && selectedVehicles.length >= 4 ? 'Four cars selected. Unselect one to choose another.' : undefined} onClick={() => onRemove(v.id)}>{isSelected ? <Check size={12} /> : <Plus size={12} />}{isSelected ? 'Selected' : 'Select'}</button></div><h3><button onClick={() => onDetail(v)}>{carName(v)} <ArrowUpRight size={13} /></button></h3><p>{variant(v)}</p><span className="compare-powertrain">{powerLabel(v.powertrain)} · {v.seats} seats</span><div className="compare-row-actions"><button className="text-button" onClick={() => onDetail(v)}>Car details</button><button className="text-button" onClick={() => onEditCosts(v)}>Edit costs</button></div></th>
            <td className="compare-overall-cell"><span className="compare-mobile-label">Overall score</span><button className="compare-score-button" onClick={() => onScores(v)} aria-label={`${carName(v)} ${variant(v)}, overall ${score.total === null ? 'score unavailable' : `${formatScore(score.total)} out of 10`}. Open scores and reviews.`}><ComparisonScoreBar score={score.total} label={`${carName(v)} overall score`} emptyLabel="Insufficient data" /><span className="compare-coverage">{score.coverage}% evidence</span>{score.provisional && <span className="compare-provisional">Provisional</span>}</button></td>
            {score.categories.map(c => <td key={c.key} className="compare-category-cell"><span className="compare-mobile-label">{categoryLabels[c.key]}<small>{c.applicable ? `Importance ${c.weight}/10` : 'Not weighted'}</small></span><button className="compare-score-button" onClick={() => setEvidence({ vehicleId: v.id, category: c.key })} aria-haspopup="dialog" aria-label={`${carName(v)} ${variant(v)}, ${categoryLabels[c.key]}: ${c.score === null || !c.applicable ? emptyScoreLabel(c) : `${formatScore(c.score)} out of 10`}. View figure and evidence.`}><ComparisonScoreBar score={c.applicable ? c.score : null} label={`${carName(v)} ${categoryLabels[c.key]}`} emptyLabel={emptyScoreLabel(c)} />{c.headline && c.headline !== emptyScoreLabel(c) && <span className={`compare-cell-fact ${c.headlineEstimated ? 'compare-cell-fact--estimated' : ''}`}>{c.headline}</span>}<span className="compare-cell-evidence">{c.score === null || !c.applicable ? 'Excluded' : `${Math.round(c.confidence * 100)}% evidence`}</span></button></td>)}
          </tr>; })}</tbody>
        </table>
      </div>
      <p className="compare-matrix-footnote">Overall uses your category importance and evidence strength, including purchase price. Unknown data adds no score or weight. Compare coverage alongside the total.</p>
      <details className="compare-research"><summary>Specifications, child-seat fit & cost breakdown</summary><div>{sortedVehicles.map(v => <VehicleResearch key={v.id} vehicle={v} personal={personal} onEditCosts={onEditCosts} onDetail={onDetail} />)}</div></details>
    </>}
    {evidenceVehicle && evidenceCategory && <ScoreEvidenceDialog vehicle={evidenceVehicle} category={evidenceCategory} onClose={() => setEvidence(null)} />}
  </div>;
}
