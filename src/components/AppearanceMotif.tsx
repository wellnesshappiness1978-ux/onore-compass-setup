/** Local resolution-independent filigree; decorative only, never astronomical data. */
export function AppearanceMotif() {
  const spiral = Array.from({ length: 100 }, (_, i) => {
    const a = i / 99 * Math.PI * 4;
    const r = 1.5 * Math.exp(a * Math.log(1.618) / (Math.PI / 2));
    return `${i === 0 ? 'M' : 'L'}${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`;
  }).join(' ');
  return <svg className="appearance-motif" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="46" /><circle cx="50" cy="50" r="42" />
    {Array.from({ length: 12 }, (_, i) => <path key={i} transform={`rotate(${i * 30} 50 50)`} d="M50 4V10 M47 8Q43 16 50 18Q57 16 53 8" />)}
    <g className="sacred-engraving">
      {[0, 90, 180, 270].map(a => <path key={a} d={spiral} transform={`translate(0 -38) translate(50 50) scale(.19) translate(-50 -50) rotate(${a} 50 50)`} />)}
      {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={50 + 11 * Math.cos(i * Math.PI / 3)} cy={50 + 11 * Math.sin(i * Math.PI / 3)} r="11" />)}
      <circle cx="50" cy="50" r="11" />
    </g>
  </svg>;
}