import * as A from "astronomy-engine";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, Crown, Download, ExternalLink, LockKeyhole, Orbit } from "lucide-react";
import { helioPhase } from "@/lib/ai/helio-phase";
import { biorhythm, type TeamMember } from "@/lib/team-analysis";
import { canUse, minPlanFor, type ContentFeature } from "@/lib/plans";
import type { Plan } from "@/lib/design-modes";
import { supabase } from "@/integrations/supabase/client";
import { listTeamMembers } from "@/lib/team-members.functions";
import { usePlan } from "./PlanProvider";
import { fengDirectionNames } from "@/lib/feng-shui";
import { Button } from "@/components/ui/button";
import { dayProfile, directionEnergy, localIso, personal } from "@/lib/day-compass";
import type { UserProfile } from "./Onboarding";

const bodies: [string, A.Body, number][] = [
  ["水星", A.Body.Mercury, 14], ["金星", A.Body.Venus, 21], ["地球", A.Body.Earth, 30],
  ["火星", A.Body.Mars, 38], ["木星", A.Body.Jupiter, 46], ["土星", A.Body.Saturn, 54],
];
function escapeIcs(value: string) { return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (m) => `\\${m}`); }

const planName: Record<Plan, string> = { free: "無料", standard: "有料", vip: "VIP", b2b: "ビジネス", "b2b-premium": "ビジネスプレミアム" };
const phaseText = { 種まき: "新しく始める準備の時期。小さな試しを増やすと流れに乗りやすい目安です。", 育成: "続けて育てる時期。習慣と関係づくりに力を注ぐ目安です。", 収穫: "形にして届ける時期。発表・提案・仕上げに向く目安です。", 休息: "整えて手放す時期。振り返りと休養を優先する目安です。" } as const;
const bizKinds: [string, [number, number, number]][] = [["契約", [0.2, 0.2, 0.6]], ["重要な商談", [0.3, 0.4, 0.3]], ["新プロジェクト立ち上げ", [0.5, 0.2, 0.3]], ["大型投資の判断", [0.1, 0.3, 0.6]]];
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const weighted = (birth: string, iso: string, w: [number, number, number]) => { const r = biorhythm(birth, iso); return ((r.physical * w[0] + r.emotional * w[1] + r.intellectual * w[2]) + 1) * 50; };

type DayMark = "high" | "turn" | "low";
function yearlyMarks(values: number[]): Map<number, DayMark> {
  const marks = new Map<number, DayMark>();
  // Pick local extrema and changes of slope, spaced apart to avoid crowded repeats.
  const candidates: { index: number; kind: DayMark; score: number }[] = [];
  for (let i = 1; i < values.length - 1; i++) {
    const before = values[i - 1] ?? 50, now = values[i] ?? 50, after = values[i + 1] ?? 50;
    if (now >= 70 && now >= before && now >= after) candidates.push({ index: i, kind: "high", score: now });
    else if (now <= 30 && now <= before && now <= after) candidates.push({ index: i, kind: "low", score: 100 - now });
    else if ((before < 50 && now >= 50) || (before > 50 && now <= 50)) candidates.push({ index: i, kind: "turn", score: 55 + Math.abs(after - before) });
  }
  for (const kind of ["high", "low", "turn"] as const) {
    for (const c of candidates.filter(x => x.kind === kind).sort((a, b) => b.score - a.score)) {
      if ([...marks.keys()].some(index => Math.abs(index - c.index) < 5)) continue;
      marks.set(c.index, c.kind);
    }
  }
  return marks;
}
const markLabel: Record<DayMark, string> = { high: "高い日", turn: "切替点", low: "低い日" };

function Gate({ plan, feature, onUpgrade, children }: { plan: Plan; feature: ContentFeature; onUpgrade?: (() => void) | undefined; children: React.ReactNode }) {
  if (canUse(plan, feature)) return <>{children}</>;
  return <div className="mt-5 flex flex-col items-center gap-2 border border-dashed border-primary/30 p-5 text-center"><LockKeyhole className="size-5 text-primary" /><p className="text-sm text-foreground">{planName[minPlanFor(feature)]}プラン以上で開放</p>{onUpgrade && <Button size="sm" variant="outline" onClick={onUpgrade}><Crown className="size-3.5" />プランを見る</Button>}</div>;
}

