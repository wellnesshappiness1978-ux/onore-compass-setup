import { useCallback, useEffect, useMemo, useState } from "react";
import type { Language } from "@/lib/translations";
import { mandalaImageUrl, type MandalaColor } from "@/lib/mandala-image";
import { dotPaintLayout } from "@/lib/art-geometry";
import { artSpecialistCopy } from "@/lib/art-specialist-copy";
import { AgolmenLoading } from "./AgolmenSpiral";

export type Capture = () => Promise<{ blob: Blob; width: number; height: number }>;
type Props = { colors: MandalaColor[]; language: Language; variation: number; reduced: boolean; onCapture: (capture: Capture | null) => void };

const SIZE = 1024;

/** Backup artwork drawn locally from the same seven colors when the AI image is unavailable. */
function fallbackSvg(colors: string[]) {
  const dots = dotPaintLayout(colors, 480);
  const body = dots.map(d => `<circle cx="${(d.x + 512).toFixed(1)}" cy="${(d.y + 512).toFixed(1)}" r="${d.r.toFixed(2)}" fill="${d.color}"/><circle cx="${(d.x + 512 - d.r * 0.3).toFixed(1)}" cy="${(d.y + 512 - d.r * 0.3).toFixed(1)}" r="${(d.r * 0.35).toFixed(2)}" fill="#fff" fill-opacity="0.35"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}"><defs><radialGradient id="bg"><stop offset="0" stop-color="#14204a"/><stop offset="1" stop-color="#03050d"/></radialGradient></defs><rect width="${SIZE}" height="${SIZE}" fill="url(#bg)"/>${body}</svg>`;
}

function svgToPng(svg: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = SIZE; canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas unavailable"));
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("PNG failed")), "image/png");
    };
    img.onerror = () => reject(new Error("SVG failed"));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

export default function MandalaScene({ colors, language, variation, reduced, onCapture }: Props) {
  const copy = artSpecialistCopy[language];
  const url = useMemo(() => mandalaImageUrl(colors, variation), [colors, variation]);
  const svg = useMemo(() => fallbackSvg(colors.map(c => c.code)), [colors]);
  const svgUrl = useMemo(() => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, [svg]);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const capture = useCallback<Capture>(async () => {
    if (!failed) {
      try {
        const response = await fetch(url);
        const blob = response.ok ? await response.blob() : null;
        if (blob && blob.size > 0 && blob.type.startsWith("image/")) return { blob, width: SIZE, height: SIZE };
      } catch { /* fall back to the local artwork */ }
    }
    return { blob: await svgToPng(svg), width: SIZE, height: SIZE };
  }, [failed, svg, url]);

  useEffect(() => { setLoaded(false); setFailed(false); }, [url]);
  // Fallback is always savable, so capture is ready once either image settles.
  useEffect(() => { if (loaded || failed) onCapture(capture); else onCapture(null); return () => onCapture(null); }, [capture, failed, loaded, onCapture]);

  return <div className="relative h-full w-full overflow-hidden bg-art-void">
    {failed
      ? <img src={svgUrl} alt={copy.mandalaAlt} className={`h-full w-full object-contain ${reduced ? "" : "animate-in fade-in duration-1000"}`} />
      : <img src={url} alt={copy.mandalaAlt} onLoad={e => { if (e.currentTarget.naturalWidth > 0) setLoaded(true); else setFailed(true); }} onError={() => setFailed(true)} className={`h-full w-full object-cover transition-opacity ${reduced ? "duration-0" : "duration-1000"} ${loaded ? "opacity-100" : "opacity-0"}`} />}
    {!loaded && !failed && <div className="absolute inset-0 grid place-items-center bg-art-void p-6"><AgolmenLoading label={copy.imageLoading} /></div>}
  </div>;
}
