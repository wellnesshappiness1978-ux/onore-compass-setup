import { usePersonalReading } from "@/hooks/use-personal-reading";
import { ArrowUpRight, Building2, Check, Compass, Crown, Dna, Fingerprint, Gem, Heart, Orbit, Sparkles, Sprout } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import GrandSummaryCard from "./GrandSummaryCard";
import { AgolmenLoading, useCompletionHold } from "./AgolmenSpiral";
import { usePlan } from "./PlanProvider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { fiveElementsCopy } from "@/lib/five-elements-copy";
import { homeReadingCopy, readingCompleteMessage } from "@/lib/home-reading-copy";
import { computeCoreLayers, type CoreLayers } from "@/lib/ai/core-layers";
import { homePlanCardsCopy, type HomePlanId } from "@/lib/home-plan-cards";
import { torisetsuTranslations, type Language } from "@/lib/translations";
import type { UserProfile } from "./Onboarding";
import { splittableName } from "@/lib/ai/five-elements";
import { isUpgradePlan } from "@/lib/plans";
import type { Plan } from "@/lib/design-modes";
import { birthColorSpectrum } from "@/lib/birth-color-spectrum";
import BirthColorGuide from "./BirthColorGuide";
import { SacredDisclosure } from "./ui/sacred-disclosure";
import { essenceKeys, traitReadingCopy } from "@/lib/trait-reading";
import { useFocus } from './FocusProvider';
import DeeperEssenceSections from './DeeperEssenceSections';
import { useQueryClient } from '@tanstack/react-query';
import { localIso } from '@/lib/day-compass';

const layerNames: Record<Language, string[]> = {
  ja: ["本格姓名判断", "精密数秘術", "西洋占星術", "四柱推命", "動物占い・独自4層参考", "本格風水学"],
  en: ["Name analysis", "Numerology", "Western astrology", "Four Pillars", "Animal cycle reference", "Feng shui"],
  "zh-CN": ["姓名分析", "数秘术", "西方占星", "四柱", "动物周期参考", "风水"],
  "zh-TW": ["姓名分析", "數秘術", "西方占星", "四柱", "動物週期參考", "風水"],
  ko: ["이름 분석", "수비학", "서양 점성술", "사주", "동물 주기 참고", "풍수"],
  es: ["Análisis del nombre", "Numerología", "Astrología occidental", "Cuatro Pilares", "Ciclo animal orientativo", "Feng shui"],
  fr: ["Analyse du nom", "Numérologie", "Astrologie occidentale", "Quatre Piliers", "Cycle animal indicatif", "Feng shui"],
};

const nameCopy: Record<Language, { title: string; grids: [string, string, string, string, string]; fortune: string; split: string; save: string; note: string }> = {
  ja: { title: "本格 姓名判断（五運と人生の軸）", grids: ["天格（家系運）", "人格（主運・内面）", "地格（基礎運）", "外格（対人・環境運）", "総格（総合・晩年運）"], fortune: "名前が示す社会的な強みと引き寄せる運命", split: "姓と名の区切りを選ぶと五運を算出して保存します", save: "この区切りで保存", note: "現代字体の画数・霊数を外格のみに加える方式・一般的な81数の吉凶表に基づく参考値です。流派により異なります。" },
  en: { title: "Name reading (five grids)", grids: ["Heaven (family)", "Person (core)", "Earth (foundation)", "Outer (social)", "Total (overall)"], fortune: "Social strengths your name suggests", split: "Choose where your surname ends to calculate and save the five grids", save: "Save this split", note: "Reference values using modern stroke counts and a common 81-number table; schools differ." },
  "zh-CN": { title: "姓名五格", grids: ["天格", "人格", "地格", "外格", "总格"], fortune: "姓名显示的社会优势", split: "选择姓与名的分界以计算并保存五格", save: "按此保存", note: "基于现代笔画与常见81数吉凶表的参考值，流派不同结果可能不同。" },
  "zh-TW": { title: "姓名五格", grids: ["天格", "人格", "地格", "外格", "總格"], fortune: "姓名顯示的社會優勢", split: "選擇姓與名的分界以計算並儲存五格", save: "依此儲存", note: "基於現代筆畫與常見81數吉凶表的參考值，流派不同結果可能不同。" },
  ko: { title: "성명 오격", grids: ["천격", "인격", "지격", "외격", "총격"], fortune: "이름이 보여주는 사회적 강점", split: "성과 이름의 경계를 선택하면 오격을 계산해 저장합니다", save: "이대로 저장", note: "현대 획수와 일반적인 81수 길흉표에 따른 참고값이며 유파마다 다릅니다." },
  es: { title: "Lectura del nombre (cinco cuadros)", grids: ["Cielo", "Persona", "Tierra", "Exterior", "Total"], fortune: "Fortalezas sociales que sugiere tu nombre", split: "Elige dónde termina tu apellido para calcular y guardar", save: "Guardar", note: "Valores de referencia con trazos modernos y una tabla común de 81 números." },
  fr: { title: "Lecture du nom (cinq cadres)", grids: ["Ciel", "Personne", "Terre", "Extérieur", "Total"], fortune: "Forces sociales suggérées par votre nom", split: "Choisissez la fin du nom de famille pour calculer et enregistrer", save: "Enregistrer", note: "Valeurs de référence avec traits modernes et une table courante de 81 nombres." },
};