export default function HelioCalendar({ date, profile, plan, onUpgrade }: { date: Date; profile: UserProfile; plan: Plan; onUpgrade?: () => void }) {
  const iso = localIso(date);
  const { enabled: testMode } = usePlan();
  const [eventIso, setEventIso] = useState(iso);
  useEffect(() => setEventIso(iso), [iso]);
  const positions = useMemo(() => bodies.map(([name, body, radius]) => {
    const v = A.HelioVector(body, new Date(`${iso}T03:00:00Z`)); // local noon in Japan
    const theta = Math.atan2(v.y, v.x);
    return { name, radius, x: 60 + radius * Math.cos(theta), y: 60 - radius * Math.sin(theta) };
  }), [iso]);
  const selectedDate = new Date(`${eventIso}T12:00:00`);
  const rhythm = personal(profile.birthDate, selectedDate);
  const best = [...directionEnergy(profile.birthDate, selectedDate)].sort((a, b) => b.score - a.score)[0];
  const label = rhythm.total >= 60 ? "予定を整える日（参考）" : "ペースを見直す日（参考）";
  const description = `アゴルメンの羅針盤の参考指標。地球暦の天体位置は天文計算、日取りと方位は独自の参考値です。吉日・契約の成功を保証しません。方位: ${best?.dir ?? "—"}`;
  const start = eventIso.replaceAll("-", "");
  const eventDate = new Date(`${eventIso}T12:00:00`);
  const endDate = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate() + 1);
  const end = localIso(endDate).replaceAll("-", "");
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(label)}&dates=${start}/${end}&details=${encodeURIComponent(description)}`;
  const download = () => {
    const content = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Onore Compass//Reference Calendar//JA", "BEGIN:VEVENT", `UID:${start}-${profile.birthDate.replaceAll("-", "")}@onore-compass`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`, `DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${end}`, `SUMMARY:${escapeIcs(label)}`, `DESCRIPTION:${escapeIcs(description)}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n") + "\r\n";
    const url = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `agolmen-${eventIso}.ics`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const phase = helioPhase(profile.birthDate, date);
  const year = date.getFullYear();
  const yearDays = Math.round((new Date(year + 1, 0, 1).getTime() - new Date(year, 0, 1).getTime()) / 86400000);
  const curve = useMemo(() => profile.birthDate ? Array.from({ length: yearDays }, (_, i) => biorhythm(profile.birthDate, localIso(new Date(year, 0, 1 + i))).total) : [], [profile.birthDate, year, yearDays]);
  const marks = useMemo(() => yearlyMarks(curve), [curve]);
  const calendarMonths = useMemo(() => Array.from({ length: 12 }, (_, month) => {
    const offset = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return { month, offset, days: Array.from({ length: days }, (_, i) => ({ day: i + 1, index: Math.round((new Date(year, month, i + 1).getTime() - new Date(year, 0, 1).getTime()) / 86400000), iso: localIso(new Date(year, month, i + 1)) })) };
  }), [year]);
  const selectedValue = biorhythm(profile.birthDate, eventIso);
  const selectedIndex = Math.round((new Date(`${eventIso}T12:00:00`).getTime() - new Date(year, 0, 1, 12).getTime()) / 86400000);
  const selectedMark = eventIso.startsWith(`${year}-`) ? marks.get(selectedIndex) : undefined;
  const rhythmNote = selectedValue.total >= 65 ? "3つの参考周期の平均が高め。予定を入れるなら準備と確認を同じ日に分けて組めます。" : selectedValue.total <= 35 ? "3つの参考周期の平均が低め。予定は余白を残し、重要な判断は資料の確認時間を先に確保できます。" : "3つの参考周期の平均は中間。予定の間に振り返りの時間を置く組み方ができます。";
  const dirs = useMemo(() => [...directionEnergy(profile.birthDate, date)].sort((a, b) => b.score - a.score), [profile.birthDate, iso]);
  const biz = canUse(plan, "helioBusiness");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const list = useServerFn(listTeamMembers);
  useEffect(() => {
    let active = true;
    if (!biz) { setMembers([]); return; }
    const local = () => { try { const values = JSON.parse(localStorage.getItem("onore-team") ?? "[]"); if (active) setMembers(Array.isArray(values) ? values : []); } catch { if (active) setMembers([]); } };
    if (testMode) { local(); return () => { active = false; }; }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) list().then(values => { if (active) setMembers(values); }).catch(() => { if (active) setMembers([]); });
      else local();
    });
    return () => { active = false; };
  }, [biz, list, testMode]);
  const births = [profile.birthDate, ...members.map(m => m.birthDate)].filter(b => /^\d{4}-\d{2}-\d{2}$/.test(b));
  const gantt = useMemo(() => biz ? bizKinds.map(([name, w]) => ({ name, months: Array.from({ length: 12 }, (_, m) => { const days = new Date(year, m + 1, 0).getDate(); let sum = 0; for (let d = 1; d <= days; d++) { const di = localIso(new Date(year, m, d)); sum += births.reduce((a, b) => a + weighted(b, di, w), 0) / births.length; } return Math.round(sum / days); }) })) : [], [biz, births.join(), year]);
  const bestDays = useMemo(() => biz ? bizKinds.map(([name, w]) => ({ name, days: Array.from({ length: 90 }, (_, i) => { const d = addDays(date, i); const di = localIso(d); return { di, v: births.reduce((a, b) => a + weighted(b, di, w), 0) / births.length }; }).sort((a, b) => b.v - a.v).slice(0, 3).map(x => x.di).sort() })) : [], [biz, births.join(), iso]);
  const weeks = useMemo(() => biz ? Array.from({ length: 6 }, (_, w) => { const start = addDays(date, w * 7); let sum = 0; for (let i = 0; i < 7; i++) { const di = localIso(addDays(start, i)); sum += births.reduce((a, b) => a + biorhythm(b, di).total, 0) / births.length; } return { start: localIso(start), v: Math.round(sum / 7) }; }) : [], [biz, births.join(), iso]);
  return <section aria-label="高精度 地球暦カレンダー" className="mt-7 border-y border-primary/30 py-7 text-left">
    <div className="flex items-center gap-3"><Orbit className="size-6 text-primary" /><h3 className="font-serif text-xl text-primary">地球暦 · Helio Compass</h3></div>
    <p className="mt-2 text-sm leading-7 text-muted-foreground">{iso} 日本時間12時の太陽中心の天体位置。軌道の半径は見やすさのため模式化しています。</p>
    <svg role="img" aria-label={`${iso}の太陽・水星・金星・地球・火星・木星・土星の位置`} viewBox="0 0 120 120" className="mx-auto mt-4 aspect-square w-full max-w-[480px]">
      {bodies.map(([, , r]) => <circle key={r} cx="60" cy="60" r={r} fill="none" className="stroke-primary/25" strokeWidth=".3" />)}
      <circle cx="60" cy="60" r="4" className="fill-primary" /><text x="60" y="69" textAnchor="middle" fontSize="3" className="fill-primary">太陽</text>
      {positions.map((p) => <g key={p.name}><circle cx={p.x} cy={p.y} r={p.name === "地球" ? 2.7 : 1.8} className={p.name === "地球" ? "fill-gold-glow" : "fill-foreground"} /><text x={p.x} y={p.y - 3.5} textAnchor="middle" fontSize="2.8" className="fill-foreground">{p.name}</text></g>)}
    </svg>
    {phase && <div className="border-t border-primary/20 pt-5"><p className="text-sm text-muted-foreground">誕生日から地球が進んだ角度 {phase.degrees}°</p><p className="mt-1 font-serif text-lg text-primary">今は「{phase.phase}」のフェーズ</p><p className="mt-1 text-base leading-8 text-foreground">{phaseText[phase.phase]}</p></div>}
    <h4 className="mt-6 font-serif text-lg text-primary">365日の個人バイオリズム</h4>
    <Gate plan={plan} feature="helioPersonal" onUpgrade={onUpgrade}>
      <p className="mt-2 text-sm text-muted-foreground">{year}年 · 実日付による参考周期（体23日・心28日・知33日の平均）。高い日・切替点・低い日を選ぶと内訳が開きます。</p>
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2" aria-label={`${year}年の日付カレンダー`}>
        {calendarMonths.map(({ month, offset, days }) => <section key={month} className="min-w-0 border-t border-primary/30 pt-3" aria-label={`${month + 1}月`}>
          <h5 className="font-serif text-base text-primary">{year}年 {month + 1}月</h5>
          <div className="mt-2 grid grid-cols-7 gap-0.5 text-center text-[10px] text-muted-foreground">{["日", "月", "火", "水", "木", "金", "土"].map(d => <span key={d}>{d}</span>)}</div>
          <div className="mt-1 grid grid-cols-7 gap-0.5">{Array.from({ length: offset }, (_, i) => <span key={`empty-${i}`} className="aspect-square" />)}{days.map(d => {
            const kind = marks.get(d.index); const current = d.iso === eventIso;
            return <Button key={d.iso} type="button" size="icon" variant="ghost" title={`${d.iso} · ${curve[d.index] ?? 50} / 100${kind ? ` · ${markLabel[kind]}` : ""}`} aria-label={`${d.iso} ${kind ? markLabel[kind] : "参考値"} ${curve[d.index] ?? 50}`} aria-pressed={current} onClick={() => setEventIso(d.iso)} className={`aspect-square size-auto min-h-8 min-w-0 rounded-sm p-0 text-xs ${current ? "ring-2 ring-primary" : ""} ${kind === "high" ? "bg-primary text-primary-foreground" : kind === "low" ? "border border-destructive/60 text-destructive" : kind === "turn" ? "border border-primary/50 text-primary" : "text-muted-foreground"}`}>{d.day}</Button>;
          })}</div>
        </section>)}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">■ 高い日　▣ 切替点　□ 低い日 · 日付ごとの値は未来の出来事を予測しません。</p>
      <div role="status" className="mt-4 border-l-2 border-primary bg-primary/5 px-4 py-3"><h5 className="font-serif text-base text-primary">{eventIso} · {selectedMark ? markLabel[selectedMark] : "参考周期"} · {selectedValue.total}/100</h5><p className="mt-1 text-sm text-foreground">体 {Math.round((selectedValue.physical + 1) * 50)} · 心 {Math.round((selectedValue.emotional + 1) * 50)} · 知 {Math.round((selectedValue.intellectual + 1) * 50)}</p><p className="mt-2 text-sm leading-7 text-muted-foreground">{rhythmNote} 体調や実際の出来事を診断する値ではありません。</p></div>
      <label className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">予定の日付<input aria-label="カレンダーに登録する日付" type="date" value={eventIso} onChange={e => { if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) setEventIso(e.target.value); }} className="rounded-md border border-primary/30 bg-background px-3 py-2 text-foreground" /></label>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-base text-foreground">{eventIso} · {label}</p>
        <div className="flex flex-wrap gap-2"><Button variant="outline" asChild><a href={google} target="_blank" rel="noopener noreferrer"><CalendarDays className="size-4" />Google カレンダー<ExternalLink className="size-3" /></a></Button><Button variant="outline" onClick={download}><Download className="size-4" />iOS / .ics</Button></div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">選んだ1日分を確認してから登録します。自動同期ではありません。</p>
    </Gate>
    <h4 className="mt-6 font-serif text-lg text-primary">8方位リアルタイム吉方位ナビ</h4>
    <Gate plan={plan} feature="helioDirections" onUpgrade={onUpgrade}>
      <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{dirs.map((d, i) => <li key={d.dir} className={`border p-3 text-center ${i === 0 ? "border-primary bg-primary/10" : "border-primary/20"}`}><p className="font-serif text-lg text-primary">{fengDirectionNames[d.dir]}</p><p className="text-sm text-foreground">{d.score}</p></li>)}</ol>
      <p className="mt-2 text-sm text-muted-foreground">今日のバイオリズムと方位の参考値。VIP曼陀羅アートは同じ出生時の天体配置から描かれます（アートタブ）。</p>
    </Gate>
    <h4 className="mt-6 font-serif text-lg text-primary">企業の365日経営バイオリズム</h4>
    <Gate plan={plan} feature="helioBusiness" onUpgrade={onUpgrade}>
      <p className="mt-2 text-sm text-muted-foreground">あなた{members.length ? `＋登録メンバー${members.length}名` : ""}のリズムを重ねた参考値。成功を保証するものではありません。</p>
      <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[560px] border-collapse text-xs"><thead><tr><th className="p-1 text-left text-primary">{year}年</th>{Array.from({ length: 12 }, (_, m) => <th key={m} className="p-1 text-primary">{m + 1}月</th>)}</tr></thead><tbody>{gantt.map(g => <tr key={g.name}><th scope="row" className="whitespace-nowrap p-1 text-left font-normal text-foreground">{g.name}</th>{g.months.map((v, m) => <td key={m} className="p-0.5"><div title={`${v}`} className={`h-5 rounded-sm ${v >= 55 ? "bg-primary" : v >= 48 ? "bg-primary/40" : "bg-muted"}`} /></td>)}</tr>)}</tbody></table></div>
      <p className="mt-1 text-xs text-muted-foreground">濃い色＝追い風の月、薄い＝通常、灰色＝慎重に進める月。</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{bestDays.map(b => <div key={b.name} className="border border-primary/25 p-3"><p className="text-sm text-primary">{b.name}の候補日（90日以内・参考）</p><div className="mt-2 flex flex-wrap gap-2">{b.days.map(di => <Button key={di} size="sm" variant={eventIso === di ? "default" : "outline"} onClick={() => setEventIso(di)} aria-pressed={eventIso === di}>{di}</Button>)}</div></div>)}</div>
      <h5 className="mt-5 font-serif text-base text-primary">組織の好調期・注意期アラート（6週間）</h5>
      <ul className="mt-2 space-y-2">{weeks.map(w => <li key={w.start} className="border-l-2 border-primary/50 pl-3 text-sm leading-7 text-foreground"><span className="text-primary">{w.start}〜 {w.v >= 55 ? "好調期" : w.v <= 45 ? "注意期" : "平常期"}</span>：{w.v >= 55 ? "提案・発表・採用面接など前に出る予定をこの週に寄せる。決裁は週前半に。" : w.v <= 45 ? "大型の決裁は先送りし、ダブルチェックを1段増やす。会議は短く、1on1で負担を聞く。" : "既存案件の進行と準備に集中。翌週の好調期に向けて資料を仕上げる。"}</li>)}</ul>
      {!members.length && <p className="mt-2 text-xs text-muted-foreground">チームタブでメンバーを登録すると、全員の波を重ねて表示します。</p>}
    </Gate>
  </section>;
}