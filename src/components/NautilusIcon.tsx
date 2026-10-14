import { useId } from 'react';
import type { AppearanceFamily } from '@/lib/appearance-families';

const turn = Math.PI * 2;
const point = (t: number) => {
  const radius = 39 * Math.exp((t - turn * 2) * Math.log((1 + Math.sqrt(5)) / 2) / (Math.PI / 2));
  return { x: 45 + radius * Math.cos(t - .45), y: 54 + radius * Math.sin(t - .45) };
};
const coordinate = (t: number) => { const p = point(t); return `${p.x.toFixed(3)} ${p.y.toFixed(3)}`; };
const spiral = Array.from({ length: 181 }, (_, i) => `${i ? 'L' : 'M'}${coordinate(i / 180 * turn * 2)}`).join(' ');
const outline = Array.from({ length: 91 }, (_, i) => `${i ? 'L' : 'M'}${coordinate(turn + i / 90 * turn)}`).join(' ') +
  Array.from({ length: 91 }, (_, i) => `L${coordinate(turn - i / 90 * turn)}`).join(' ') + 'Z';

/** Shared golden-ratio chamber geometry for menu jewelry and screen backgrounds. */
export function NautilusGeometry() {
  return <>
    <path className="nautilus-shell" d={outline} />
    <path className="nautilus-spiral" d={spiral} />
    {Array.from({ length: 22 }, (_, i) => {
      const t = turn + i / 21 * turn;
      const a = point(t), b = point(t - turn);
      return <path className="nautilus-chamber" key={i} d={`M${a.x} ${a.y}Q${(a.x + b.x) / 2 + (a.y - b.y) * .18} ${(a.y + b.y) / 2 - (a.x - b.x) * .18} ${b.x} ${b.y}`} />;
    })}
  </>;
}

export function NautilusIcon({ className = '', family }: { className?: string; family?: AppearanceFamily }) {
  const id = useId().replace(/:/g, '');
  return <svg viewBox="8 12 82 82" className={`nautilus-icon ${className}`} data-nautilus={family} aria-hidden="true" focusable="false">
    <defs><linearGradient id={`${id}-foil`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="var(--cosmic-foil-light)" /><stop offset=".28" stopColor="var(--cosmic-foil-gold)" />
      <stop offset=".5" stopColor="var(--cosmic-foil-light)" /><stop offset=".73" stopColor="var(--gold-deep)" /><stop offset="1" stopColor="var(--cosmic-foil-gold)" />
    </linearGradient></defs>
    <g className="nautilus-relief" fill={`url(#${id}-foil)`}><path d={outline} /></g>
    <NautilusGeometry />
    <g className="nautilus-diamonds"><path d="M76 27l4 6-4 6-4-6Z M26 59l3 4-3 4-3-4Z" />
      <path className="nautilus-glints" d="M76 20v26M65 33h22M76 33l-6-6m6 6 6 6M23 63h6M26 60v6" />
    </g>
    <g className="nautilus-jewels">
      {[0, 1, 2, 3, 4, 5].map(i => { const p = point(turn + (i + 13) / 21 * turn); return <g key={i} transform={`translate(${p.x} ${p.y})`}><path d="M0 -2.5L2 0L0 2.5L-2 0Z" /><path className="nautilus-jewel-facet" d="M0 -2.5V2.5M-2 0H2" /></g>; })}
    </g>
  </svg>;
}