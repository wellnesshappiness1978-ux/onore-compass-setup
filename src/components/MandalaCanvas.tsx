import { useCallback, useEffect, useRef, useState } from "react";
import type { Language } from "@/lib/translations";
import { artSpecialistCopy } from "@/lib/art-specialist-copy";
import mandalaBase from "@/assets/mandala-base-vivid.jpg";
import { capturePaintedMandala, drawMandalaComposition, type MandalaFinish } from "@/lib/painted-mandala";

export type MandalaColor = { name: string; code: string };
export type Capture = (options?: { hideBirthDetails?: boolean }) => Promise<{ blob: Blob; width: number; height: number }>;
type Props = { language: Language; onCapture: (capture: Capture | null) => void; colors?: string[]; labels?: string[] };

const BASE_FILTER = "brightness(1.12) saturate(1.18)";

/** The original painting is the artwork; the personal birth-color gem and
 * seven-color crown are composed on top, identically for view and export. */
export default function MandalaCanvas({ language, onCapture, colors = [], labels = [] }: Props) {
  const copy = artSpecialistCopy[language];
  const canvas = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [failed, setFailed] = useState(false);
  const finish = useRef<MandalaFinish>({ colors, labels });
  finish.current = { colors, labels };

  useEffect(() => {
    const source = new Image();
    source.decoding = "async";
    source.onload = () => { setImage(source); setFailed(false); };
    source.onerror = () => { setImage(null); setFailed(true); };
    source.src = mandalaBase;
    return () => { source.onload = null; source.onerror = null; };
  }, []);

  const paint = useCallback(() => {
    const target = canvas.current;
    if (!target || !image) return;
    const context = target.getContext("2d");
    if (!context) return;
    drawMandalaComposition(context, image, target.width, finish.current, BASE_FILTER);
  }, [image]);

  useEffect(() => {
    const target = canvas.current;
    if (!target || !image) return;
    const size = Math.min(1024, Math.max(320, Math.round((target.clientWidth || 640) * (window.devicePixelRatio || 1))));
    if (target.width !== size) { target.width = size; target.height = size; }
    paint();
    const observer = new ResizeObserver(() => {
      const next = Math.min(1024, Math.max(320, Math.round((target.clientWidth || 640) * (window.devicePixelRatio || 1))));
      if (target.width !== next) { target.width = next; target.height = next; }
      paint();
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [image, paint, colors, labels]);

  const capture = useCallback<Capture>(async () => {
    if (!image) throw new Error("Artwork unavailable");
    return capturePaintedMandala(image, finish.current, BASE_FILTER);
  }, [image]);
  useEffect(() => {
    onCapture(image ? capture : null);
    return () => onCapture(null);
  }, [image, capture, onCapture]);

  return <div className="relative grid h-full w-full place-items-center overflow-hidden bg-art-void">
    <canvas ref={canvas} role="img" aria-label={copy.mandalaAlt} className="mandala-masterpiece h-full w-full object-contain" />
    {failed && <p role="alert" className="absolute inset-0 grid place-items-center bg-art-void p-6 text-center text-foreground">{copy.imageError}</p>}
  </div>;
}
