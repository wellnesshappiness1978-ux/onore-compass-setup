import { useEffect, useRef, useState } from "react";
import { Copy, Crown, Download, LockKeyhole, LockKeyholeOpen, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBirthColorPair } from "@/lib/birth-colors";
import { nineStarsTranslations } from "@/lib/nine-stars-translations";
import { animalNames, getArtSymbols, NineStarsArtwork, palaceGrid, zodiacGlyphs, zodiacNames } from "./NineStarsArtwork";
import type { Language } from "@/lib/translations";

type Props = { language: Language; onVip: () => void; birthDate: string; bloodType?: string; testUnlocked?: boolean };

export default function NineStarsPanel({ language, onVip, birthDate, bloodType = "", testUnlocked = false }: Props) {
  const t = nineStarsTranslations[language];
  const pair = getBirthColorPair(birthDate);
  const symbols = getArtSymbols(birthDate);
  const [revealed, setRevealed] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const artRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!testUnlocked) setRevealed(false); }, [testUnlocked]);
  const open = testUnlocked && revealed;

  // Rasterize only the labelled illustrative SVG, never the lock overlay or private profile.
  async function createWallpaper(): Promise<Blob> {
    const svg = artRef.current?.querySelector("svg");
    if (!svg) throw new Error("Artwork unavailable");
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const tokens = ["background", "celestial-ink", "gold-glow", "primary", "birth-color-1", "birth-color-2", "birth-color-3", "birth-color-4", "birth-color-5", "birth-color-6", "birth-color-7", "birth-color-8", "birth-color-9", "birth-color-11", "birth-color-22", "birth-color-33"];
    const css = getComputedStyle(svg);
    let serialized = new XMLSerializer().serializeToString(clone);
    for (const token of tokens) {
      const color = css.getPropertyValue(`--${token}`).trim();
      if (color) serialized = serialized.replaceAll(`var(--${token})`, color);
    }
    const source = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
    const src = URL.createObjectURL(source);
    try {
      const image = new Image();
      image.src = src;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      const bg = css.getPropertyValue("--background").trim();
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1080, 1920);
      ctx.drawImage(image, 0, 350, 1080, 1080);
      ctx.textAlign = "center";
      ctx.fillStyle = css.getPropertyValue("--gold-glow").trim();
      ctx.font = '38px "Noto Serif JP", serif';
      ctx.fillText(t.wallpaperTitle, 540, 225);
      ctx.font = '24px "Noto Sans JP", sans-serif';
      ctx.fillText(t.watermark, 540, 1585);
      ctx.font = '20px "Noto Sans JP", sans-serif';
      ctx.fillText("ONORE COMPASS  ·  NINE STAR REFERENCE", 540, 1640);
      return await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("PNG unavailable")), "image/png"));
    } finally { URL.revokeObjectURL(src); }
  }

  async function download() {
    setBusy(true);
    try {
      const blob = await createWallpaper();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "onore-nine-stars-preview.png";
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10000);
      setStatus(t.saved);
    } catch { setStatus(t.exportError); }
    finally { setBusy(false); }
  }

  async function shareImage() {
    setBusy(true);
    try {
      const file = new File([await createWallpaper()], "onore-nine-stars-preview.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({ files: [file], title: t.wallpaperTitle, text: t.shareText });
        setStatus(t.shared);
      } else if (navigator.clipboard?.write && typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": file })]);
        setStatus(t.imageCopied);
      } else setStatus(t.shareFallback);
    } catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) setStatus(t.shareFallback); }
    finally { setBusy(false); }
  }

  async function copyLink() {
    try { await navigator.clipboard.writeText(window.location.origin); setStatus(t.linkCopied); }
    catch { setStatus(t.shareFallback); }
  }

  return (
    <section className="mx-auto max-w-3xl text-center" aria-labelledby="nine-stars-heading">
      <p className="text-[10px] text-primary/75 tracking-[0.2em]">{t.subtitle}</p>
      <p className="mt-5 font-serif text-sm text-primary/90">{t.tagline}</p>
      <h3 id="nine-stars-heading" className="mt-2 font-serif text-2xl text-gradient-gold sm:text-3xl">{t.title}</h3>
      <p className="mt-3 text-xs leading-6 text-muted-foreground">{pair ? t.preview : t.fallback}</p>
      {testUnlocked && <p className="mx-auto mt-3 inline-block border border-primary/40 px-3 py-1 text-[11px] text-primary">{t.testNotice}</p>}
      <div className="relative mx-auto mt-8 aspect-square w-full max-w-[640px] overflow-hidden rounded-full border border-primary/40 shadow-gold">
        <div ref={artRef} className={`absolute inset-0 transition-all duration-[1600ms] ease-out ${open ? "scale-100 blur-0" : "scale-105 blur-[2px]"}`}>
          <NineStarsArtwork main={pair?.main.token ?? "var(--primary)"} sub={pair?.sub.token ?? "var(--gold-glow)"} bloodType={bloodType} birthDate={birthDate} language={language}/>
        </div>
        {open && <div className="pointer-events-none absolute inset-0 animate-[unlock-burst_1.6s_ease-out_forwards] bg-[radial-gradient(circle,var(--gold-glow)_0%,transparent_60%)] motion-reduce:animate-none" aria-hidden="true" />}
        <div className={`absolute inset-0 flex flex-col items-center justify-center bg-background/45 p-4 backdrop-blur-[3px] transition-opacity duration-700 sm:p-8 ${open ? "pointer-events-none opacity-0" : "opacity-100"}`}>
          <div className="flex size-12 items-center justify-center rounded-full border border-primary/40 bg-background/75 text-primary shadow-gold">{testUnlocked ? <LockKeyholeOpen className="size-5" /> : <LockKeyhole className="size-5" />}</div>
          <p className="mt-4 flex items-center gap-2 font-serif text-base text-primary sm:text-lg"><Sparkles className="size-4" />{testUnlocked ? t.testUnlock : t.lock}</p>
          <Button variant="champagne" onClick={testUnlocked ? () => setRevealed(true) : onVip} className="mt-5 h-auto max-w-[300px] whitespace-normal px-4 py-2 text-center text-xs leading-5 sm:max-w-[330px] sm:px-5 sm:py-3 sm:text-sm sm:leading-6"><Crown className="size-4 shrink-0" />{testUnlocked ? t.viewPreview : t.unlock}</Button>
        </div>
      </div>
      {open && <Button variant="ghost" size="sm" className="mt-3 text-xs text-muted-foreground" onClick={() => setRevealed(false)}>{t.replay}</Button>}
      <p className="mx-auto mt-7 max-w-xl text-xs leading-6 text-muted-foreground">{t.note}</p>
      <div className="mx-auto mt-7 max-w-[640px] border-y border-primary/25 py-5 text-left">
        <div className="flex items-baseline justify-between gap-4"><h4 className="font-serif text-base text-primary">{t.gridTitle}</h4><span className="text-[10px] text-muted-foreground">{t.gridQualifier}</span></div>
        <div className="mt-4 grid grid-cols-3 gap-px border border-primary/25 bg-primary/25">
          {palaceGrid.map((cell) => <div key={cell.number} className="min-h-20 bg-background/90 p-2 text-center sm:min-h-24 sm:p-3">
            <span className="block text-[10px] text-muted-foreground">{cell.direction}</span>
            <span className="mt-1 block font-serif text-xl text-primary sm:text-2xl">{cell.number}</span>
            <span className="block text-[11px] text-foreground sm:text-sm">{cell.star}</span>
          </div>)}
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">{t.gridDisclaimer}</p>
        {symbols && <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground"><span>{t.zodiac}: <strong className="font-normal text-foreground">{zodiacGlyphs[symbols.zodiac]} {zodiacNames[symbols.zodiac]}</strong></span><span>{t.animal}: <strong className="font-normal text-foreground">{animalNames[symbols.animal]}</strong></span>{bloodType && <span>{t.blood}: <strong className="font-normal text-foreground">{bloodType}</strong></span>}</div>}
        <p className="mt-2 text-[11px] leading-5 text-muted-foreground">{t.symbolDisclaimer}</p>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button variant="outline" onClick={download} disabled={!open || busy} className="h-auto min-h-10 border-primary/40 text-primary"><Download />{t.downloadPreview}</Button>
        <Button variant="outline" onClick={shareImage} disabled={!open || busy} className="h-auto min-h-10 border-primary/40 text-primary"><Share2 />{t.shareImage}</Button>
        <Button variant="ghost" onClick={copyLink} className="h-auto min-h-10 text-muted-foreground"><Copy />{t.copyLink}</Button>
      </div>
      <p className="mt-3 text-[11px] leading-5 text-muted-foreground">{t.shareNote}</p>
      <p role="status" aria-live="polite" className="mt-2 min-h-5 text-xs text-primary">{status}</p>
    </section>
  );
}