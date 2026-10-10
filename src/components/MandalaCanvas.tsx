import { useCallback, useEffect, useMemo, useState } from "react";
import type { Language } from "@/lib/translations";
import { compassMandalaLayout } from "@/lib/art-geometry";
import { artSpecialistCopy } from "@/lib/art-specialist-copy";

export type MandalaColor = { name: string; code: string };
export type Capture = () => Promise<{ blob: Blob; width: number; height: number }>;
type Props = { colors: MandalaColor[]; language: Language; variation: number; reduced: boolean; onCapture: (capture: Capture | null) => void };

const OUT = 2048;
const BASE_IMAGE = "/assets/mandala-base.png";

/** Builds the dynamic seven-color plate used for both live display and export. */
export function buildMandalaColorPlate(codes: string[], variation: number, _animated: boolean) {
  const { core, compassR, blades, layers, particles, workSeed } = compassMandalaLayout(codes, variation);
  const unit = (salt: number) => {
    const x = Math.sin((workSeed + salt) * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };
  const textureDefs = layers.map((_, i) => `<filter id="pigment${i}" x="-18%" y="-18%" width="136%" height="136%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${(.009 + unit(100 + i) * .006).toFixed(4)}" numOctaves="4" seed="${(workSeed + i * 17) % 997}" result="grain"/><feDisplacementMap in="SourceGraphic" in2="grain" scale="${(7 + unit(120 + i) * 7).toFixed(2)}" xChannelSelector="R" yChannelSelector="G"/></filter>`).join("");
  const layerEls = layers.slice().reverse().map((l, ri) => {
    const i = layers.length - 1 - ri;
    const paintedOuter = i === layers.length - 1 ? 514 : l.outer + 5;
    const paintedInner = Math.max(0, l.inner - 5);
    const middle = (paintedInner + paintedOuter) / 2;
    const breadth = paintedOuter - paintedInner;
    const stipple = Array.from({ length: l.petals * 4 }, (_, k) => {
      const a = l.phase + k * Math.PI * 2 / (l.petals * 4) + (unit(i * 400 + k) - .5) * .025;
      const r = middle + (unit(i * 700 + k) - .5) * (l.outer - l.inner) * .58;
      const size = .55 + unit(i * 900 + k) * 1.45;
      return `<circle cx="${(Math.cos(a) * r).toFixed(1)}" cy="${(Math.sin(a) * r).toFixed(1)}" r="${size.toFixed(2)}" fill="${k % 5 ? l.color : "#C49A3A"}" fill-opacity="${(.34 + unit(i * 1100 + k) * .42).toFixed(2)}"/>`;
    }).join("");
    const dash = `${(2.5 + unit(1400 + i) * 4).toFixed(1)} ${(5 + unit(1500 + i) * 8).toFixed(1)} ${(10 + unit(1600 + i) * 12).toFixed(1)} ${(3 + unit(1700 + i) * 4).toFixed(1)}`;
    const brokenBrush = `${(70 + unit(2300 + i) * 95).toFixed(1)} ${(9 + unit(2400 + i) * 25).toFixed(1)} ${(32 + unit(2500 + i) * 74).toFixed(1)} ${(5 + unit(2600 + i) * 16).toFixed(1)}`;
    const veinDash = `${(12 + unit(3100 + i) * 18).toFixed(1)} ${(3 + unit(3200 + i) * 7).toFixed(1)} ${(1 + unit(3300 + i) * 3).toFixed(1)} ${(4 + unit(3400 + i) * 9).toFixed(1)}`;
    return `<g data-birth-color="${l.color}" class="pigment-layer"><circle r="${middle.toFixed(1)}" fill="none" stroke="${l.color}" stroke-opacity=".48" stroke-width="${breadth.toFixed(1)}" filter="url(#pigment${i})"/><circle r="${(middle + (unit(2700 + i) - .5) * 5).toFixed(1)}" fill="none" stroke="${l.color}" stroke-opacity=".28" stroke-width="${(breadth * .8).toFixed(1)}" stroke-linecap="round" stroke-dasharray="${brokenBrush}" stroke-dashoffset="${(unit(2800 + i) * 97).toFixed(1)}" filter="url(#pigment${i})"/><path d="${l.innerPath}" fill="none" stroke="${l.color}" stroke-opacity=".18" stroke-width="${(1 + unit(1800 + i) * .65).toFixed(2)}" filter="url(#pigment${i})"/><path d="${l.path}" fill="none" stroke="url(#agedGold)" stroke-opacity="${(.22 + i * .018).toFixed(2)}" stroke-width="${(.42 + unit(3500 + i) * .34).toFixed(2)}" stroke-linecap="round" stroke-dasharray="${veinDash}" filter="url(#roughGold)"/><path d="${l.facetPath}" fill="none" stroke="url(#leafGold)" stroke-opacity="${(.13 + i * .014).toFixed(2)}" stroke-width="${(.3 + unit(3600 + i) * .24).toFixed(2)}" stroke-dasharray="${dash}" stroke-dashoffset="${(unit(3700 + i) * 31).toFixed(1)}" filter="url(#fineGold)"/><path d="${l.guillochePath}" fill="none" stroke="url(#midGold)" stroke-opacity=".38" stroke-width="${(.5 + unit(1900 + i) * .45).toFixed(2)}" stroke-linecap="round" stroke-dasharray="${dash}" stroke-dashoffset="${(unit(2000 + i) * 19).toFixed(1)}" filter="url(#roughGold)"/>${stipple}</g>`;
  }).join("");
  const parts = particles.slice(0, 92).map((p, i) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(.35 + p.r * .46).toFixed(2)}" fill="${i % 4 ? "#A77B2C" : "#D8B65C"}" fill-opacity="${(.24 + unit(2200 + i) * .42).toFixed(2)}"/>`).join("");
  const goldLeaf = particles.slice(16, 62).filter((_, i) => i % 2 === 0).map((p, i) => {
    const s = 1.4 + unit(4100 + i) * 3.2;
    const skew = (unit(4200 + i) - .5) * s;
    return `<path d="M${(p.x - s).toFixed(1)} ${(p.y + skew).toFixed(1)}l${(s * 1.2).toFixed(1)} ${(-s * .9).toFixed(1)}l${(s * .85).toFixed(1)} ${(s * 1.1).toFixed(1)}l${(-s * 1.35).toFixed(1)} ${(s * .48).toFixed(1)}Z" fill="url(#leafGold)" fill-opacity="${(.34 + unit(4300 + i) * .34).toFixed(2)}" filter="url(#fineGold)"/>`;
  }).join("");
  const rays = Array.from({ length: 72 }, (_, i) => {
    const a = i / 72 * Math.PI * 2 + unit(5000 + i) * .016;
    const start = 42 + unit(5100 + i) * 24;
    const length = 128 + unit(5200 + i) * 292;
    const half = (.0025 + unit(5300 + i) * .007) * (i % 6 === 0 ? 1.8 : 1);
    const point = (r: number, da = 0) => `${(Math.cos(a + da) * r).toFixed(1)},${(Math.sin(a + da) * r).toFixed(1)}`;
    const fill = i % 9 === 0 ? "url(#platinumRay)" : "url(#goldRay)";
    return `<path d="M${point(start, -half)} L${point(length)} L${point(start, half)} Z" fill="${fill}" fill-opacity="${(i % 9 === 0 ? .38 : .16 + unit(5400 + i) * .18).toFixed(2)}" filter="url(#rayTexture)"/>`;
  }).join("");
  const rayThreads = Array.from({ length: 144 }, (_, i) => {
    const a = i / 144 * Math.PI * 2 + (unit(6000 + i) - .5) * .012;
    const start = 58 + unit(6100 + i) * 35;
    const end = 172 + unit(6200 + i) * 278;
    const x1 = Math.cos(a) * start, y1 = Math.sin(a) * start;
    const x2 = Math.cos(a) * end, y2 = Math.sin(a) * end;
    const stroke = i % 12 === 0 ? "url(#platinumRay)" : "url(#goldRay)";
    return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${stroke}" stroke-opacity="${(i % 12 === 0 ? .52 : .14 + unit(6300 + i) * .23).toFixed(2)}" stroke-width="${(i % 12 === 0 ? .75 : .18 + unit(6400 + i) * .42).toFixed(2)}" stroke-linecap="round" stroke-dasharray="${i % 5 ? "160 8 32 5" : "210 4 16 3"}" filter="url(#rayTexture)"/>`;
  }).join("");
  const filigreeRosettes = layers.map((l, i) => `<g opacity="${(.35 + i * .035).toFixed(2)}"><path d="${l.facetPath}" fill="none" stroke="#F5DEA0" stroke-width="${(.3 + i * .045).toFixed(2)}" stroke-dasharray="1 2 7 3" filter="url(#fineGold)"/><path d="${l.innerPath}" fill="none" stroke="url(#leafGold)" stroke-width="${(.48 + i * .055).toFixed(2)}" stroke-dasharray="19 3 2 4" filter="url(#roughGold)"/></g>`).join("");
  const crownJewels = Array.from({ length: 64 }, (_, i) => {
    const a = i / 64 * Math.PI * 2 + unit(6500 + i) * .006;
    const r = 420 + (i % 2) * 15 + (unit(6600 + i) - .5) * 4;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    const s = i % 8 === 0 ? 4.6 : 1.5 + unit(6700 + i) * 1.8;
    return `<path d="M${x.toFixed(1)} ${(y - s).toFixed(1)}L${(x + s * .62).toFixed(1)} ${y.toFixed(1)}L${x.toFixed(1)} ${(y + s).toFixed(1)}L${(x - s * .62).toFixed(1)} ${y.toFixed(1)}Z" fill="${i % 8 === 0 ? "#FFF4BF" : "url(#leafGold)"}" fill-opacity="${i % 8 === 0 ? ".88" : ".58"}" stroke="#7B551D" stroke-width=".35" filter="url(#fineGold)"/>`;
  }).join("");
  const compassEngraving = blades.map((blade, i) => `<polygon points="${blade.points}" fill="none" stroke="${i % 4 ? "url(#agedGold)" : "url(#leafGold)"}" stroke-opacity="${blade.light ? ".7" : ".48"}" stroke-width="${blade.light ? ".78" : ".5"}" stroke-linejoin="round" stroke-dasharray="${i % 3 ? "8 2 1 3" : "13 3 2 2"}" filter="url(#roughGold)"/>`).join("");
  const gemRadius = compassR * .68;
  // A raised emerald-cut solid: a planar crown, bevels and a dark inset seat, never a circular bezel.
  const gemPoint = (i: number, scale = 1) => {
    const a = -Math.PI / 2 + Math.PI / 8 + i * Math.PI / 4;
    return `${(Math.cos(a) * gemRadius * .86 * scale).toFixed(1)},${(Math.sin(a) * gemRadius * 1.08 * scale).toFixed(1)}`;
  };
  const gemOutline = Array.from({ length: 8 }, (_, i) => gemPoint(i)).join(" ");
  const gemTable = Array.from({ length: 8 }, (_, i) => gemPoint(i, .57)).join(" ");
  const gemSeat = Array.from({ length: 8 }, (_, i) => gemPoint(i, 1.14)).join(" ");
  const gemFacets = Array.from({ length: 8 }, (_, i) => {
    const fill = i < 2 ? "url(#gemLight)" : i < 5 ? "url(#gemDeep)" : "url(#gemFlash)";
    return `<path d="M${gemPoint(i)} L${gemPoint((i + 1) % 8)} L${gemPoint((i + 1) % 8, .57)} L${gemPoint(i, .57)}Z" fill="${fill}" stroke="${core}" stroke-opacity=".45" stroke-width=".4"/>`;
  }).join("");
  const gemProngs = [0, 2, 4, 6].map(i => `<path d="M${gemPoint(i, 1.09)}L${gemPoint(i, .88)}" stroke="url(#leafGold)" stroke-width="3.2" stroke-linecap="round"/>`).join("");
  const birthSparkles = Array.from({ length: 350 }, (_, i) => {
    const a = unit(7100 + i) * Math.PI * 2;
    const r = Math.sqrt(unit(7500 + i)) * 452;
    if (r < gemRadius * 1.5) return "";
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    const color = codes[i % 7] ?? core;
    const size = i % 17 === 0 ? 2.8 + unit(7900 + i) * 1.7 : .55 + unit(7900 + i) * 1.05;
    const flare = i % 17 === 0 ? `<path d="M${x.toFixed(2)} ${(y - size * 2.4).toFixed(2)}Q${x.toFixed(2)} ${y.toFixed(2)} ${(x + size * 1.5).toFixed(2)} ${y.toFixed(2)}Q${x.toFixed(2)} ${y.toFixed(2)} ${x.toFixed(2)} ${(y + size * 2.4).toFixed(2)}Q${x.toFixed(2)} ${y.toFixed(2)} ${(x - size * 1.5).toFixed(2)} ${y.toFixed(2)}Q${x.toFixed(2)} ${y.toFixed(2)} ${x.toFixed(2)} ${(y - size * 2.4).toFixed(2)}Z" fill="${color}"/>` : "";
    return `<g data-sparkle-color="${color}" opacity="${(.55 + unit(8300 + i) * .4).toFixed(2)}"><g filter="url(#sparkleBloom)"><circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${size.toFixed(2)}" fill="${color}"/>${flare}</g><circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${(size * .32).toFixed(2)}" fill="#FFFCE8" fill-opacity=".86"/></g>`;
  }).join("");
  const brushSpiral = Array.from({ length: 190 }, (_, i) => { const t = i / 189; const a = t * Math.PI * 7.4 + workSeed % 17 * .07; const r = 31 + t * 417 + Math.sin(i * .71 + workSeed) * .8; return `${i ? "L" : "M"}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`; }).join("");
  const style = `<style>.pigment-layer{mix-blend-mode:color}</style>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-512 -512 1024 1024" width="1024" height="1024">${style}<defs>${textureDefs}<linearGradient id="agedGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6F4B18"/><stop offset=".48" stop-color="#B88935"/><stop offset="1" stop-color="#7A5420"/></linearGradient><linearGradient id="midGold" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#98702B"/><stop offset=".52" stop-color="#D5AF57"/><stop offset="1" stop-color="#A67B30"/></linearGradient><linearGradient id="leafGold" x1=".15" y1=".85" x2=".85" y2=".15"><stop offset="0" stop-color="#A97927"/><stop offset=".43" stop-color="#F0D98A"/><stop offset=".58" stop-color="#FFF0B0"/><stop offset="1" stop-color="#B48632"/></linearGradient><radialGradient id="corePaint" cx="38%" cy="32%"><stop offset="0" stop-color="#E9D89D"/><stop offset=".24" stop-color="${core}"/><stop offset=".76" stop-color="${core}" stop-opacity=".88"/><stop offset="1" stop-color="#261A0A" stop-opacity=".7"/></radialGradient><linearGradient id="coreRay" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${core}" stop-opacity=".95"/><stop offset="1" stop-color="${core}" stop-opacity="0"/></linearGradient><radialGradient id="goldRay" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="450"><stop offset="0" stop-color="#FFF5CE"/><stop offset=".18" stop-color="#F6D875" stop-opacity=".95"/><stop offset=".52" stop-color="#E8BC58" stop-opacity=".62"/><stop offset="1" stop-color="#C28B2E" stop-opacity="0"/></radialGradient><radialGradient id="platinumRay" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="445"><stop offset="0" stop-color="#FFF9D8"/><stop offset=".38" stop-color="#FFF0AA" stop-opacity=".78"/><stop offset="1" stop-color="#EBC56C" stop-opacity="0"/></radialGradient><radialGradient id="gemLight" cx="32%" cy="24%"><stop offset="0" stop-color="#FFF6D5"/><stop offset=".18" stop-color="${core}"/><stop offset="1" stop-color="${core}" stop-opacity=".72"/></radialGradient><linearGradient id="gemDeep" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${core}"/><stop offset="1" stop-color="#130C08"/></linearGradient><linearGradient id="gemFlash" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${core}"/><stop offset=".48" stop-color="#FFF9DC"/><stop offset=".66" stop-color="${core}"/><stop offset="1" stop-color="#25170D"/></linearGradient><filter id="roughGold" x="-12%" y="-12%" width="124%" height="124%"><feTurbulence type="fractalNoise" baseFrequency=".015 .28" numOctaves="2" seed="${workSeed % 997}" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2"/></filter><filter id="fineGold" x="-16%" y="-16%" width="132%" height="132%"><feTurbulence type="fractalNoise" baseFrequency=".045 .19" numOctaves="2" seed="${(workSeed + 211) % 997}" result="fleck"/><feDisplacementMap in="SourceGraphic" in2="fleck" scale="1.15"/></filter><filter id="rayTexture" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="2" seed="${(workSeed + 317) % 997}" result="rayNoise"/><feDisplacementMap in="SourceGraphic" in2="rayNoise" scale="3.4"/></filter><filter id="coreTexture" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="turbulence" baseFrequency=".025 .16" numOctaves="3" seed="${(workSeed + 83) % 997}" result="paint"/><feDisplacementMap in="SourceGraphic" in2="paint" scale="2.8"/></filter><filter id="sparkleBloom" x="-250%" y="-250%" width="600%" height="600%"><feGaussianBlur stdDeviation="1.8" result="bloom"/><feMerge><feMergeNode in="bloom"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="insetShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="2" dy="5" stdDeviation="3.5" flood-color="#080604" flood-opacity=".95"/></filter></defs><g>${layerEls}<g data-radiant-rays="72">${rays}${rayThreads}</g>${filigreeRosettes}<path d="${brushSpiral}" fill="none" stroke="url(#midGold)" stroke-width="1.05" stroke-opacity=".46" stroke-linecap="round" stroke-dasharray="3 7 15 5" filter="url(#roughGold)"/><circle r="447" fill="none" stroke="url(#agedGold)" stroke-opacity=".58" stroke-width="1.2" stroke-dasharray="18 3 5 8" filter="url(#roughGold)"/><circle r="441" fill="none" stroke="url(#leafGold)" stroke-opacity=".4" stroke-width=".65" stroke-dasharray="2 5 11 4"/>${crownJewels}${parts}${goldLeaf}${compassEngraving}${birthSparkles}<g data-core-gemstone="${core}" data-gem-setting="inset" filter="url(#insetShadow)"><path d="M${gemSeat.replaceAll(" ", " L")}Z" fill="#120C08" fill-opacity=".94"/><path d="M${gemOutline.replaceAll(" ", " L")}Z" fill="${core}"/>${gemFacets}<path data-birth-color="${core}" d="M${gemTable.replaceAll(" ", " L")}Z" fill="url(#corePaint)" stroke="${core}" stroke-width=".6"/><path d="M${gemPoint(7, .57)}L${gemPoint(0, .57)}L${gemPoint(1, .57)}" fill="none" stroke="#FFFBE8" stroke-opacity=".72" stroke-width=".85"/>${gemProngs}</g></g></svg>`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image unavailable"));
    img.src = src;
  });
}

