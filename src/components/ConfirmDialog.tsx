import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function ConfirmDialog({ title, children, confirmLabel, onConfirm, onClose }: { title: string; children: React.ReactNode; confirmLabel: string; onConfirm: () => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className="confirm-dialog" aria-labelledby="confirm-title" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><button className="icon-button dialog-close" aria-label="Close confirmation" onClick={onClose}><X size={18} /></button><p className="eyebrow">A QUICK CHECK</p><h2 id="confirm-title">{title}</h2><div className="confirm-content">{children}</div><div className="button-group"><button className="button secondary" onClick={onClose} autoFocus>Cancel</button><button className="button primary" onClick={onConfirm}>{confirmLabel}</button></div></dialog>;
}
