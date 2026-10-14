import { NautilusGeometry } from './NautilusIcon';
import celestial from '@/assets/appearance-celestial.jpg';
import sacred from '@/assets/appearance-sacred.jpg';
import harmony from '@/assets/appearance-harmony.jpg';
import sovereign from '@/assets/appearance-sovereign.jpg';

/** Presentation-only geometric engraving; never used by the astronomical renderer. */
export function AppearanceMotif({ background = false }: { background?: boolean }) {
  return <>
    {background && <div className="appearance-photo" aria-hidden="true">
      {Object.entries({ celestial, sacred, harmony, sovereign }).map(([family, src]) => <img key={family} data-photo={family} src={src} alt="" width={1920} height={1920} loading="lazy" decoding="async" />)}
    </div>}
    <svg className={background ? 'appearance-background' : 'appearance-motif'} viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="46" /><circle cx="50" cy="50" r="44" />
    <g className="cosmic-shell-engraving"><NautilusGeometry /></g>
    <g className="sacred-engraving">
      {Array.from({ length: 19 }, (_, i) => {
        const ring = i === 0 ? 0 : i < 7 ? 1 : 2;
        const a = (i - (ring === 1 ? 1 : 7)) * Math.PI / (ring === 1 ? 3 : 6);
        return <circle key={i} cx={50 + ring * 12 * Math.cos(a)} cy={50 + ring * 12 * Math.sin(a)} r="12" />;
      })}
      {[0, 90, 180, 270].map(a => <g key={a} transform={`rotate(${a} 50 50) translate(38 -1) scale(.24)`}><NautilusGeometry /></g>)}
    </g>
    <g className="royal-engraving">
      <path d="M50 5L89 27V73L50 95L11 73V27Z M50 13L82 32V68L50 87L18 68V32Z M50 8V92M14 29L86 71M14 71L86 29 M50 20L70 50L50 80L30 50Z" />
      {Array.from({ length: 8 }, (_, i) => <path key={i} transform={`rotate(${i * 45} 50 50)`} d="M50 4L53 12L50 18L47 12Z" />)}
    </g>
    <g className="harmony-engraving"><circle cx="39" cy="50" r="24" /><circle cx="61" cy="50" r="24" /><path d="M50 18Q84 50 50 82Q16 50 50 18Z" /></g>
    <g className="sovereign-engraving">
      {Array.from({ length: 12 }, (_, i) => <g key={i} transform={`rotate(${i * 30} 50 50)`}><path d="M50 5C35 18 65 23 50 34C40 28 39 15 50 5ZM50 7C58 14 44 22 50 30" /><path d="M50 2L52 5L50 8L48 5Z" /></g>)}
    </g>
  </svg></>;
}