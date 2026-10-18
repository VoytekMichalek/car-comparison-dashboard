import { useRef, useState } from 'react';
import { RotateCcw, ArrowUpRight, SlidersHorizontal } from 'lucide-react';
import { defaultWeights, money, yearLabel } from '../lib';
import { getPrice } from '../data';
import { categoryLabels, categoryRules, scoreVehicle } from '../scoring';
import type { PersonalData, ScoreCategory, ScoreWeights, Vehicle } from '../types';
import { ReviewsPanel, ScoreBreakdown } from '../components/Scores';

export default function Rankings({ vehicles, personal, weights, budget, onWeights, onResetWeights, onDetail }: { vehicles: Vehicle[]; personal: PersonalData; weights: ScoreWeights; budget: number; onWeights: (weights: ScoreWeights) => void; onResetWeights: () => void; onDetail: (v: Vehicle) => void }) {
  const [weightsOpen, setWeightsOpen] = useState(() => window.matchMedia('(min-width: 1001px)').matches);
  const scoreDetail = useRef<HTMLElement>(null);
  const [selectedId, setSelectedId] = useState(vehicles[0]?.familyId);
  const usingDefaults = (Object.keys(defaultWeights) as ScoreCategory[]).every(key => weights[key] === defaultWeights[key]);
  const ranked = vehicles.map(v => ({ v, score: scoreVehicle(v, personal, weights, budget) })).sort((a, b) => b.score.total - a.score.total);
  const selected = vehicles.find(v => v.familyId === selectedId) ?? vehicles[0];
  function inspectScore(familyId: string) {
    setSelectedId(familyId);
    requestAnimationFrame(() => {
      scoreDetail.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      scoreDetail.current?.focus({ preventScroll: true });
    });
  }
  return <div className="page-content rankings-page"><div className="page-heading"><div><p className="eyebrow">RATINGS & PRIORITIES</p><h1>Scores & reviews<span className="heading-dot">.</span></h1><p>Set each category’s importance from 1–10. Rankings update immediately.</p></div><button className="button secondary" onClick={onResetWeights} disabled={usingDefaults} aria-describedby="weight-status"><RotateCcw size={15} />Reset to defaults</button></div><div className="rankings-layout"><details className="panel weights-panel" open={weightsOpen} onToggle={e => setWeightsOpen(e.currentTarget.open)}><summary><SlidersHorizontal size={18} /><strong>Category importance</strong></summary><p className="micro muted">1 = low importance · 10 = high importance</p><p className="weight-status" id="weight-status" role="status">{usingDefaults ? 'Default weights are active.' : 'Custom weights are active. Reset restores the original category priorities.'}</p>{(Object.keys(categoryLabels) as ScoreCategory[]).map(key => <div className="weight-control" key={key}><label htmlFor={`weight-${key}`}>{categoryLabels[key]}</label><output htmlFor={`weight-${key}`}>{weights[key]}</output><input id={`weight-${key}`} type="range" min="1" max="10" step="1" value={weights[key]} aria-label={`${categoryLabels[key]} importance`} onChange={e => onWeights({ ...weights, [key]: Number(e.target.value) })} /><details><summary>Scoring rule</summary><p>{categoryRules[key]}</p></details></div>)}<p className="micro muted">Saved on this browser. Shared comparison links include the weights, but exclude your quotes and personal fit confirmations.</p></details><section className="panel ranking-results"><div className="section-title"><h2>Current ranking</h2><span className="pill">{money(budget)} purchase target</span></div><p className="micro muted">Selected year/variant from Browse. Seat-fit limitations remain a separate check.</p><div className="ranked-list">{ranked.map(({ v, score }, index) => <button key={v.id} className={`rank-row ${v.id === selected.id ? 'selected' : ''}`} onClick={() => inspectScore(v.familyId)}><span className="rank-number">{String(index + 1).padStart(2, '0')}</span><span className="rank-car"><strong>{v.make} {v.model}</strong><small>{yearLabel(v)} · {v.variant}</small><span className="rank-bar"><span style={{ width: `${score.total * 10}%` }} /></span></span><span className="rank-score"><strong>{score.total.toFixed(1)}<small>/10</small></strong><span>{score.coverage}% evidence</span>{getPrice(v.id)?.low != null && getPrice(v.id)!.low! > budget && <small>Over budget</small>}</span></button>)}</div></section></div><section ref={scoreDetail} tabIndex={-1} className="scoring-car-selection"><div><span className="eyebrow">SELECT A CAR ABOVE TO INSPECT ITS SCORE</span><h2>{selected.make} {selected.model} <span>{yearLabel(selected)} · {selected.variant}</span></h2></div><button className="button secondary" onClick={() => onDetail(selected)}>Vehicle details <ArrowUpRight size={15} /></button></section><div className="rating-detail-grid"><ScoreBreakdown score={scoreVehicle(selected, personal, weights, budget)} /><ReviewsPanel vehicle={selected} /></div></div>;
}
