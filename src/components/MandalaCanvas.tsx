import { useCallback, useEffect, useRef, useState } from "react";
import type { Language } from "@/lib/translations";
import { artSpecialistCopy } from "@/lib/art-specialist-copy";
import mandalaBase from "@/assets/mandala-base-vivid.jpg";
import { capturePaintedMandala } from "@/lib/painted-mandala";

export type MandalaColor = { name: string; code: string };
export type Capture = (options?: { hideBirthDetails?: boolean }) => Promise<{ blob: Blob; width: number; height: number }>;
type Props = { language: Language; onCapture: (capture: Capture | null) => void };

/** The original painting is the entire artwork; no procedural overlays. */
export default function MandalaCanvas({ language, onCapture }: Props) {
  const copy = artSpecialistCopy[language];
  const image = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const capture = useCallback<Capture>(async () => {
    const source = image.current;
    if (!source || !source.complete || !source.naturalWidth) throw new Error("Artwork unavailable");
    return capturePaintedMandala(source, getComputedStyle(source).filter);
  }, []);
  useEffect(() => {
    onCapture(ready ? capture : null);
    return () => onCapture(null);
  }, [ready, capture, onCapture]);

  return <div className="relative grid h-full w-full place-items-center overflow-hidden bg-art-void">
    <img ref={image} src={mandalaBase} alt={copy.mandalaAlt} width={1024} height={1024}
      decoding="async" onLoad={() => { setReady(true); setFailed(false); }}
      onError={() => { setReady(false); setFailed(true); }}
      className="mandala-masterpiece h-full w-full object-contain" />
    {failed && <p role="alert" className="absolute inset-0 grid place-items-center bg-art-void p-6 text-center text-foreground">{copy.imageError}</p>}
  </div>;
}
