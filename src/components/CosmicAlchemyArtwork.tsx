import { useEffect, useRef, useCallback } from "react";
import type { ReturnTypeNatal } from "@/lib/natal-sky-types";
import type { Capture } from "./MandalaScene";
import type { NineStarProfile } from "@/lib/calendar-traditions";

type Props = { sky: ReturnTypeNatal; nine: NineStarProfile; colors: string[]; onCapture: (capture: Capture | null) => void };

function paintPlanet(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, gold: string, seed: number) {
  ctx.save();
  ctx.shadowColor = color; ctx.shadowBlur = radius * 2.8;
  const sphere = ctx.createRadialGradient(x - radius * .34, y - radius * .42, radius * .05, x, y, radius);
  sphere.addColorStop(0, gold); sphere.addColorStop(.18, color); sphere.addColorStop(.68, color); sphere.addColorStop(1, "#050713");
  ctx.fillStyle = sphere; ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, radius * .94, 0, Math.PI * 2); ctx.clip(); ctx.shadowBlur = 0;
  for (let stripe = 0; stripe < 7; stripe++) {
    const sy = y - radius * .7 + stripe * radius * .23;
    ctx.strokeStyle = stripe % 2 ? gold : color; ctx.globalAlpha = .1 + ((seed + stripe * 7) % 5) * .035; ctx.lineWidth = Math.max(1, radius * .08);
    ctx.beginPath(); ctx.ellipse(x, sy, radius * (1.05 - Math.abs(sy - y) / radius * .25), radius * .13, .08 * Math.sin(seed + stripe), 0, Math.PI * 2); ctx.stroke();
  }
  for (let crater = 0; crater < 5; crater++) {
    const a = ((seed * 17 + crater * 79) % 360) * Math.PI / 180, d = radius * (.18 + ((seed + crater * 23) % 48) / 100);
    ctx.fillStyle = crater % 2 ? "#050713" : gold; ctx.globalAlpha = .1; ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, radius * (.05 + crater * .008), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  ctx.shadowBlur = 0; ctx.strokeStyle = gold; ctx.globalAlpha = .72; ctx.lineWidth = Math.max(1, radius * .07); ctx.beginPath(); ctx.arc(x, y, radius * 1.08, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

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
  // Layered currents create an original marine-cosmic depth without copying a named artist.
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  for (let band = 0; band < 11; band++) {
    const y0 = h * (.3 + band * .07);
    const wave = ctx.createLinearGradient(0, y0, w, y0 + h * .1);
    wave.addColorStop(0, "transparent"); wave.addColorStop(.45, colors[(band + 2) % colors.length] ?? sub); wave.addColorStop(1, "transparent");
    ctx.strokeStyle = wave; ctx.globalAlpha = .055 + band * .009; ctx.lineWidth = Math.max(2, w * (.013 - band * .00075));
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
    const planetRadius = w * (i < 2 ? .023 : .012 + (i % 3) * .003);
    paintPlanet(ctx, x, y, planetRadius, colors[i % colors.length] ?? gold, gold, seed + i * 41);
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
  return <canvas ref={ref} width={900} height={1600} role="img" aria-label="出生宇宙創生図 · 出生10天体と九星計算を用いたパーソナルアート" className="block h-full w-full object-cover" />;
}
