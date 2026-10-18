import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

export default function InfoTooltip({ label, children, text }: { label: string; children: ReactNode; text?: string }) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  function show() {
    clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function hideSoon() {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useLayoutEffect(() => {
    if (!open || !trigger.current || !tooltip.current) return;
    const anchor = trigger.current.getBoundingClientRect();
    const bubble = tooltip.current.getBoundingClientRect();
    const left = Math.max(12, Math.min(anchor.left + anchor.width / 2 - bubble.width / 2, window.innerWidth - bubble.width - 12));
    const below = anchor.bottom + 8;
    const top = below + bubble.height <= window.innerHeight - 12 ? below : Math.max(12, anchor.top - bubble.height - 8);
    setPosition({ left, top });
  }, [open, children]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    function onPointerDown(event: PointerEvent) {
      if (!trigger.current?.contains(event.target as Node) && !tooltip.current?.contains(event.target as Node)) setOpen(false);
    }
    function onViewportChange() { setOpen(false); }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('scroll', onViewportChange, true);
    window.addEventListener('resize', onViewportChange);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('scroll', onViewportChange, true);
      window.removeEventListener('resize', onViewportChange);
    };
  }, [open]);

  return <>
    <button ref={trigger} type="button" className={`info-tooltip-trigger${text ? ' with-text' : ''}`} aria-label={label} aria-describedby={open ? id : undefined} onMouseEnter={show} onMouseLeave={hideSoon} onFocus={show} onBlur={() => setOpen(false)} onClick={show}>
      {text}<Info size={13} aria-hidden="true" />
    </button>
    {open && createPortal(<div ref={tooltip} id={id} role="tooltip" className="info-tooltip" style={position} onMouseEnter={show} onMouseLeave={hideSoon}>{children}</div>, document.body)}
  </>;
}
