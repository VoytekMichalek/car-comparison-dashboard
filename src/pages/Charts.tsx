import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { ArrowUpRight, ChartNoAxesCombined, Filter, Info } from 'lucide-react';
import { SourceRefs } from '../components/Shared';
import { AnnualCostChart } from '../components/AnnualCostChart';
import { vehicles as catalogue } from '../data';
import { depreciationSeries, formatPurchaseChange, depreciationCars, powertrainColours, priceScorePoints, seriesColours } from '../charts';
import type { DepreciationSeries, PriceScorePoint } from '../charts';
import { money, powerLabel, yearLabel } from '../lib';
import { formatScore } from '../scoring';
import { pointLabelPosition, scoreAxis, yearLabelStep } from '../chartLayout';
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
  const descriptionId = useId();
  const narrow = width < 560;
  const height = narrow ? 330 : 420;
  const left = narrow ? 48 : 66, right = narrow ? 16 : 38, top = 44, bottom = height - 42;
  const maxValue = Math.max(10000, Math.ceil(Math.max(...series.flatMap(s => s.points.map(p => p.value))) / 10000) * 10000);
  const x = (value: number) => left + value / horizon * (width - left - right);
  const y = (value: number) => bottom - value / maxValue * (bottom - top);
  const focused = series.find(s => s.vehicle.id === focusedId);
  const ordered = series;
  const labelStep = yearLabelStep(width, horizon);
  return <div ref={ref} className="insight-plot"><svg viewBox={`0 0 ${width} ${height}`} className="depreciation-svg" aria-label={`Estimated vehicle value over ${horizon} years`} aria-describedby={descriptionId} role="group">
    <desc id={descriptionId}>Each line is a selected car. Choose a car in the legend to highlight it and inspect its annual points. Choose it again or use Show all equally to clear the highlight. All values are Australian dollars and scenario estimates.</desc>
    <text className="insight-axis-title" x={left} y={20}>Value (AUD)</text>
    {[0, .25, .5, .75, 1].map(t => <g key={t}><line className="insight-grid" x1={left} x2={width - right} y1={y(maxValue * t)} y2={y(maxValue * t)} /><text className="insight-tick" x={left - 9} y={y(maxValue * t) + 4} textAnchor="end">{shortMoney(maxValue * t)}</text></g>)}
    {Array.from({ length: horizon + 1 }, (_, i) => i).filter(i => !narrow || horizon <= 5 || i % 2 === 0 || i === horizon).map(i => <text className="insight-tick" x={x(i)} y={bottom + 22} key={i} textAnchor="middle">{i === 0 ? 'Now' : i}</text>)}
    <text className="insight-axis-title" x={width - right} y={height - 2} textAnchor="end">Years from purchase</text>
    {focused && <line className="insight-cursor" x1={x(year)} x2={x(year)} y1={top} y2={bottom} />}
    {ordered.map(s => { const colour = seriesColour(s.vehicle); const active = s === focused; return <g className={`insight-series ${active ? 'is-focused' : ''}`} key={s.vehicle.id}>
      <path d={s.points.map((p, i) => `${i ? 'L' : 'M'}${x(p.year)},${y(p.value)}`).join(' ')} fill="none" stroke={colour} strokeWidth={active ? 3.5 : 2} opacity={!focused || active ? 1 : .6} />
      {s.points.map(p => <g key={p.year} tabIndex={active ? 0 : -1} role="button" className="insight-year-point" aria-label={`${name(s.vehicle)}, ${p.year === 0 ? 'purchase today' : `year ${p.year}`}: ${money(p.value)} estimated value, ${money(Math.abs(p.loss))} ${p.loss < 0 ? 'gain' : 'loss'} from purchase`} aria-pressed={active && p.year === year} onClick={() => { onFocus(active && p.year === year ? '' : s.vehicle.id); onYear(p.year); }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onFocus(active && p.year === year ? '' : s.vehicle.id); onYear(p.year); } }}>
        <circle className="point-hit-target" cx={x(p.year)} cy={y(p.value)} r={narrow ? 9 : 11} />
        {active && p.year === year && <circle cx={x(p.year)} cy={y(p.value)} r={8} fill="white" stroke={colour} strokeWidth={1.5} />}
        <circle cx={x(p.year)} cy={y(p.value)} r={active ? 4.5 : 2.5} fill={active ? colour : 'white'} stroke={colour} strokeWidth={1.5} />
        {active && (p.year === year || !narrow && (p.year % labelStep === 0 || p.year === horizon)) && <text className="year-value-label" x={x(p.year)} y={y(p.value) - 13} textAnchor={p.year === 0 ? 'start' : p.year === horizon ? 'end' : 'middle'}>{shortMoney(p.value)}</text>}
      </g>)}
    </g>; })}
    {focused && <path className="focused-line-overlay" pointerEvents="none" d={focused.points.map((p, i) => `${i ? 'L' : 'M'}${x(p.year)},${y(p.value)}`).join(' ')} fill="none" stroke={seriesColour(focused.vehicle)} strokeWidth="3.5" />}
  </svg></div>;
}