const planIcons: Record<HomePlanId, typeof Sprout> = { standard: Sprout, vip: Gem, b2b: Building2, "b2b-premium": Crown };

export default function SelfCoreCard({ title, goal = "", profile, language, onDiagnosis, onProfileChange, currentPlan, onSelectPlan, experienceOnly = false }: { title?: string; goal?: string; onProfileChange?: (p: UserProfile) => Promise<void>; profile: UserProfile; language: Language; onDiagnosis: () => void; currentPlan?: Plan; onSelectPlan?: (plan: HomePlanId) => void; experienceOnly?: boolean }) {
  const focus = useFocus();
  const subject = { label: focus?.label(language) ?? 'you', isSelf: !focus?.member && !focus?.group };
  const { override, enabled } = usePlan();
  const activePlan = enabled && override ? override : currentPlan ?? "free";
  const palette = birthColorSpectrum(profile);
  const t = homeReadingCopy[language];
  const traits = traitReadingCopy[language];
  const p = homePlanCardsCopy[language];
  const upgradeCards = p.cards.filter(card => isUpgradePlan(activePlan, card.id));
  const [dialogPlan, setDialogPlan] = useState<HomePlanId | null>(null);
  const f = fiveElementsCopy[language];
  const n = nameCopy[language];
  const chars = splittableName(profile.nameKanji);
  const readingClient = useQueryClient();
  const profileSignature = JSON.stringify(profile);
  const day = localIso(new Date());
  const localLayers = useMemo(() => {
    const key = ['core-layers', day, profileSignature];
    const cached = readingClient.getQueryData<CoreLayers | null>(key);
    if (cached !== undefined) return cached;
    const calculated = computeCoreLayers(profile);
    readingClient.setQueryData(key, calculated);
    return calculated;
  }, [profileSignature, day, readingClient]);
  const [cut, setCut] = useState(chars && chars.length >= 3 ? 2 : 1);
  const [saving, setSaving] = useState(false);
  // The short essence gets priority; the complete result starts after its first visible text.
  const quick = usePersonalReading({ profile, language, goal, subject }, 'quick');
  const { data, partial, isPending, isError, refetch } = usePersonalReading({ profile, language, goal, subject });
  const holding = useCompletionHold(isPending, 0);
  const top = quick.data ?? (quick.partial.catchphrase ? quick.partial : data ?? (partial.catchphrase ? partial : undefined));
  const topLoading = !top && (quick.isPending || isPending);
  const e = data?.elements;
  const values = e ? [e.name ? `${e.name.sky} · ${e.name.person} · ${e.name.earth} · ${e.name.outer} · ${e.name.total}` : null, e.zodiac, e.eto, e.blood, e.animal] : [];
  const sections = data ? [data.synthesis, data.name, data.mind, data.instinct, data.strength] : [];
  const layerPassages = data ? [
    [data.nameNature, data.nameGuide], [data.numerologyNature, data.numerologyGuide],
    [data.westernNature, data.westernGuide], [data.pillarsNature, data.pillarsGuide],
    [data.animalNature, data.animalGuide], [data.fengNature, data.fengGuide],
  ] : [];
  const coreSections = language === "ja" ? ["コアアイデンティティ", "思考バイアス", "前進と静観の内的な差"] : ["Core identity", "Decision patterns", "Advance and pause tendencies"];
  const icons = [Dna, Fingerprint, Orbit, Heart, Sparkles];

  const nameDetails = (
<section aria-label={n.title} className="my-6 border-y border-primary/25 py-5">
            <h3 className="font-serif text-lg text-gradient-gold sm:text-xl">{n.title}</h3>
            {localLayers?.name ? <>
              {data?.nameFortune && <><h4 className="mt-5 font-serif text-sm text-primary">{n.fortune}</h4><p className="mt-2 whitespace-pre-line text-sm leading-8 text-foreground sm:text-base">{data?.nameFortune}</p></>}

            </> : chars && onProfileChange ? <div className="mt-3">
              <p className="text-sm text-muted-foreground">{n.split}</p>
              <div className="mt-3 flex flex-wrap gap-2">{chars.slice(0, -1).map((_, i) => <Button key={i} size="sm" variant={cut === i + 1 ? "default" : "outline"} onClick={() => setCut(i + 1)}>{chars.slice(0, i + 1).join("")}　{chars.slice(i + 1).join("")}</Button>)}</div>
              <Button className="mt-3" disabled={saving} onClick={async () => { setSaving(true); try { await onProfileChange({ ...profile, nameKanji: `${chars.slice(0, cut).join("")} ${chars.slice(cut).join("")}` }); } finally { setSaving(false); } }}>{n.save}</Button>
            </div> : <p className="mt-3 text-sm text-muted-foreground">{f.nameNote}</p>}
          </section>
  );

  return (
    <section aria-label={t.title} className="min-w-0 overflow-hidden rounded-lg border border-primary/35 bg-card/75 shadow-champagne backdrop-blur-md">
      <header className="flex items-start gap-3 border-b border-primary/20 bg-primary/5 p-5 sm:p-8">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary/10 text-primary"><Compass className="size-5" aria-hidden="true" /></div>
        <div className="min-w-0"><p className="text-[10px] uppercase text-primary/75">AGOLMEN'S COMPASS · {t.openToAll}</p><h2 className="mt-2 break-words font-serif text-xl leading-snug text-gradient-gold sm:text-2xl">{title ?? t.title}</h2></div>
      </header>
      <div className="px-5 sm:px-8">
        {topLoading && <div aria-hidden="true" className="my-6 space-y-3 rounded-md border-2 border-primary/30 px-4 py-6"><div className="h-3 w-24 animate-pulse rounded bg-primary/20" /><div className="h-7 w-4/5 animate-pulse rounded bg-primary/15" /></div>}
        {top?.catchphrase && <section aria-label={traits.catchphrase} className="my-6 rounded-md border-2 border-primary/60 px-4 py-6 sm:px-6 sm:py-8 [overflow-wrap:anywhere]">
          <p className="flex items-center gap-2 text-sm text-primary"><Sparkles className="size-4" aria-hidden="true" />{traits.catchphrase}</p>
          <p className="mt-4 border-l-2 border-primary pl-4 font-serif text-2xl leading-relaxed text-gradient-gold sm:pl-6 sm:text-3xl">{top.catchphrase}</p>
        </section>}
        <section aria-label={traits.essence} className="my-5 py-2">
          <h3 className="font-serif text-xl text-primary">{traits.essence}</h3>
          <div className="mt-4 divide-y divide-primary/20">
            {essenceKeys.map((key, i) => <SacredDisclosure key={key} className="min-w-0 py-1 [overflow-wrap:anywhere]" title={<span className="flex items-start gap-3 font-serif text-lg leading-8 text-primary"><span className="shrink-0 font-mono text-xs leading-8">0{i + 1}</span><span>{traits.headings[i]}</span></span>}>
              {top?.essence?.[key] ? <p className="mt-3 whitespace-pre-line text-base leading-8 text-foreground">{top.essence[key]}</p> : topLoading ? <AgolmenLoading compact label={t.loading} /> : <p role="status" className="mt-3 text-foreground">{t.error}</p>}
            </SacredDisclosure>)}
          </div>
          {!top && isError && quick.isError && <Button variant="outline" className="mt-3" onClick={() => { void quick.refetch(); void refetch(); }}>{t.retry}</Button>}
          {experienceOnly && <DeeperEssenceSections profile={profile} language={language} passages={data?.deeperEssence ?? partial.deeperEssence} />}
        </section>
        <SacredDisclosure className="my-5" title={t.views}>
        <div className="divide-y divide-primary/20">
          {layerNames[language].map((name, i) => {
            const passage = layerPassages[i];
            return <SacredDisclosure key={name} className="min-w-0 py-1 [overflow-wrap:anywhere]" title={<span className="flex items-start gap-3 font-serif text-lg leading-8 text-primary"><span className="shrink-0 font-mono text-xs leading-8">0{i + 1}</span><span>{name}</span></span>}>
              {passage ? <div className="space-y-6">
                <section><h4 className="font-serif text-lg text-primary">{t.gift}</h4><p className="mt-3 whitespace-pre-line text-base leading-8 text-foreground">{passage[0]}</p></section>
                <section className="border-l-2 border-primary pl-4"><h4 className="text-sm text-primary">{t.guide}</h4><p className="mt-2 whitespace-pre-line text-base leading-8 text-foreground">{passage[1]}</p></section>
              </div> : isPending ? <AgolmenLoading compact label={t.loading} /> : <p role="status" className="text-sm leading-7 text-muted-foreground">{t.error}</p>}
              {i === 0 && nameDetails}
            </SacredDisclosure>;
          })}
        </div>
        <p className="mt-4 text-xs leading-6 text-muted-foreground">{t.preview}</p>
                 {isPending || holding ? <AgolmenLoading compact label={holding ? readingCompleteMessage[language] : t.loading} /> : isError || !data ? (
          <div className="flex min-h-40 flex-col items-start justify-center gap-3" role="alert"><p className="text-sm text-muted-foreground">{t.error}</p><Button variant="outline" onClick={() => void refetch()}>{t.retry}</Button></div>
        ) : <>
          {!experienceOnly && data.keySummary && <section aria-label="本質の交差点" className="my-6 rounded-lg border border-primary/50 bg-gradient-to-b from-primary/15 to-transparent p-5 sm:p-6"><p className="text-xs text-primary">{language === "ja" ? "複数の参考レイヤーが交差する人物像" : "A portrait across the reference layers"}</p><p className="mt-3 font-serif text-lg leading-9 text-foreground sm:text-xl">{data.keySummary}</p></section>}
          {!experienceOnly && sections.map((text, i) => {
            const Icon = icons[i] ?? Sparkles;
            return <article key={i} className="border-b border-primary/20 py-7 last:border-b-0 sm:py-9">
              <div className="flex items-start gap-3"><span className="pt-0.5 font-serif text-xs text-primary/70">0{i + 1}</span><Icon className="size-5 shrink-0 text-primary" aria-hidden="true" /><h3 className="min-w-0 break-words font-serif text-lg leading-snug text-primary sm:text-xl">{f.sections[i]}</h3></div>
              <p className={`mt-5 max-w-3xl whitespace-pre-line break-words text-foreground ${i === 0 ? "font-serif text-[1.0625rem] leading-[2.1] sm:text-xl sm:leading-[2.05]" : "text-sm leading-8 sm:text-base"}`}>{text}</p>
            </article>;
          })}
            {!experienceOnly && <article className="border-t border-primary/25 py-7"><h3 className="font-serif text-xl text-primary">{language === "ja" ? "見落としやすい内面" : "An inner blind spot"}</h3><p className="mt-3 text-base leading-8 text-foreground">{data.caution}</p></article>}
            {!experienceOnly && <section aria-label={torisetsuTranslations[language].manual} className="border-t border-primary/25 py-7"><h3 className="font-serif text-xl text-primary">{torisetsuTranslations[language].manualTitle}</h3><div className="mt-4 space-y-5">{[data.manualCore, data.manualDecision, data.manualTiming].map((body, i) => <article key={i}><h4 className="font-serif text-lg text-primary">{t.labels[i + 3]}</h4><p className="mt-2 text-base leading-8 text-foreground">{body}</p></article>)}</div></section>}
            {!experienceOnly && <section aria-label="深層ガイド" className="border-t border-primary/25 py-7"><h3 className="font-serif text-xl text-primary">{language === "ja" ? "占術別 深層ガイド" : "Deep guide by art"}</h3><div className="mt-4 space-y-6">{([
              ["精密数秘術｜繰り返す試練と突破の才能", data.numerologyTrial],
              ["西洋占星術｜建前と本音・心の回復法", data.astroRecovery],
              ["四柱推命｜攻め時と空回りの罠", data.pillarsTiming],
              ["動物占い｜決断の癖とやる気スイッチ", data.animalSwitch],
              ["バースカラー｜日常での取り入れ方", activePlan === "free" ? "" : data.colorPractice],
              [`地球暦｜今のフェーズ${data.helio ? `「${data.helio.phase}」` : ""}`, data.helioGuide],
            ] as const).filter(([, body]) => body).map(([title, body]) => <article key={title}><h4 className="font-serif text-lg text-primary">{title}</h4><p className="mt-2 whitespace-pre-line text-base leading-8 text-foreground">{body}</p></article>)}</div></section>}
        </>}
        </SacredDisclosure>
        <div className="-mx-5 sm:-mx-8"><GrandSummaryCard profile={profile} language={language} plan={activePlan} embedded part="approaches" /></div>
        {palette && <section aria-label="color" className="pb-6 pt-6"><BirthColorGuide profile={profile} plan={activePlan} language={language} /></section>}
        <div className="space-y-1 border-t border-primary/20 py-4 text-xs leading-6 text-muted-foreground"><p>{t.preview}</p><p>{f.nameNote} {e?.zodiacBoundary ? f.boundaryNote : ""} {e?.uncertainYear ? f.yearNote : ""}</p><p>{f.method}</p></div>
      </div>
      <GrandSummaryCard profile={profile} language={language} plan={activePlan} embedded part="summary" />
      <GrandSummaryCard profile={profile} language={language} plan={activePlan} embedded part="share" />
      {upgradeCards.length > 0 && <footer className="border-t border-primary/25 bg-background/40 p-5 sm:p-8">
        <div className="flex items-center gap-3"><Sparkles className="size-5 text-primary" aria-hidden="true" /><div className="min-w-0"><h3 className="font-serif text-lg text-primary sm:text-xl">{p.sectionTitle}</h3><p className="mt-1 text-xs text-muted-foreground">{p.sectionSub}</p></div></div>
        <div className="mt-5 -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0">
          {upgradeCards.map((card) => {
            const Icon = planIcons[card.id];
            const vip = card.id === "vip" || card.id === "b2b-premium";
            return <article key={card.id} className={`flex w-[84%] min-w-[84%] snap-start flex-col rounded-lg border p-4 sm:w-auto sm:min-w-0 sm:p-5 ${vip ? "border-primary/50 bg-gradient-to-b from-primary/20 via-card/80 to-card/70 shadow-champagne" : "border-primary/25 bg-card/60"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] leading-none ${vip ? "bg-champagne-gradient font-medium text-primary-foreground" : "border border-primary/45 text-primary"}`}>{card.badge}</span>
                <Icon className={`size-5 shrink-0 ${vip ? "text-(--gold-glow)" : "text-primary"}`} aria-hidden="true" />
              </div>
              <h4 className="mt-3 break-words font-serif text-base leading-snug text-foreground sm:text-lg">{card.name}</h4>
              <p className="mt-2 break-words text-xs leading-6 text-primary sm:text-[13px]">{card.catch}</p>
              <ul className="mt-4 flex-1 space-y-2.5">
                {card.features.map((feat) => <li key={feat} className="flex items-start gap-2"><Check className={`mt-0.5 size-3.5 shrink-0 ${vip ? "text-(--gold-glow)" : "text-primary"}`} aria-hidden="true" /><span className="min-w-0 break-words text-xs leading-5 text-foreground/90">{feat}</span></li>)}
              </ul>
              <Button type="button" variant={vip ? "default" : "outline"} disabled={currentPlan === card.id} onClick={() => onSelectPlan ? onSelectPlan(card.id) : setDialogPlan(card.id)} className={`mt-4 h-11 w-full whitespace-normal text-xs leading-5 ${vip ? "shadow-champagne" : "border-primary/40 text-primary hover:bg-primary/10"}`}>{currentPlan === card.id ? "利用中" : card.cta}</Button>
            </article>;
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2"><p className="text-xs leading-5 text-muted-foreground">{p.nextStepNote}</p><Button variant="link" className="h-auto p-0 text-xs" onClick={onDiagnosis}>{t.goToArts}<ArrowUpRight className="size-3" /></Button></div>
        <Dialog open={dialogPlan !== null} onOpenChange={(open) => { if (!open) setDialogPlan(null); }}>
          <DialogContent className="max-w-sm rounded-lg border-primary/40 bg-card p-5 text-left sm:p-6">
            {(() => { const card = p.cards.find((c) => c.id === dialogPlan); if (!card) return null;
              return <>
                <DialogTitle className="break-words font-serif text-lg text-gradient-gold">{card.name}</DialogTitle>
                <DialogDescription className="mt-2 break-words text-sm leading-6 text-primary">{card.catch}</DialogDescription>
                <ul className="mt-4 space-y-2.5">
                  {card.features.map((feat) => <li key={feat} className="flex items-start gap-2"><Check className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" /><span className="min-w-0 break-words text-xs leading-5 text-foreground/90">{feat}</span></li>)}
                </ul>
                <p className="mt-4 text-[11px] leading-5 text-muted-foreground">{p.dialogNote}</p>
                <Button variant="outline" className="mt-4 w-full border-primary/40 text-primary hover:bg-primary/10" onClick={() => setDialogPlan(null)}>{p.close}</Button>
              </>; })()}
          </DialogContent>
        </Dialog>
      </footer>}
    </section>
  );
}
