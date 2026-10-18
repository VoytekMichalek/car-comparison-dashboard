import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowUpRight, ChartNoAxesCombined, Info } from 'lucide-react';
import { SourceRefs } from '../components/Shared';
import { vehicles as catalogue } from '../data';
import { depreciationSeries, initialChartSelection, powertrainColours, priceScorePoints, seriesColours } from '../charts';
import type { DepreciationSeries, PriceScorePoint } from '../charts';
import { money, powerLabel, yearLabel } from '../lib';
import { formatScore } from '../scoring';
import type { PersonalData, Powertrain, ScoreWeights, Vehicle } from '../types';
import '../charts.css';

function usePlotWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => setWidth(Math.max(180, Math.round(node.getBoundingClientRect().width)));
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}
const name = (v: Vehicle) => `${v.make} ${v.model}`;
const configuration = (v: Vehicle) => `${yearLabel(v)} · ${v.variant}`;
const shortMoney = (amount: number) => amount === 0 ? '$0' : Math.abs(amount) >= 1000 ? `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k` : `$${Math.round(amount)}`;
const familyOrder = [...new Set(catalogue.map(v => v.familyId))];
const seriesColour = (v: Vehicle) => seriesColours[Math.max(0, familyOrder.indexOf(v.familyId)) % seriesColours.length];

function DepreciationPlot({ series, focusedId, onFocus, year, onYear, horizon }: { series: DepreciationSeries[]; focusedId: string; onFocus: (id: string) => void; year: number; onYear: (year: number) => void; horizon: number }) {
  const { ref, width } = usePlotWidth();
  const titleId = useId();
  const descriptionId = useId();
  const narrow = width < 560;
  const height = narrow ? 300 : 370;
  const left = narrow ? 48 : 66, right = narrow ? 16 : 38, top = 44, bottom = height - 42;
  const maxValue = Math.max(10000, Math.ceil(Math.max(...series.flatMap(s => s.points.map(p => p.value))) / 10000) * 10000);
  const x = (value: number) => left + value / horizon * (width - left - right);
  const y = (value: number) => bottom - value / maxValue * (bottom - top);
  const focused = series.find(s => s.vehicle.id === focusedId) ?? series[0];
  const ordered = [...series.filter(s => s !== focused), ...(focused ? [focused] : [])];
  return <div ref={ref} className="insight-plot"><svg viewBox={`0 0 ${width} ${height}`} className="depreciation-svg" aria-labelledby={`${titleId} ${descriptionId}`} role="group">
    <title id={titleId}>Estimated vehicle value over {horizon} years</title><desc id={descriptionId}>Each line is a selected car. Choose a car in the legend, then tab through its annual points, or use the year selector below. All values are Australian dollars and scenario estimates.</desc>
    <text className="insight-axis-title" x={left} y={20}>Value (AUD)</text>
    {[0, .25, .5, .75, 1].map(t => <g key={t}><line className="insight-grid" x1={left} x2={width - right} y1={y(maxValue * t)} y2={y(maxValue * t)} /><text className="insight-tick" x={left - 9} y={y(maxValue * t) + 4} textAnchor="end">{shortMoney(maxValue * t)}</text></g>)}
    {Array.from({ length: horizon + 1 }, (_, i) => i).filter(i => !narrow || horizon <= 5 || i % 2 === 0 || i === horizon).map(i => <text className="insight-tick" x={x(i)} y={bottom + 22} key={i} textAnchor="middle">{i === 0 ? 'Now' : i}</text>)}
    <text className="insight-axis-title" x={width - right} y={height - 2} textAnchor="end">Years from purchase</text>
    {focused && <line className="insight-cursor" x1={x(year)} x2={x(year)} y1={top} y2={bottom} />}
    {ordered.map(s => { const colour = seriesColour(s.vehicle); const active = s === focused; return <g className={`insight-series ${active ? 'is-focused' : ''}`} key={s.vehicle.id}>
      <path d={s.points.map((p, i) => `${i ? 'L' : 'M'}${x(p.year)},${y(p.value)}`).join(' ')} fill="none" stroke={colour} strokeWidth={active ? 3 : 1.8} opacity={active ? 1 : .5} />
      {s.points.map(p => <g key={p.year} tabIndex={active ? 0 : -1} role="button" className="insight-year-point" aria-label={`${name(s.vehicle)}, ${p.year === 0 ? 'purchase today' : `year ${p.year}`}: ${money(p.value)} estimated value, ${money(Math.abs(p.loss))} ${p.loss < 0 ? 'gain' : 'loss'} from purchase`} onFocus={() => { onFocus(s.vehicle.id); onYear(p.year); }} onMouseEnter={() => { onFocus(s.vehicle.id); onYear(p.year); }} onClick={() => { onFocus(s.vehicle.id); onYear(p.year); }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onFocus(s.vehicle.id); onYear(p.year); } }}>
        <title>{name(s.vehicle)} · year {p.year}: {money(p.value)} estimated value</title>
        <circle className="point-hit-target" cx={x(p.year)} cy={y(p.value)} r={narrow ? 9 : 11} />
        {active && p.year === year && <circle cx={x(p.year)} cy={y(p.value)} r={8} fill="white" stroke={colour} strokeWidth={1.5} />}
        <circle cx={x(p.year)} cy={y(p.value)} r={active ? 4.5 : 2.5} fill={active ? colour : 'white'} stroke={colour} strokeWidth={1.5} />
        {active && !narrow && <text className="year-value-label" x={x(p.year)} y={y(p.value) - 13} textAnchor={p.year === 0 ? 'start' : p.year === horizon ? 'end' : 'middle'}>{shortMoney(p.value)}</text>}
      </g>)}
    </g>; })}
  </svg></div>;
}

