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
  const compassEngraving = blades.map((blade, i) => `<polygon points="${blade.points}" fill="${blade.light ? "url(#leafGold)" : "url(#agedGold)"}" fill-opacity="${blade.light ? ".36" : ".25"}" stroke="${i % 4 ? "#8A6425" : "#E7CA75"}" stroke-opacity=".48" stroke-width=".42" filter="url(#roughGold)"/>`).join("");
  const brushSpiral = Array.from({ length: 190 }, (_, i) => { const t = i / 189; const a = t * Math.PI * 7.4 + workSeed % 17 * .07; const r = 31 + t * 417 + Math.sin(i * .71 + workSeed) * .8; return `${i ? "L" : "M"}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`; }).join("");
  const style = `<style>.pigment-layer{mix-blend-mode:color}</style>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-512 -512 1024 1024" width="1024" height="1024">${style}<defs>${textureDefs}<linearGradient id="agedGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6F4B18"/><stop offset=".48" stop-color="#B88935"/><stop offset="1" stop-color="#7A5420"/></linearGradient><linearGradient id="midGold" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#98702B"/><stop offset=".52" stop-color="#D5AF57"/><stop offset="1" stop-color="#A67B30"/></linearGradient><linearGradient id="leafGold" x1=".15" y1=".85" x2=".85" y2=".15"><stop offset="0" stop-color="#A97927"/><stop offset=".43" stop-color="#F0D98A"/><stop offset=".58" stop-color="#FFF0B0"/><stop offset="1" stop-color="#B48632"/></linearGradient><radialGradient id="corePaint" cx="38%" cy="32%"><stop offset="0" stop-color="#E9D89D"/><stop offset=".24" stop-color="${core}"/><stop offset=".76" stop-color="${core}" stop-opacity=".88"/><stop offset="1" stop-color="#261A0A" stop-opacity=".7"/></radialGradient><filter id="roughGold" x="-12%" y="-12%" width="124%" height="124%"><feTurbulence type="fractalNoise" baseFrequency=".015 .28" numOctaves="2" seed="${workSeed % 997}" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2"/></filter><filter id="fineGold" x="-16%" y="-16%" width="132%" height="132%"><feTurbulence type="fractalNoise" baseFrequency=".045 .19" numOctaves="2" seed="${(workSeed + 211) % 997}" result="fleck"/><feDisplacementMap in="SourceGraphic" in2="fleck" scale="1.15"/></filter><filter id="coreTexture" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="turbulence" baseFrequency=".025 .16" numOctaves="3" seed="${(workSeed + 83) % 997}" result="paint"/><feDisplacementMap in="SourceGraphic" in2="paint" scale="2.8"/></filter></defs><g>${layerEls}<path d="${brushSpiral}" fill="none" stroke="url(#midGold)" stroke-width="1.05" stroke-opacity=".46" stroke-linecap="round" stroke-dasharray="3 7 15 5" filter="url(#roughGold)"/><circle r="447" fill="none" stroke="url(#agedGold)" stroke-opacity=".58" stroke-width="1.2" stroke-dasharray="18 3 5 8" filter="url(#roughGold)"/><circle r="441" fill="none" stroke="url(#leafGold)" stroke-opacity=".4" stroke-width=".65" stroke-dasharray="2 5 11 4"/>${parts}${goldLeaf}<circle data-birth-color="${core}" r="${(compassR * .29).toFixed(1)}" fill="url(#corePaint)" fill-opacity=".9" stroke="#B88B32" stroke-opacity=".72" stroke-width="2.2" filter="url(#coreTexture)"/>${compassEngraving}<circle r="${(compassR * .22).toFixed(1)}" fill="none" stroke="url(#leafGold)" stroke-opacity=".7" stroke-width=".8" stroke-dasharray="7 2 2 3" filter="url(#roughGold)"/><circle r="${(compassR * .11).toFixed(1)}" fill="none" stroke="#F5DF92" stroke-opacity=".46" stroke-width=".55" stroke-dasharray="1.5 2.7" filter="url(#fineGold)"/></g></svg>`;
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