async function hybridToPng(svg: string): Promise<Blob> {
  const baseBlob = await fetch(BASE_IMAGE).then(response => {
    if (!response.ok) throw new Error("Base artwork unavailable");
    return response.blob();
  });
  const baseData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Base artwork unavailable"));
    reader.onerror = () => reject(new Error("Base artwork unavailable"));
    reader.readAsDataURL(baseBlob);
  });
  const plateContent = svg.slice(svg.indexOf(">") + 1, svg.lastIndexOf("</svg>"));
  const mergedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-512 -512 1024 1024" width="2048" height="2048"><image href="${baseData}" x="-512" y="-512" width="1024" height="1024" preserveAspectRatio="xMidYMid meet"/>${plateContent}</svg>`;
  const merged = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(mergedSvg)}`);
  return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      canvas.width = OUT; canvas.height = OUT;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas unavailable"));
      ctx.drawImage(merged, 0, 0, OUT, OUT);
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("PNG failed")), "image/png");
  });
}

export default function MandalaCanvas({ colors, language, variation, reduced, onCapture }: Props) {
  const copy = artSpecialistCopy[language];
  const [baseReady, setBaseReady] = useState(false);
  const codes = useMemo(() => colors.map(c => c.code), [colors]);
  const live = useMemo(() => buildMandalaColorPlate(codes, variation, !reduced), [codes, variation, reduced]);
  const capture = useCallback<Capture>(async () => ({ blob: await hybridToPng(buildMandalaColorPlate(codes, variation, false)), width: OUT, height: OUT }), [codes, variation]);
  useEffect(() => { onCapture(capture); return () => onCapture(null); }, [capture, onCapture]);

  return <div role="img" aria-label={copy.mandalaAlt} className="relative grid h-full w-full place-items-center overflow-hidden bg-art-void">
    <img src={BASE_IMAGE} alt="" aria-hidden="true" width={1024} height={1024} onLoad={() => setBaseReady(true)} className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${baseReady ? "opacity-100" : "opacity-0"}`} />
    <div className="absolute inset-0 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: live }} />
  </div>;
}