function PriceScorePlot({ points, selected, budget, onSelect }: { points: PriceScorePoint[]; selected?: PriceScorePoint; budget: number; onSelect: (id: string) => void }) {
  const { ref, width } = usePlotWidth();
  const titleId = useId();
  const descId = useId();
  const narrow = width < 560;
  const height = narrow ? 340 : 400;
  const left = 44, right = narrow ? 19 : 36, top = 45, bottom = height - 48;
  const maxPrice = Math.max(10000, Math.ceil(Math.max(budget, ...points.map(p => p.price)) / 10000) * 10000);
  const x = (value: number) => left + value / maxPrice * (width - left - right);
  const y = (value: number) => bottom - (value - 1) / 9 * (bottom - top);
  // Keep DOM order stable while tabbing. Moving the focused dot to the end would skip other cars.
  const ordered = points;
  return <div ref={ref} className="insight-plot"><svg viewBox={`0 0 ${width} ${height}`} className="price-score-svg" role="group" aria-labelledby={`${titleId} ${descId}`}>
    <title id={titleId}>Purchase price versus overall score</title><desc id={descId}>Each dot is one filtered vehicle configuration. Colour identifies its powertrain. Hollow dots have provisional scores. Select a dot or use the car selector to read its price, fee basis and score evidence.</desc>
    <text className="insight-axis-title" x={left} y={20}>Overall score / 10</text>
    {[1, 2, 4, 6, 8, 10].map(score => <g key={score}><line className="insight-grid" x1={left} x2={width - right} y1={y(score)} y2={y(score)} /><text className="insight-tick" x={left - 10} y={y(score) + 4} textAnchor="end">{score}</text></g>)}
    {[0, .25, .5, .75, 1].map(t => <text className="insight-tick" key={t} x={x(t * maxPrice)} y={bottom + 23} textAnchor={t === 1 ? 'end' : t === 0 ? 'start' : 'middle'}>{shortMoney(t * maxPrice)}</text>)}
    <line className="insight-budget-line" x1={x(budget)} x2={x(budget)} y1={top} y2={bottom} /><text className="insight-budget-label" x={x(budget) - 5} y={top - 9} textAnchor="end">{shortMoney(budget)} target</text>
    {ordered.map(p => { const active = p === selected; const colour = powertrainColours[p.vehicle.powertrain]; return <g key={p.vehicle.id} tabIndex={0} role="button" className={`insight-score-point ${active ? 'is-selected' : ''}`} aria-label={`${name(p.vehicle)}, ${configuration(p.vehicle)}: ${money(p.price)}, score ${formatScore(p.score.total)} out of 10, ${p.score.coverage}% evidence${p.score.provisional ? ', provisional' : ''}`} onMouseEnter={() => onSelect(p.vehicle.id)} onFocus={() => onSelect(p.vehicle.id)} onClick={() => onSelect(p.vehicle.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(p.vehicle.id); } }}>
      <title>{name(p.vehicle)} · {configuration(p.vehicle)}: {money(p.price)} · {formatScore(p.score.total)}/10 · {p.score.coverage}% evidence</title>
      <circle className="point-hit-target" cx={x(p.price)} cy={y(p.score.total!)} r="14" />
      {active && <circle cx={x(p.price)} cy={y(p.score.total!)} r="13" fill="white" stroke={colour} strokeWidth="1.5" />}
      <circle cx={x(p.price)} cy={y(p.score.total!)} r={active ? 7 : 6} fill={p.score.provisional ? 'white' : colour} stroke={colour} strokeWidth={p.score.provisional ? 2.5 : 1.5} />
      {active && <circle cx={x(p.price)} cy={y(p.score.total!)} r="2" fill={colour} />}
    </g>; })}
    {selected && <circle pointerEvents="none" cx={x(selected.price)} cy={y(selected.score.total!)} r="14" fill="none" stroke={powertrainColours[selected.vehicle.powertrain]} strokeWidth="1.5" />}
    <text className="insight-axis-title" x={width - right} y={height - 2} textAnchor="end">Purchase price (AUD)</text>
  </svg></div>;
}

