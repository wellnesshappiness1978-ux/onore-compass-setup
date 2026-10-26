import ChunkedText from "@/components/ChunkedText";
import { usePersonalReading } from "@/hooks/use-personal-reading";
import MethodExplanationList from "./MethodExplanationList";
import { goalText } from "@/lib/focus";
import { ChevronDown, Sparkles } from "lucide-react";
import ShareCardButton from "./ShareCardButton";
import type { UserProfile } from "./Onboarding";
import { homeReadingCopy, readingCompleteMessage } from "@/lib/home-reading-copy";
import { birthColorSpectrum, localizeBirthColorName } from "@/lib/birth-color-spectrum";
import type { Plan } from "@/lib/design-modes";
import type { Language } from "@/lib/translations";
import { AgolmenLoading, useCompletionHold } from "./AgolmenSpiral";
import { approachKeys, traitReadingCopy } from "@/lib/trait-reading";
import { detailLinkLabel } from "@/lib/art-overview-copy";
import { useFocus } from "./FocusProvider";

const titles: Record<Language, [string, string, string]> = {
  ja: ["分類別診断（17占術）", "あなたの診断カードをシェア", "詳しい解説を読む"],
  en: ["Readings by method (17 arts)", "Share your reading card", "Read the detailed reading"],
  "zh-CN": ["分类别诊断（17种占术）", "分享你的诊断卡", "阅读详细解说"],
  "zh-TW": ["分類別診斷（17種占術）", "分享你的診斷卡", "閱讀詳細解說"],
  ko: ["분류별 분석 (17가지 점술)", "나의 진단 카드 공유", "자세한 해설 읽기"],
  es: ["Lecturas por método (17 artes)", "Compartir tu tarjeta", "Leer la explicación"],
  fr: ["Lectures par méthode (17 arts)", "Partager votre carte", "Lire l’explication"],
};

export default function GrandSummaryCard({ profile, language, plan, embedded = false, part = "all" }: { profile: UserProfile; language: Language; plan: Plan; embedded?: boolean; part?: "all" | "approaches" | "summary" | "share" }) {
  const focus = useFocus();
  const subject = { label: focus?.label(language) ?? 'you', isSelf: !focus?.member && !focus?.group };
  const { data, isPending, partial } = usePersonalReading({ profile, language, goal: focus ? goalText(focus.focus, language) : '', subject });
  const copy = homeReadingCopy[language];
  const [title, share] = titles[language];
  const readMore = detailLinkLabel(language, focus?.member || focus?.group ? focus.label(language) : null, Boolean(focus?.group));
  const palette = birthColorSpectrum(profile);
  const traits = traitReadingCopy[language];
  const text = data?.axisSummary ?? partial.axisSummary;
  const holding = useCompletionHold(isPending, 0);
  const showApproaches = part === "all" || part === "approaches";
  const showSummary = part === "all" || part === "summary";
  const showShare = part === "all" || part === "share";
  const heading = part === "summary" ? traits.final : part === "share" ? share : title;
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
      {showApproaches && <MethodExplanationList language={language} detail={key => {
        const body = data?.approaches[key] ?? partial.approaches?.[key];
        if (data?.approachAvailability[key] === "unavailable") return null;
        return <details className="group mt-3 rounded-md border border-primary/25 bg-primary/5">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-3 text-sm text-primary [&::-webkit-details-marker]:hidden">{readMore}<ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" /></summary>
          {body ? <div aria-busy={isPending}><ChunkedText className="px-3 pb-3 text-[15px] leading-7 text-foreground" text={body} /></div> : <AgolmenLoading compact label={copy.loading} />}
        </details>;
      }} />}

      {showSummary && (text ? <section className="mt-6 border-y border-primary/40 py-6 [overflow-wrap:anywhere]"><p aria-busy={isPending} className="whitespace-pre-line text-base leading-8 text-foreground sm:text-lg">{text}</p></section> : loading ? <AgolmenLoading compact label={holding ? readingCompleteMessage[language] : copy.loading} /> : data ? <section className="mt-6 border-y border-primary/40 py-6 [overflow-wrap:anywhere]">
        <ChunkedText className="text-base leading-8 text-foreground sm:text-lg sm:leading-9" text={text} />
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
