import type { CosmicMoonPlacement } from './cosmic-art';

export const COSMIC_NEBULA_WEIGHTS = [1, .82, .68, .54, .43, .3, .24] as const;

/** Separate gas islands, never a spatial rainbow ramp. RGB retains the exact input;
 * optical depth alone moderates its appearance against the shared space ink. */
export function deepNebulaPixels(colors: readonly string[], seed: number, diameter: number) {
  const pixels = new Uint8ClampedArray(diameter * diameter * 4);
  const channels = colors.map(color => [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16)));
  const anchors = [[.28,.58],[.74,.31],[.68,.76],[.22,.2],[.86,.58],[.12,.8],[.52,.1]];
  for (let y = 0; y < diameter; y++) for (let x = 0; x < diameter; x++) {
    const u = x / diameter, v = y / diameter;
    const warp = Math.sin(u * 11 + v * 7 + seed % 19) * .035 + Math.sin(v * 23 - u * 13) * .018;
    const wisps = Math.max(0, .36 + .25 * Math.sin(u * 37 + v * 29 + warp * 45) + .18 * Math.sin(u * 83 - v * 67) + .12 * Math.sin(u * 173 + v * 139));
    let strongest = 0, role = 0;
    anchors.forEach(([ax = 0, ay = 0], index) => {
      const dx = (u - ax + warp) / .31, dy = (v - ay - warp) / .18;
      const density = Math.exp(-(dx * dx + dy * dy) * 1.45) * (COSMIC_NEBULA_WEIGHTS[index] ?? .24);
      if (density > strongest) { strongest = density; role = index; }
    });
    // Fine extinction lanes interrupt the gas without circular masks or white veils.
    const extinction = .22 + .78 * Math.abs(Math.sin(u * 19 - v * 31 + warp * 80));
    const pixel = (y * diameter + x) * 4;
    for (let channel = 0; channel < 3; channel++) pixels[pixel + channel] = channels[role]?.[channel] ?? 0;
    pixels[pixel + 3] = 255 * Math.min(.52, strongest * wisps * extinction * 1.18);
  }
  return pixels;
}

/** Earth-facing spherical illumination: no fake atmosphere or phase-gradient shortcuts. */
export function lunarLightNormal(phaseAngle: number, lightAngle: number) {
  const phase = phaseAngle * Math.PI / 180;
  return { x: Math.sin(phase) * Math.cos(lightAngle), y: Math.sin(phase) * Math.sin(lightAngle), z: Math.cos(phase) };
}

const noise = (n: number) => { const v = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };
// Stable near-side maria and crater fields; artistic albedo, not a surveyed lunar map.
const maria = [[.28,-.28,.33,.24],[-.38,-.05,.39,.47],[.47,.08,.24,.23],[-.06,-.42,.25,.18],[.18,.39,.17,.13]];
const craters = Array.from({length: 180}, (_,i) => ({x:(noise(i*17+3)-.5)*1.9,y:(noise(i*23+7)-.5)*1.9,r:.008+noise(i*31+11)**3*.085}));

export function lunarSurfacePixels(moon: Pick<CosmicMoonPlacement,'phaseAngle'|'lightAngle'|'poleAngle'|'librationLongitude'|'librationLatitude'>, diameter: number, stone: readonly number[], reflected: readonly number[] = stone, mode: 'birth-phase' | 'full-light' = 'birth-phase') {
  const pixels = new Uint8ClampedArray(diameter * diameter * 4);
  const light = mode === 'full-light' ? { x: .12, y: -.16, z: Math.sqrt(.96) } : lunarLightNormal(moon.phaseAngle, moon.lightAngle);
  const rotation = moon.poleAngle + Math.PI / 2, c = Math.cos(rotation), s = Math.sin(rotation);
  for(let y=0;y<diameter;y++) for(let x=0;x<diameter;x++) {
    const nx=(x+.5)/diameter*2-1, ny=(y+.5)/diameter*2-1, squared=nx*nx+ny*ny;
    if(squared>=1) continue;
    const nz=Math.sqrt(1-squared);
    const u=nx*c+ny*s + Math.sin(moon.librationLongitude*Math.PI/180)*nz;
    const v=-nx*s+ny*c + Math.sin(moon.librationLatitude*Math.PI/180)*nz;
    let albedo=.91, relief=0;
    for(const [mx=0,my=0,rx=1,ry=1] of maria) {
      const d=((u-mx)/rx)**2+((v-my)/ry)**2;
      albedo-=.19*Math.exp(-d*2.3);
    }
    for(const crater of craters) {
      const d=Math.hypot(u-crater.x,v-crater.y)/crater.r;
      if(d>1.45) continue;
      albedo-=.16*Math.exp(-d*d*3);
      relief+=(.13*Math.exp(-(((d-.91)*9)**2))-.09*Math.exp(-d*d*5))*(1+light.x*(u-crater.x)/crater.r+light.y*(v-crater.y)/crater.r);
    }
    const incidence=nx*light.x+ny*light.y+nz*light.z;
    // Visibility-enhanced artistic earthshine: retain the true sunlit hemisphere,
    // but reveal textured shadow albedo even at new Moon. No atmosphere is implied.
    const earthshine=(.28+.12*(1-light.z)/2)*(.76+.24*nz);
    const sunlight=mode === 'full-light' ? .88 + .16*nz + relief*.25 : Math.max(0,incidence+relief*.35)**.65*.96;
    const rim=.035*Math.pow(1-nz,5);
    const grain=.96+.08*noise(x*37+y*71);
    const index=(y*diameter+x)*4;
    for(let channel=0;channel<3;channel++) pixels[index+channel]=Math.max(.22,albedo+relief)*grain*((stone[channel]??184)*sunlight+(reflected[channel]??184)*(mode === 'full-light' ? .08 : earthshine+rim));
    pixels[index+3]=Math.min(1,(1-Math.sqrt(squared))*diameter)*255;
  }
  return pixels;
}