export function PriceScorePlot({ points, selected, budget, fullScale, onSelect }: { points: PriceScorePoint[]; selected?: PriceScorePoint; budget: number; fullScale: boolean; onSelect: (id: string) => void }) {
  const { ref, width } = usePlotWidth();
  const descId = useId();
  const tooltipId = useId();
  const [hoveredId, setHoveredId] = useState('');
  const [keyboardId, setKeyboardId] = useState('');
  const inspected = points.find(point => point.vehicle.id === (hoveredId || keyboardId));
  const narrow = width < 560;
  const height = narrow ? 380 : 460;
  const left = narrow ? 46 : 56, right = narrow ? 18 : 30, top = 52, bottom = height - 50;
  const maxPrice = Math.max(10000, Math.ceil(Math.max(budget, ...points.map(p => p.price)) / 10000) * 10000);
  const axis = scoreAxis(points.map(p => p.score.total!), fullScale);
  const x = (value: number) => left + value / maxPrice * (width - left - right);
  const y = (value: number) => bottom - (value - axis.min) / (axis.max - axis.min) * (bottom - top);
  const box = selected ? pointLabelPosition(x(selected.price), y(selected.score.total!), width, left, right, top, bottom) : undefined;
  const tooltipWidth = Math.min(310, width - 16);
  const tooltipPosition = inspected ? { left: Math.max(8, Math.min(x(inspected.price) - tooltipWidth / 2, width - tooltipWidth - 8)), top: Math.max(34, Math.min(y(inspected.score.total!) + 20, height - 238)), width: tooltipWidth } : undefined;
  const targetNearLeft = x(budget) < left + 90;
  return <div ref={ref} className="insight-plot price-score-plot" onPointerLeave={() => setHoveredId('')}><svg viewBox={`0 0 ${width} ${height}`} className="price-score-svg" role="group" aria-label="Purchase price versus score excluding purchase price" aria-describedby={descId}>
    <desc id={descId}>Each filled dot is one filtered car. Its weighted score excludes the purchase-price category and its weight. Visible score axis: {axis.min} to {axis.max} out of 10. Colour identifies powertrain; a dashed outline identifies a provisional score. Hover or keyboard-focus a dot for its details. Click, tap or press Enter to retain a highlight. Activate it again to clear the highlight.</desc>
    <text className="insight-axis-title" x={left} y={20}>Score / 10 · price excluded</text>
    {axis.ticks.map(score => <g key={score}><line className="insight-grid" x1={left} x2={width - right} y1={y(score)} y2={y(score)} /><text className="insight-tick" x={left - 10} y={y(score) + 4} textAnchor="end">{score.toFixed(1)}</text></g>)}
    {[0, .25, .5, .75, 1].map(t => <g key={t}><line className="insight-grid insight-vertical-grid" x1={x(t * maxPrice)} x2={x(t * maxPrice)} y1={top} y2={bottom} /><text className="insight-tick" x={x(t * maxPrice)} y={bottom + 25} textAnchor={t === 1 ? 'end' : t === 0 ? 'start' : 'middle'}>{shortMoney(t * maxPrice)}</text></g>)}
    <line className="insight-budget-line" x1={x(budget)} x2={x(budget)} y1={top} y2={bottom} /><text className="insight-budget-label" x={targetNearLeft ? x(budget) + 5 : x(budget) - 5} y={top - 10} textAnchor={targetNearLeft ? 'start' : 'end'}>{shortMoney(budget)} target</text>
    {selected && <g className="insight-selected-guides" pointerEvents="none"><line x1={left} x2={x(selected.price)} y1={y(selected.score.total!)} y2={y(selected.score.total!)} /><line x1={x(selected.price)} x2={x(selected.price)} y1={y(selected.score.total!)} y2={bottom} /></g>}
    {points.map(p => { const active = p === selected; const colour = powertrainColours[p.vehicle.powertrain]; return <g key={p.vehicle.id} tabIndex={0} role="button" className={`insight-score-point ${active ? 'is-selected' : ''}`} aria-label={`${name(p.vehicle)}, ${configuration(p.vehicle)}, ${powerLabel(p.vehicle.powertrain)}: ${money(p.price)}, score excluding purchase price ${formatScore(p.score.total)} out of 10, ${p.score.coverage}% evidence${p.score.provisional ? ', provisional' : ''}`} aria-pressed={active} aria-describedby={p === inspected ? tooltipId : undefined} onPointerEnter={event => { if (event.pointerType !== 'touch') setHoveredId(p.vehicle.id); }} onPointerLeave={() => setHoveredId(current => current === p.vehicle.id ? '' : current)} onFocus={event => { if (event.currentTarget.matches(':focus-visible')) setKeyboardId(p.vehicle.id); }} onBlur={() => setKeyboardId(current => current === p.vehicle.id ? '' : current)} onClick={() => onSelect(p.vehicle.id)} onKeyDown={e => { if (e.key === 'Escape') { setHoveredId(''); setKeyboardId(''); } if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(p.vehicle.id); } }}>
      <circle className="point-hit-target" cx={x(p.price)} cy={y(p.score.total!)} r="15" />
      {active && <circle cx={x(p.price)} cy={y(p.score.total!)} r="13" fill="white" stroke={colour} strokeWidth="1.5" />}
      <circle className="insight-score-dot" cx={x(p.price)} cy={y(p.score.total!)} r={active ? 8 : 7} fill={colour} stroke={p.score.provisional ? '#172c25' : colour} strokeWidth={p.score.provisional ? 1.7 : 1.5} strokeDasharray={p.score.provisional ? '2 2' : undefined} />
      {active && <circle cx={x(p.price)} cy={y(p.score.total!)} r="2.5" fill={colour} />}
    </g>; })}
    {selected && box && <g className="insight-dot-label" pointerEvents="none" aria-hidden="true"><circle cx={x(selected.price)} cy={y(selected.score.total!)} r="14" fill="none" stroke={powertrainColours[selected.vehicle.powertrain]} strokeWidth="2" /><line x1={x(selected.price)} y1={y(selected.score.total!)} x2={Math.max(box.x, Math.min(x(selected.price), box.x + box.width))} y2={box.y + box.height / 2} stroke={powertrainColours[selected.vehicle.powertrain]} /><rect x={box.x} y={box.y} width={box.width} height={box.height} rx="6" fill="white" stroke={powertrainColours[selected.vehicle.powertrain]} /><text x={box.x + 10} y={box.y + 22} className="insight-dot-name" textLength={selected.vehicle.model.length * 7 > box.width - 20 ? box.width - 20 : undefined} lengthAdjust="spacingAndGlyphs">{selected.vehicle.model}</text><text x={box.x + 10} y={box.y + 42} className="insight-dot-value">{money(selected.price)} · {formatScore(selected.score.total)}/10</text></g>}
    <text className="insight-axis-title" x={width - right} y={height - 2} textAnchor="end">Purchase price (AUD)</text>
  </svg>{inspected && tooltipPosition && <PriceScoreTooltip point={inspected} id={tooltipId} style={tooltipPosition} />}</div>;
}

