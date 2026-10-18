import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutGrid, Columns3, UsersRound, Calculator, NotebookPen, ArrowUpRight, ArrowRight, MapPin, Search, SlidersHorizontal, Heart, ChevronDown, X, PlugZap, Check, ShieldCheck, BookOpen, Info, Share2, Menu, Leaf, ExternalLink, Star, LineChart } from 'lucide-react';
import { vehicles, vehicleIds, vehicleMap, getPrice, images, sources, prices } from './data';
import { activeFilterCount, CHECKED_DATE, chooseComparison, comparisonVehicles, defaultFilters, defaultWeights, filterVehicles, FIT_REVIEW_NOTICE, formatDate, money, parseHash, priceGroup, publicHash, readPersonal, toggleComparison, writePersonal, yearLabel } from './lib';
import type { Filters, PublicState, VehicleSection, View } from './lib';
import type { PersonalData, ScoreWeights, Vehicle } from './types';
import { VehicleCard } from './components/Shared';
import VehicleDetails from './pages/VehicleDetails';
import Notebook from './pages/Notebook';
import Ownership from './pages/Ownership';
import Rankings from './pages/Rankings';
import Charts from './pages/Charts';
import { scoreVehicle } from './scoring';
import Compare from './pages/Compare';
import CatalogueFilters from './components/CatalogueFilters';
import { researchPacks } from './research';

const nav = [{ id: 'browse', label: 'Browse cars', icon: LayoutGrid }, { id: 'compare', label: 'Compare', icon: Columns3 }, { id: 'costs', label: 'Ownership costs', icon: Calculator }, { id: 'scores', label: 'Scores & reviews', icon: Star }, { id: 'charts', label: 'Charts', icon: LineChart }, { id: 'notebook', label: 'Notebook', icon: NotebookPen }] as const;
const familyOrder = ['tesla-model-y', 'mitsubishi-outlander-phev', 'kia-ev6', 'hyundai-ioniq-5', 'toyota-rav4-hybrid', 'byd-atto-3', 'byd-sealion-6', 'nissan-x-trail-epower', 'toyota-kluger-hybrid', 'kia-sorento', 'kia-ev5', 'zeekr-7x', 'subaru-forester', 'subaru-outback', 'kia-sportage', 'hyundai-tucson', 'kia-carnival', 'mitsubishi-outlander-petrol', 'nissan-x-trail-petrol'];
function storage() { try { return window.localStorage; } catch { return null; } }

