import { useCallback, useEffect, useMemo, useRef } from "react";
import { regularPolygonPoints, simpleMandalaRings, type MandalaMotif } from "@/lib/art-geometry";

export type Capture = () => Promise<{ blob: Blob; width: number; height: number }>;
type Props = { colors: string[]; progress: number; reduced: boolean; onCapture: (capture: Capture | null) => void };

const R = 480;
const BG_INNER = "#0B132B";
const BG_OUTER = "#020309";

function ringPath(inner: number, outer: number) {
  return `M ${outer} 0 A ${outer} ${outer} 0 1 0 ${-outer} 0 A ${outer} ${outer} 0 1 0 ${outer} 0 Z M ${inner} 0 A ${inner} ${inner} 0 1 1 ${-inner} 0 A ${inner} ${inner} 0 1 1 ${inner} 0 Z`;
}

function polyPoints(sides: number, radius: number, phase: number) {
  return regularPolygonPoints(sides, radius, phase).map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

function Motif({ motif, inner, outer, symmetry, color }: { motif: MandalaMotif; inner: number; outer: number; symmetry: number; color: string }) {
  const mid = (inner + outer) / 2;
  const span = outer - inner;
  const items = Array.from({ length: symmetry }, (_, i) => (i / symmetry) * 360);
  if (motif === "hexagon" || motif === "octagon") {
    const sides = motif === "hexagon" ? 6 : 8;
    return <g fill="none" stroke={color} strokeWidth={1.1} strokeOpacity={.9}>
      <polygon points={polyPoints(sides, outer - span * .12, 0)} />
      <polygon points={polyPoints(sides, outer - span * .12, Math.PI / sides)} />
      {items.map(a => <line key={a} x1={0} y1={-inner - span * .1} x2={0} y2={-outer + span * .1} transform={`rotate(${a})`} strokeOpacity={.55} />)}
    </g>;
  }
  if (motif === "circles") {
    return <g fill="none" stroke={color} strokeWidth={1} strokeOpacity={.85}>
      {items.map(a => <circle key={a} cx={0} cy={-mid} r={span * .42} transform={`rotate(${a})`} />)}
    </g>;
  }
  return <g fill="none" stroke={color} strokeWidth={1.1} strokeOpacity={.9}>
    {items.map(a => <path key={a} d={`M 0 ${-inner - span * .08} Q ${span * .34} ${-mid} 0 ${-outer + span * .08} Q ${-span * .34} ${-mid} 0 ${-inner - span * .08} Z`} transform={`rotate(${a})`} />)}
  </g>;
}

export default function MandalaScene({ colors, progress, reduced, onCapture }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const mandala = useMemo(() => simpleMandalaRings(colors, R), [colors]);
  const reveal = Math.min(1, Math.max(0, progress / 1.2));

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
      ctx.fillStyle = mandala.core;
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
  }, [mandala.core]);

  useEffect(() => { onCapture(capture); return () => onCapture(null); }, [capture, onCapture]);

  return <div className="relative h-full w-full overflow-hidden" style={{ background: `radial-gradient(circle, ${BG_INNER} 0%, ${BG_OUTER} 75%)` }}>
    <style>{"@keyframes mandala-spin{to{transform:rotate(360deg)}}"}</style>
    <svg ref={svg} viewBox="-500 -500 1000 1000" role="img" aria-label="バースカラー曼陀羅" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        {mandala.rings.map((ring, i) => <radialGradient key={i} id={`mandala-ring-${i}`} gradientUnits="userSpaceOnUse" cx={0} cy={0} r={ring.outer}>
          <stop offset={ring.inner / ring.outer} stopColor={ring.innerColor} />
          <stop offset={1} stopColor={ring.color} />
        </radialGradient>)}
        <radialGradient id="mandala-core" gradientUnits="userSpaceOnUse" cx={0} cy={0} r={mandala.coreRadius}>
          <stop offset={0} stopColor={mandala.core} stopOpacity={.95} />
          <stop offset={1} stopColor={mandala.core} stopOpacity={.35} />
        </radialGradient>
      </defs>
      <g style={{ opacity: reveal, transform: `scale(${.85 + reveal * .15})`, transition: reduced ? undefined : "opacity 1s ease, transform 1s ease" }}>
        <g data-spin="" style={reduced ? undefined : { animation: "mandala-spin 240s linear infinite", transformOrigin: "0 0" }}>
          {mandala.rings.map((ring, i) => {
            const mid = (ring.inner + ring.outer) / 2;
            return <g key={i}>
              <path d={ringPath(ring.inner, ring.outer)} fill={`url(#mandala-ring-${i})`} fillRule="evenodd" fillOpacity={.16} />
              <circle r={ring.outer} fill="none" stroke={ring.color} strokeWidth={.8} strokeOpacity={.7} />
              <Motif motif={ring.motif} inner={ring.inner} outer={ring.outer} symmetry={ring.symmetry} color={ring.color} />
              {Array.from({ length: ring.dots }, (_, d) => {
                const a = (d / ring.dots) * Math.PI * 2 + (i % 2 ? Math.PI / ring.dots : 0);
                const r = d % 2 ? ring.outer - 6 : mid;
                return <circle key={d} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={d % 2 ? 2.2 : 3.2} fill={d % 2 ? ring.color : ring.innerColor} />;
              })}
            </g>;
          })}
          <circle r={mandala.coreRadius} fill="url(#mandala-core)" />
          <Motif motif="petals" inner={mandala.coreRadius * .2} outer={mandala.coreRadius * .95} symmetry={8} color={mandala.core} />
          <circle r={mandala.coreRadius * .18} fill={mandala.core} />
        </g>
      </g>
    </svg>
  </div>;
}
