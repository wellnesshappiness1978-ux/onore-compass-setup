import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, Compass, Dna, Fingerprint, Heart, Orbit, Sparkles, Users, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateHomeReading } from "@/lib/ai/home-reading.functions";
import { fiveElementsCopy } from "@/lib/five-elements-copy";
import { homeReadingCopy } from "@/lib/home-reading-copy";
import type { Language } from "@/lib/translations";
import type { UserProfile } from "./Onboarding";
import { useState } from "react";
import { splittableName } from "@/lib/ai/five-elements";

const nameCopy: Record<Language, { title: string; grids: [string, string, string, string, string]; fortune: string; split: string; save: string; note: string }> = {
  ja: { title: "本格 姓名判断（五運と人生の軸）", grids: ["天格（家系運）", "人格（主運・内面）", "地格（基礎運）", "外格（対人・環境運）", "総格（総合・晩年運）"], fortune: "名前が示す社会的な強みと引き寄せる運命", split: "姓と名の区切りを選ぶと五運を算出して保存します", save: "この区切りで保存", note: "現代字体の画数・霊数を外格のみに加える方式・一般的な81数の吉凶表に基づく参考値です。流派により異なります。" },
  en: { title: "Name reading (five grids)", grids: ["Heaven (family)", "Person (core)", "Earth (foundation)", "Outer (social)", "Total (overall)"], fortune: "Social strengths your name suggests", split: "Choose where your surname ends to calculate and save the five grids", save: "Save this split", note: "Reference values using modern stroke counts and a common 81-number table; schools differ." },
  "zh-CN": { title: "姓名五格", grids: ["天格", "人格", "地格", "外格", "总格"], fortune: "姓名显示的社会优势", split: "选择姓与名的分界以计算并保存五格", save: "按此保存", note: "基于现代笔画与常见81数吉凶表的参考值，流派不同结果可能不同。" },
  "zh-TW": { title: "姓名五格", grids: ["天格", "人格", "地格", "外格", "總格"], fortune: "姓名顯示的社會優勢", split: "選擇姓與名的分界以計算並儲存五格", save: "依此儲存", note: "基於現代筆畫與常見81數吉凶表的參考值，流派不同結果可能不同。" },
  ko: { title: "성명 오격", grids: ["천격", "인격", "지격", "외격", "총격"], fortune: "이름이 보여주는 사회적 강점", split: "성과 이름의 경계를 선택하면 오격을 계산해 저장합니다", save: "이대로 저장", note: "현대 획수와 일반적인 81수 길흉표에 따른 참고값이며 유파마다 다릅니다." },
  es: { title: "Lectura del nombre (cinco cuadros)", grids: ["Cielo", "Persona", "Tierra", "Exterior", "Total"], fortune: "Fortalezas sociales que sugiere tu nombre", split: "Elige dónde termina tu apellido para calcular y guardar", save: "Guardar", note: "Valores de referencia con trazos modernos y una tabla común de 81 números." },
  fr: { title: "Lecture du nom (cinq cadres)", grids: ["Ciel", "Personne", "Terre", "Extérieur", "Total"], fortune: "Forces sociales suggérées par votre nom", split: "Choisissez la fin du nom de famille pour calculer et enregistrer", save: "Enregistrer", note: "Valeurs de référence avec traits modernes et une table courante de 81 nombres." },
};

