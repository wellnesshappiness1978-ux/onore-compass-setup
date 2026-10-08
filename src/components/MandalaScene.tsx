import { useCallback, useEffect, useMemo, useRef } from "react";
import { dotPaintLayout } from "@/lib/art-geometry";

export type Capture = () => Promise<{ blob: Blob; width: number; height: number }>;
type Props = { colors: string[]; progress: number; reduced: boolean; onCapture: (capture: Capture | null) => void };

const R = 480;
const BG_INNER = "#0B132B";
const BG_OUTER = "#020309";

export default function MandalaScene({ colors, progress, reduced, onCapture }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const dots = useMemo(() => dotPaintLayout(colors, R), [colors]);
  const core = colors[0] ?? "#FFD21C";
  const reveal = Math.min(1, Math.max(0, progress / 1.5));

  const capture = useCallback<Capture>(async () => {
    const node = svg.current;
    if (!node) throw new Error("Artwork unavailable");
    const clone = node.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.querySelectorAll("[data-spin]").forEach(el => el.removeAttribute("style"));
    clone.setAttribute("width", "2160");
    clone.setAttribute("height", "2160");
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" }));
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error("Image unavailable")); img.src = url; });
      const width = 2160, height = 3840;
      const out = document.createElement("canvas");
      out.width = width; out.height = height;
      const ctx = out.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      const bg = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, height * .6);
      bg.addColorStop(0, BG_INNER); bg.addColorStop(1, BG_OUTER);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, (height - width) / 2, width, width);
      ctx.fillStyle = core;
      ctx.textAlign = "center";
      ctx.font = `${Math.round(width / 26)}px serif`;
      ctx.fillText("AGOLMEN'S COMPASS", width / 2, height * .16);
      ctx.font = `${Math.round(width / 55)}px sans-serif`;
      ctx.fillText("BIRTH COLOR MANDALA · ILLUSTRATIVE ART", width / 2, height * .83);
      const blob = await new Promise<Blob>((resolve, reject) => out.toBlob(v => v ? resolve(v) : reject(new Error("PNG unavailable")), "image/png"));
      return { blob, width, height };
    } finally {
      URL.revokeObjectURL(url);
    }
  }, [core]);

  useEffect(() => { onCapture(capture); return () => onCapture(null); }, [capture, onCapture]);

  return <div className="relative h-full w-full overflow-hidden" style={{ background: `radial-gradient(circle, ${BG_INNER} 0%, ${BG_OUTER} 75%)` }}>
    <style>{"@keyframes mandala-spin{to{transform:rotate(360deg)}}"}</style>
    <svg ref={svg} viewBox="-500 -500 1000 1000" role="img" aria-label="バースカラー曼陀羅" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="dot-gloss" cx=".35" cy=".3" r=".7">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".55" />
          <stop offset=".45" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity=".28" />
        </radialGradient>
      </defs>
      <g data-spin="" style={reduced ? undefined : { animation: "mandala-spin 300s linear infinite", transformOrigin: "0 0" }}>
        {[0, 1, 2, 3, 4, 5].map(band => {
          const shown = reduced || reveal >= band / 6 + .02;
          return <g key={band} style={{ opacity: shown ? 1 : 0, transition: reduced ? undefined : "opacity .45s ease" }}>
            {dots.filter(d => d.band === band).map((d, i) => <g key={i}>
              <circle cx={d.x} cy={d.y} r={d.r} fill={d.color} />
              <circle cx={d.x} cy={d.y} r={d.r} fill="url(#dot-gloss)" />
            </g>)}
          </g>;
        })}
      </g>
    </svg>
  </div>;
}