export function PriceScoreTooltip({ point, id, style }: { point: PriceScorePoint; id: string; style?: CSSProperties }) {
  return <div id={id} role="tooltip" className="insight-hover-tooltip" style={style}>
    <strong>{name(point.vehicle)}</strong><span>{configuration(point.vehicle)}</span><span className="insight-tooltip-power" style={{ color: powertrainColours[point.vehicle.powertrain] }}>{powerLabel(point.vehicle.powertrain)}</span>
    <dl><div><dt>Purchase price</dt><dd className={point.priceEstimated ? 'estimated-value' : ''}>{money(point.price)}{point.priceEstimated && <small>Estimate</small>}</dd></div><div><dt>Score · price excluded</dt><dd>{formatScore(point.score.total)}<small>/ 10</small></dd></div></dl>
    <span>{point.score.coverage}% evidence coverage{point.score.provisional ? ' · Provisional score' : ''}</span><small>{point.priceBasis}</small>
  </div>;
}

export default function Charts({ filterBar, vehicles, personal, weights, budget, onDetail }: { filterBar?: ReactNode; vehicles: Vehicle[]; personal: PersonalData; weights: ScoreWeights; budget: number; onDetail: (v: Vehicle) => void }) {
  const [selectedFamilies, setSelectedFamilies] = useState<string[] | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [carSearch, setCarSearch] = useState('');
  const pickerId = useId();
  const [horizon, setHorizon] = useState(10);
  const [focusId, setFocusId] = useState('');
  const [focusYear, setFocusYear] = useState(5);
  const [scatterId, setScatterId] = useState('');
  const [fullScoreScale, setFullScoreScale] = useState(false);
  const selectedCars = depreciationCars(vehicles, selectedFamilies);
  const pickerCars = vehicles.filter(v => `${name(v)} ${configuration(v)} ${powerLabel(v.powertrain)}`.toLowerCase().includes(carSearch.trim().toLowerCase()));
  const series = useMemo(() => selectedCars.flatMap(v => { const s = depreciationSeries(v, personal, horizon); return s ? [s] : []; }), [selectedCars, personal, horizon]);
  const focused = series.find(s => s.vehicle.id === focusId);
  const selectedYear = Math.min(focusYear, horizon);
  const selectedPoint = focused?.points.find(p => p.year === selectedYear);
  const scatterPoints = useMemo(() => priceScorePoints(vehicles, personal, weights, budget), [vehicles, personal, weights, budget]);
  const scatterSelected = scatterPoints.find(p => p.vehicle.id === scatterId);
  const scatterAxis = scoreAxis(scatterPoints.map(p => p.score.total!), fullScoreScale);
  const powers = (['BEV', 'PHEV', 'HEV', 'PETROL', 'DIESEL'] as Powertrain[]).filter(power => scatterPoints.some(p => p.vehicle.powertrain === power));
  function toggleCar(v: Vehicle) {
    setSelectedFamilies(current => {
      const base = current ?? vehicles.map(car => car.familyId);
      return base.includes(v.familyId) ? base.filter(id => id !== v.familyId) : [...base, v.familyId];
    });
  }
  return <div className="page-content charts-page"><div className="page-heading"><div><p className="eyebrow">PRICE, VALUE & PRIORITIES</p><h1>Charts<span className="heading-dot">.</span></h1><p>Explore resale scenarios and the value behind your weighted scores.</p></div><div className="heading-icon"><ChartNoAxesCombined size={30} strokeWidth={1.2} /></div></div>{filterBar}
    {!vehicles.length ? <p className="panel insight-empty">No cars match these filters. Change or reset the filters to see the charts.</p> : <>
    <p className="insight-filter-note">{vehicles.length} model {vehicles.length === 1 ? 'family' : 'families'} · selected Browse year/variant · your saved prices, cost inputs and category weights apply.</p>
    <section className="panel insight-panel" aria-labelledby="depreciation-heading"><div className="insight-panel-heading"><div><p className="eyebrow">SCENARIO ESTIMATE</p><h2 id="depreciation-heading">Expected depreciation</h2><p>Estimated car value from purchase today. Each point is one year; percentages show the change from that purchase price.</p></div><label className="insight-horizon"><span>Chart horizon</span><select value={horizon} onChange={e => setHorizon(Number(e.target.value))}>{[3, 5, 10].map(n => <option value={n} key={n}>{n} years</option>)}</select></label></div>
      <div className="insight-estimate-note"><Info size={17} /><p>Broad powertrain assumptions, not individual car forecasts. Your resale inputs in Ownership costs replace the default curve. Resale values are uncertain.</p></div>
      <div className="insight-car-filter">
        <div className="insight-car-filter-heading"><div><strong>Cars on this chart</strong><p aria-live="polite">{selectedCars.length === vehicles.length ? `All ${vehicles.length} cars included` : `${selectedCars.length} of ${vehicles.length} cars included`}</p></div><div className="insight-car-filter-buttons"><button className="button primary" aria-expanded={pickerOpen} aria-controls={pickerId} onClick={() => setPickerOpen(open => !open)}><Filter size={16} />{pickerOpen ? 'Close car filter' : 'Filter cars'}</button><button className="button secondary" onClick={() => setSelectedFamilies(null)} disabled={selectedFamilies === null}>Show all cars</button></div></div>
        {pickerOpen && <div id={pickerId} className="insight-car-picker"><div className="insight-picker-actions"><label className="insight-car-search"><span>Search cars</span><input type="search" value={carSearch} onChange={e => setCarSearch(e.target.value)} placeholder="Make, model or powertrain" /></label><button className="text-button" onClick={() => setSelectedFamilies([])}>Clear selection</button></div><p className="insight-picker-help">Tick cars to include their lines. This filter only changes depreciation.</p><div className="insight-car-options" role="group" aria-label="Cars included in depreciation">{pickerCars.map(v => <label key={v.id}><input type="checkbox" checked={selectedFamilies === null || selectedFamilies.includes(v.familyId)} onChange={() => toggleCar(v)} /><span className="insight-swatch" style={{ backgroundColor: seriesColour(v) }} /><span><strong>{name(v)}</strong><small>{configuration(v)}</small></span></label>)}</div>{!pickerCars.length && <p className="insight-picker-help">No cars match your search. Your chart selection is unchanged.</p>}</div>}
      </div>
      {series.length ? <><div className="insight-line-toolbar"><div><p className="insight-legend-caption">{selectedYear === 0 ? 'At purchase' : `At year ${selectedYear}`} · change from your purchase price</p><p className="insight-line-help">Click a car to highlight it. Click it again to clear.</p></div><div className="insight-line-controls"><label><span>Inspect year</span><select value={selectedYear} onChange={e => setFocusYear(Number(e.target.value))}>{Array.from({ length: horizon + 1 }, (_, year) => <option key={year} value={year}>{year === 0 ? 'Now · purchase' : `Year ${year}`}</option>)}</select></label><button className="button secondary" onClick={() => setFocusId('')}>Show all equally</button></div></div><DepreciationPlot series={series} focusedId={focused?.vehicle.id ?? ''} onFocus={setFocusId} year={selectedYear} onYear={setFocusYear} horizon={horizon} /><div className="insight-line-legend" aria-label="Highlight a car’s depreciation values">{series.map(s => <button key={s.vehicle.id} aria-pressed={focused?.vehicle.id === s.vehicle.id} className={focused?.vehicle.id === s.vehicle.id ? 'is-active' : ''} onClick={() => setFocusId(focused?.vehicle.id === s.vehicle.id ? '' : s.vehicle.id)}><span className="insight-swatch" style={{ backgroundColor: seriesColour(s.vehicle) }} /><span className="insight-legend-car"><strong>{name(s.vehicle)}</strong><small>{money(s.points[selectedYear].value)}</small><small>{formatPurchaseChange(s.points[selectedYear].changePercent)}</small></span></button>)}</div>
      {focused && selectedPoint && <><div className="insight-focus-bar"><div><span className="eyebrow">FOCUSED CAR</span><h3>{name(focused.vehicle)}</h3><p>{configuration(focused.vehicle)}</p></div><button className="text-button" onClick={() => onDetail(focused.vehicle)}>Car details <ArrowUpRight size={15} /></button></div><div className="insight-selected-values" aria-live="polite"><div><span>{selectedYear === 0 ? 'Purchase price' : `Value at year ${selectedYear}`}</span><strong className={selectedYear === 0 ? '' : 'estimated-value'}>{money(selectedPoint.value)}</strong></div><div><span>{selectedPoint.loss < 0 ? 'Gain' : 'Depreciation'} from purchase</span><strong className="estimated-value">{money(Math.abs(selectedPoint.loss))}</strong><small className="insight-value-change">{formatPurchaseChange(selectedPoint.changePercent)}</small></div><div><span>{focused.customResale ? 'Your resale anchor' : 'Illustrative value range'}</span><strong className="estimated-value">{focused.customResale ? `${money(focused.anchorValue)} at year ${focused.anchorYears}` : `${money(selectedPoint.low)}–${money(selectedPoint.high)}`}</strong></div></div>
      <div className="insight-year-values" aria-label={`Annual estimated values for ${name(focused.vehicle)}`}>{focused.points.map(p => <button key={p.year} aria-pressed={selectedYear === p.year} onClick={() => setFocusYear(p.year)}><span>{p.year === 0 ? 'Now' : `Year ${p.year}`}</span><strong>{money(p.value)}</strong><small title={formatPurchaseChange(p.changePercent)}>{formatPurchaseChange(p.changePercent).replace(' from purchase', '')}</small></button>)}</div>
      <p className="insight-method-note">{focused.note} <SourceRefs ids={focused.sourceIds} />{!focused.customResale && ' Yellow values and ranges are estimates, not statistical confidence intervals. Values after purchase are rounded to A$100.'}</p></>}
      <details className="insight-value-data"><summary>Yearly values for all selected cars</summary><div className="insight-data-cars">{series.map(s => <section key={s.vehicle.id}><h3>{name(s.vehicle)}</h3><p>{configuration(s.vehicle)}</p><dl>{s.points.map(p => <div key={p.year}><dt>{p.year === 0 ? 'Purchase' : `Year ${p.year}`}</dt><dd>{money(p.value)}<small>{formatPurchaseChange(p.changePercent)}</small></dd></div>)}</dl></section>)}</div></details></> : <p className="insight-empty">{selectedCars.length ? 'No usable purchase/resale values for this selection. Enter a valid purchase and resale assumption in Ownership costs.' : 'No cars selected for these page filters. Open Filter cars or choose Show all cars.'}</p>}
      {selectedCars.length > series.length && <p className="insight-gap-note">Withheld: {selectedCars.filter(v => !series.some(s => s.vehicle.id === v.id)).map(name).join(', ')}. Purchase/resale values are missing or cannot define a valid curve.</p>}
      <p className="insight-footnote">This chart shows the car’s value, not running costs or total ownership cost. Same powertrain rates can produce similar lines. Changing the chart horizon does not change your saved ownership period.</p>
    </section>
    <section className="panel insight-panel" aria-labelledby="price-score-heading"><div className="insight-panel-heading"><div><p className="eyebrow">YOUR WEIGHTED COMPARISON</p><h2 id="price-score-heading">Purchase price vs score</h2><p>Overall score excluding purchase price. Your other category weights still apply.</p></div><span className="pill">{money(budget)} target</span></div><div className="insight-power-legend">{powers.map(power => <span key={power}><i style={{ backgroundColor: powertrainColours[power] }} />{powerLabel(power)}</span>)}<span><i className="insight-provisional-key" />Dashed outline · provisional</span></div>
      {scatterPoints.length ? <><div className="insight-plot-toolbar"><label><span>Score axis</span><select value={fullScoreScale ? 'full' : 'focused'} onChange={e => setFullScoreScale(e.target.value === 'full')}><option value="focused">Focus on these cars</option><option value="full">Full scale · 1–10</option></select></label><p><strong>{scatterAxis.min.toFixed(1)}–{scatterAxis.max.toFixed(1)}</strong> visible · out of 10<br />Hover or focus for details. Click, tap or press Enter to keep a highlight.</p><button className="button secondary" onClick={() => setScatterId('')}>Show all equally</button></div><PriceScorePlot fullScale={fullScoreScale} points={scatterPoints} selected={scatterSelected} budget={budget} onSelect={id => setScatterId(current => current === id ? '' : id)} /><label className="insight-point-picker"><span>Inspect a car</span><select value={scatterSelected?.vehicle.id ?? ''} onChange={e => setScatterId(e.target.value)}><option value="">No highlight · all cars equally</option>{scatterPoints.map(p => <option key={p.vehicle.id} value={p.vehicle.id}>{name(p.vehicle)} · {configuration(p.vehicle)}</option>)}</select></label>{scatterSelected && <div className="insight-scatter-detail" aria-live="polite"><div className="insight-scatter-car"><span className="insight-power-label" style={{ color: powertrainColours[scatterSelected.vehicle.powertrain] }}>{powerLabel(scatterSelected.vehicle.powertrain)}</span><h3>{name(scatterSelected.vehicle)}</h3><p>{configuration(scatterSelected.vehicle)}</p><button className="text-button" onClick={() => onDetail(scatterSelected.vehicle)}>Car details & score <ArrowUpRight size={15} /></button></div><div><span>Purchase price</span><strong className={scatterSelected.priceEstimated ? 'estimated-value' : ''}>{money(scatterSelected.price)}</strong><small>{scatterSelected.priceEstimated ? 'Estimate · ' : ''}{scatterSelected.priceBasis} <SourceRefs ids={scatterSelected.sourceIds} /></small></div><div><span>Score · purchase price excluded</span><strong>{formatScore(scatterSelected.score.total)}<small> / 10</small></strong><small>{scatterSelected.score.coverage}% evidence coverage{scatterSelected.score.provisional ? ' · provisional' : ''}</small></div></div>}</> : <p className="insight-empty">No usable price/score pairs. Missing prices or scores are excluded.</p>}
      {scatterPoints.length < vehicles.length && <p className="insight-gap-note">Not plotted: {vehicles.filter(v => !scatterPoints.some(p => p.vehicle.id === v.id)).map(name).join(', ')}. Price or score is unavailable.</p>}
      <p className="insight-footnote">Purchase price and its category weight are excluded from this graph’s score and evidence coverage. Other applicable categories use your selected weights. Electric range is scored only for battery-only EVs; PHEV range is excluded. Unknown data is excluded and weak evidence has less influence. Purchase prices may have different fee bases. Overlapping dots remain individually available in the selector.</p>
    </section>
    <AnnualCostChart vehicles={vehicles} personal={personal} onDetail={onDetail} /></>}
  </div>;
}