export function paintLunarSurface(ctx: CanvasRenderingContext2D, moon: CosmicMoonPlacement) {
  const css=getComputedStyle(document.documentElement);
  const stone=css.getPropertyValue('--cosmic-lunar-stone').trim();
  const rgb=[1,3,5].map(i=>parseInt(stone.slice(i,i+2),16));
  const silver=css.getPropertyValue('--cosmic-lunar-earthshine').trim();
  const reflected=[1,3,5].map(i=>parseInt(silver.slice(i,i+2),16));
  const diameter=Math.max(48,Math.ceil(moon.radius*2));
  const surface=document.createElement('canvas'); surface.width=diameter; surface.height=diameter;
  const art=surface.getContext('2d'); if(!art) return;
  const image=art.createImageData(diameter,diameter);
  image.data.set(lunarSurfacePixels(moon,diameter,rgb,reflected,'full-light')); art.putImageData(image,0,0);
  ctx.drawImage(surface,moon.x-moon.radius,moon.y-moon.radius,moon.radius*2,moon.radius*2);
}

/** Artistic diffraction halo, not a fictional lunar atmosphere; keep the phase silhouette clear. */
export function paintLunarHalo(ctx: CanvasRenderingContext2D, moon: CosmicMoonPlacement, seed: number) {
  const palette=getComputedStyle(document.documentElement);
  const light=palette.getPropertyValue('--craft-pearl').trim();
  const {x,y,radius}=moon;
  ctx.save(); ctx.globalCompositeOperation='screen';
  const halo=ctx.createRadialGradient(x,y,radius*.9,x,y,radius*2.8);
  halo.addColorStop(0,light); halo.addColorStop(.18,light); halo.addColorStop(1,'transparent');
  ctx.globalAlpha=.13; ctx.fillStyle=halo;
  ctx.beginPath();ctx.arc(x,y,radius*2.8,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=light;ctx.lineWidth=radius*.022;
  for(let ray=0;ray<40;ray++) {
    const a=ray/40*Math.PI*2;
    const length=radius*(1.35+noise(seed+ray*17)*.95);
    ctx.globalAlpha=.025+.045*noise(seed+ray);
    ctx.beginPath();ctx.moveTo(x+Math.cos(a)*radius*1.08,y+Math.sin(a)*radius*1.08);
    ctx.lineTo(x+Math.cos(a)*length,y+Math.sin(a)*length);ctx.stroke();
  }
  ctx.restore();
}

export function paintWideSolarRays(ctx: CanvasRenderingContext2D, size: number, sun: {x:number;y:number;radius:number}, seed: number) {
  const css=getComputedStyle(document.documentElement), gold=css.getPropertyValue('--cosmic-solar-ray').trim(), core=css.getPropertyValue('--cosmic-solar-core').trim();
  ctx.save(); ctx.globalCompositeOperation='screen'; ctx.lineCap='round';
  for(let ray=0;ray<112;ray++) {
    const angle=(ray+noise(seed+ray)*.8)/112*Math.PI*2;
    const dx=Math.cos(angle),dy=Math.sin(angle);
    const end=Math.min(dx>0?(size-sun.x)/dx:dx<0?-sun.x/dx:Infinity,dy>0?(size-sun.y)/dy:dy<0?-sun.y/dy:Infinity);
    const start=sun.radius*.96, length=end*(.8+noise(seed+ray*7)*.24);
    const gradient=ctx.createLinearGradient(sun.x+dx*start,sun.y+dy*start,sun.x+dx*length,sun.y+dy*length);
    gradient.addColorStop(0,core); gradient.addColorStop(.15,gold+'a0'); gradient.addColorStop(.55,gold+'28'); gradient.addColorStop(1,gold+'00');
    ctx.strokeStyle=gradient;
    for(let pass=0;pass<2;pass++) {
      ctx.globalAlpha=pass?.23:.055; ctx.lineWidth=size*(pass?.00035:.0035)*( .5+noise(seed+ray*13));
      ctx.beginPath(); ctx.moveTo(sun.x+dx*start,sun.y+dy*start); ctx.lineTo(sun.x+dx*length,sun.y+dy*length);ctx.stroke();
    }
  }
  ctx.restore();
}