export default function Charts({ filterBar, vehicles, personal, weights, budget, compareIds = [], onDetail }: { filterBar?: ReactNode; vehicles: Vehicle[]; personal: PersonalData; weights: ScoreWeights; budget: number; compareIds?: string[]; onDetail: (v: Vehicle) => void }) {
  const [selectedFamilies, setSelectedFamilies] = useState(() => { const ids = initialChartSelection(vehicles, compareIds, budget); return vehicles.filter(v => ids.includes(v.id)).map(v => v.familyId); });
  const [cleared, setCleared] = useState(false);
  const [horizon, setHorizon] = useState(10);
  const [focusId, setFocusId] = useState('');
  const [focusYear, setFocusYear] = useState(5);
  const [scatterId, setScatterId] = useState('');
  const visibleSelected = vehicles.filter(v => selectedFamilies.includes(v.familyId));
  const selectionHidden = !cleared && visibleSelected.length === 0 && vehicles.length > 0;
  const effectiveSelection = selectionHidden ? initialChartSelection(vehicles, compareIds, budget) : visibleSelected.map(v => v.id);
  const selectedCars = vehicles.filter(v => effectiveSelection.includes(v.id));
  const series = useMemo(() => selectedCars.flatMap(v => { const s = depreciationSeries(v, personal, horizon); return s ? [s] : []; }), [selectedCars, personal, horizon]);
  const focused = series.find(s => s.vehicle.id === focusId) ?? series[0];
  const selectedYear = Math.min(focusYear, horizon);
  const selectedPoint = focused?.points.find(p => p.year === selectedYear);
  const scatterPoints = useMemo(() => priceScorePoints(vehicles, personal, weights, budget), [vehicles, personal, weights, budget]);
  const scatterSelected = scatterPoints.find(p => p.vehicle.id === scatterId) ?? scatterPoints[0];
  const powers = (['BEV', 'PHEV', 'HEV', 'PETROL', 'DIESEL'] as Powertrain[]).filter(power => scatterPoints.some(p => p.vehicle.powertrain === power));
  function toggleCar(v: Vehicle) {
    const base = selectedCars.map(car => car.familyId);
    const next = base.includes(v.familyId) ? base.filter(id => id !== v.familyId) : [...base, v.familyId];
    setSelectedFamilies(next);
    setCleared(next.length === 0);
    if (!base.includes(v.familyId)) setFocusId(v.id);
  }
  return <div className="page-content charts-page"><div className="page-heading"><div><p className="eyebrow">PRICE, VALUE & PRIORITIES</p><h1>Charts<span className="heading-dot">.</span></h1><p>Explore resale scenarios and the value behind your weighted scores.</p></div><div className="heading-icon"><ChartNoAxesCombined size={30} strokeWidth={1.2} /></div></div>{filterBar}
    {!vehicles.length ? <p className="panel insight-empty">No cars match these filters. Change or reset the filters to see the charts.</p> : <>
    <p className="insight-filter-note">{vehicles.length} model {vehicles.length === 1 ? 'family' : 'families'} · selected Browse year/variant · your saved prices, cost inputs and category weights apply.</p>
    <section className="panel insight-panel" aria-labelledby="depreciation-heading"><div className="insight-panel-heading"><div><p className="eyebrow">SCENARIO ESTIMATE</p><h2 id="depreciation-heading">Expected depreciation</h2><p>Estimated car value from purchase today. Each point is one year.</p></div><label className="insight-horizon"><span>Chart horizon</span><select value={horizon} onChange={e => setHorizon(Number(e.target.value))}>{[3, 5, 10].map(n => <option value={n} key={n}>{n} years</option>)}</select></label></div>
      <div className="insight-estimate-note"><Info size={17} /><p>Broad powertrain assumptions, not individual car forecasts. Your resale inputs in Ownership costs replace the default curve. Resale values are uncertain.</p></div>
      <details className="insight-car-picker"><summary>Choose cars for the lines <span>{selectedCars.length} selected</span></summary><div className="insight-picker-actions"><button className="text-button" onClick={() => { setSelectedFamilies(vehicles.map(v => v.familyId)); setCleared(false); }}>Show all {vehicles.length}</button><button className="text-button" onClick={() => { setSelectedFamilies([]); setCleared(true); }}>Clear</button></div><div className="insight-car-options">{vehicles.map(v => <label key={v.id}><input type="checkbox" checked={effectiveSelection.includes(v.id)} onChange={() => toggleCar(v)} /><span className="insight-swatch" style={{ backgroundColor: seriesColour(v) }} /><span><strong>{name(v)}</strong><small>{configuration(v)}</small></span></label>)}</div></details>
      {selectionHidden && <p className="insight-filter-note" role="status">Your previous selection is hidden by the filters. Showing an initial selection from the available cars.</p>}
      {series.length ? <><div className="insight-line-legend" aria-label="Focus a car’s depreciation values">{series.map(s => <button key={s.vehicle.id} aria-pressed={focused?.vehicle.id === s.vehicle.id} className={focused?.vehicle.id === s.vehicle.id ? 'is-active' : ''} onClick={() => setFocusId(s.vehicle.id)}><span className="insight-swatch" style={{ backgroundColor: seriesColour(s.vehicle) }} /><span>{name(s.vehicle)}</span></button>)}</div><DepreciationPlot series={series} focusedId={focused!.vehicle.id} onFocus={setFocusId} year={selectedYear} onYear={setFocusYear} horizon={horizon} />
      {focused && selectedPoint && <><div className="insight-focus-bar"><div><span className="eyebrow">FOCUSED CAR</span><h3>{name(focused.vehicle)}</h3><p>{configuration(focused.vehicle)}</p></div><label><span>Inspect year</span><select value={selectedYear} onChange={e => setFocusYear(Number(e.target.value))}>{focused.points.map(p => <option key={p.year} value={p.year}>{p.year === 0 ? 'Now · purchase' : `Year ${p.year}`}</option>)}</select></label><button className="text-button" onClick={() => onDetail(focused.vehicle)}>Car details <ArrowUpRight size={15} /></button></div><div className="insight-selected-values" aria-live="polite"><div><span>{selectedYear === 0 ? 'Purchase price' : `Value at year ${selectedYear}`}</span><strong className={selectedYear === 0 ? '' : 'estimated-value'}>{money(selectedPoint.value)}</strong></div><div><span>{selectedPoint.loss < 0 ? 'Gain' : 'Depreciation'} from purchase</span><strong className="estimated-value">{money(Math.abs(selectedPoint.loss))}</strong></div><div><span>{focused.customResale ? 'Your resale anchor' : 'Illustrative value range'}</span><strong className="estimated-value">{focused.customResale ? `${money(focused.anchorValue)} at year ${focused.anchorYears}` : `${money(selectedPoint.low)}–${money(selectedPoint.high)}`}</strong></div></div>
      <div className="insight-year-values" aria-label={`Annual estimated values for ${name(focused.vehicle)}`}>{focused.points.map(p => <button key={p.year} aria-pressed={selectedYear === p.year} onClick={() => setFocusYear(p.year)}><span>{p.year === 0 ? 'Now' : `Year ${p.year}`}</span><strong>{money(p.value)}</strong></button>)}</div>
      <p className="insight-method-note">{focused.note} <SourceRefs ids={focused.sourceIds} />{!focused.customResale && ' Yellow values and ranges are estimates, not statistical confidence intervals. Values after purchase are rounded to A$100.'}</p></>}
      <details className="insight-value-data"><summary>Yearly values for all selected cars</summary><div className="insight-data-cars">{series.map(s => <section key={s.vehicle.id}><h3>{name(s.vehicle)}</h3><p>{configuration(s.vehicle)}</p><dl>{s.points.map(p => <div key={p.year}><dt>{p.year === 0 ? 'Purchase' : `Year ${p.year}`}</dt><dd>{money(p.value)}</dd></div>)}</dl></section>)}</div></details></> : <p className="insight-empty">{selectedCars.length ? 'No usable purchase/resale values for this selection. Enter a valid purchase and resale assumption in Ownership costs.' : 'Choose cars above to draw their depreciation lines.'}</p>}
      {selectedCars.length > series.length && <p className="insight-gap-note">Withheld: {selectedCars.filter(v => !series.some(s => s.vehicle.id === v.id)).map(name).join(', ')}. Purchase/resale values are missing or cannot define a valid curve.</p>}
      <p className="insight-footnote">This chart shows the car’s value, not running costs or total ownership cost. Same powertrain rates can produce similar lines. Changing the chart horizon does not change your saved ownership period.</p>
    </section>
    <section className="panel insight-panel" aria-labelledby="price-score-heading"><div className="insight-panel-heading"><div><p className="eyebrow">YOUR WEIGHTED COMPARISON</p><h2 id="price-score-heading">Purchase price vs overall score</h2><p>Lower price is left; higher score is up. Colours identify the powertrain.</p></div><span className="pill">{money(budget)} target</span></div><div className="insight-power-legend">{powers.map(power => <span key={power}><i style={{ backgroundColor: powertrainColours[power] }} />{powerLabel(power)}</span>)}<span><i className="insight-hollow-key" />Provisional score</span></div>
      {scatterPoints.length ? <><PriceScorePlot points={scatterPoints} selected={scatterSelected} budget={budget} onSelect={setScatterId} /><label className="insight-point-picker"><span>Inspect a car</span><select value={scatterSelected?.vehicle.id ?? ''} onChange={e => setScatterId(e.target.value)}>{scatterPoints.map(p => <option key={p.vehicle.id} value={p.vehicle.id}>{name(p.vehicle)} · {configuration(p.vehicle)}</option>)}</select></label>{scatterSelected && <div className="insight-scatter-detail" aria-live="polite"><div className="insight-scatter-car"><span className="insight-power-label" style={{ color: powertrainColours[scatterSelected.vehicle.powertrain] }}>{powerLabel(scatterSelected.vehicle.powertrain)}</span><h3>{name(scatterSelected.vehicle)}</h3><p>{configuration(scatterSelected.vehicle)}</p><button className="text-button" onClick={() => onDetail(scatterSelected.vehicle)}>Car details & score <ArrowUpRight size={15} /></button></div><div><span>Purchase price</span><strong className={scatterSelected.priceEstimated ? 'estimated-value' : ''}>{money(scatterSelected.price)}</strong><small>{scatterSelected.priceEstimated ? 'Estimate · ' : ''}{scatterSelected.priceBasis} <SourceRefs ids={scatterSelected.sourceIds} /></small></div><div><span>Overall score</span><strong>{formatScore(scatterSelected.score.total)}<small> / 10</small></strong><small>{scatterSelected.score.coverage}% evidence coverage{scatterSelected.score.provisional ? ' · provisional' : ''}</small></div></div>}</> : <p className="insight-empty">No usable price/score pairs. Missing prices or scores are excluded.</p>}
      {scatterPoints.length < vehicles.length && <p className="insight-gap-note">Not plotted: {vehicles.filter(v => !scatterPoints.some(p => p.vehicle.id === v.id)).map(name).join(', ')}. Price or score is unavailable.</p>}
      <p className="insight-footnote">Uses the same weighted scores as Scores & reviews. Unknown categories are excluded; weak evidence has less influence. Purchase prices may have different fee bases. Overlapping dots remain individually available in the selector.</p>
    </section></>}
  </div>;
}
