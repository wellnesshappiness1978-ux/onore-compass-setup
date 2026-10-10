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
export function buildMandalaColorPlate(codes: string[], variation: number, animated: boolean) {
  const { core, compassR, blades, layers, particles, workSeed } = compassMandalaLayout(codes, variation);
  const grads = layers.map((l, i) => `<radialGradient id="g${i}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${l.outer.toFixed(1)}"><stop offset="${(l.inner / l.outer).toFixed(3)}" stop-color="${l.innerColor}"/><stop offset=".58" stop-color="${l.color}"/><stop offset=".88" stop-color="${l.color}"/><stop offset="1" stop-color="${l.color}" stop-opacity=".9"/></radialGradient><linearGradient id="j${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF8D6" stop-opacity=".9"/><stop offset=".18" stop-color="${l.color}"/><stop offset=".55" stop-color="${l.color}" stop-opacity=".68"/><stop offset=".78" stop-color="#FFF0AA" stop-opacity=".72"/><stop offset="1" stop-color="${l.color}"/></linearGradient>`).join("");
  const layerEls = layers.slice().reverse().map((l, ri) => {
    const i = layers.length - 1 - ri;
    const middle = (l.inner + l.outer) / 2;
    const jewels = Array.from({ length: l.petals }, (_, k) => { const a = l.phase + k * Math.PI * 2 / l.petals; const r = k % 2 ? middle + (l.outer - l.inner) * .13 : middle - (l.outer - l.inner) * .1; const x = Math.cos(a) * r; const y = Math.sin(a) * r; const size = 3.4 + (k % 3); return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(a * 180 / Math.PI + 45).toFixed(1)})"><rect x="-${size}" y="-${size}" width="${size * 2}" height="${size * 2}" rx="1" fill="url(#j${i})" stroke="#FFE9A0" stroke-width=".8"/><path d="M-${size} 0L0 -${size}L${size} 0L0 ${size}Z" fill="none" stroke="#FFF8D6" stroke-opacity=".7" stroke-width=".45"/></g>`; }).join("");
    const beads = Array.from({ length: l.petals * 3 }, (_, k) => { const a = l.phase + k * Math.PI * 2 / (l.petals * 3); return `<circle cx="${(Math.cos(a) * l.outer).toFixed(1)}" cy="${(Math.sin(a) * l.outer).toFixed(1)}" r="${k % 3 ? "1.35" : "2.25"}" fill="${k % 3 ? "#D7AD4D" : l.color}" stroke="#FFF2B8" stroke-width=".35"/>`; }).join("");
    return `<g data-birth-color="${l.color}" class="plate-color ${animated ? (i % 2 ? "mc-rev" : "mc-rot") : ""}" style="animation-duration:${300 + i * 58}s"><path d="${l.path}" fill="url(#g${i})" fill-opacity=".94" stroke="#D7AD4D" stroke-width="1.4"/><path d="${l.innerPath}" fill="none" stroke="#FFF0A6" stroke-opacity=".84" stroke-width="1.05"/><path d="${l.facetPath}" fill="url(#j${i})" fill-opacity=".5" stroke="#F2CE73" stroke-opacity=".82" stroke-width=".7"/><path d="${l.guillochePath}" fill="none" stroke="#FFE7A0" stroke-opacity=".72" stroke-width=".8"/><path d="${l.guillochePath}" fill="none" stroke="${l.color}" stroke-opacity=".96" stroke-width="3.4" filter="url(#jewelGlow)"/>${jewels}${beads}</g>`;
  }).join("");
  const bladeEls = blades.map(b => `<polygon points="${b.points}" fill="${b.light ? "url(#goldL)" : "url(#goldD)"}"/>`).join("");
  const parts = particles.map((p, i) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r.toFixed(2)}" fill="${i % 3 ? "#D8AE4B" : "#FFF0B8"}" class="${animated ? "mc-tw" : ""}" style="animation-delay:${p.delay.toFixed(2)}s"/>`).join("");
  const spiral = Array.from({ length: 190 }, (_, i) => { const t = i / 189; const a = t * Math.PI * 8 + workSeed % 17 * .07; const r = 34 + t * 414; return `${i ? "L" : "M"}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`; }).join("");
  const crown = Array.from({ length: 48 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI * 2 / 48; const r1 = 453; const r2 = i % 2 ? 473 : 485; const half = Math.PI / 96; const p = (r: number, aa: number) => `${(Math.cos(aa) * r).toFixed(1)},${(Math.sin(aa) * r).toFixed(1)}`; return `<path d="M${p(r1,a-half)}L${p(r2,a)}L${p(r1,a+half)}Z" fill="${i % 2 ? "#7B5417" : "#D7AD4D"}" stroke="#FFE9A5" stroke-width=".65"/>`; }).join("");
  const style = `<style>.plate-color{mix-blend-mode:color}.plate-light{mix-blend-mode:soft-light}.plate-overlay{mix-blend-mode:overlay}${animated ? ".mc-rot,.mc-rev{transform-origin:0 0;animation:mc-turn linear infinite}.mc-rev{animation-direction:reverse}.mc-tw{animation:mc-tw 4.5s ease-in-out infinite alternate}.mc-in{transform-origin:0 0;animation:mc-in 1s ease-out both}@keyframes mc-turn{to{transform:rotate(360deg)}}@keyframes mc-tw{from{opacity:.3}to{opacity:1}}@keyframes mc-in{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}" : ""}</style>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-512 -512 1024 1024" width="1024" height="1024">${style}<defs>${grads}<linearGradient id="goldL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF8D0"/><stop offset=".45" stop-color="#E5BE58"/><stop offset="1" stop-color="#9A6717"/></linearGradient><linearGradient id="goldD" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B78124"/><stop offset="1" stop-color="#402704"/></linearGradient><radialGradient id="gem"><stop offset="0" stop-color="#FFF"/><stop offset=".18" stop-color="${core}"/><stop offset=".72" stop-color="${core}"/><stop offset="1" stop-color="#120B04"/></radialGradient><radialGradient id="coreAura"><stop offset="0" stop-color="${core}" stop-opacity=".74"/><stop offset="1" stop-color="${core}" stop-opacity="0"/></radialGradient><filter id="softGlow" x="-35%" y="-35%" width="170%" height="170%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="jewelGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g class="${animated ? "mc-in" : ""}"><g class="plate-overlay">${crown}<circle r="447" fill="none" stroke="#D7AD4D" stroke-width="2"/><circle r="441" fill="none" stroke="#FFF0A8" stroke-width=".55" stroke-dasharray="1.5 4"/></g>${layerEls}<path d="${spiral}" fill="none" stroke="#F5D77D" stroke-width="1.1" stroke-opacity=".72"/><path d="${spiral}" fill="none" stroke="${core}" stroke-width="3.8" stroke-opacity=".26" filter="url(#jewelGlow)"/><circle class="plate-light" r="${(compassR * 1.7).toFixed(1)}" fill="url(#coreAura)"/><g class="plate-overlay ${animated ? "mc-rot" : ""}" style="animation-duration:420s">${bladeEls}</g><circle r="${(compassR * .36).toFixed(1)}" fill="none" stroke="#D7AD4D" stroke-width="4" stroke-dasharray="2 3"/><circle data-birth-color="${core}" r="${(compassR * .25).toFixed(1)}" fill="url(#gem)" stroke="#FFF4C2" stroke-width="3" filter="url(#softGlow)"/><path d="M0 -${(compassR*.2).toFixed(1)}L${(compassR*.12).toFixed(1)} 0L0 ${(compassR*.2).toFixed(1)}L-${(compassR*.12).toFixed(1)} 0Z" fill="none" stroke="#FFF8D8" stroke-width="1"/>${parts}</g></svg>`;
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
  const [base, colorPlate] = await Promise.all([
    loadImage(BASE_IMAGE),
    loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`),
  ]);
  return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      canvas.width = OUT; canvas.height = OUT;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas unavailable"));
      ctx.drawImage(base, 0, 0, OUT, OUT);
      ctx.drawImage(colorPlate, 0, 0, OUT, OUT);
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
    <img src={BASE_IMAGE} alt="" aria-hidden="true" width={1024} height={1024} onLoad={() => setBaseReady(true)} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${baseReady ? "opacity-100" : "opacity-0"}`} />
    <div className="absolute inset-0 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: live }} />
  </div>;
}
