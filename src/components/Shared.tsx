import { ExternalLink, ImageOff, ArrowUpRight, Check, Plus, Heart, Star } from 'lucide-react';
import { imageFor, sourceMap } from '../data';
import { isFuelOnly, isPlugIn, fitLabel, money, number, powerLabel, rangeStandard, yearLabel } from '../lib';
import type { Fact, ImageAsset, PriceSnapshot, Vehicle } from '../types';
import { formatScore } from '../scoring';
import type { ScoreResult } from '../scoring';

export function SourceRefs({ ids }: { ids: string[] }) {
  return <span className="source-refs">{[...new Set(ids)].map((id, i) => { const s = sourceMap.get(id); return s ? <a key={id} href={s.url} target="_blank" rel="noreferrer" aria-label={`Source: ${s.title}`} title={s.title}>[{i + 1}]</a> : null; })}</span>;
}
export function FactValue({ fact }: { fact: Fact }) {
  return fact.value === null ? <span className="muted">{/^not applicable/i.test(fact.basis) ? 'Not applicable' : 'Not verified'}</span> : <>{number(fact.value)} <span className="unit">{fact.unit}</span></>;
}
export function Photo({ vehicle, className = '' }: { vehicle: Vehicle; className?: string }) {
  const asset = imageFor(vehicle);
  return asset ? <img className={className} src={`${import.meta.env.BASE_URL}${asset.path.slice(1)}`} alt={asset.alt} loading="lazy" onError={e => { e.currentTarget.hidden = true; e.currentTarget.parentElement?.classList.add('image-failed'); }} /> : <div className={`photo-placeholder ${className}`}><ImageOff size={30} strokeWidth={1.2} /><span>{vehicle.make} {vehicle.model}</span><small>Generation photo not yet available</small></div>;
}
export function Credit({ asset }: { asset?: ImageAsset }) {
  return asset ? <p className="photo-credit">{asset.generation} · <a href={asset.sourceUrl} target="_blank" rel="noreferrer">Photo: {asset.credit}</a> · <a href={asset.licenseUrl} target="_blank" rel="noreferrer">{asset.license}</a>{asset.note && <span> · {asset.note}</span>}</p> : <p className="photo-credit">A verified, reusable photo for this generation has not been sourced.</p>;
}
export function FitBadge({ vehicle, confirmed = false }: { vehicle: Vehicle; confirmed?: boolean }) {
  const positive = confirmed || vehicle.familyFit.status.startsWith('tested');
  return <span className={`fit-badge ${positive ? 'positive' : 'caution'}`}><span className="status-dot" />{confirmed ? 'Your fit confirmed' : fitLabel(vehicle)}</span>;
}
export function Price({ price, compact = false }: { price?: PriceSnapshot; compact?: boolean }) {
  if (!price || price.low === null) return <><span className="price unknown-price">Price to verify</span><span className="price-caption">Research gap · no verified asking sample</span></>;
  const estimated = price.kind === 'estimate' || price.confidence === 'low' || price.basis === 'unverified' || price.basis === 'mixed';
  const observations = price.observations ?? [];
  const years = observations.map(o => o.year).filter((year): year is number => year !== null);
  const lowYear = Math.min(...years), highYear = Math.max(...years);
  const missingYears = observations.length - years.length;
  const yearContext = years.length ? `${lowYear === highYear ? String(lowYear) : `${lowYear}–${String(highYear).slice(2)}`}${missingYears ? `; ${missingYears} year unverified` : ''}` : observations.length ? 'Year unverified' : null;
  return <><span className={`price ${estimated ? 'estimated-value' : ''}`} title={price.estimateBasis ?? price.note}>{money(price.low, compact)}{price.high !== null && price.high !== price.low ? <span className="price-high">–{money(price.high, compact)}</span> : null}</span><span className="price-caption">{estimated ? 'Estimate' : price.condition === 'used' ? 'Used asking' : 'New asking'} · {price.basis === 'drive-away' ? 'drive-away' : price.basis === 'excludes-charges' ? 'excl. charges' : 'fee basis varies'}{price.sampleCount > 0 ? ` · n=${price.sampleCount}` : ''}{yearContext && <span className="price-sample-context">Priced cars: {yearContext}</span>}</span></>;
}
export function VehicleCard({ vehicle: v, options, price, favourite, compared, confirmed, score, detailHref, scoreHref, onScore, onVariant, onDetail, onFavourite, onCompare }: {
  vehicle: Vehicle; options: Vehicle[]; price?: PriceSnapshot; favourite: boolean; compared: boolean; confirmed: boolean;
  onVariant: (v: Vehicle) => void; onDetail: (v: Vehicle) => void; onFavourite: (id: string) => void; onCompare: (id: string) => void;
  score: ScoreResult; onScore: (v: Vehicle) => void;
  detailHref: string; scoreHref: string;
}) {
  const isHybrid = isFuelOnly(v.powertrain);
  function follow(e: React.MouseEvent<HTMLAnchorElement>, open: () => void) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    open();
  }
  return <article className="vehicle-card">
    <div className="card-photo"><Photo vehicle={v} /><span className={`power-badge ${v.powertrain.toLowerCase()}`}>{powerLabel(v.powertrain)}</span><button className={`icon-button favourite ${favourite ? 'is-favourite' : ''}`} onClick={() => onFavourite(v.id)} aria-label={`${favourite ? 'Unsave' : 'Save'} ${v.make} ${v.model}`} aria-pressed={favourite}><Heart size={17} fill={favourite ? 'currentColor' : 'none'} /></button><span className="reference-photo">Reference photo</span></div>
    <div className="card-body"><div className="card-heading"><div><p className="make-label">{v.make}</p><h3><a className="card-title-link" href={detailHref} onClick={e => follow(e, () => onDetail(v))} aria-label={`View ${v.make} ${v.model} ${yearLabel(v)} ${v.variant} details`}>{v.model}</a></h3></div><a className="score-badge" href={scoreHref} onClick={e => follow(e, () => onScore(v))} aria-label={`${score.total === null ? 'Insufficient score data' : `Overall score ${formatScore(score.total)} out of 10`} for ${v.make} ${v.model}. ${score.coverage}% evidence coverage${score.provisional ? '; provisional' : ''}. View score breakdown.`}><Star size={12} fill="currentColor" /><strong>{formatScore(score.total)}</strong>{score.total !== null && <span>/10</span>}</a></div>
      <label className="variant-select"><span className="sr-only">{v.make} {v.model} year and variant</span><select value={v.id} onChange={e => { const selected = options.find(o => o.id === e.target.value); if (selected) onVariant(selected); }}>{options.map(o => <option key={o.id} value={o.id}>{yearLabel(o)} · {o.variant}</option>)}</select></label>
      <div className="card-price"><Price price={price} /></div>
      <div className="card-specs"><div><span className="spec-label">{isHybrid ? 'Fuel use' : 'Electric range'}</span><strong>{isHybrid ? <FactValue fact={v.consumption} /> : <FactValue fact={v.range} />}</strong><small>{isHybrid ? 'Combined' : v.range.value === null ? 'Evidence gap' : rangeStandard(v.range)}</small></div><div><span className="spec-label">Seats</span><strong>{v.seats}</strong><small>{v.seats > 5 ? '3 rows' : '2 rows'}</small></div><div><span className="spec-label">Boot</span><strong><FactValue fact={v.boot} /></strong><small>{v.seats > 5 ? 'Third row folded' : 'Rear seats up'}</small></div></div>
      <FitBadge vehicle={v} confirmed={confirmed} />
      <p className="card-evidence">{score.coverage}% evidence coverage{score.provisional ? ' · Provisional' : ''} · {confirmed ? 'Your fit confirmed' : 'Your seat fit pending'}</p>
    </div>
    <div className="card-footer"><a className="text-button" href={detailHref} onClick={e => follow(e, () => onDetail(v))}>View car details <ArrowUpRight size={16} /></a><button className={`compare-button ${compared ? 'selected' : ''}`} onClick={() => onCompare(v.id)} aria-label={`${compared ? 'Remove' : 'Add'} ${v.make} ${v.model} ${v.variant} ${compared ? 'from' : 'to'} comparison`} aria-pressed={compared}>{compared ? <Check size={14} /> : <Plus size={14} />}<span>Compare</span></button></div>
  </article>;
}
export function External({ href, children }: { href: string; children: React.ReactNode }) { return <a href={href} target="_blank" rel="noreferrer">{children} <ExternalLink size={12} className="inline-icon" /></a>; }
