import { useEffect, useState } from 'react';
import { Download, Upload, Plus, NotebookPen, ArrowUpRight, Pencil, Trash2, Check, Save, Heart, FolderOpen } from 'lucide-react';
import { vehicles, vehicleMap, vehicleIds } from '../data';
import ConfirmDialog from '../components/ConfirmDialog';
import { money, parseBackup, powerLabel, yearLabel } from '../lib';
import type { Listing, PersonalData, Vehicle } from '../types';

type Draft = Omit<Listing, 'price' | 'kilometres'> & { price: string; kilometres: string };
const blank = (vehicleId = vehicles[0].id): Draft => ({ id: '', vehicleId, title: '', url: '', price: '', kilometres: '', location: '', status: 'saved', notes: '' });
const statusNames: Record<Listing['status'], string> = { saved: 'Saved', contacted: 'Contacted', 'test-drive': 'Test drive booked', inspected: 'Inspected', passed: 'Passed on' };

export default function Notebook({ personal, onUpdate, initialVehicle, onClearInitial, onDetail, onMessage, storageError, onEnableStorage }: {
  personal: PersonalData; onUpdate: (p: PersonalData) => void; initialVehicle: string | null; onClearInitial: () => void; onDetail: (v: Vehicle) => void; onMessage: (s: string) => void; storageError: string | null; onEnableStorage: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => blank(initialVehicle ?? undefined));
  const [formError, setFormError] = useState('');
  const [pendingImport, setPendingImport] = useState<PersonalData | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Listing | null>(null);
  useEffect(() => { if (initialVehicle) { setDraft(blank(initialVehicle)); onClearInitial(); } }, [initialVehicle, onClearInitial]);
  const field = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft(d => ({ ...d, [key]: value }));
  function save(e: React.FormEvent) {
    e.preventDefault();
    const listing: Listing = { ...draft, id: draft.id || crypto.randomUUID(), price: draft.price === '' ? null : Number(draft.price), kilometres: draft.kilometres === '' ? null : Number(draft.kilometres) };
    try {
      const next = { ...personal, listings: draft.id ? personal.listings.map(l => l.id === draft.id ? listing : l) : [listing, ...personal.listings] };
      onUpdate(parseBackup(JSON.stringify(next), vehicleIds)); setDraft(blank(draft.vehicleId)); setFormError(''); onMessage(draft.id ? 'Listing updated.' : 'Listing added to your notebook.');
    } catch (err) { setFormError(err instanceof Error ? err.message : 'Check the listing fields.'); }
  }
  function exportData() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(personal, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'fieldnotes-notebook-2026-10-18.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); onMessage('Notebook backup exported. Keep it somewhere safe.');
  }
  async function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
    try {
      if (file.size > 5_000_000) throw new Error('This backup is too large (maximum 5 MB).');
      const next = parseBackup(await file.text(), vehicleIds);
      setPendingImport(next);
    } catch (err) { onMessage(err instanceof Error ? err.message : 'Could not read that backup.'); }
  }
  return <div className="page-content notebook-page"><div className="page-heading"><div><p className="eyebrow">THE SHOPPING JOURNAL</p><h1>Saved cars & notes<span className="heading-dot">.</span></h1><p>Sale listings, inspection notes and backups.</p></div><div className="button-group"><button className="button secondary" onClick={exportData}><Download size={16} />Export backup</button><label className="button secondary file-button"><Upload size={16} />Import backup<input type="file" accept=".json,application/json" aria-label="Import notebook backup" onChange={importData} /></label></div></div>
    <div className="privacy-strip"><Save size={17} /><span><strong>Just on this browser.</strong> Your notebook is saved locally and stays out of shared comparison links. Export a backup to move it to another device.</span></div>
    {storageError && <div className="notice caution-notice"><p>{storageError}</p><button className="button secondary" onClick={onEnableStorage}>Retry saving this notebook</button></div>}
    <section className="panel seat-profile"><div><h3>Our three seats</h3><p>Record the seat models and arrangement you need to try.</p></div><label><span className="sr-only">Our child-seat models and arrangement</span><textarea value={personal.seatModels} rows={2} maxLength={5000} placeholder="e.g. two harnessed seats + a high-back booster. Which models?" onChange={e => onUpdate({ ...personal, seatModels: e.target.value })} /></label></section>
    <div className="notebook-grid"><section className="panel listing-form-panel"><div className="section-title"><div><p className="eyebrow">ONE TO LOOK AT</p><h2>{draft.id ? 'Edit a listing' : 'Save a sale listing'}</h2></div><NotebookPen size={23} /></div><form onSubmit={save} className="listing-form">
      <label className="field"><span>Vehicle configuration</span><select value={draft.vehicleId} onChange={e => field('vehicleId', e.target.value)}>{vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} · {yearLabel(v)} · {v.variant}</option>)}</select></label>
      <label className="field"><span>Listing title</span><input required maxLength={300} placeholder="e.g. White Model Y in Brisbane" value={draft.title} onChange={e => field('title', e.target.value)} /></label>
      <label className="field"><span>Listing link <small>optional</small></span><input type="url" maxLength={3000} placeholder="https://…" value={draft.url} onChange={e => field('url', e.target.value)} /></label>
      <div className="form-row"><label className="field"><span>Asking price (A$)</span><input type="number" min="0" step="1" placeholder="42,000" value={draft.price} onChange={e => field('price', e.target.value)} /></label><label className="field"><span>Odometer (km)</span><input type="number" min="0" step="1" placeholder="35,000" value={draft.kilometres} onChange={e => field('kilometres', e.target.value)} /></label></div>
      <label className="field"><span>Location</span><input maxLength={300} placeholder="Suburb, state" value={draft.location} onChange={e => field('location', e.target.value)} /></label>
      <label className="field"><span>Where you're up to</span><select value={draft.status} onChange={e => field('status', e.target.value as Listing['status'])}>{Object.entries(statusNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="field"><span>Notes & inspection checks</span><textarea rows={4} maxLength={20000} placeholder="Service history, battery condition, seat fit, remaining warranty…" value={draft.notes} onChange={e => field('notes', e.target.value)} /></label>
      {formError && <p className="form-error" role="alert">{formError}</p>}
      <div className="button-group"><button className="button primary" type="submit">{draft.id ? <Check size={16} /> : <Plus size={16} />}{draft.id ? 'Save changes' : 'Add to notebook'}</button>{draft.id && <button className="button secondary" type="button" onClick={() => setDraft(blank())}>Cancel</button>}</div>
    </form></section><section className="saved-listings"><div className="section-title"><h2>Your finds <span className="count">{personal.listings.length}</span></h2></div>{personal.listings.length === 0 ? <div className="empty-state panel"><FolderOpen size={36} strokeWidth={1.2} /><h3>No saved listings.</h3><p>Paste a sale listing to keep its price, kilometres and your first impressions in one place.</p><span className="small-label">Listings stay in this browser.</span></div> : personal.listings.map(l => { const v = vehicleMap.get(l.vehicleId)!; return <article className="listing-card panel" key={l.id}><div className="listing-top"><span className={`listing-status status-${l.status}`}>{statusNames[l.status]}</span><div><button className="icon-button" onClick={() => { setDraft({ ...l, price: l.price?.toString() ?? '', kilometres: l.kilometres?.toString() ?? '' }); document.querySelector('.listing-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} aria-label={`Edit ${l.title}`}><Pencil size={16} /></button><button className="icon-button" aria-label={`Delete ${l.title}`} onClick={() => setPendingDelete(l)}><Trash2 size={16} /></button></div></div><h3>{l.title}</h3><button className="text-button muted" onClick={() => onDetail(v)}>{v.make} {v.model} · {yearLabel(v)} · {v.variant}</button><div className="listing-numbers"><strong>{l.price === null ? 'Price not recorded' : money(l.price)}</strong><span>{l.kilometres === null ? 'km not recorded' : `${l.kilometres.toLocaleString('en-AU')} km`}</span><span>{l.location || 'Location not recorded'}</span></div>{l.notes && <p className="listing-notes">{l.notes}</p>}{l.url && <a className="text-button" href={l.url} target="_blank" rel="noreferrer">Open sale listing <ArrowUpRight size={16} /></a>}</article>; })}</section></div>
    <section className="saved-favourites"><div className="section-title"><h2><Heart size={19} />Saved favourites <span className="count">{personal.favourites.length}</span></h2></div><div className="favourites-grid">{personal.favourites.length ? personal.favourites.map(id => { const v = vehicleMap.get(id); return v ? <button className="panel favourite-summary" key={id} onClick={() => onDetail(v)}><span className="eyebrow">{powerLabel(v.powertrain)} · {yearLabel(v)}</span><strong>{v.make} {v.model}</strong><span>{v.variant}</span><ArrowUpRight size={17} /></button> : null; }) : <p className="muted">Tap the heart on any car to keep it here.</p>}</div></section>
    {pendingImport && <ConfirmDialog title="Replace this browser’s notebook?" confirmLabel="Import this backup" onClose={() => setPendingImport(null)} onConfirm={() => { onUpdate(pendingImport); setPendingImport(null); onMessage('Backup imported. Your notebook is ready.'); }}><p>This backup contains <strong>{pendingImport.listings.length} {pendingImport.listings.length === 1 ? 'listing' : 'listings'}</strong> and <strong>{pendingImport.favourites.length} {pendingImport.favourites.length === 1 ? 'favourite' : 'favourites'}</strong>.</p><p>Importing replaces your current listings, notes, seat models, fit checks and cost settings. Export the current notebook first if you want to keep it.</p></ConfirmDialog>}
    {pendingDelete && <ConfirmDialog title="Remove this sale listing?" confirmLabel="Delete listing" onClose={() => setPendingDelete(null)} onConfirm={() => { onUpdate({ ...personal, listings: personal.listings.filter(l => l.id !== pendingDelete.id) }); if (draft.id === pendingDelete.id) setDraft(blank()); setPendingDelete(null); onMessage('Listing removed from your notebook.'); }}><p><strong>{pendingDelete.title}</strong> and its listing notes will be deleted from this browser’s notebook. Vehicle research and favourites stay available.</p></ConfirmDialog>}
  </div>;
}
