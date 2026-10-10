import { useCallback, useEffect, useMemo } from "react";
import type { Language } from "@/lib/translations";
import { compassMandalaLayout } from "@/lib/art-geometry";
import { artSpecialistCopy } from "@/lib/art-specialist-copy";

export type MandalaColor = { name: string; code: string };
export type Capture = () => Promise<{ blob: Blob; width: number; height: number }>;
type Props = { colors: MandalaColor[]; language: Language; variation: number; reduced: boolean; onCapture: (capture: Capture | null) => void };

const OUT = 2048;

/** Builds the full mandala SVG string; used both for display and PNG export (no network). */
function buildSvg(codes: string[], variation: number, animated: boolean) {
  const { core, compassR, blades, layers, particles } = compassMandalaLayout(codes, variation);
  const grads = layers.map((l, i) => `<radialGradient id="g${i}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${l.outer.toFixed(1)}"><stop offset="${(l.inner / l.outer).toFixed(3)}" stop-color="${l.innerColor}"/><stop offset="1" stop-color="${l.color}"/></radialGradient>`).join("");
  const layerEls = layers.slice().reverse().map((l, ri) => {
    const i = layers.length - 1 - ri;
    return `<g class="${animated ? (i % 2 ? "mc-rev" : "mc-rot") : ""}" style="animation-duration:${180 + i * 40}s"><path d="${l.path}" fill="url(#g${i})" fill-opacity=".9" filter="url(#glow)"/><path d="${l.path}" fill="none" stroke="#F8E08E" stroke-opacity=".55" stroke-width=".9"/><circle r="${l.outer.toFixed(1)}" fill="none" stroke="${l.color}" stroke-width="1.2" stroke-opacity=".85"/>${Array.from({ length: l.petals * 2 }, (_, k) => { const a = l.phase + k * Math.PI / l.petals; return `<circle cx="${(Math.cos(a) * l.outer).toFixed(1)}" cy="${(Math.sin(a) * l.outer).toFixed(1)}" r="2.2" fill="${k % 2 ? l.color : "#F8E08E"}"/>`; }).join("")}</g>`;
  }).join("");
  const bladeEls = blades.map(b => `<polygon points="${b.points}" fill="${b.light ? "url(#goldL)" : "url(#goldD)"}"/>`).join("");
  const parts = particles.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r.toFixed(2)}" fill="#FFE9A8" class="${animated ? "mc-tw" : ""}" style="animation-delay:${p.delay.toFixed(2)}s"/>`).join("");
  const style = animated ? `<style>.mc-rot,.mc-rev{transform-origin:0 0;animation:mc-turn linear infinite}.mc-rev{animation-direction:reverse}.mc-tw{animation:mc-tw 4s ease-in-out infinite alternate}.mc-in{transform-origin:0 0;animation:mc-in 1s ease-out both}@keyframes mc-turn{to{transform:rotate(360deg)}}@keyframes mc-tw{from{opacity:.25}to{opacity:1}}@keyframes mc-in{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}</style>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-512 -512 1024 1024" width="1024" height="1024">${style}<defs><radialGradient id="bg"><stop offset="0" stop-color="#0A1028"/><stop offset=".6" stop-color="#03040A"/><stop offset="1" stop-color="#000"/></radialGradient>${grads}<linearGradient id="goldL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF4C2"/><stop offset="1" stop-color="#E2B33C"/></linearGradient><linearGradient id="goldD" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B8862A"/><stop offset="1" stop-color="#6E4A12"/></linearGradient><radialGradient id="gem"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset=".35" stop-color="${core}"/><stop offset="1" stop-color="${core}"/></radialGradient><filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="halo"><feGaussianBlur stdDeviation="14"/></filter></defs><rect x="-512" y="-512" width="1024" height="1024" fill="url(#bg)"/><g class="${animated ? "mc-in" : ""}">${layerEls}<circle r="${(compassR * 1.15).toFixed(1)}" fill="#000" fill-opacity=".55"/><circle r="${(compassR * .9).toFixed(1)}" fill="#F4C84A" fill-opacity=".45" filter="url(#halo)"/><g class="${animated ? "mc-rot" : ""}" style="animation-duration:240s">${bladeEls}</g><circle r="${(compassR * .2).toFixed(1)}" fill="url(#gem)" stroke="#FFF4C2" stroke-width="1.5" filter="url(#glow)"/>${parts}</g></svg>`;
}

function svgToPng(svg: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = OUT; canvas.height = OUT;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas unavailable"));
      ctx.drawImage(img, 0, 0, OUT, OUT);
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("PNG failed")), "image/png");
    };
    img.onerror = () => reject(new Error("SVG failed"));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

export default function MandalaCanvas({ colors, language, variation, reduced, onCapture }: Props) {
  const copy = artSpecialistCopy[language];
  const codes = useMemo(() => colors.map(c => c.code), [colors]);
  const live = useMemo(() => buildSvg(codes, variation, !reduced), [codes, variation, reduced]);
  const capture = useCallback<Capture>(async () => ({ blob: await svgToPng(buildSvg(codes, variation, false)), width: OUT, height: OUT }), [codes, variation]);
  useEffect(() => { onCapture(capture); return () => onCapture(null); }, [capture, onCapture]);

  return <div role="img" aria-label={copy.mandalaAlt} className="grid h-full w-full place-items-center overflow-hidden bg-art-void [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: live }} />;
}
