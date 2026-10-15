import { useMemo } from "react";
import { almanacDay, SOLAR_TERM_KANA } from "@/lib/helio-almanac";
import type { Language } from "@/lib/translations";

const WD: Record<string, string[]> = { ja: ["日", "月", "火", "水", "木", "金", "土"] };
const label: Record<string, { title: string; note: string; sun: string; earth: string; day: string }> = {
  ja: { title: "地球暦の拡大窓", note: "旧暦・月相・二十四節気・雑節・通し日数・黄経は天文計算による参考値です。", sun: "太陽黄経", earth: "地球", day: "日目" },
  en: { title: "Earth calendar zoom", note: "Lunar dates, moon phases, solar terms and longitudes are calculated reference values.", sun: "Sun longitude", earth: "Earth", day: "day" },
};

export default function HelioAlmanacStrip({ date, language, onPick, minDate, maxDate }: { date: Date; language: Language; onPick: (d: Date) => void; minDate: Date; maxDate: Date }) {
  const t = label[language] ?? label["en"]!;
  const wd = WD[language] ?? new Array(7).fill(0).map((_, i) => new Intl.DateTimeFormat(language, { weekday: "narrow" }).format(new Date(2024, 0, 7 + i)));
  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => { const d = new Date(date.getFullYear(), date.getMonth(), date.getDate() + i - 15); return { d, a: almanacDay(d) }; }), [date.getFullYear(), date.getMonth(), date.getDate()]);
  const sel = days[15]!.a;
  const marks = [sel.term && `${sel.term}（${SOLAR_TERM_KANA[sel.term]}）`, ...sel.zassetsu, sel.apsis, sel.quarter].filter(Boolean).join("・");
  return <section aria-label={t.title} className="mx-auto mt-4 w-full max-w-4xl min-w-0 rounded-md border border-primary/30 bg-background/40 p-3 text-left">
    <h4 className="font-serif text-sm text-primary">{t.title}</h4>
    <div className="mt-2 overflow-x-auto">
      <div className="flex min-w-max items-stretch">
        {days.map(({ d, a }, i) => {
          const out = d < minDate || d > maxDate; const cur = i === 15;
          return <button key={a.iso} type="button" disabled={out} onClick={() => onPick(d)} aria-pressed={cur} aria-label={`${a.iso} ${a.lunarMonthName}${a.lunarDayLabel} ${a.term ?? ""}`}
            className={`flex w-8 shrink-0 flex-col items-center gap-0.5 border-l border-primary/15 py-1 text-[11px] leading-tight ${cur ? "bg-primary/25 ring-1 ring-primary" : ""} ${out ? "opacity-35" : "hover:bg-primary/10"}`}>
            {d.getDate() === 1 && <span className="text-[10px] font-bold text-primary">{d.getMonth() + 1}月</span>}
            <span className="font-serif text-sm text-foreground">{d.getDate()}</span>
            <span className={`${a.weekday === 0 ? "text-destructive" : "text-muted-foreground"}`}>{wd[a.weekday]}</span>
            <span className="text-[10px] text-muted-foreground [writing-mode:vertical-rl]">{a.lunarDay === 1 ? a.lunarMonthName : ""}{a.lunarDayLabel}</span>
            {a.term && <span className="mt-1 font-serif text-xs font-bold text-primary [writing-mode:vertical-rl]">{a.term}</span>}
            {a.zassetsu.map(z => <span key={z} className="text-[10px] text-primary/80 [writing-mode:vertical-rl]">{z}</span>)}
            {a.apsis && <span className="text-[10px] text-primary/80">{a.apsis === "遠日点" ? "遠" : "近"}</span>}
            <span className="mt-auto text-[9px] text-muted-foreground">{String(a.halfDay).padStart(3, "0")}</span>
          </button>;
        })}
      </div>
    </div>
    <p className="mt-2 text-sm leading-7 text-foreground">
      <strong className="text-primary">{sel.iso}</strong>（{wd[sel.weekday]}）・旧暦 {sel.lunarMonthName}{sel.lunarDayLabel}{marks && `・${marks}`}・{sel.half} {sel.halfDay}{t.day}／{sel.halfLength}日間・{t.sun} {sel.sunLon}°（{t.earth} {sel.earthLon}°）
    </p>
    <p className="mt-1 text-[10px] text-muted-foreground">{t.note}</p>
  </section>;
}
