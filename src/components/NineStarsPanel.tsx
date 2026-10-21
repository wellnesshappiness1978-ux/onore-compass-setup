import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Copy, Crown, Download, Expand, LockKeyhole, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { birthColorSpectrum } from "@/lib/birth-color-spectrum";
import { natalSky } from "@/lib/natal-sky";
import { nineStarsTranslations } from "@/lib/nine-stars-translations";
import { getArtSymbols, NineStarsArtwork, zodiacGlyphs } from "./NineStarsArtwork";
import type { Language } from "@/lib/translations";
import type { UserProfile } from "./Onboarding";
import type { Capture } from "./MandalaCanvas";
import CosmicGenesisCanvas from "./CosmicGenesisCanvas";
import { paletteColors } from "@/lib/art-geometry";
import { AgolmenLoading } from "./AgolmenSpiral";
import { nineStarProfile } from "@/lib/calendar-traditions";
import { artSpecialistCopy } from "@/lib/art-specialist-copy";
import { nineStarName, trigramLabel } from "@/lib/ui-i18n";
import { helioCopy } from "@/lib/helio-copy";
import { canUse } from "@/lib/plans";
import { SacredDisclosure } from "./ui/sacred-disclosure";
import ArtExportDialog from "./ArtExportDialog";
import { newArtSerial } from "@/lib/art-certificate";
import type { Plan } from "@/lib/design-modes";

import { cosmicGenesis, earthViewAtBirth } from "@/lib/cosmic-astronomy";
const MandalaScene = lazy(() => import("./MandalaCanvas"));
type Props = { language: Language; onVip: () => void; profile: UserProfile; plan: Plan; previewMode?: boolean };

const accessCopy: Record<Language, { mandalaLock: string; cosmicLock: string; mandalaCta: string; cosmicCta: string }> = {
  ja: { mandalaLock: "スタンダード会員以上でご利用いただけます", cosmicLock: "VIP会員以上でご利用いただけます", mandalaCta: "スタンダードプランを見る", cosmicCta: "VIPプランを見る" },
  en: { mandalaLock: "Available with Standard membership or above", cosmicLock: "Available with VIP membership or above", mandalaCta: "View Standard plan", cosmicCta: "View VIP plan" },
  "zh-CN": { mandalaLock: "标准会员及以上可用", cosmicLock: "VIP会员及以上可用", mandalaCta: "查看标准方案", cosmicCta: "查看VIP方案" },
  "zh-TW": { mandalaLock: "標準會員及以上可用", cosmicLock: "VIP會員及以上可用", mandalaCta: "查看標準方案", cosmicCta: "查看VIP方案" },
  ko: { mandalaLock: "스탠다드 회원 이상 이용 가능", cosmicLock: "VIP 회원 이상 이용 가능", mandalaCta: "스탠다드 플랜 보기", cosmicCta: "VIP 플랜 보기" },
  es: { mandalaLock: "Disponible con membresía Estándar o superior", cosmicLock: "Disponible con membresía VIP o superior", mandalaCta: "Ver plan Estándar", cosmicCta: "Ver plan VIP" },
  fr: { mandalaLock: "Disponible dès l’offre Standard", cosmicLock: "Disponible dès l’offre VIP", mandalaCta: "Voir l’offre Standard", cosmicCta: "Voir l’offre VIP" },
};

const cosmicPlanetNames: Record<Language, string[]> = {
  ja: ["水星", "金星", "地球", "火星", "木星", "土星", "天王星", "海王星"],
  en: ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"],
  "zh-CN": ["水星", "金星", "地球", "火星", "木星", "土星", "天王星", "海王星"],
  "zh-TW": ["水星", "金星", "地球", "火星", "木星", "土星", "天王星", "海王星"],
  ko: ["수성", "금성", "지구", "화성", "목성", "토성", "천왕성", "해왕성"],
  es: ["Mercurio", "Venus", "Tierra", "Marte", "Júpiter", "Saturno", "Urano", "Neptuno"],
  fr: ["Mercure", "Vénus", "Terre", "Mars", "Jupiter", "Saturne", "Uranus", "Neptune"],
};

