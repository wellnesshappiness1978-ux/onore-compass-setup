import { useEffect, useRef, useCallback } from "react";
import type { ReturnTypeNatal } from "@/lib/natal-sky-types";
import type { Capture } from "./MandalaScene";
import type { NineStarProfile } from "@/lib/calendar-traditions";

type Props = { sky: ReturnTypeNatal; nine: NineStarProfile; colors: string[]; onCapture: (capture: Capture | null) => void };

function paint(canvas: HTMLCanvasElement, sky: ReturnTypeNatal, nine: NineStarProfile, colors: string[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const { width: w, height: h } = canvas;
  const cx = w / 2, cy = h * .49, r = w * .38;
  const root = getComputedStyle(document.documentElement);
  const main = colors[0] ?? root.getPropertyValue("--primary").trim();
  const sub = colors[1] ?? root.getPropertyValue("--gold-glow").trim();
  const voidColor = root.getPropertyValue("--art-void").trim() || "oklch(0.105 0.035 255)";
  const gold = root.getPropertyValue("--gold-glow").trim() || "oklch(0.96 0.055 92)";
  ctx.fillStyle = voidColor; ctx.fillRect(0, 0, w, h);
  const nebulae = [[.22, .31, .42, colors[3] ?? sub], [.76, .46, .5, colors[5] ?? main], [.43, .7, .46, colors[2] ?? gold]] as const;
  nebulae.forEach(([nx, ny, nr, color]) => { const cloud = ctx.createRadialGradient(w * nx, h * ny, 0, w * nx, h * ny, w * nr); cloud.addColorStop(0, color); cloud.addColorStop(.18, `${color}88`); cloud.addColorStop(.5, `${color}22`); cloud.addColorStop(1, "transparent"); ctx.globalAlpha = .36; ctx.fillStyle = cloud; ctx.fillRect(0, 0, w, h); });
  // Deep-ocean ribbons give this natal piece a distinct, original cosmic-marine depth.
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  for (let band = 0; band < 7; band++) {
    const y0 = h * (.3 + band * .07);
    const wave = ctx.createLinearGradient(0, y0, w, y0 + h * .1);
    wave.addColorStop(0, "transparent"); wave.addColorStop(.45, colors[(band + 2) % colors.length] ?? sub); wave.addColorStop(1, "transparent");
    ctx.strokeStyle = wave; ctx.globalAlpha = .08 + band * .012; ctx.lineWidth = Math.max(2, w * (.012 - band * .001));
    ctx.beginPath();
    for (let x = -w * .1; x <= w * 1.1; x += w / 90) {
      const y = y0 + Math.sin(x / w * Math.PI * (2.1 + band * .13) + band) * h * (.035 + band * .006);
      if (x < 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
  // Deterministic stars from the date-based planet positions, not a new reading.
  const seed = sky.bodies.reduce((n, b) => n + Math.round(b.longitude * 100), nine.honmei * 97 + nine.getsumei * 53 + nine.keisha * 31);
  for (let i = 0; i < 1280; i++) {
    const x = ((i * 739 + seed * 19) % 997) / 997 * w;
    const y = ((i * 433 + seed * 31) % 991) / 991 * h;
    const a = .16 + ((i * 17) % 50) / 100;
    ctx.globalAlpha = a; ctx.fillStyle = i % 13 === 0 ? colors[i % colors.length] ?? sub : gold;
    ctx.beginPath(); ctx.arc(x, y, (i % 17 === 0 ? 1.7 : .45) * w / 900, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  const light = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.1);
  light.addColorStop(0, gold); light.addColorStop(.08, sub); light.addColorStop(.24, main); light.addColorStop(.7, "transparent");
  ctx.globalAlpha = .62; ctx.fillStyle = light; ctx.fillRect(cx-r*1.15, cy-r*1.15, r*2.3, r*2.3); ctx.globalAlpha = 1;
  for (let ring = 0; ring < 9; ring++) {
    const star = nine.palaces[ring]?.star ?? ring + 1;
    ctx.strokeStyle = star === nine.honmei ? gold : colors[(star + nine.keisha) % colors.length] ?? sub; ctx.globalAlpha = .14 + star * .024;
    ctx.lineWidth = Math.max(1, w / 800);
    ctx.beginPath(); ctx.ellipse(cx, cy, r * (.24 + ring * .085), r * (.14 + ring * .058), (star % 2 ? -.48 : .48) + nine.keisha * .025, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.save(); ctx.translate(cx, cy); ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = gold; ctx.lineWidth = Math.max(1, w / 1100); ctx.globalAlpha = .62; ctx.beginPath();
  for (let i = 0; i < 420; i++) { const a = i * .105; const radius = 2.7 * Math.exp(.0095 * a) * w / 900; const x = Math.cos(a) * radius; const y = Math.sin(a) * radius * .82; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
  ctx.stroke(); ctx.restore();
  ctx.globalAlpha = .85;
  sky.bodies.forEach((body, i) => {
    const rad = (body.longitude - 90) * Math.PI / 180;
    const distance = r * (.62 + i % 3 * .12);
    const x = cx + Math.cos(rad) * distance, y = cy + Math.sin(rad) * distance * .78;
    ctx.strokeStyle = colors[i % colors.length] ?? gold; ctx.lineWidth = w / 1100;
    ctx.globalAlpha = .35; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
    ctx.globalAlpha = 1; ctx.shadowColor = colors[i % colors.length] ?? gold; ctx.shadowBlur = w / 35;
    ctx.fillStyle = colors[i % colors.length] ?? gold; ctx.beginPath(); ctx.arc(x, y, w * (i < 2 ? .011 : .006), 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = gold; ctx.globalAlpha = .65; ctx.beginPath(); ctx.arc(x, y, w * (i < 2 ? .019 : .012), 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0;
  });
  ctx.globalAlpha = 1; ctx.textAlign = "center"; ctx.fillStyle = gold;
  ctx.font = `${Math.round(w * .06)}px serif`; ctx.fillText("AGOLMEN'S COMPASS", cx, h * .13);
  ctx.font = `${Math.round(w * .039)}px serif`; ctx.fillText("COSMIC ALCHEMY", cx, h * .79);
  ctx.font = `${Math.round(w * .019)}px sans-serif`; ctx.fillText("NATAL SKY · ILLUSTRATIVE ART", cx, h * .83);
  ctx.fillText(`HONMEI ${nine.honmei} · GETSUMEI ${nine.getsumei} · KEISHA ${nine.keisha}`, cx, h * .86);
  ctx.fillText(sky.approximate ? "JST NOON REFERENCE" : "JST BIRTH TIME", cx, h * .89);
}

export default function CosmicAlchemyArtwork({ sky, nine, colors, onCapture }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const capture = useCallback(async () => {
    const out = document.createElement("canvas"); out.width = 2160; out.height = 3840;
    paint(out, sky, nine, colors);
    const blob = await new Promise<Blob>((resolve, reject) => out.toBlob(b => b ? resolve(b) : reject(new Error("PNG unavailable")), "image/png"));
    return { blob, width: out.width, height: out.height };
  }, [sky, nine, colors]);
  useEffect(() => { if (ref.current) paint(ref.current, sky, nine, colors); onCapture(capture); return () => onCapture(null); }, [sky, nine, colors, capture, onCapture]);
  return <canvas ref={ref} width={900} height={1600} role="img" aria-label="出生宇宙創生図 · 出生10天体と九星計算を用いたパーソナルアート" className="mx-auto block h-full max-h-[700px] w-auto max-w-full object-contain" />;
}
