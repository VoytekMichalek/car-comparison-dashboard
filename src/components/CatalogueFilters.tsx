import { useState } from 'react';
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { defaultFilters, money } from '../lib';
import type { Filters } from '../lib';
import type { Vehicle } from '../types';

export default function CatalogueFilters({ filters, vehicles, count, onChange, context }: {
  filters: Filters; vehicles: Vehicle[]; count: number; onChange: (filters: Filters) => void; context?: string;
}) {
  const [open, setOpen] = useState(() => window.matchMedia('(min-width: 1001px)').matches);
  const active = Object.entries(defaultFilters).filter(([key, value]) => filters[key as keyof Filters] !== value).length;
  const change = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });
  return <details className="panel catalogue-filters" open={open} onToggle={e => setOpen(e.currentTarget.open)}>
    <summary><span><SlidersHorizontal size={17} />Filter cars{active > 0 && <b>{active}</b>}</span><small>{count} matching configurations</small></summary>
    <div className="catalogue-filter-fields">
      <label className="field filter-search"><span>Search cars</span><div className="input-unit"><Search size={16} /><input type="search" value={filters.search} placeholder="Make, model or variant" onChange={e => change('search', e.target.value)} /></div></label>
      <label className="field"><span>Powertrain</span><select value={filters.powertrain} onChange={e => change('powertrain', e.target.value as Filters['powertrain'])}><option value="all">All powertrains</option><option value="BEV">Electric</option><option value="PHEV">Plug-in hybrid</option><option value="HEV">Hybrid</option><option value="PETROL">Petrol</option><option value="DIESEL">Diesel</option></select></label>
      <label className="field"><span>Make</span><select value={filters.make} onChange={e => change('make', e.target.value)}><option value="all">All makes</option>{[...new Set(vehicles.map(v => v.make))].sort().map(make => <option key={make}>{make}</option>)}</select></label>
      <label className="field"><span>Year</span><select value={filters.year} onChange={e => change('year', e.target.value)}><option value="all">All years</option>{[...new Set(vehicles.flatMap(v => v.years))].sort((a, b) => b - a).map(year => <option key={year}>{year}</option>)}</select></label>
      <label className="field"><span>New / used</span><select value={filters.condition} onChange={e => change('condition', e.target.value as Filters['condition'])}><option value="all">New & used</option><option value="new">New stock</option><option value="used">Used stock</option></select></label>
      <label className="field"><span>Seats</span><select value={filters.seats} onChange={e => change('seats', e.target.value as Filters['seats'])}><option value="all">All seat counts</option><option value="7">7 or more</option></select></label>
      <label className="field"><span>Child-seat evidence</span><select value={filters.fit} onChange={e => change('fit', e.target.value as Filters['fit'])}><option value="all">All evidence</option><option value="published">Published fit evidence</option><option value="confirmed">Our fit confirmed</option><option value="unverified">Unverified / limitations</option></select></label>
      <label className="field"><span>Budget target</span><select value={filters.budget} onChange={e => change('budget', Number(e.target.value))}>{[...new Set([30000, 35000, 40000, 45000, 50000, 65000, 90000, 150000, filters.budget])].sort((a, b) => a - b).map(budget => <option key={budget} value={budget}>{money(budget)}</option>)}</select></label>
    </div>
    <div className="catalogue-filter-actions"><label><input type="checkbox" checked={filters.withinBudgetOnly} onChange={e => change('withinBudgetOnly', e.target.checked)} />Within budget only</label><label><input type="checkbox" checked={filters.favourites} onChange={e => change('favourites', e.target.checked)} />Favourites only</label><button className="text-button" onClick={() => onChange({ ...defaultFilters })} disabled={!active}><RotateCcw size={14} />Reset filters</button></div>
    {context && <p className="micro muted filter-context">{context}</p>}
  </details>;
}