export default function NineStarsPanel({ language, onVip, profile, plan, previewMode = false }: Props) {
  const t = nineStarsTranslations[language];
  const a = artSpecialistCopy[language];
  const { birthDate, bloodType } = profile;
  const palette = birthColorSpectrum(profile);
  const sky = natalSky(birthDate, profile.birthTime, profile.birthTimeUnknown);
  const genesis = cosmicGenesis(birthDate, profile.birthTime, profile.birthTimeUnknown);
  const earthView = genesis ? earthViewAtBirth(genesis, profile.birthPlace, profile.birthCity) : null;
  const nine = nineStarProfile(birthDate, profile.birthTime, profile.birthTimeUnknown, profile.gender);
  const symbols = getArtSymbols(birthDate);
  const [art, setArt] = useState<"mandala" | "cosmic">("mandala");
  const [mounted, setMounted] = useState(false);
  const [colors, setColors] = useState({ main: "#D4AF37", sub: "#F3E5AB" });
  const paletteEntries = palette ? paletteColors(palette) : [];
  const artColors = paletteEntries.length ? paletteEntries.map(color => color.code) : [colors.main, colors.sub];
  const [status, setStatus] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [serial, setSerial] = useState("");
  useEffect(() => { setSerial(newArtSerial()); }, [art]);
  const [captureReady, setCaptureReady] = useState(false);
  const capture = useRef<Capture | null>(null);
  const setCapture = useCallback((fn: Capture | null) => { capture.current = fn; setCaptureReady(Boolean(fn)); }, []);
  const ignoreCapture = useCallback(() => undefined, []);
  const mandalaOpen = canUse(plan, "mandalaArt");
  const cosmicOpen = canUse(plan, "cosmicGenesisArt");
  const open = art === "mandala" ? mandalaOpen : cosmicOpen;
  const gateCopy = accessCopy[language];
  useEffect(() => {
    setMounted(true);
    const css = getComputedStyle(document.documentElement);
    setColors({ main: css.getPropertyValue("--primary").trim() || "#D4AF37", sub: css.getPropertyValue("--gold-glow").trim() || "#F3E5AB" });
  }, []);
  useEffect(() => {
    if (!open) return;
    const share = (event: Event) => { event.preventDefault(); setExportOpen(true); };
    window.addEventListener("onore-share-card", share);
    return () => window.removeEventListener("onore-share-card", share);
  }, [open, art]);
  useEffect(() => { capture.current = null; setCaptureReady(false); setStatus(""); }, [art, open]);

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
    <p className="mt-3 text-sm leading-7 text-muted-foreground">{palette && open ? art === "mandala" ? a.mandalaDescription : a.cosmicDescription : t.fallback}</p>
    {previewMode && open && <p className="mx-auto mt-3 inline-block border border-primary/40 px-3 py-1 text-sm text-primary">{t.testNotice}</p>}
    <aside className="mt-6 border-y border-primary/35 py-5 text-left" aria-label={a.about}><p className="font-serif text-lg leading-8 text-primary">{art === "mandala" ? a.mandalaAbout : a.cosmicAbout}</p><p className="mt-2 text-sm leading-7 text-muted-foreground">{art === "cosmic" && (sky?.approximate ? a.approximate : a.exactTime)} {a.artDisclaimer}</p></aside>
    {palette && open && art === "cosmic" && <div className="mx-auto mt-5 grid max-w-[720px] grid-cols-4 gap-2 sm:grid-cols-7" aria-label={a.palette}>{paletteColors(palette).map((color, index) => <div key={`${color.slot}-${index}`} className="min-w-0"><span className="mx-auto block size-8 rounded-full border border-primary/30" style={{ backgroundColor: color.code }} /><span className="mt-1 block truncate text-[11px] text-muted-foreground">{a.paletteSlots[index]}</span></div>)}</div>}
    {palette && open && art === "mandala" && <div className="mx-auto mt-6 grid max-w-[720px] grid-cols-4 gap-2 sm:grid-cols-7" aria-label={a.palette}>{paletteColors(palette).map((color, index) => <div key={`${color.slot}-${index}`} className="min-w-0"><span className="mx-auto block size-8 rounded-full border border-primary/30 shadow-gold" style={{ backgroundColor: color.code }} /><span className="mt-1 block truncate text-[11px] text-muted-foreground">{a.paletteSlots[index]}</span></div>)}</div>}
    <div className="relative mx-auto mt-7 aspect-square w-full max-w-[920px] overflow-hidden border-y border-primary/35 bg-background shadow-gold" aria-label={art === "cosmic" ? a.cosmic : a.mandalaAlt}>
      {mounted && open && genesis && earthView && art === "cosmic" ? <CosmicGenesisCanvas genesis={genesis} earthView={earthView} colors={artColors} language={language} birthPlace={[profile.birthPlace, profile.birthCity].filter(Boolean).join(" ")} onCapture={setCapture} /> : mounted && open && sky ? <Suspense fallback={<AgolmenLoading compact label={a.loading} />}>
        <MandalaScene language={language} onCapture={setCapture} colors={artColors} labels={a.paletteSlots} />
      </Suspense> : art === "mandala" ? <Suspense fallback={<AgolmenLoading compact label={a.loading} />}><MandalaScene language={language} onCapture={ignoreCapture} colors={artColors} labels={a.paletteSlots} /></Suspense> : <NineStarsArtwork main={colors.main} sub={colors.sub} bloodType={bloodType} birthDate={birthDate} language={language} />}
      {!open && <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/65 p-4 backdrop-blur-[2px]">
        <div className="flex size-12 items-center justify-center rounded-full border border-primary/50 bg-background/80 text-primary"><LockKeyhole className="size-5" /></div>
        <p className="mt-4 font-serif text-lg text-primary">{art === "mandala" ? gateCopy.mandalaLock : gateCopy.cosmicLock}</p>
        <Button variant="champagne" onClick={onVip} className="mt-5 h-auto max-w-[300px] whitespace-normal px-4 py-3 text-center text-sm leading-6"><Crown className="size-4 shrink-0" />{art === "mandala" ? gateCopy.mandalaCta : gateCopy.cosmicCta}</Button>
      </div>}
    </div>
    {open && <div className="mt-3 flex flex-wrap justify-center gap-2"><Button variant="outline" size="sm" onClick={() => setFullscreen(true)}><Expand className="size-4" />{a.fullscreen}</Button></div>}
    {fullscreen && createPortal(<div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-background p-2 sm:p-8" role="dialog" aria-modal="true" aria-label={art === "cosmic" ? a.cosmic : a.mandalaAlt}><Button variant="outline" size="icon" onClick={() => setFullscreen(false)} aria-label={a.closeFullscreen} title={a.closeFullscreen} className="absolute right-4 top-4 z-10"><X /></Button>{art === "mandala" && palette && <div className="grid w-full max-w-[720px] grid-cols-4 gap-2 sm:grid-cols-7" aria-label={a.palette}>{paletteColors(palette).map((color, index) => <div key={`${color.slot}-${index}`} className="min-w-0 text-center"><span className="mx-auto block size-8 rounded-full border border-primary/30 shadow-gold" style={{ backgroundColor: color.code }} /><span className="mt-1 block truncate text-[11px] text-muted-foreground">{a.paletteSlots[index]}</span></div>)}</div>}<div className={`aspect-square max-h-full w-full ${art === "mandala" ? "max-w-[min(100vw,calc(100vh-7rem))]" : "max-w-[min(100vw,100vh)]"}`}>{art === "cosmic" && genesis && earthView ? <CosmicGenesisCanvas genesis={genesis} earthView={earthView} colors={artColors} language={language} birthPlace={[profile.birthPlace, profile.birthCity].filter(Boolean).join(" ")} onCapture={ignoreCapture} /> : <Suspense fallback={<AgolmenLoading label={a.loading} />}><MandalaScene language={language} onCapture={ignoreCapture} colors={artColors} labels={a.paletteSlots} /></Suspense>}</div></div>, document.body)}
    {open && sky && nine && <SacredDisclosure className="mt-5 text-left" title={a.valuesTitle(sky.approximate ? a.noon : a.registered)} closeLabel={a.closeFullscreen}><dl className="mt-3 grid grid-cols-3 gap-3"><div><dt className="text-xs text-muted-foreground">{a.honmei}</dt><dd className="text-primary">{nineStarName(language, nine.honmei)}</dd></div><div><dt className="text-xs text-muted-foreground">{a.getsumei}</dt><dd className="text-primary">{nineStarName(language, nine.getsumei)}</dd></div><div><dt className="text-xs text-muted-foreground">{a.keisha}</dt><dd className="text-primary">{nineStarName(language, nine.keisha)}</dd></div></dl><p className="mt-3 text-sm leading-6 text-muted-foreground">{a.calculation}{nine.nearBoundary ? ` ${a.boundary}` : ""}</p><dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{(art === "cosmic" && genesis ? genesis.planets : sky.bodies).map((body, index) => <div key={body.name}><dt className="text-sm text-muted-foreground">{art === "cosmic" ? cosmicPlanetNames[language][index] : Object.values(helioCopy[language].planets)[index] ?? body.name}</dt><dd className="text-primary">{body.longitude.toFixed(2)}°</dd></div>)}</dl></SacredDisclosure>}
    <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-muted-foreground">{a.planetDisclaimer(Boolean(sky?.approximate))} {t.gridDisclaimer}</p>
    <div className="mx-auto mt-7 max-w-[640px] border-y border-primary/25 py-5 text-left"><div className="flex items-baseline justify-between gap-4"><h4 className="font-serif text-xl text-primary">{t.gridTitle}</h4><span className="text-xs text-muted-foreground">{nine ? `${nine.solarYear} · ${nine.solarMonth}` : t.gridQualifier}</span></div>
      <div className="mt-4 grid grid-cols-3 gap-px border border-primary/25 bg-primary/25">{(nine?.palaces ?? []).map(cell => <div key={cell.palace} className="min-h-20 bg-background/90 p-2 text-center sm:min-h-24 sm:p-3"><span className="block text-xs text-muted-foreground">{trigramLabel(language, cell.trigram, cell.direction)}</span><span className="mt-1 block font-serif text-xl text-primary sm:text-2xl">{cell.star}</span><span className="block text-xs text-foreground sm:text-sm">{nineStarName(language, cell.star)}</span></div>)}</div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{nine ? a.personalGrid : t.gridDisclaimer}</p>
      {symbols && <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"><span>{t.zodiac}: <strong className="font-normal text-foreground">{zodiacGlyphs[symbols.zodiac]} {a.zodiacNames[symbols.zodiac]}</strong></span><span>{t.animal}: <strong className="font-normal text-foreground">{a.animalNames[symbols.animal]}</strong></span></div>}
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.symbolDisclaimer}</p>
    </div>
    <div className="mt-6 flex flex-wrap justify-center gap-2"><Button variant="outline" onClick={() => setExportOpen(true)} disabled={!open || !captureReady} className="min-h-11 border-primary/40 text-primary"><Download />{art === "mandala" ? a.downloadWallpaper : t.downloadPreview}</Button><Button variant="outline" onClick={() => setExportOpen(true)} disabled={!open || !captureReady} className="min-h-11 border-primary/40 text-primary"><Share2 />{t.shareImage}</Button><Button variant="ghost" onClick={copyLink} className="min-h-11 text-muted-foreground"><Copy />{t.copyLink}</Button></div>
    {open && <ArtExportDialog open={exportOpen} onOpenChange={setExportOpen} capture={capture.current} language={language} record={{title:art === "cosmic" ? a.cosmic : a.mandala,serial,name:[profile.nameKanji,profile.nameRomaji].filter(Boolean).join(" / "),birthDate:profile.birthDate,birthTime:profile.birthTime,birthTimeUnknown:profile.birthTimeUnknown,birthPlace:profile.birthPlace,birthCity:profile.birthCity ?? ""}} />}
    <p className="mt-3 text-sm leading-6 text-muted-foreground">{t.shareNote}</p><p role="status" aria-live="polite" className="mt-2 min-h-6 text-sm text-primary">{status}</p>
  </section>;
}
