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
  const { core, compassR, blades, layers, particles } = compassMandalaLayout(codes, variation);
  const grads = layers.map((l, i) => `<radialGradient id="g${i}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${l.outer.toFixed(1)}"><stop offset="${(l.inner / l.outer).toFixed(3)}" stop-color="${l.innerColor}"/><stop offset=".72" stop-color="${l.color}"/><stop offset="1" stop-color="${l.color}" stop-opacity=".76"/></radialGradient>`).join("");
  const layerEls = layers.slice().reverse().map((l, ri) => {
    const i = layers.length - 1 - ri;
    return `<g data-birth-color="${l.color}" class="plate-color ${animated ? (i % 2 ? "mc-rev" : "mc-rot") : ""}" style="animation-duration:${210 + i * 44}s"><path d="${l.path}" fill="url(#g${i})" fill-opacity=".86"/><path d="${l.path}" fill="none" stroke="${l.color}" stroke-opacity=".92" stroke-width="2.4" filter="url(#softGlow)"/><circle r="${l.outer.toFixed(1)}" fill="none" stroke="${l.color}" stroke-width="8" stroke-opacity=".36" filter="url(#softGlow)"/><circle r="${((l.inner + l.outer) / 2).toFixed(1)}" fill="none" stroke="${l.color}" stroke-width="${Math.max(18, (l.outer - l.inner) * .58).toFixed(1)}" stroke-opacity=".27"/>${Array.from({ length: l.petals * 2 }, (_, k) => { const a = l.phase + k * Math.PI / l.petals; return `<circle cx="${(Math.cos(a) * l.outer).toFixed(1)}" cy="${(Math.sin(a) * l.outer).toFixed(1)}" r="${k % 2 ? "3.2" : "2.1"}" fill="${l.color}" filter="url(#pinGlow)"/>`; }).join("")}</g>`;
  }).join("");
  const bladeEls = blades.map(b => `<polygon points="${b.points}" fill="${b.light ? "url(#goldL)" : "url(#goldD)"}"/>`).join("");
  const parts = particles.map((p, i) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r.toFixed(2)}" fill="${i % 3 ? "#D8AE4B" : "#FFF0B8"}" class="${animated ? "mc-tw" : ""}" style="animation-delay:${p.delay.toFixed(2)}s"/>`).join("");
  const style = `<style>.plate-color{mix-blend-mode:color}.plate-light{mix-blend-mode:soft-light}.plate-overlay{mix-blend-mode:overlay}${animated ? ".mc-rot,.mc-rev{transform-origin:0 0;animation:mc-turn linear infinite}.mc-rev{animation-direction:reverse}.mc-tw{animation:mc-tw 4.5s ease-in-out infinite alternate}.mc-in{transform-origin:0 0;animation:mc-in 1s ease-out both}@keyframes mc-turn{to{transform:rotate(360deg)}}@keyframes mc-tw{from{opacity:.3}to{opacity:1}}@keyframes mc-in{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}" : ""}</style>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-512 -512 1024 1024" width="1024" height="1024">${style}<defs>${grads}<linearGradient id="goldL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF4C2"/><stop offset="1" stop-color="#D7A82F"/></linearGradient><linearGradient id="goldD" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#AF7B22"/><stop offset="1" stop-color="#543407"/></linearGradient><radialGradient id="gem"><stop offset="0" stop-color="#FFF" stop-opacity=".9"/><stop offset=".28" stop-color="${core}"/><stop offset="1" stop-color="${core}"/></radialGradient><radialGradient id="coreAura"><stop offset="0" stop-color="${core}" stop-opacity=".9"/><stop offset="1" stop-color="${core}" stop-opacity="0"/></radialGradient><filter id="softGlow" x="-35%" y="-35%" width="170%" height="170%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="pinGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g class="${animated ? "mc-in" : ""}">${layerEls}<circle class="plate-light" r="${(compassR * 1.48).toFixed(1)}" fill="url(#coreAura)"/><g class="plate-overlay ${animated ? "mc-rot" : ""}" style="animation-duration:260s">${bladeEls}</g><circle data-birth-color="${core}" r="${(compassR * .24).toFixed(1)}" fill="url(#gem)" stroke="#FFF4C2" stroke-width="2.5" filter="url(#softGlow)"/>${parts}</g></svg>`;
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
