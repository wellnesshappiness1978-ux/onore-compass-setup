import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, Lock, Sparkles } from "lucide-react";
import ShareCardButton from "./ShareCardButton";
import type { UserProfile } from "./Onboarding";
import { generateHomeReading } from "@/lib/ai/home-reading.functions";
import { homeReadingCopy, readingCompleteMessage } from "@/lib/home-reading-copy";
import { birthColorSpectrum, localizeBirthColorName } from "@/lib/birth-color-spectrum";
import type { Plan } from "@/lib/design-modes";
import type { Language } from "@/lib/translations";
import { AgolmenLoading, useCompletionHold } from "./AgolmenSpiral";
import { approachKeys, type ApproachKey, traitReadingCopy } from "@/lib/trait-reading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

const titles: Record<Language, [string, string, string, string, string]> = {
  ja: ["分類別診断（15占術）", "あなたの診断カードをシェア", "詳しい解説を読む", "この占術は現在のプロフィールでは算出していません。推測で補うことはせず、表示を控えています。", "多層総合診断"],
  en: ["Readings by method (15 arts)", "Share your reading card", "Read the detailed reading", "This method is not calculated from the current profile. Rather than guessing, no reading is shown.", "Multi-layer grand reading"],
  "zh-CN": ["分类别诊断（15种占术）", "分享你的诊断卡", "阅读详细解说", "此占术目前未根据资料计算，为避免臆测，不显示解读。", "多层综合诊断"],
  "zh-TW": ["分類別診斷（15種占術）", "分享你的診斷卡", "閱讀詳細解說", "此占術目前未依資料計算，為避免臆測，不顯示解讀。", "多層綜合診斷"],
  ko: ["분류별 분석 (15가지 점술)", "나의 진단 카드 공유", "자세한 해설 읽기", "이 점술은 현재 프로필로 계산하지 않습니다. 추측으로 채우지 않고 표시하지 않습니다.", "다층 종합 분석"],
  es: ["Lecturas por método (15 artes)", "Compartir tu tarjeta", "Leer la explicación", "Este método no se calcula con el perfil actual. No se muestra una lectura inventada.", "Lectura integral multicapa"],
  fr: ["Lectures par méthode (15 arts)", "Partager votre carte", "Lire l’explication", "Cette méthode n’est pas calculée avec le profil actuel. Aucune lecture inventée n’est affichée.", "Lecture globale multicouche"],
};

type Genre = "western" | "eastern" | "calendar" | "number" | "color" | "context";
const genreOf: Record<ApproachKey, Genre> = { western: "western", indian: "western", ziwei: "eastern", earth: "calendar", pillars: "eastern", sanmei: "eastern", nineStars: "eastern", lunarMansion: "calendar", animal: "eastern", numerology: "number", maya: "calendar", color: "color", blood: "context", siblings: "context", region: "context" };
const genres: Record<Language, Record<Genre, string>> = {
  ja: { western: "天体・星の占術", eastern: "東洋命術", calendar: "暦・周期の占術", number: "数の占術", color: "色彩理論", context: "気質・環境の参考" },
  en: { western: "Celestial astrology", eastern: "East Asian destiny arts", calendar: "Calendar & cycles", number: "Number arts", color: "Color theory", context: "Temperament & context" },
  "zh-CN": { western: "天体星象", eastern: "东方命理", calendar: "历法与周期", number: "数字占术", color: "色彩理论", context: "气质与环境参考" },
  "zh-TW": { western: "天體星象", eastern: "東方命理", calendar: "曆法與週期", number: "數字占術", color: "色彩理論", context: "氣質與環境參考" },
  ko: { western: "천체 점성술", eastern: "동양 명리", calendar: "달력·주기", number: "수의 점술", color: "색채 이론", context: "기질·환경 참고" },
  es: { western: "Astrología celeste", eastern: "Artes orientales", calendar: "Calendarios y ciclos", number: "Artes numéricas", color: "Teoría del color", context: "Temperamento y contexto" },
  fr: { western: "Astrologie céleste", eastern: "Arts d’Asie orientale", calendar: "Calendriers et cycles", number: "Arts des nombres", color: "Théorie des couleurs", context: "Tempérament et contexte" },
};

