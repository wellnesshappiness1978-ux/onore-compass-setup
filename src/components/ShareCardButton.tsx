import { useState } from "react";
import { Download, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Language } from "@/lib/translations";

type Format = "story" | "x";
export type ShareCardData = { kicker: string; title: string; score: number; names: string[]; lines: string[] };

const copy = {
  ja: { cta: "✨ SNSでシェアする", title: "シェア用カード", desc: "サイズを選んで保存・シェアできます。", story: "ストーリーズ 9:16", x: "X 16:9", save: "画像を保存", share: "端末でシェア", note: "※生年月日から計算した参考値のカードです。Instagramは保存した画像をストーリーズで選んで投稿してください。", brand: "オノレコンパス", scoreLabel: "相性スコア", shared: "シェア画面を開きました", saved: "画像を保存しました" },
  en: { cta: "✨ Share on social", title: "Share card", desc: "Choose a size, then save or share.", story: "Stories 9:16", x: "X 16:9", save: "Save image", share: "Share from device", note: "Reference values derived from birth dates. For Instagram, pick the saved image in Stories.", brand: "Onore Compass", scoreLabel: "Match score", shared: "Share sheet opened", saved: "Image saved" },
};

const NAVY = "#0B132B", GOLD = "#F4D03F", CREAM = "#F7F1DC";

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const out: string[] = []; let line = "";
  for (const ch of [...text]) { if (ctx.measureText(line + ch).width > max && line) { out.push(line); line = ch; } else line += ch; }
  if (line) out.push(line);
  return out;
}

function render(format: Format, d: ShareCardData, brand: string, scoreLabel: string) {
  const [w, h] = format === "story" ? [1080, 1920] : [1200, 675];
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  const bg = ctx.createRadialGradient(w / 2, h * 0.38, 40, w / 2, h / 2, Math.max(w, h));
  bg.addColorStop(0, "#1E2A55"); bg.addColorStop(0.55, NAVY); bg.addColorStop(1, "#050914");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  let seed = d.score * 97 + d.title.length;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < (format === "story" ? 220 : 140); i++) {
    ctx.globalAlpha = 0.2 + rnd() * 0.8; ctx.fillStyle = rnd() > 0.7 ? GOLD : CREAM;
    ctx.beginPath(); ctx.arc(rnd() * w, rnd() * h, rnd() * 2.4 + 0.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.strokeRect(28, 28, w - 56, h - 56);
  ctx.globalAlpha = 0.35; ctx.lineWidth = 1; ctx.strokeRect(44, 44, w - 88, h - 88); ctx.globalAlpha = 1;
  const serif = '"Noto Serif JP", serif';
  const story = format === "story";
  const cx = story ? w / 2 : w * 0.28, cy = story ? h * 0.36 : h / 2, r = story ? 230 : 170;
  // score ring
  ctx.lineWidth = story ? 22 : 16; ctx.strokeStyle = "rgba(244,208,63,0.18)";
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r); g.addColorStop(0, "#FFF3B0"); g.addColorStop(1, GOLD);
  ctx.strokeStyle = g; ctx.lineCap = "round"; ctx.shadowColor = GOLD; ctx.shadowBlur = 30;
  ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * d.score) / 100); ctx.stroke();
  ctx.shadowBlur = 0; ctx.textAlign = "center"; ctx.fillStyle = CREAM;
  ctx.font = `500 ${story ? 34 : 26}px ${serif}`; ctx.fillText(scoreLabel, cx, cy - r * 0.32);
  ctx.fillStyle = g; ctx.font = `700 ${story ? 150 : 110}px ${serif}`; ctx.fillText(`${d.score}%`, cx, cy + r * 0.28);
  // text block
  const tx = story ? w / 2 : w * 0.6, maxW = story ? w - 180 : w * 0.52;
  ctx.textAlign = story ? "center" : "left";
  const left = story ? tx : w * 0.52;
  let y = story ? h * 0.36 + r + 120 : 140;
  ctx.fillStyle = GOLD; ctx.font = `500 ${story ? 32 : 22}px ${serif}`; ctx.fillText(d.kicker, left, y); y += story ? 80 : 54;
  ctx.fillStyle = CREAM; ctx.font = `700 ${story ? 64 : 40}px ${serif}`;
  for (const l of wrap(ctx, d.title, maxW).slice(0, 2)) { ctx.fillText(l, left, y); y += story ? 80 : 50; }
  if (d.names.length) { ctx.fillStyle = GOLD; ctx.font = `500 ${story ? 36 : 24}px ${serif}`; ctx.fillText(d.names.join("  ×  ").slice(0, 60), left, y); y += story ? 80 : 46; }
  ctx.fillStyle = CREAM; ctx.font = `400 ${story ? 34 : 22}px ${serif}`;
  for (const para of d.lines) for (const l of wrap(ctx, para, maxW).slice(0, story ? 4 : 2)) { ctx.fillText(l, left, y); y += story ? 54 : 34; }
  ctx.textAlign = "center"; ctx.fillStyle = GOLD; ctx.font = `600 ${story ? 40 : 26}px ${serif}`;
  ctx.fillText(`✦ ${brand} ✦`, w / 2, h - (story ? 110 : 60));
  return c;
}

export default function ShareCardButton({ data, language, className }: { data: ShareCardData; language: Language; className?: string }) {
  const t = language === "ja" ? copy.ja : copy.en;
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<Format>("story");
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const build = (f: Format) => { setFormat(f); setStatus(""); setUrl(render(f, data, t.brand, t.scoreLabel).toDataURL("image/png")); };
  const filename = `onore-${format}-${data.score}.png`;
  const text = `${data.kicker} ${data.title} ${data.score}% | ${t.brand}`;
  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  const save = () => { if (!url) return; const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); setStatus(t.saved); };
  const share = async () => {
    if (!url) return;
    try {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], text }); setStatus(t.shared); }
      else save();
    } catch { /* user cancelled */ }
  };
  const links = [
    ["X", `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(appUrl)}`],
    ["LINE", `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(text)}`],
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`],
  ] as const;

  return (
    <>
      <Button type="button" variant="champagne" className={className} onClick={() => { setOpen(true); build(format); }}>
        <Sparkles className="size-4" />{t.cta.replace("✨ ", "")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t.title}</DialogTitle><DialogDescription>{t.desc}</DialogDescription></DialogHeader>
          <div role="radiogroup" className="flex gap-2">
            {(["story", "x"] as const).map((f) => (
              <button key={f} type="button" role="radio" aria-checked={format === f} onClick={() => build(f)}
                className={`flex-1 rounded-full border px-3 py-1.5 text-xs ${format === f ? "border-primary bg-primary/20 text-primary" : "border-primary/20 text-muted-foreground"}`}>{t[f]}</button>
            ))}
          </div>
          {url && <img src={url} alt={data.title} className={`mx-auto rounded-lg border border-primary/30 ${format === "story" ? "max-h-[46vh]" : "w-full"}`} />}
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={save}><Download className="size-4" />{t.save}</Button>
            <Button type="button" onClick={share}><Share2 className="size-4" />{t.share}</Button>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {links.map(([name, href]) => <a key={name} href={href} target="_blank" rel="noreferrer" className="rounded-full border border-primary/30 px-3 py-1 text-xs text-primary hover:bg-primary/10">{name}</a>)}
            <button type="button" onClick={save} className="rounded-full border border-primary/30 px-3 py-1 text-xs text-primary hover:bg-primary/10">Instagram</button>
          </div>
          {status && <p role="status" className="text-center text-xs text-primary">{status}</p>}
          <p className="text-[11px] leading-5 text-muted-foreground">{t.note}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
