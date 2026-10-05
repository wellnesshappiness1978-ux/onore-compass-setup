import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Copy, Crown, Download, LockKeyhole, Play, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { birthColorSpectrum } from "@/lib/birth-color-spectrum";
import { natalSky } from "@/lib/natal-sky";
import { computeCoreLayers } from "@/lib/ai/core-layers";
import { nineStarsTranslations } from "@/lib/nine-stars-translations";
import { animalNames, getArtSymbols, NineStarsArtwork, palaceGrid, zodiacGlyphs, zodiacNames } from "./NineStarsArtwork";
import type { Language } from "@/lib/translations";
import type { UserProfile } from "./Onboarding";
import type { Capture } from "./MandalaScene";
import CosmicAlchemyArtwork from "./CosmicAlchemyArtwork";

const MandalaScene = lazy(() => import("./MandalaScene"));
type Props = { language: Language; onVip: () => void; profile: UserProfile; testUnlocked?: boolean };

export default function NineStarsPanel({ language, onVip, profile, testUnlocked = false }: Props) {
  const t = nineStarsTranslations[language];
  const { birthDate, bloodType } = profile;
  const palette = birthColorSpectrum(profile);
  const sky = natalSky(birthDate, profile.birthTime, profile.birthTimeUnknown);
  const element = computeCoreLayers(profile)?.shichu.dayElement ?? "木";
  const symbols = getArtSymbols(birthDate);
  const [art, setArt] = useState<"mandala" | "cosmic">("mandala");
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [colors, setColors] = useState({ main: "#D4AF37", sub: "#F3E5AB" });
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const capture = useRef<Capture | null>(null);
  const setCapture = useCallback((fn: Capture | null) => { capture.current = fn; }, []);
  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const css = getComputedStyle(document.documentElement);
    setColors({ main: css.getPropertyValue("--primary").trim() || "#D4AF37", sub: css.getPropertyValue("--gold-glow").trim() || "#F3E5AB" });
  }, []);
  useEffect(() => { if (!testUnlocked) { setPlaying(false); setProgress(0); } }, [testUnlocked]);
  useEffect(() => {
    if (!playing || reduced) return;
    const start = performance.now();
    const id = window.setInterval(() => {
      const elapsed = Math.min(7, (performance.now() - start) / 1000);
      setProgress(elapsed);
      if (elapsed >= 7) { window.clearInterval(id); setPlaying(false); }
    }, 50);
    return () => window.clearInterval(id);
  }, [playing, reduced]);
  useEffect(() => { if (!mounted || !testUnlocked || !sky) return; setProgress(reduced ? 7 : 0); setPlaying(!reduced); }, [mounted, testUnlocked, reduced, profile.birthDate, profile.birthTime, profile.birthTimeUnknown]);
  useEffect(() => {
    if (!testUnlocked || (art === "mandala" && progress < 7)) return;
    const share = (event: Event) => { event.preventDefault(); void shareImage(); };
    window.addEventListener("onore-share-card", share);
    return () => window.removeEventListener("onore-share-card", share);
  }, [testUnlocked, progress, art]);
  const open = testUnlocked && (art === "cosmic" || progress >= 7);
  const start = () => { setProgress(reduced ? 7 : 0); setPlaying(!reduced); };

  async function createWallpaper() {
    if (!capture.current) throw new Error("Artwork unavailable");
    return capture.current();
  }
  async function download() {
    setBusy(true);
    try {
      const { blob, width, height } = await createWallpaper();
      const url = URL.createObjectURL(blob);
       const link = document.createElement("a"); link.href = url; link.download = `agolmen-${art === "cosmic" ? "cosmic-alchemy" : "birth-color-mandala"}-preview.png`;
      document.body.append(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10000);
      setStatus(`${t.saved} · ${width} × ${height}`);
    } catch { setStatus(t.exportError); }
    finally { setBusy(false); }
  }
  async function shareImage() {
    setBusy(true);
    try {
      const { blob } = await createWallpaper();
       const file = new File([blob], `agolmen-${art === "cosmic" ? "cosmic-alchemy" : "birth-color-mandala"}-preview.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] }) && navigator.share) { await navigator.share({ files: [file], title: art === "cosmic" ? "出生宇宙創生図（参考アート）" : "バースカラー曼陀羅アート（参考アート）", text: t.shareText }); setStatus(t.shared); }
      else if (navigator.clipboard?.write && typeof ClipboardItem !== "undefined") { await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]); setStatus(t.imageCopied); }
      else setStatus(t.shareFallback);
    } catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) setStatus(t.shareFallback); }
    finally { setBusy(false); }
  }
  async function copyLink() {
    try { await navigator.clipboard.writeText(window.location.origin); setStatus(t.linkCopied); }
    catch { setStatus(t.shareFallback); }
  }

  return <section className="mx-auto max-w-3xl text-center" aria-labelledby="nine-stars-heading">
    <p className="text-xs text-primary/75">{t.subtitle}</p>
    <p className="mt-5 font-serif text-base text-primary/90">{t.tagline}</p>
    <h3 id="nine-stars-heading" className="mt-2 font-serif text-2xl text-gradient-gold sm:text-3xl">{language === "ja" ? "アート" : "Art"}</h3>
    <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label="作品"><Button variant={art === "mandala" ? "default" : "outline"} role="tab" aria-selected={art === "mandala"} onClick={() => setArt("mandala")} className="h-auto min-h-12 whitespace-normal text-xs sm:text-sm">バースカラー曼陀羅アート</Button><Button variant={art === "cosmic" ? "default" : "outline"} role="tab" aria-selected={art === "cosmic"} onClick={() => setArt("cosmic")} className="h-auto min-h-12 whitespace-normal text-xs sm:text-sm">出生宇宙創生図</Button></div>
    <p className="mt-3 font-serif text-xl text-primary">{art === "mandala" ? "バースカラー曼陀羅アート" : "出生宇宙創生図（コズミック・アルケミー）"}</p>
    <p className="mt-3 text-sm leading-7 text-muted-foreground">{palette && testUnlocked ? (language === "ja" ? `バースカラー ${palette.main.name} ${palette.main.code} × ${palette.sub.name} ${palette.sub.code}。1440色の参考パレットです。` : `Illustrative birth-color palette: ${palette.main.name} ${palette.main.code} × ${palette.sub.name} ${palette.sub.code}.`) : t.fallback}</p>
    {testUnlocked && <p className="mx-auto mt-3 inline-block border border-primary/40 px-3 py-1 text-sm text-primary">{t.testNotice}</p>}
    <aside className="mt-6 border-y border-primary/35 py-5 text-left" aria-label="曼陀羅アートについて"><p className="font-serif text-lg leading-8 text-primary">{language === "ja" ? "🪐 出生日時の10天体配置と、1,440色の参考バースカラー・伝統的な五行のモチーフを融合させた、あなたの出生情報から描く波動共鳴アートです。" : "Ten natal celestial positions, an illustrative 1,440-color palette and traditional five-element motifs form your personal celestial artwork."}</p><p className="mt-2 text-sm leading-7 text-muted-foreground">{sky?.approximate ? "出生時刻が未登録のため日本時間12時の参考配置です。" : "登録時刻は日本時間として計算します。"}天体角度は天文計算、色・五行の共鳴は創作表現で、公式な色対応や効能を示すものではありません。</p></aside>
    <div className={`relative mx-auto mt-7 w-full max-w-[700px] overflow-hidden border-y border-primary/35 bg-background shadow-gold ${art === "cosmic" ? "aspect-[9/16] max-h-[700px]" : "aspect-square"}`} aria-label={language === "ja" ? "立体曼陀羅アート" : "3D mandala art"}>
      {mounted && testUnlocked && sky && art === "cosmic" ? <CosmicAlchemyArtwork sky={sky} main={palette?.main.code ?? colors.main} sub={palette?.sub.code ?? colors.sub} onCapture={setCapture} /> : mounted && testUnlocked && sky ? <Suspense fallback={<div className="flex h-full items-center justify-center text-primary"><Sparkles className="size-7 animate-pulse" /></div>}>
        <MandalaScene sky={sky} main={palette?.main.code ?? colors.main} sub={palette?.sub.code ?? colors.sub} element={element} progress={progress} reduced={reduced} onCapture={setCapture} />
      </Suspense> : <NineStarsArtwork main={colors.main} sub={colors.sub} bloodType={bloodType} birthDate={birthDate} language={language} />}
      {art === "mandala" && testUnlocked && sky && progress > 0 && progress < 7 && <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-background/70 px-5 py-4 text-primary" role="status"><p className="font-serif text-sm">{progress < 2 ? "光が集まる" : progress < 5 ? "星々と五行の環が巡る" : "曼陀羅が開花する"}</p><div className="mt-2 h-1 bg-primary/25"><div className="h-full bg-primary transition-[width] duration-100" style={{ width: `${progress / 7 * 100}%` }} /></div></div>}
      {!open && !playing && <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/65 p-4 backdrop-blur-[2px]">
        <div className="flex size-12 items-center justify-center rounded-full border border-primary/50 bg-background/80 text-primary"><LockKeyhole className="size-5" /></div>
        <p className="mt-4 font-serif text-lg text-primary">{testUnlocked ? t.testUnlock : t.lock}</p>
        <Button variant="champagne" onClick={testUnlocked && sky ? start : onVip} className="mt-5 h-auto max-w-[300px] whitespace-normal px-4 py-3 text-center text-sm leading-6"><Crown className="size-4 shrink-0" />{testUnlocked && sky ? t.viewPreview : t.unlock}</Button>
      </div>}
    </div>
    {open && <div className="mt-3 flex flex-wrap justify-center gap-2"><Button variant="ghost" size="sm" onClick={start}><Play className="size-4" />{t.replay}</Button></div>}
    {testUnlocked && sky && <details className="mt-5 border-y border-primary/20 py-4 text-left"><summary className="cursor-pointer text-primary">出生10天体の角度 · {sky.approximate ? "正午の参考配置" : "登録時刻の配置"}</summary><p className="mt-3 text-sm text-muted-foreground">黄道面の0°を牡羊座の始点とする角度。曼陀羅の外周点と結線に反映（主要角度は±6°）。天体球は地心赤道方向、外周は黄道黄経です。</p><dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">{sky.bodies.map(b => <div key={b.name}><dt className="text-sm text-muted-foreground">{b.name}</dt><dd className="text-primary">{b.longitude.toFixed(2)}°</dd></div>)}</dl></details>}
    <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-muted-foreground">{language === "ja" ? `惑星の方角は出生日時の地心位置を天文計算した参考図。${sky?.approximate ? "出生時間がないため正午（日本時間）で表示。" : ""}惑星の大きさ・軌道線・曼陀羅と五行の光は装飾表現です。色は測定された波長・周波数ではなく、効能を保証しません。${t.gridDisclaimer}` : `${sky?.approximate ? "Birth time unknown: shown at noon Japan time. " : ""}Planet directions are calculated; sizes, orbit lines, mandala and five-element light are artistic. Colors are not measured wavelengths. ${t.gridDisclaimer}`}</p>
    <div className="mx-auto mt-7 max-w-[640px] border-y border-primary/25 py-5 text-left"><div className="flex items-baseline justify-between gap-4"><h4 className="font-serif text-xl text-primary">{t.gridTitle}</h4><span className="text-xs text-muted-foreground">{t.gridQualifier}</span></div>
      <div className="mt-4 grid grid-cols-3 gap-px border border-primary/25 bg-primary/25">{palaceGrid.map(cell => <div key={cell.number} className="min-h-20 bg-background/90 p-2 text-center sm:min-h-24 sm:p-3"><span className="block text-xs text-muted-foreground">{cell.direction}</span><span className="mt-1 block font-serif text-xl text-primary sm:text-2xl">{cell.number}</span><span className="block text-xs text-foreground sm:text-sm">{cell.star}</span></div>)}</div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{t.gridDisclaimer}</p>
      {symbols && <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"><span>{t.zodiac}: <strong className="font-normal text-foreground">{zodiacGlyphs[symbols.zodiac]} {zodiacNames[symbols.zodiac]}</strong></span><span>{t.animal}: <strong className="font-normal text-foreground">{animalNames[symbols.animal]}</strong></span></div>}
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.symbolDisclaimer}</p>
    </div>
    <div className="mt-6 flex flex-wrap justify-center gap-2"><Button variant="outline" onClick={download} disabled={!open || busy} className="min-h-11 border-primary/40 text-primary"><Download />{t.downloadPreview}</Button><Button variant="outline" onClick={shareImage} disabled={!open || busy} className="min-h-11 border-primary/40 text-primary"><Share2 />{t.shareImage}</Button><Button variant="ghost" onClick={copyLink} className="min-h-11 text-muted-foreground"><Copy />{t.copyLink}</Button></div>
    <p className="mt-3 text-sm leading-6 text-muted-foreground">{t.shareNote}</p><p role="status" aria-live="polite" className="mt-2 min-h-6 text-sm text-primary">{status}</p>
  </section>;
}