export default function SelfCoreCard({ profile, language, onDiagnosis, onConsult, onArt, onTeam, onProfileChange }: { onProfileChange?: (p: UserProfile) => Promise<void>; profile: UserProfile; language: Language; onDiagnosis: () => void; onConsult: () => void; onArt: () => void; onTeam: () => void }) {
  const t = homeReadingCopy[language];
  const f = fiveElementsCopy[language];
  const generate = useServerFn(generateHomeReading);
  const n = nameCopy[language];
  const chars = splittableName(profile.nameKanji);
  const [cut, setCut] = useState(chars && chars.length >= 3 ? 2 : 1);
  const [saving, setSaving] = useState(false);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["home-reading-five-v3", profile, language],
    queryFn: () => generate({ data: { profile, language } }),
    staleTime: Infinity,
    retry: false,
  });
  const e = data?.elements;
  const values = e ? [e.name ? `${e.name.sky} · ${e.name.person} · ${e.name.earth} · ${e.name.outer} · ${e.name.total}` : null, e.zodiac, e.eto, e.blood, e.animal] : [];
  const sections = data ? [data.synthesis, data.name, data.mind, data.instinct, data.strength] : [];
  const icons = [Dna, Fingerprint, Orbit, Heart, Sparkles];

  return (
    <section aria-label={t.title} className="min-w-0 overflow-hidden rounded-lg border border-primary/35 bg-card/75 shadow-champagne backdrop-blur-md">
      <header className="flex items-start gap-3 border-b border-primary/20 bg-primary/5 p-5 sm:p-8">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary/10 text-primary"><Compass className="size-5" aria-hidden="true" /></div>
        <div className="min-w-0"><p className="text-[10px] uppercase text-primary/75">ONORE COMPASS · {t.openToAll}</p><h2 className="mt-2 break-words font-serif text-xl leading-snug text-gradient-gold sm:text-2xl">{t.title}</h2></div>
      </header>
      <div className="px-5 sm:px-8">
        {isPending ? <div role="status" className="flex min-h-40 items-center gap-3 text-sm text-muted-foreground"><Sparkles className="size-5 animate-pulse text-primary" />{t.loading}</div> : isError || !data ? (
          <div className="flex min-h-40 flex-col items-start justify-center gap-3" role="alert"><p className="text-sm text-muted-foreground">{t.error}</p><Button variant="outline" onClick={() => void refetch()}>{t.retry}</Button></div>
        ) : <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-b border-primary/20 py-6 sm:grid-cols-5 sm:gap-5">
            {f.axes.map((label, i) => <div key={label} className="min-w-0 border-l border-primary/35 pl-3"><p className="text-xs text-primary">{label}</p><p className="mt-2 break-words font-serif text-sm leading-6 text-foreground">{values[i] ?? f.missing}</p></div>)}
          </div>
          <section aria-label={n.title} className="my-6 rounded-lg border border-primary/40 bg-primary/5 p-4 sm:p-6">
            <h3 className="font-serif text-lg text-gradient-gold sm:text-xl">{n.title}</h3>
            {e?.name ? <>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {(["sky", "person", "earth", "outer", "total"] as const).map((k, i) => { const l = e.name!.luck[k]; return <div key={k} className="rounded-md border border-primary/25 bg-background/40 p-3 text-center">
                  <p className="text-[11px] leading-4 text-muted-foreground">{n.grids[i]}</p>
                  <p className="mt-1 font-serif text-2xl text-primary">{e.name![k]}<span className="text-xs">画</span></p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] ${l === "吉" ? "bg-primary text-primary-foreground" : l === "半吉" ? "border border-primary/50 text-primary" : "border border-muted-foreground/40 text-muted-foreground"}`}>{l}</span>
                </div>; })}
              </div>
              {data.nameFortune && <><h4 className="mt-5 font-serif text-sm text-primary">{n.fortune}</h4><p className="mt-2 whitespace-pre-line text-sm leading-8 text-foreground sm:text-base">{data.nameFortune}</p></>}
              <p className="mt-3 text-[11px] leading-5 text-muted-foreground">{n.note}</p>
            </> : chars && onProfileChange ? <div className="mt-3">
              <p className="text-sm text-muted-foreground">{n.split}</p>
              <div className="mt-3 flex flex-wrap gap-2">{chars.slice(0, -1).map((_, i) => <Button key={i} size="sm" variant={cut === i + 1 ? "default" : "outline"} onClick={() => setCut(i + 1)}>{chars.slice(0, i + 1).join("")}　{chars.slice(i + 1).join("")}</Button>)}</div>
              <Button className="mt-3" disabled={saving} onClick={async () => { setSaving(true); try { await onProfileChange({ ...profile, nameKanji: `${chars.slice(0, cut).join("")} ${chars.slice(cut).join("")}` }); } finally { setSaving(false); } }}>{n.save}</Button>
            </div> : <p className="mt-3 text-sm text-muted-foreground">{f.nameNote}</p>}
          </section>
          {sections.map((text, i) => {
            const Icon = icons[i] ?? Sparkles;
            return <article key={i} className="border-b border-primary/20 py-7 last:border-b-0 sm:py-9">
              <div className="flex items-start gap-3"><span className="pt-0.5 font-serif text-xs text-primary/70">0{i + 1}</span><Icon className="size-5 shrink-0 text-primary" aria-hidden="true" /><h3 className="min-w-0 break-words font-serif text-lg leading-snug text-primary sm:text-xl">{f.sections[i]}</h3></div>
              <p className={`mt-5 max-w-3xl whitespace-pre-line break-words text-foreground ${i === 0 ? "font-serif text-[1.0625rem] leading-[2.1] sm:text-xl sm:leading-[2.05]" : "text-sm leading-8 sm:text-base"}`}>{text}</p>
            </article>;
          })}
        </>}
        <div className="space-y-1 border-t border-primary/20 py-4 text-xs leading-6 text-muted-foreground"><p>{t.preview}</p><p>{f.nameNote} {e?.zodiacBoundary ? f.boundaryNote : ""} {e?.uncertainYear ? f.yearNote : ""}</p><p>{f.method}</p></div>
      </div>
      {data && !isError && <footer className="border-t border-primary/25 bg-background/40 p-5 sm:p-8">
        <div className="flex items-center gap-3"><Sparkles className="size-5 text-primary" aria-hidden="true" /><h3 className="font-serif text-lg text-primary sm:text-xl">{t.nextStepTitle}</h3></div>
        <div className="mt-5 grid gap-2.5">
          {([[WandSparkles, t.consultCta, onConsult, t.vipLabel], [Orbit, t.artCta, onArt, t.vipLabel], [Users, t.teamCta, onTeam, t.businessLabel]] as const).map(([Icon, label, action, badge]) => <Button key={label} type="button" variant="outline" onClick={action} className="group h-auto min-h-16 w-full justify-start gap-3 whitespace-normal border-primary/25 bg-card/50 px-4 py-3 text-left text-foreground hover:border-primary/65 hover:bg-primary/10 hover:text-foreground sm:px-5">
            <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" /><span className="min-w-0 flex-1 break-words text-sm leading-6">{label}</span><span className="shrink-0 text-[10px] text-primary">{badge}</span><ArrowUpRight className="size-4 shrink-0 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
          </Button>)}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2"><p className="text-xs leading-5 text-muted-foreground">{t.nextStepNote}</p><Button variant="link" className="h-auto p-0 text-xs" onClick={onDiagnosis}>{t.goToArts}<ArrowUpRight className="size-3" /></Button></div>
      </footer>}
    </section>
  );
}
