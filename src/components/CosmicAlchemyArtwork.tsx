import { useEffect, useRef, useCallback } from "react";
import type { ReturnTypeNatal } from "@/lib/natal-sky-types";
import type { Capture } from "./MandalaScene";

type Props = { sky: ReturnTypeNatal; main: string; sub: string; onCapture: (capture: Capture | null) => void };

function paint(canvas: HTMLCanvasElement, sky: ReturnTypeNatal, main: string, sub: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const { width: w, height: h } = canvas;
  const cx = w / 2, cy = h * .49, r = w * .38;
  const root = getComputedStyle(document.documentElement);
  const voidColor = root.getPropertyValue("--art-void").trim() || "oklch(0.105 0.035 255)";
  const gold = root.getPropertyValue("--gold-glow").trim() || "oklch(0.96 0.055 92)";
  const bg = ctx.createRadialGradient(cx, cy, w * .06, cx, cy, h * .73);
  bg.addColorStop(0, main); bg.addColorStop(.19, voidColor); bg.addColorStop(1, voidColor);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  // Deterministic stars from the date-based planet positions, not a new reading.
  const seed = sky.bodies.reduce((n, b) => n + Math.round(b.longitude * 100), 0);
  for (let i = 0; i < 780; i++) {
    const x = ((i * 739 + seed * 19) % 997) / 997 * w;
    const y = ((i * 433 + seed * 31) % 991) / 991 * h;
    const a = .16 + ((i * 17) % 50) / 100;
    ctx.globalAlpha = a; ctx.fillStyle = i % 9 === 0 ? sub : gold;
    ctx.beginPath(); ctx.arc(x, y, (i % 11 === 0 ? 1.5 : .55) * w / 900, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  const light = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.1);
  light.addColorStop(0, gold); light.addColorStop(.08, sub); light.addColorStop(.24, main); light.addColorStop(.7, "transparent");
  ctx.globalAlpha = .62; ctx.fillStyle = light; ctx.fillRect(cx-r*1.15, cy-r*1.15, r*2.3, r*2.3); ctx.globalAlpha = 1;
  for (let ring = 0; ring < 7; ring++) {
    ctx.strokeStyle = ring % 2 ? sub : gold; ctx.globalAlpha = .2 + ring * .045;
    ctx.lineWidth = Math.max(1, w / 800);
    ctx.beginPath(); ctx.ellipse(cx, cy, r * (.35 + ring * .12), r * (.22 + ring * .09), ring % 2 ? -.4 : .4, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalAlpha = .85;
  sky.bodies.forEach((body, i) => {
    const rad = (body.longitude - 90) * Math.PI / 180;
    const distance = r * (.62 + i % 3 * .12);
    const x = cx + Math.cos(rad) * distance, y = cy + Math.sin(rad) * distance * .78;
    ctx.strokeStyle = i % 2 ? sub : gold; ctx.lineWidth = w / 1200;
    ctx.globalAlpha = .35; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
    ctx.globalAlpha = 1; ctx.shadowColor = i % 2 ? sub : gold; ctx.shadowBlur = w / 45;
    ctx.fillStyle = i % 2 ? sub : gold; ctx.beginPath(); ctx.arc(x, y, w * (i < 2 ? .009 : .005), 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  });
  ctx.globalAlpha = 1; ctx.textAlign = "center"; ctx.fillStyle = gold;
  ctx.font = `${Math.round(w * .06)}px serif`; ctx.fillText("AGOLMEN'S COMPASS", cx, h * .13);
  ctx.font = `${Math.round(w * .039)}px serif`; ctx.fillText("COSMIC ALCHEMY", cx, h * .79);
  ctx.font = `${Math.round(w * .019)}px sans-serif`; ctx.fillText("NATAL SKY · ILLUSTRATIVE ART", cx, h * .83);
  ctx.fillText(sky.approximate ? "JST NOON REFERENCE" : "JST BIRTH TIME", cx, h * .86);
}

export default function CosmicAlchemyArtwork({ sky, main, sub, onCapture }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const capture = useCallback(async () => {
    const out = document.createElement("canvas"); out.width = 2160; out.height = 3840;
    paint(out, sky, main, sub);
    const blob = await new Promise<Blob>((resolve, reject) => out.toBlob(b => b ? resolve(b) : reject(new Error("PNG unavailable")), "image/png"));
    return { blob, width: out.width, height: out.height };
  }, [sky, main, sub]);
  useEffect(() => { if (ref.current) paint(ref.current, sky, main, sub); onCapture(capture); return () => onCapture(null); }, [sky, main, sub, capture, onCapture]);
  return <canvas ref={ref} width={900} height={1600} role="img" aria-label="出生宇宙創生図 · 出生天体を用いた参考アート" className="mx-auto block h-full max-h-[700px] w-auto max-w-full object-contain" />;
}
