import { useId } from 'react';
import type { AppearanceFamily } from '@/lib/appearance-families';

const turn = Math.PI * 2;
const sweep = turn * .9;
const end = turn * 2;
const start = end - sweep;
const rotation = -.6;
const point = (t: number) => {
  const radius = 36 * Math.exp((t - end) * Math.log((1 + Math.sqrt(5)) / 2) / (Math.PI / 2));
  return { x: 49 + radius * Math.cos(t + rotation), y: 49 + radius * Math.sin(t + rotation) };
};
const rim = (t: number) => {
  const radius = 34 + 3 * (t - start) / sweep;
  return { x: 49 + radius * Math.cos(t + rotation), y: 49 + radius * Math.sin(t + rotation) };
};
const coordinate = (p: { x: number; y: number }) => `${p.x.toFixed(3)} ${p.y.toFixed(3)}`;
const spiral = Array.from({ length: 241 }, (_, i) => `${i ? 'L' : 'M'}${coordinate(point(i / 240 * end))}`).join(' ');
const outline = Array.from({ length: 145 }, (_, i) => `${i ? 'L' : 'M'}${coordinate(rim(start + i / 144 * sweep))}`).join(' ') +
  Array.from({ length: 145 }, (_, i) => `L${coordinate(point(end - i / 144 * sweep))}`).join(' ') + 'Z';

/** Shared golden-ratio chamber geometry for menu jewelry and screen backgrounds. */
export function NautilusGeometry() {
  return <>
    <path className="nautilus-shell" d={outline} />
    <path className="nautilus-spiral" d={spiral} />
    {Array.from({ length: 22 }, (_, i) => {
      const t = start + i / 21 * sweep;
      const a = rim(t), b = point(t);
      return <path className="nautilus-chamber" key={i} d={`M${a.x} ${a.y}Q${(a.x + b.x) / 2 + (a.y - b.y) * .18} ${(a.y + b.y) / 2 - (a.x - b.x) * .18} ${b.x} ${b.y}`} />;
    })}
  </>;
}

export function NautilusIcon({ className = '', family }: { className?: string; family?: AppearanceFamily }) {
  const id = useId().replace(/:/g, '');
  return <svg viewBox="7 7 84 84" className={`nautilus-icon ${className}`} data-nautilus={family} aria-hidden="true" focusable="false">
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
      {[0, 1, 2, 3, 4, 5].map(i => { const p = rim(start + (i + 8) / 21 * sweep); return <g key={i} transform={`translate(${p.x} ${p.y})`}><path d="M0 -2.5L2 0L0 2.5L-2 0Z" /><path className="nautilus-jewel-facet" d="M0 -2.5V2.5M-2 0H2" /></g>; })}
    </g>
  </svg>;
}