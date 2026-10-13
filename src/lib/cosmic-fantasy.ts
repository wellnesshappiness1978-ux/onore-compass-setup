import { COSMIC_NEBULA_WEIGHTS } from './cosmic-optics';

const unit = (seed: number) => { const v = Math.sin(seed * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };
export type DistantPhenomenon = { x: number; y: number; radius: number; tilt: number; weight: number; role: number; kind: 'spiral' | 'elliptical' | 'nebula' | 'cluster' | 'curtain' | 'disk' | 'dust' };

/** Imagined distant objects, not additional natal bodies or measured sky positions. */
export function distantPhenomena(seed: number): DistantPhenomenon[] {
  const anchors = [[.22,.59],[.76,.3],[.72,.74],[.18,.24],[.84,.52],[.17,.79],[.51,.12]];
  const kinds: DistantPhenomenon['kind'][] = ['spiral','nebula','elliptical','cluster','curtain','disk','dust'];
  return anchors.map(([x = 0, y = 0], role) => ({ x, y, role, kind: kinds[role] ?? 'dust', radius: .052 + (COSMIC_NEBULA_WEIGHTS[role] ?? .24) * .065, tilt: (unit(seed + role * 131) - .5) * 1.5, weight: COSMIC_NEBULA_WEIGHTS[role] ?? .24 }));
}

/** Distinct projected morphology, independent of natal positions. */
export function distantGrain(kind: DistantPhenomenon['kind'], t: number, angle: number, scatter: number) {
  if (kind === 'spiral') {
    const a = t * 11.4 + Math.floor(angle / (Math.PI * 2) * 3) * Math.PI * 2 / 3 + scatter * .32;
    return { x: Math.cos(a) * t, y: Math.sin(a) * t * .58 };
  }
  if (kind === 'curtain') return { x: (t * 2 - 1) * 1.5, y: Math.sin(t * 8.5) * .3 + scatter * .52 };
  if (kind === 'dust') return { x: (t * 2 - 1) * 1.5, y: Math.sin(t * 7.5) * .28 + scatter * .27 };
  const radial = kind === 'cluster' ? t ** 2.4 : kind === 'elliptical' ? t ** 1.8 : kind === 'nebula' ? .48 + t * .52 : .32 + t * .68;
  const flatten = kind === 'disk' ? .2 : kind === 'elliptical' ? .46 : .8;
  const turbulence = kind === 'nebula' ? 1 + Math.sin(angle * 5 + t * 7) * .16 : 1;
  return { x: Math.cos(angle) * radial * turbulence, y: Math.sin(angle) * radial * flatten * turbulence };
}

/** Bounded deep-space grains and broken filaments, never opaque color fields. */
export function paintFantasyDepth(ctx: CanvasRenderingContext2D, size: number, colors: readonly string[], seed: number) {
  const starlight = getComputedStyle(document.documentElement).getPropertyValue('--craft-pearl').trim();
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (const field of distantPhenomena(seed)) {
    const color = colors[field.role] ?? colors[0] ?? starlight;
    ctx.save(); ctx.translate(field.x * size, field.y * size); ctx.rotate(field.tilt);
    const radius = field.radius * size;
    for (let i = 0; i < Math.round(520 + field.weight * 420); i++) {
      const salt = seed + field.role * 911 + i * 43, t = Math.sqrt(unit(salt));
      const point = distantGrain(field.kind, t, unit(salt + 5) * Math.PI * 2, unit(salt + 7) - .5);
      const x = point.x * radius, y = point.y * radius;
      const glow = size * (.0007 + unit(salt + 13) ** 2 * .0028);
      ctx.fillStyle = i % 31 === 0 ? starlight : color;
      ctx.globalAlpha = (.075 + field.weight * .2) * (.35 + unit(salt + 17) * .65);
      if (i % 5 === 0) {
        const mist = ctx.createRadialGradient(x, y, 0, x, y, glow * 5);
        mist.addColorStop(0, color); mist.addColorStop(1, 'transparent');
        ctx.fillStyle = mist; ctx.globalAlpha *= .22;
        ctx.beginPath(); ctx.arc(x, y, glow * 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = i % 31 === 0 ? starlight : color; ctx.globalAlpha /= .22;
      }
      ctx.beginPath(); ctx.arc(x, y, glow, 0, Math.PI * 2); ctx.fill();
      if (i % 31 === 0) {
        ctx.globalAlpha *= .7; ctx.strokeStyle = starlight; ctx.lineWidth = size * .0004;
        ctx.beginPath(); ctx.moveTo(x-glow*2,y); ctx.lineTo(x+glow*2,y); ctx.moveTo(x,y-glow*2); ctx.lineTo(x,y+glow*2); ctx.stroke();
      }
    }
    if (field.kind !== 'cluster' && field.kind !== 'elliptical') {
      ctx.strokeStyle = color; ctx.lineWidth = size * .00065;
      for (let thread = 0; thread < 14; thread++) {
        ctx.globalAlpha = (.07 + field.weight * .08) * (1 - thread / 18); ctx.beginPath();
        for (let step = 0; step <= 64; step++) {
          const t = step / 64;
          let x: number, y: number;
          if (field.kind === 'curtain' || field.kind === 'dust') { x = (t * 2 - 1) * radius * 1.5; y = Math.sin(t * 7.5 + thread * .055) * radius * .35 + (thread - 6.5) * radius * .028; }
          else { const a = t * (field.kind === 'spiral' ? 11.4 : Math.PI * 2) + thread * .12, r = radius * (field.kind === 'spiral' ? .12 + t * .85 : .42 + thread * .038); x = Math.cos(a) * r; y = Math.sin(a) * r * (field.kind === 'disk' ? .2 : .68); }
          if (step) ctx.lineTo(x,y); else ctx.moveTo(x,y);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  ctx.restore();
}