import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Copy, Crown, Download, Expand, LockKeyhole, RefreshCw, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { birthColorSpectrum } from "@/lib/birth-color-spectrum";
import { natalSky } from "@/lib/natal-sky";
import { nineStarsTranslations } from "@/lib/nine-stars-translations";
import { getArtSymbols, NineStarsArtwork, zodiacGlyphs } from "./NineStarsArtwork";
import type { Language } from "@/lib/translations";
import type { UserProfile } from "./Onboarding";
import type { Capture } from "./MandalaScene";
import CosmicAlchemyArtwork from "./CosmicAlchemyArtwork";
import { paletteColors } from "@/lib/art-geometry";
import { AgolmenLoading } from "./AgolmenSpiral";
import { nineStarProfile } from "@/lib/calendar-traditions";
import { artSpecialistCopy } from "@/lib/art-specialist-copy";
import { nineStarName, trigramLabel } from "@/lib/ui-i18n";
import { helioCopy } from "@/lib/helio-copy";

const MandalaScene = lazy(() => import("./MandalaScene"));
type Props = { language: Language; onVip: () => void; profile: UserProfile; testUnlocked?: boolean };

export default function NineStarsPanel({ language, onVip, profile, testUnlocked = false }: Props) {
  const t = nineStarsTranslations[language];
  const a = artSpecialistCopy[language];
  const { birthDate, bloodType } = profile;
  const palette = birthColorSpectrum(profile);
  const sky = natalSky(birthDate, profile.birthTime, profile.birthTimeUnknown);
  const nine = nineStarProfile(birthDate, profile.birthTime, profile.birthTimeUnknown, profile.gender);
  const symbols = getArtSymbols(birthDate);
  const [art, setArt] = useState<"mandala" | "cosmic">("mandala");
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [colors, setColors] = useState({ main: "#D4AF37", sub: "#F3E5AB" });
  const paletteEntries = palette ? paletteColors(palette) : [];
  const artColors = paletteEntries.length ? paletteEntries.map(color => color.code) : [colors.main, colors.sub];
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [variation, setVariation] = useState(0);
  const [captureReady, setCaptureReady] = useState(false);
  const capture = useRef<Capture | null>(null);
  const setCapture = useCallback((fn: Capture | null) => { capture.current = fn; setCaptureReady(Boolean(fn)); }, []);
  const displayedColors = paletteEntries.map(color => ({ name: color.name ?? "参考色", code: color.code }));
  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const css = getComputedStyle(document.documentElement);
    setColors({ main: css.getPropertyValue("--primary").trim() || "#D4AF37", sub: css.getPropertyValue("--gold-glow").trim() || "#F3E5AB" });
  }, []);
  useEffect(() => {
    if (!testUnlocked) return;
    const share = (event: Event) => { event.preventDefault(); void shareImage(); };
    window.addEventListener("onore-share-card", share);
    return () => window.removeEventListener("onore-share-card", share);
  }, [testUnlocked, art]);
  const open = testUnlocked;

  async function createWallpaper() {
    if (!capture.current) throw new Error("Artwork unavailable");
    return capture.current();
  }
  async function download() {
    setBusy(true);
    try {
      const { blob, width, height } = await createWallpaper();
      const url = URL.createObjectURL(blob);
      const extension = blob.type === "image/jpeg" ? "jpg" : "png";
      const link = document.createElement("a"); link.href = url; link.download = `agolmen-${art === "cosmic" ? "cosmic-alchemy" : "birth-color-mandala"}-preview.${extension}`;
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
      const extension = blob.type === "image/jpeg" ? "jpg" : "png";
      const file = new File([blob], `agolmen-${art === "cosmic" ? "cosmic-alchemy" : "birth-color-mandala"}-preview.${extension}`, { type: blob.type });
      if (navigator.canShare?.({ files: [file] }) && navigator.share) { await navigator.share({ files: [file], title: art === "cosmic" ? a.cosmic : a.mandala, text: t.shareText }); setStatus(t.shared); }
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
    <h3 id="nine-stars-heading" className="mt-2 font-serif text-2xl text-gradient-gold sm:text-3xl">{a.heading}</h3>
    <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label={a.tabs}><Button variant={art === "mandala" ? "default" : "outline"} role="tab" aria-selected={art === "mandala"} onClick={() => setArt("mandala")} className="h-auto min-h-12 whitespace-normal text-xs sm:text-sm">{a.mandala}</Button><Button variant={art === "cosmic" ? "default" : "outline"} role="tab" aria-selected={art === "cosmic"} onClick={() => setArt("cosmic")} className="h-auto min-h-12 whitespace-normal text-xs sm:text-sm">{a.cosmic}</Button></div>
    <p className="mt-3 font-serif text-xl text-primary">{art === "mandala" ? a.mandala : a.cosmicLong}</p>
    <p className="mt-3 text-sm leading-7 text-muted-foreground">{palette && testUnlocked ? art === "mandala" ? a.mandalaDescription : a.cosmicDescription : t.fallback}</p>
    {testUnlocked && <p className="mx-auto mt-3 inline-block border border-primary/40 px-3 py-1 text-sm text-primary">{t.testNotice}</p>}
    <aside className="mt-6 border-y border-primary/35 py-5 text-left" aria-label={a.about}><p className="font-serif text-lg leading-8 text-primary">{art === "mandala" ? a.mandalaAbout : a.cosmicAbout}</p><p className="mt-2 text-sm leading-7 text-muted-foreground">{art === "cosmic" && (sky?.approximate ? a.approximate : a.exactTime)} {a.artDisclaimer}</p></aside>
    {palette && testUnlocked && <div className="mx-auto mt-5 grid max-w-[720px] grid-cols-4 gap-2 sm:grid-cols-7" aria-label={a.palette}>{paletteColors(palette).map((color, index) => <div key={`${color.slot}-${index}`} className="min-w-0"><span className="mx-auto block size-8 rounded-full border border-primary/30" style={{ backgroundColor: color.code }} /><span className="mt-1 block truncate text-[11px] text-muted-foreground">{a.paletteSlots[index]}</span></div>)}</div>}
    <div className={`relative mx-auto mt-7 w-full overflow-hidden border-y border-primary/35 bg-background shadow-gold ${art === "cosmic" ? "aspect-[9/16] max-w-[760px] sm:max-h-[1120px]" : "aspect-square max-w-[920px]"}`} aria-label={art === "cosmic" ? a.cosmic : a.mandalaAlt}>
      {mounted && testUnlocked && sky && nine && art === "cosmic" ? <CosmicAlchemyArtwork sky={sky} nine={nine} colors={artColors} language={language} onCapture={setCapture} /> : mounted && testUnlocked && sky ? <Suspense fallback={<AgolmenLoading compact label={a.loading} />}>
        <MandalaScene colors={displayedColors} language={language} variation={variation} reduced={reduced} onCapture={setCapture} />
      </Suspense> : <NineStarsArtwork main={colors.main} sub={colors.sub} bloodType={bloodType} birthDate={birthDate} language={language} />}
      {!open && <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/65 p-4 backdrop-blur-[2px]">
        <div className="flex size-12 items-center justify-center rounded-full border border-primary/50 bg-background/80 text-primary"><LockKeyhole className="size-5" /></div>
        <p className="mt-4 font-serif text-lg text-primary">{testUnlocked ? t.testUnlock : t.lock}</p>
        <Button variant="champagne" onClick={onVip} className="mt-5 h-auto max-w-[300px] whitespace-normal px-4 py-3 text-center text-sm leading-6"><Crown className="size-4 shrink-0" />{t.unlock}</Button>
      </div>}
    </div>
    {open && art === "mandala" && <div className="mt-3 flex flex-wrap justify-center gap-2"><Button variant="outline" size="sm" onClick={() => setVariation(value => value + 1)}><RefreshCw className="size-4" />{a.regenerate}</Button><Button variant="outline" size="sm" onClick={() => setFullscreen(true)}><Expand className="size-4" />{a.fullscreen}</Button></div>}
    {fullscreen && art === "mandala" && createPortal(<div className="fixed inset-0 z-[200] bg-background" role="dialog" aria-modal="true" aria-label={a.mandalaAlt}><Button variant="outline" size="icon" onClick={() => setFullscreen(false)} aria-label={a.closeFullscreen} title={a.closeFullscreen} className="absolute right-4 top-4 z-10"><X /></Button><div className="h-full w-full"><Suspense fallback={<AgolmenLoading label={a.loading} />}><MandalaScene colors={displayedColors} language={language} variation={variation} reduced={reduced} onCapture={() => undefined} /></Suspense></div></div>, document.body)}
    {testUnlocked && sky && nine && <details className="mt-5 border-y border-primary/20 py-4 text-left"><summary className="cursor-pointer text-primary">{a.valuesTitle(sky.approximate ? a.noon : a.registered)}</summary><dl className="mt-3 grid grid-cols-3 gap-3"><div><dt className="text-xs text-muted-foreground">{a.honmei}</dt><dd className="text-primary">{nineStarName(language, nine.honmei)}</dd></div><div><dt className="text-xs text-muted-foreground">{a.getsumei}</dt><dd className="text-primary">{nineStarName(language, nine.getsumei)}</dd></div><div><dt className="text-xs text-muted-foreground">{a.keisha}</dt><dd className="text-primary">{nineStarName(language, nine.keisha)}</dd></div></dl><p className="mt-3 text-sm leading-6 text-muted-foreground">{a.calculation}{nine.nearBoundary ? ` ${a.boundary}` : ""}</p><dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">{sky.bodies.map((b, index) => <div key={b.name}><dt className="text-sm text-muted-foreground">{Object.values(helioCopy[language].planets)[index] ?? b.name}</dt><dd className="text-primary">{b.longitude.toFixed(2)}°</dd></div>)}</dl></details>}
    <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-muted-foreground">{a.planetDisclaimer(Boolean(sky?.approximate))} {t.gridDisclaimer}</p>
    <div className="mx-auto mt-7 max-w-[640px] border-y border-primary/25 py-5 text-left"><div className="flex items-baseline justify-between gap-4"><h4 className="font-serif text-xl text-primary">{t.gridTitle}</h4><span className="text-xs text-muted-foreground">{nine ? `${nine.solarYear} · ${nine.solarMonth}` : t.gridQualifier}</span></div>
      <div className="mt-4 grid grid-cols-3 gap-px border border-primary/25 bg-primary/25">{(nine?.palaces ?? []).map(cell => <div key={cell.palace} className="min-h-20 bg-background/90 p-2 text-center sm:min-h-24 sm:p-3"><span className="block text-xs text-muted-foreground">{trigramLabel(language, cell.trigram, cell.direction)}</span><span className="mt-1 block font-serif text-xl text-primary sm:text-2xl">{cell.star}</span><span className="block text-xs text-foreground sm:text-sm">{nineStarName(language, cell.star)}</span></div>)}</div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{nine ? a.personalGrid : t.gridDisclaimer}</p>
      {symbols && <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"><span>{t.zodiac}: <strong className="font-normal text-foreground">{zodiacGlyphs[symbols.zodiac]} {a.zodiacNames[symbols.zodiac]}</strong></span><span>{t.animal}: <strong className="font-normal text-foreground">{a.animalNames[symbols.animal]}</strong></span></div>}
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.symbolDisclaimer}</p>
    </div>
    <div className="mt-6 flex flex-wrap justify-center gap-2"><Button variant="outline" onClick={download} disabled={!open || busy || !captureReady} className="min-h-11 border-primary/40 text-primary"><Download />{art === "mandala" ? a.downloadWallpaper : t.downloadPreview}</Button><Button variant="outline" onClick={shareImage} disabled={!open || busy || !captureReady} className="min-h-11 border-primary/40 text-primary"><Share2 />{t.shareImage}</Button><Button variant="ghost" onClick={copyLink} className="min-h-11 text-muted-foreground"><Copy />{t.copyLink}</Button></div>
    <p className="mt-3 text-sm leading-6 text-muted-foreground">{t.shareNote}</p><p role="status" aria-live="polite" className="mt-2 min-h-6 text-sm text-primary">{status}</p>
  </section>;
}
