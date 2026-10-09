import { useCallback, useEffect, useMemo, useState } from "react";
import type { Language } from "@/lib/translations";
import { mandalaImageUrl, type MandalaColor } from "@/lib/mandala-image";
import { artSpecialistCopy } from "@/lib/art-specialist-copy";
import { AgolmenLoading } from "./AgolmenSpiral";

export type Capture = () => Promise<{ blob: Blob; width: number; height: number }>;
type Props = { colors: MandalaColor[]; language: Language; variation: number; reduced: boolean; onCapture: (capture: Capture | null) => void };
const ignoreCapture = () => undefined;

export default function MandalaScene({ colors, language, variation, reduced, onCapture }: Props) {
  const copy = artSpecialistCopy[language];
  const url = useMemo(() => mandalaImageUrl(colors, variation), [colors, variation]);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const capture = useCallback<Capture>(async () => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(copy.imageError);
    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) throw new Error(copy.imageError);
    return { blob, width: 1024, height: 1024 };
  }, [copy.imageError, url]);

  useEffect(() => { setLoaded(false); setFailed(false); onCapture(null); }, [url, onCapture]);
  useEffect(() => { if (loaded && !failed) onCapture(capture); return () => onCapture(null); }, [capture, failed, loaded, onCapture]);

  return <div className="relative h-full w-full overflow-hidden bg-art-void">
    <img src={url} alt={copy.mandalaAlt} onLoad={() => { setLoaded(true); setFailed(false); }} onError={() => { setLoaded(false); setFailed(true); }} className={`h-full w-full object-cover transition-opacity duration-1000 ${loaded ? "opacity-100" : "opacity-0"} ${reduced ? "duration-0" : ""}`} />
    {!loaded && !failed && <div className="absolute inset-0 grid place-items-center bg-art-void p-6"><AgolmenLoading label={copy.imageLoading} /></div>}
    {failed && <div role="alert" className="absolute inset-0 grid place-items-center bg-art-void p-8 text-center text-sm leading-7 text-destructive">{copy.imageError}</div>}
  </div>;
}

export { ignoreCapture };