export default function GrandSummaryCard({ profile, language, plan, embedded = false, part = "all" }: { profile: UserProfile; language: Language; plan: Plan; embedded?: boolean; part?: "all" | "approaches" | "summary" | "share" }) {
  const generate = useServerFn(generateHomeReading);
  const { data, isPending } = useQuery({
    queryKey: ["home-reading-six-v16", profile, language],
    queryFn: () => generate({ data: { profile, language } }),
    staleTime: Infinity,
    retry: false,
  });
  const copy = homeReadingCopy[language];
  const [title, share, readMore, unavailable, summaryTitle] = titles[language];
  const palette = birthColorSpectrum(profile);
  const traits = traitReadingCopy[language];
  const text = data?.axisSummary;
  const holding = useCompletionHold(isPending);
  const showApproaches = part === "all" || part === "approaches";
  const showSummary = part === "all" || part === "summary";
  const showShare = part === "all" || part === "share";
  const heading = part === "summary" ? summaryTitle : part === "share" ? share : title;
  const colors = palette ? (plan === "free" ? [palette.main] : [palette.main, palette.sub, palette.money, palette.work, palette.love, palette.health, palette.mind]) : [];
  const available = data ? approachKeys.filter(k => data.approachAvailability[k] !== "unavailable" && data.approaches[k]?.trim()) : [];
  const shareData = data && (data.keySummary || text) ? {
    kicker: "", title: "", names: [] as string[],
    lines: [data.catchphrase, data.keySummary || (text ?? "").slice(0, 120)].filter(Boolean),
    caution: data.caution,
    keywords: available.slice(0, 6).map(k => traits.methods[approachKeys.indexOf(k)] ?? ""),
    palette: colors.slice(0, 6).map(c => ({ label: localizeBirthColorName(c.name, language), code: c.code })),
    score: 0, kind: "identity" as const,
  } : null;
  const loading = isPending || holding;
  return (
    <section id={part === "summary" ? "grand-summary" : undefined} aria-label={heading} className={embedded ? "border-t border-primary/30 px-5 py-8 sm:px-8 sm:py-10" : "card-lux relative mt-8 overflow-hidden rounded-lg px-5 py-8 sm:px-10 sm:py-12"}>
      <div className="text-center">
        <Sparkles className="mx-auto size-6 text-primary" strokeWidth={1.2} aria-hidden="true" />
        <h2 className="mt-3 font-serif text-2xl text-gradient-gold sm:text-3xl">{heading}</h2>
      </div>
      {showApproaches && <Accordion type="single" collapsible className="mt-6 divide-y divide-primary/20 rounded-lg border border-primary/30">
        {approachKeys.map((key, i) => {
          const status = data?.approachAvailability[key] ?? "unavailable";
          const body = data?.approaches[key]?.trim();
          const ok = status !== "unavailable" && Boolean(body);
          return <AccordionItem key={key} value={key} className="border-b-0 px-4">
            <AccordionTrigger className="min-w-0 gap-3 py-4 text-left hover:no-underline">
              <span className="flex min-w-0 items-center gap-3"><span className="shrink-0 font-mono text-xs text-primary/70">{String(i + 1).padStart(2, "0")}</span><span className="min-w-0 break-words font-serif text-base text-primary">{traits.methods[i]}</span></span>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <p className="text-xs text-muted-foreground">{genres[language][genreOf[key]]} · {loading ? copy.loading : ok ? (status === "context" ? traits.symbolic : traits.statuses.reference) : traits.statuses.unavailable}</p>
              {loading ? <AgolmenLoading compact label={copy.loading} /> : ok ? <details className="group mt-3 rounded-md border border-primary/25 bg-primary/5">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-3 text-sm text-primary [&::-webkit-details-marker]:hidden">{readMore}<ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" /></summary>
                <p className="whitespace-pre-line px-3 pb-3 text-[15px] leading-7 text-foreground [overflow-wrap:anywhere]">{body}</p>
              </details> : <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-muted-foreground"><Lock className="mt-1 size-3.5 shrink-0" aria-hidden="true" />{unavailable}</p>}
            </AccordionContent>
          </AccordionItem>;
        })}
      </Accordion>}
      {showSummary && (loading ? <AgolmenLoading compact label={holding ? readingCompleteMessage[language] : copy.loading} /> : data ? <section className="mt-6 border-y border-primary/40 py-6 [overflow-wrap:anywhere]">
        <p className="whitespace-pre-line text-base leading-snug text-foreground sm:text-lg sm:leading-snug">{text}</p>
      </section> : <p role="status" className="mt-6 text-foreground">{copy.error}</p>)}
      {showSummary && <p className="mt-5 text-center text-[11px] text-muted-foreground">{copy.preview}</p>}
      {showShare && <ShareCardButton
        className="mt-6 h-auto min-h-12 w-full whitespace-normal px-4 py-3 text-base"
        language={language}
        loading={isPending}
        label={share}
        autoOpen={false}
        data={shareData}
      />}
    </section>
  );
}