export default function App() {
  const [initial] = useState(() => readPersonal(storage(), vehicleIds));
  const [personal, setPersonal] = useState<PersonalData>(initial.data);
  const [storageError, setStorageError] = useState(initial.error);
  const [canSave, setCanSave] = useState(!initial.error);
  const firstSave = useRef(true);
  const [publicState, setPublicState] = useState(() => parseHash(window.location.hash, vehicleIds));
  const { view, compare, filters } = publicState;
  const weights = publicState.weights ?? personal.weights ?? defaultWeights;
  const [variants, setVariants] = useState<Record<string, string>>(() => Object.fromEntries(compare.map(id => vehicleMap.get(id)).filter((v): v is Vehicle => Boolean(v)).map(v => [v.familyId, v.id])));
  const [costVehicleId, setCostVehicleId] = useState<string | undefined>();
  const [initialListing, setInitialListing] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [showResearch, setShowResearch] = useState(false);
  const [showBenchmarks, setShowBenchmarks] = useState(false);
  const [showUnknown, setShowUnknown] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 1000px)').matches);
  const [sort, setSort] = useState('score');
  const main = useRef<HTMLElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  useEffect(() => { const media = window.matchMedia('(max-width: 1000px)'); const update = () => setIsMobile(media.matches); media.addEventListener('change', update); return () => media.removeEventListener('change', update); }, []);
  useEffect(() => { if (!menuOpen || !isMobile) return; sidebar.current?.querySelector<HTMLButtonElement>('nav button')?.focus(); const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenuOpen(false); document.getElementById('mobile-menu-button')?.focus(); } }; window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape); }, [menuOpen, isMobile]);

  useEffect(() => { if (firstSave.current) { firstSave.current = false; return; } if (canSave) setStorageError(writePersonal(storage(), personal)); }, [personal, canSave]);
  useEffect(() => { const hash = publicHash(publicState); if (window.location.hash !== hash) window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hash}`); }, [publicState]);
  useEffect(() => { const handle = () => setPublicState(parseHash(window.location.hash, vehicleIds)); window.addEventListener('hashchange', handle); window.addEventListener('popstate', handle); return () => { window.removeEventListener('hashchange', handle); window.removeEventListener('popstate', handle); }; }, []);
  useEffect(() => { if (!message) return; const timer = setTimeout(() => setMessage(''), 5500); return () => clearTimeout(timer); }, [message]);
  useEffect(() => { main.current?.focus({ preventScroll: true }); if (view !== 'vehicle') window.scrollTo({ top: 0, behavior: 'instant' }); }, [view, publicState.vehicleId]);

  const clearInitial = useCallback(() => setInitialListing(null), []);
  function goTo(next: PublicState, replace = false) {
    const hash = publicHash(next);
    if (hash !== window.location.hash) window.history[replace ? 'replaceState' : 'pushState'](null, '', `${window.location.pathname}${window.location.search}${hash}`);
    setPublicState(next);
    setMenuOpen(false);
  }
  function navigate(next: View) { goTo({ ...publicState, view: next, vehicleId: undefined, section: undefined }); }
  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) { setPublicState(s => ({ ...s, filters: { ...s.filters, [key]: value } })); }
  function toggleCompare(id: string) { const result = toggleComparison(compare, id); if (result.full) setMessage('Your comparison holds four cars. Remove one before adding another.'); setPublicState(s => ({ ...s, compare: result.ids })); }
  function openDetail(v: Vehicle, section: VehicleSection = 'overview', replace = false) { chooseVariant(v); goTo({ ...publicState, view: 'vehicle', vehicleId: v.id, section }, replace); }
  function updateWeights(weights: ScoreWeights) { setPublicState(s => ({ ...s, weights })); setPersonal(p => ({ ...p, weights })); }
  function favourite(id: string) { setPersonal(p => ({ ...p, favourites: p.favourites.includes(id) ? p.favourites.filter(v => v !== id) : [...p.favourites, id] })); }
  function chooseVariant(v: Vehicle) { setVariants(prev => ({ ...prev, [v.familyId]: v.id })); }
  function addListing(id: string) { setInitialListing(id); navigate('notebook'); }
  async function share() {
    const hash = publicHash({ ...publicState, view: 'compare', weights });
    const url = `${window.location.origin}${window.location.pathname}${hash}`;
    try { await navigator.clipboard.writeText(url); setMessage('Comparison link copied. Your personal notes are not included.'); }
    catch { window.prompt('Copy this comparison link. Personal notes are not included.', url); }
  }
  function representative(list: Vehicle[]) {
    const grouped = new Map<string, Vehicle[]>(); list.forEach(v => grouped.set(v.familyId, [...(grouped.get(v.familyId) ?? []), v]));
    return [...grouped.entries()].map(([family, options]) => options.find(v => v.id === variants[family]) ?? options.find(v => priceGroup(getPrice(v.id), filters.budget) === 'budget') ?? options.find(v => getPrice(v.id)?.low != null) ?? options[0]).sort((a, b) => sort === 'score' ? (scoreVehicle(b, personal, weights, filters.budget).total ?? -1) - (scoreVehicle(a, personal, weights, filters.budget).total ?? -1) : sort === 'price' ? (getPrice(a.id)?.low ?? Infinity) - (getPrice(b.id)?.low ?? Infinity) : sort === 'range' ? (b.range.value ?? 0) - (a.range.value ?? 0) : familyOrder.indexOf(a.familyId) - familyOrder.indexOf(b.familyId));
  }
  const filtered = filterVehicles(vehicles, filters, personal.favourites, personal.fitChecks, prices);
  const visible = representative(filtered);
  const withinBudget = visible.filter(v => priceGroup(getPrice(v.id), filters.budget) === 'budget');
  const benchmarks = visible.filter(v => priceGroup(getPrice(v.id), filters.budget) === 'benchmark');
  const unknown = visible.filter(v => priceGroup(getPrice(v.id), filters.budget) === 'unknown');
  const detail = view === 'vehicle' && publicState.vehicleId ? vehicleMap.get(publicState.vehicleId) : undefined;
  const selected = compare.map(id => vehicleMap.get(id)!).filter(Boolean);

  function cards(cars: Vehicle[]) { return <div className="vehicle-grid">{cars.map(v => <VehicleCard key={v.familyId} vehicle={v} options={filtered.filter(o => o.familyId === v.familyId)} price={getPrice(v.id)} favourite={personal.favourites.includes(v.id)} compared={compare.includes(v.id)} confirmed={Boolean(personal.fitChecks[v.id])} score={scoreVehicle(v, personal, weights, filters.budget)} detailHref={publicHash({ ...publicState, view: 'vehicle', vehicleId: v.id, section: 'overview' })} scoreHref={publicHash({ ...publicState, view: 'vehicle', vehicleId: v.id, section: 'scores' })} onScore={v => openDetail(v, 'scores')} onVariant={chooseVariant} onDetail={v => openDetail(v)} onFavourite={favourite} onCompare={toggleCompare} />)}</div>; }
  const activeFilters = activeFilterCount(filters) > 0;
  const filterBar = (context?: string) => <CatalogueFilters filters={filters} vehicles={vehicles} count={filtered.length} context={context} onChange={filters => setPublicState(s => ({ ...s, filters }))} />;
  return <div className="app"><a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); main.current?.focus(); }}>Skip to content</a>
    <aside ref={sidebar} inert={isMobile && !menuOpen} className={`sidebar ${menuOpen ? 'mobile-open' : ''}`}><button className="brand" onClick={() => navigate('browse')} aria-label="Fieldnotes home"><span className="brand-mark"><span /><span /><span /></span><span>fieldnotes<span className="brand-period">.</span></span></button><p className="sidebar-kicker">THE FAMILY CAR EDIT</p><nav aria-label="Main navigation">{nav.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${(view === id || view === 'vehicle' && id === 'browse') ? 'active' : ''}`} aria-current={(view === id || view === 'vehicle' && id === 'browse') ? 'page' : undefined} onClick={() => navigate(id)}><Icon size={18} strokeWidth={1.7} /><span>{label}</span>{id === 'notebook' && personal.listings.length > 0 && <span className="nav-count">{personal.listings.length}</span>}</button>)}</nav><div className="sidebar-note"><Leaf size={22} strokeWidth={1.4} /><h3>Research snapshot</h3><p>{vehicles.length} configurations<br />{sources.length} source records</p><button onClick={() => setShowResearch(true)}>About the research <ArrowUpRight size={13} /></button></div><div className="sidebar-bottom"><span className="location-icon"><MapPin size={17} /></span><div><strong>Queensland, Australia</strong><small>AUD · Australian specifications</small></div></div></aside>
    {menuOpen && <button className="mobile-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
    <div className="app-main" inert={isMobile && menuOpen}><header className="topbar"><div className="topbar-left"><button id="mobile-menu-button" className="icon-button mobile-menu" aria-label="Open navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}><Menu size={20} /></button><span className="topbar-breadcrumb">Car research <span>/</span> <strong>{view === 'vehicle' ? `${detail?.make ?? ''} ${detail?.model ?? ''}` : nav.find(n => n.id === view)?.label}</strong></span></div><div className="topbar-right"><span className="research-date"><span className="status-dot" />Research checked {formatDate(CHECKED_DATE)}</span><button className="topbar-save" onClick={() => { navigate('browse'); updateFilter('favourites', !filters.favourites); }} aria-label="Show saved favourites"><Heart size={17} /><span>{personal.favourites.length} saved</span></button></div></header>
      {storageError && view !== 'notebook' && <div className="storage-banner" role="status"><Info size={16} /><span>{storageError}</span><button onClick={() => navigate('notebook')}>Backup options <ArrowRight size={14} /></button></div>}
      {personal.fitReviewNeeded && <div className="storage-banner" role="status"><Info size={16} /><span>{FIT_REVIEW_NOTICE} Your notes and saved cars are unchanged.</span><button onClick={() => setPersonal(p => ({ ...p, fitReviewNeeded: false }))} aria-label="Dismiss seat-fit review notice">Dismiss <X size={14} /></button></div>}
      <main id="main-content" ref={main} tabIndex={-1}>
        {view === 'browse' && <div className="page-content browse-page"><section className="browse-heading"><div><p className="eyebrow">AUSTRALIAN FAMILY CARS</p><h1>Family car<br />comparison<span className="heading-dot">.</span></h1><p>Prices, child-seat fit, ownership costs and weighted scores.</p></div><div className="brief-card"><p className="eyebrow">YOUR FAMILY BRIEF</p><div><span><UsersRound size={17} />3 child seats</span><span><PlugZap size={17} />Home charging</span></div><strong>Up to {money(filters.budget)}</strong><small>1 rear-facing + 2 seats / boosters<br />Queensland · New & used · Open to extra rows</small></div></section>
          <section className="catalogue" aria-labelledby="catalogue-title"><div className="catalogue-heading"><div><p className="eyebrow">EXPLORE THE POSSIBILITIES</p><h2 id="catalogue-title">The shortlist <span className="count">{visible.length}</span></h2></div><p>{new Set(vehicles.map(v => v.familyId)).size} model families <span>·</span> {vehicles.length} researched configurations</p></div>
            {filterBar()}
            <div className="results-heading"><p><span className="status-dot" /><strong>Within your asking-price target</strong><span>{withinBudget.length} {withinBudget.length === 1 ? 'model' : 'models'}</span></p><label><span>Sort by</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="score">Overall score</option><option value="editorial">Shortlist order</option><option value="price">Asking price</option><option value="range">Published electric range</option></select></label></div><p className="results-note">Asking prices and labelled estimates at or below {money(filters.budget)}. Check the fee basis: additional charges may apply. Change a card’s year & variant to explore more.</p>
            {withinBudget.length ? cards(withinBudget) : <div className="empty-state panel"><Search size={30} strokeWidth={1.4} /><h3>No prices match these filters.</h3><p>Try a wider budget or fewer filters. Unpriced research and higher-priced benchmarks are below.</p>{activeFilters && <button className="button secondary" onClick={() => setPublicState(s => ({ ...s, filters: { ...defaultFilters } }))}>Reset filters</button>}</div>}
            {unknown.length > 0 && <section className="catalogue-group"><button className="group-toggle" aria-expanded={showUnknown} onClick={() => setShowUnknown(v => !v)}><div><span className="eyebrow">KEEP EXPLORING</span><h2>Asking price to verify <span className="count">{unknown.length}</span></h2><p>Useful research, without a verified current asking sample.</p></div><ChevronDown size={22} className={showUnknown ? 'rotated' : ''} /></button>{showUnknown && cards(unknown)}</section>}
            {benchmarks.length > 0 && <section className="catalogue-group benchmark-group"><button className="group-toggle" aria-expanded={showBenchmarks} onClick={() => setShowBenchmarks(v => !v)}><div><span className="eyebrow">A LITTLE PERSPECTIVE</span><h2>Beyond the budget <span className="count">{benchmarks.length}</span></h2><p>Higher-priced benchmarks. See what the extra spend buys.</p></div><span className="benchmark-toggle-label">{showBenchmarks ? 'Hide benchmarks' : 'Explore benchmarks'}<ChevronDown size={20} className={showBenchmarks ? 'rotated' : ''} /></span></button>{showBenchmarks && cards(benchmarks)}</section>}
            {visible.length === 0 && <p className="empty-catalogue">No configurations match these filters. Reset filters to see the full catalogue.</p>}
          </section><div className="research-reminder"><ShieldCheck size={22} strokeWidth={1.4} /><div><strong>Good research. Then a real-world check.</strong><p>Published seat tests are combination-specific. Bring your three seats, check the individual car and leave space for the pram.</p></div></div>
        </div>}
        {view === 'compare' && <Compare filterBar={filterBar('Filters apply to the comparison rows. Your optional selected cars stay saved.')} scope={publicState.compareScope ?? 'all'} onScope={compareScope => setPublicState(s => ({ ...s, compareScope }))} selectedVehicles={selected} allVehicles={filtered} onChoose={(index, id) => { if (!id || vehicleIds.has(id)) { setPublicState(s => ({ ...s, compare: chooseComparison(s.compare, index, id) })); if (id) chooseVariant(vehicleMap.get(id)!); } }} onEditCosts={v => { setCostVehicleId(v.id); chooseVariant(v); navigate('costs'); }} weights={weights} budget={filters.budget} onWeights={() => navigate('scores')} onScores={v => openDetail(v, 'scores')} vehicles={comparisonVehicles(filtered, compare, publicState.compareScope)} personal={personal} onRemove={toggleCompare} onBrowse={() => navigate('browse')} onDetail={v => openDetail(v)} onShare={share} onStart={() => { const candidates = visible.slice(0, 3); setPublicState(s => ({ ...s, compare: candidates.map(v => v.id) })); }} />}
        {view === 'costs' && <Ownership filterBar={filterBar('Filters apply to the cost list and car choices. Your selected editor remains available.')} choices={filtered} initialVehicleId={costVehicleId} vehicles={visible} allVehicles={vehicles} personal={personal} onUpdate={setPersonal} onDetail={v => openDetail(v)} onVariant={chooseVariant} />}
        {view === 'scores' && <Rankings filterBar={filterBar()} vehicles={visible} personal={personal} weights={weights} budget={filters.budget} onWeights={updateWeights} onResetWeights={() => { updateWeights({ ...defaultWeights }); setMessage('Default category weights restored. Rankings updated.'); }} onDetail={v => openDetail(v, 'scores')} />}
        {view === 'charts' && <Charts filterBar={filterBar('Filters apply to all charts. Choose year and variant from Browse cars.')} vehicles={visible} personal={personal} weights={weights} budget={filters.budget} onDetail={v => openDetail(v)} />}
        {view === 'notebook' && <Notebook filterBar={filterBar('Filtered-out listings and notes remain saved.')} availableVehicles={filterVehicles(vehicles, { ...filters, withinBudgetOnly: false }, personal.favourites, personal.fitChecks, prices)} budget={filters.budget} budgetOnly={filters.withinBudgetOnly} personal={personal} onUpdate={setPersonal} initialVehicle={initialListing} onClearInitial={clearInitial} onDetail={v => openDetail(v)} onMessage={setMessage} storageError={storageError} onEnableStorage={() => { const error = writePersonal(storage(), personal); setStorageError(error); setCanSave(!error); if (!error) setMessage('Browser saving is working. This notebook has been saved.'); }} />}
        {detail && <VehicleDetails vehicle={detail} options={vehicles.filter(v => v.familyId === detail.familyId)} personal={personal} compared={compare.includes(detail.id)} score={scoreVehicle(detail, personal, weights, filters.budget)} initialSection={publicState.section} onBack={() => navigate('browse')} onVariant={v => openDetail(v, 'overview', true)} onCompare={toggleCompare} onFavourite={favourite} onUpdate={setPersonal} onAddListing={addListing} onScoring={() => navigate('scores')} onEditCosts={() => { setCostVehicleId(detail.id); chooseVariant(detail); navigate('costs'); }} />}
      </main><footer className="site-footer"><span>Australian specifications · Dated research snapshot</span><div><span>Australia · AUD · {formatDate(CHECKED_DATE)}</span><button onClick={() => setShowResearch(true)}>Research & photo credits <ArrowUpRight size={13} /></button></div></footer>
    </div>
    {compare.length > 0 && view === 'browse' && <div className="comparison-tray"><div className="tray-icon"><Columns3 size={20} /></div><div><strong>{compare.length} {compare.length === 1 ? 'car' : 'cars'} to compare</strong><span>{selected.map(v => `${v.make} ${v.model}`).join(' · ')}</span></div><button className="tray-clear" aria-label="Clear comparison" onClick={() => setPublicState(s => ({ ...s, compare: [] }))}><X size={16} /></button><button className="button primary" onClick={() => navigate('compare')}>Compare now <ArrowRight size={16} /></button></div>}
    {showResearch && <ResearchDialog onClose={() => setShowResearch(false)} />}
    <div className={`toast ${message ? 'visible' : ''}`} role="status" aria-live="polite">{message && <><Check size={16} /><span>{message}</span><button aria-label="Dismiss notification" onClick={() => setMessage('')}><X size={14} /></button></>}</div>
  </div>;
}

function ResearchDialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className="research-dialog" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }} aria-labelledby="research-title"><button className="icon-button dialog-close" onClick={onClose} aria-label="Close research information"><X size={20} /></button><p className="eyebrow">DATA & ATTRIBUTION</p><h2 id="research-title">Research sources & limits</h2><p>Fieldnotes is a curated Australian research snapshot, checked {formatDate(CHECKED_DATE)}. It brings together {sources.length} source records across {new Set(vehicles.map(v => v.familyId)).size} model families. It is not a live vehicle inventory or a valuation service.</p><p>{researchPacks.length} model audits cover {researchPacks.reduce((sum, p) => sum + p.audit.items.length, 0)} item checks. Each car’s Sources section shows checked findings, retained estimates and unresolved gaps.</p><div className="research-principles"><section><BookOpen size={21} /><h3>Evidence follows the claim.</h3><p>Manufacturer specifications, applicable ANCAP assessments, official recall records and independent Australian family tests. Open the Sources & research gaps section on each car’s page for the references.</p></section><section><UsersRound size={21} /><h3>Your seats still matter.</h3><p>A tested combination does not establish the fit of all child seats or boosters. Check your own restraints, buckles and installation in the exact vehicle.</p></section><section><Share2 size={21} /><h3>Share the research.</h3><p>Comparison links contain selected configuration IDs, public filters and scoring weights. Your notebook, fit confirmations and cost assumptions stay in this browser. Export a backup to move them.</p></section></div><h3>Photography & attribution</h3><p>Genuine reference photographs. Market, year and trim details may differ; the caption identifies the pictured generation. A missing image is labelled rather than substituted with a different generation.</p><div className="credits-list">{images.map(i => <div key={i.familyId}><a href={i.sourceUrl} target="_blank" rel="noreferrer">{i.alt}<ExternalLink size={12} /></a><span>{i.credit} · <a href={i.licenseUrl} target="_blank" rel="noreferrer">{i.license}</a></span><small>{i.note}</small></div>)}</div><button className="button primary" onClick={onClose}>Back to the shortlist <ArrowRight size={16} /></button></dialog>;
}
