import * as A from "astronomy-engine";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, ChevronLeft, ChevronRight, Download, ExternalLink, Orbit } from "lucide-react";
import { helioPhase } from "@/lib/ai/helio-phase";
import { biorhythm, type TeamMember } from "@/lib/team-analysis";
import { canUse, type ContentFeature } from "@/lib/plans";
import type { Plan } from "@/lib/design-modes";
import { supabase } from "@/integrations/supabase/client";
import { listTeamMembers } from "@/lib/team-members.functions";
import { usePlan } from "./PlanProvider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dayProfile, directionEnergy, localIso, personal } from "@/lib/day-compass";
import type { UserProfile } from "./Onboarding";
import type { Language } from "@/lib/translations";
import { helioCopy } from "@/lib/helio-copy";
import { directionLabels } from "@/lib/ui-i18n";

const bodies = [
  ["mercury", A.Body.Mercury, 14], ["venus", A.Body.Venus, 21], ["earth", A.Body.Earth, 30],
  ["mars", A.Body.Mars, 38], ["jupiter", A.Body.Jupiter, 46], ["saturn", A.Body.Saturn, 54],
] as const;
const bizWeights: [number, number, number][] = [
  [0.2, 0.2, 0.6], [0.3, 0.4, 0.3], [0.5, 0.2, 0.3], [0.1, 0.3, 0.6],
];
function escapeIcs(value: string) { return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (m) => `\\${m}`); }

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
function Gate({ plan, feature, children }: { plan: Plan; feature: ContentFeature; onUpgrade?: (() => void) | undefined; children: React.ReactNode }) {
  if (canUse(plan, feature)) return <>{children}</>;
  return null;
}

export default function HelioCalendar({ date, profile, plan, language, onUpgrade, hideDirections = false }: { date: Date; profile: UserProfile; plan: Plan; language: Language; onUpgrade?: () => void; hideDirections?: boolean }) {
  const t = helioCopy[language];
  const markLabel: Record<DayMark, string> = { high: t.high, turn: t.turn, low: t.low };
  const iso = localIso(date);
  const { enabled: testMode } = usePlan();
  const [eventIso, setEventIso] = useState(iso);
  const [calendarView, setCalendarView] = useState<"calendar" | "detail">("calendar");
  const [visibleMonth, setVisibleMonth] = useState(date.getMonth());
  useEffect(() => { setEventIso(iso); setVisibleMonth(date.getMonth()); }, [iso, date]);
  const positions = useMemo(() => bodies.map(([id, body, radius]) => {
    const v = A.HelioVector(body, new Date(`${iso}T03:00:00Z`)); // local noon in Japan
    const theta = Math.atan2(v.y, v.x);
    return { id, radius, x: 60 + radius * Math.cos(theta), y: 60 - radius * Math.sin(theta) };
  }), [iso]);
  const selectedDate = new Date(`${eventIso}T12:00:00`);
  const rhythm = personal(profile.birthDate, selectedDate);
  const best = [...directionEnergy(profile.birthDate, selectedDate)].sort((a, b) => b.score - a.score)[0];
  const label = rhythm.total >= 60 ? t.periods.high : t.periods.low;
  const description = `${t.title}. ${t.healthNotice} ${directionLabels[language][best?.dir ?? "N"]}`;
  const start = eventIso.replaceAll("-", "");
  const eventDate = new Date(`${eventIso}T12:00:00`);
  const endDate = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate() + 1);
  const end = localIso(endDate).replaceAll("-", "");
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(label)}&dates=${start}/${end}&details=${encodeURIComponent(description)}`;
  const download = () => {
    const content = ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:-//Agolmen's Compass//Reference Calendar//${language}`, "BEGIN:VEVENT", `UID:${start}-${profile.birthDate.replaceAll("-", "")}@agolmen-compass`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`, `DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${end}`, `SUMMARY:${escapeIcs(label)}`, `DESCRIPTION:${escapeIcs(description)}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n") + "\r\n";
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
  const rhythmNote = t.selectedNote(selectedValue.total >= 65 ? "high" : selectedValue.total <= 35 ? "low" : "mid");
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
  const gantt = useMemo(() => biz ? bizWeights.map((w, index) => ({ name: t.businessKinds[index] ?? "", months: Array.from({ length: 12 }, (_, m) => { const days = new Date(year, m + 1, 0).getDate(); let sum = 0; for (let d = 1; d <= days; d++) { const di = localIso(new Date(year, m, d)); sum += births.reduce((a, b) => a + weighted(b, di, w), 0) / births.length; } return Math.round(sum / days); }) })) : [], [biz, births.join(), year, t]);
  const bestDays = useMemo(() => biz ? bizWeights.map((w, index) => ({ name: t.businessKinds[index] ?? "", days: Array.from({ length: 90 }, (_, i) => { const d = addDays(date, i); const di = localIso(d); return { di, v: births.reduce((a, b) => a + weighted(b, di, w), 0) / births.length }; }).sort((a, b) => b.v - a.v).slice(0, 3).map(x => x.di).sort() })) : [], [biz, births.join(), iso, t]);
  const weeks = useMemo(() => biz ? Array.from({ length: 6 }, (_, w) => { const start = addDays(date, w * 7); let sum = 0; for (let i = 0; i < 7; i++) { const di = localIso(addDays(start, i)); sum += births.reduce((a, b) => a + biorhythm(b, di).total, 0) / births.length; } return { start: localIso(start), v: Math.round(sum / 7) }; }) : [], [biz, births.join(), iso]);
  return <section aria-label={t.title} className="mt-7 border-y border-primary/30 py-7 text-left">
    <div className="flex items-center gap-3"><Orbit className="size-6 text-primary" /><h3 className="font-serif text-xl text-primary">{t.title}</h3></div>
    <p className="mt-2 text-sm leading-7 text-muted-foreground">{t.position(iso)}</p>
    <svg role="img" aria-label={t.imageLabel(iso)} viewBox="0 0 120 120" className="mx-auto mt-4 aspect-square w-full max-w-[280px]">
      {bodies.map(([, , r]) => <circle key={r} cx="60" cy="60" r={r} fill="none" className="stroke-primary/25" strokeWidth=".3" />)}
      <circle cx="60" cy="60" r="4" className="fill-primary" /><text x="60" y="69" textAnchor="middle" fontSize="3" className="fill-primary">{t.planets.sun}</text>
      {positions.map((p) => <g key={p.id}><circle cx={p.x} cy={p.y} r={p.id === "earth" ? 2.7 : 1.8} className={p.id === "earth" ? "fill-gold-glow" : "fill-foreground"} /><text x={p.x} y={p.y - 3.5} textAnchor="middle" fontSize="2.8" className="fill-foreground">{t.planets[p.id]}</text></g>)}
    </svg>
    {phase && <div className="border-t border-primary/20 pt-5"><p className="text-sm text-muted-foreground">{t.phaseAngle(phase.degrees)}</p><p className="mt-1 font-serif text-lg text-primary">{t.phaseNow(t.phases[phase.phase])}</p><p className="mt-1 text-base leading-8 text-foreground">{t.phaseNotes[phase.phase]}</p></div>}
    <h4 className="mt-6 font-serif text-lg text-primary">{t.personalYear}</h4>
    <Gate plan={plan} feature="helioPersonal" onUpgrade={onUpgrade}>
      <p className="mt-2 text-sm text-muted-foreground">{t.yearIntro(year)}</p>
      <Tabs value={calendarView} onValueChange={(value) => setCalendarView(value as "calendar" | "detail")} className="mt-4">
        <TabsList className="grid h-11 w-full grid-cols-2 border border-primary/20 bg-background/50">
          <TabsTrigger value="calendar">{t.calendar}</TabsTrigger>
          <TabsTrigger value="detail">{t.detail}</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar" className="mt-4">
          <div className="mx-auto max-w-md rounded-md border border-primary/25 bg-background/30 p-3" aria-label={`${year} · ${t.calendar}`}>
            <div className="flex items-center justify-between">
              <Button type="button" size="icon" variant="ghost" aria-label={t.previousMonth} onClick={() => setVisibleMonth(month => (month + 11) % 12)}><ChevronLeft className="size-4" /></Button>
              <h5 className="font-serif text-base text-primary">{new Intl.DateTimeFormat(language, { year: "numeric", month: "long" }).format(new Date(year, visibleMonth, 1))}</h5>
              <Button type="button" size="icon" variant="ghost" aria-label={t.nextMonth} onClick={() => setVisibleMonth(month => (month + 1) % 12)}><ChevronRight className="size-4" /></Button>
            </div>
            {(() => { const month = calendarMonths[visibleMonth]; if (!month) return null; return <>
              <div className="mt-2 grid grid-cols-7 gap-0.5 text-center text-[10px] text-muted-foreground">{t.weekdays.map(d => <span key={d}>{d}</span>)}</div>
              <div className="mt-1 grid grid-cols-7 gap-0.5">{Array.from({ length: month.offset }, (_, i) => <span key={`empty-${i}`} className="aspect-square" />)}{month.days.map(d => {
                const kind = marks.get(d.index); const current = d.iso === eventIso;
                return <Button key={d.iso} type="button" size="icon" variant="ghost" title={`${d.iso} · ${curve[d.index] ?? 50} / 100${kind ? ` · ${markLabel[kind]}` : ""}`} aria-label={`${d.iso} ${kind ? markLabel[kind] : t.reference} ${curve[d.index] ?? 50}`} aria-pressed={current} onClick={() => { setEventIso(d.iso); setCalendarView("detail"); }} className={`aspect-square size-auto min-h-8 min-w-0 rounded-sm p-0 text-xs ${current ? "ring-2 ring-primary" : ""} ${kind === "high" ? "bg-primary text-primary-foreground" : kind === "low" ? "border border-destructive/60 text-destructive" : kind === "turn" ? "border border-primary/50 text-primary" : "text-muted-foreground"}`}>{d.day}</Button>;
              })}</div>
            </>; })()}
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">{t.calendarLegend}</p>
        </TabsContent>
        <TabsContent value="detail" className="mt-4">
          <div role="status" className="border-l-2 border-primary bg-primary/5 px-4 py-4"><h5 className="font-serif text-base text-primary">{eventIso} · {selectedMark ? markLabel[selectedMark] : t.reference} · {selectedValue.total}/100</h5><p className="mt-1 text-sm text-foreground">{t.metrics(Math.round((selectedValue.physical + 1) * 50), Math.round((selectedValue.emotional + 1) * 50), Math.round((selectedValue.intellectual + 1) * 50))}</p><p className="mt-2 text-sm leading-7 text-muted-foreground">{rhythmNote} {t.healthNotice}</p></div>
          <label className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">{t.scheduleDate}<input aria-label={t.addDateLabel} type="date" value={eventIso} onChange={e => { if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) { setEventIso(e.target.value); const next = new Date(`${e.target.value}T12:00:00`); if (next.getFullYear() === year) setVisibleMonth(next.getMonth()); } }} className="rounded-md border border-primary/30 bg-background px-3 py-2 text-foreground" /></label>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-base text-foreground">{eventIso} · {label}</p><div className="flex flex-wrap gap-2"><Button variant="outline" asChild><a href={google} target="_blank" rel="noopener noreferrer"><CalendarDays className="size-4" />{t.googleCalendar}<ExternalLink className="size-3" /></a></Button><Button variant="outline" onClick={download}><Download className="size-4" />iOS / .ics</Button></div></div>
          <p className="mt-2 text-xs text-muted-foreground">{t.manualSync}</p>
        </TabsContent>
      </Tabs>
    </Gate>
    {!hideDirections && <><h4 className="mt-6 font-serif text-lg text-primary">{t.directionTitle}</h4>
    <Gate plan={plan} feature="helioDirections" onUpgrade={onUpgrade}>
      <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{dirs.map((d, i) => <li key={d.dir} className={`border p-3 text-center ${i === 0 ? "border-primary bg-primary/10" : "border-primary/20"}`}><p className="font-serif text-lg text-primary">{directionLabels[language][d.dir]}</p><p className="text-sm text-foreground">{d.score}</p></li>)}</ol>
      <p className="mt-2 text-sm text-muted-foreground">{t.directionNote}</p>
    </Gate></>}
    <h4 className="mt-6 font-serif text-lg text-primary">{t.businessTitle}</h4>
    <Gate plan={plan} feature="helioBusiness" onUpgrade={onUpgrade}>
      <p className="mt-2 text-sm text-muted-foreground">{t.businessIntro(members.length)}</p>
      <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[560px] border-collapse text-xs"><thead><tr><th className="p-1 text-left text-primary">{year}</th>{t.months(year).map((month, index) => <th key={index} className="p-1 text-primary">{month}</th>)}</tr></thead><tbody>{gantt.map(g => <tr key={g.name}><th scope="row" className="whitespace-nowrap p-1 text-left font-normal text-foreground">{g.name}</th>{g.months.map((v, m) => <td key={m} className="p-0.5"><div title={`${v}`} className={`h-5 rounded-sm ${v >= 55 ? "bg-primary" : v >= 48 ? "bg-primary/40" : "bg-muted"}`} /></td>)}</tr>)}</tbody></table></div>
      <p className="mt-1 text-xs text-muted-foreground">{t.chartLegend}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{bestDays.map(b => <div key={b.name} className="border border-primary/25 p-3"><p className="text-sm text-primary">{b.name} {t.candidateDays}</p><div className="mt-2 flex flex-wrap gap-2">{b.days.map(di => <Button key={di} size="sm" variant={eventIso === di ? "default" : "outline"} onClick={() => setEventIso(di)} aria-pressed={eventIso === di}>{di}</Button>)}</div></div>)}</div>
      <h5 className="mt-5 font-serif text-base text-primary">{t.alertTitle}</h5>
      <ul className="mt-2 space-y-2">{weeks.map(w => { const level = w.v >= 55 ? "high" : w.v <= 45 ? "low" : "mid"; return <li key={w.start} className="border-l-2 border-primary/50 pl-3 text-sm leading-7 text-foreground"><span className="text-primary">{w.start} · {t.periods[level]}</span>: {t.periodAdvice[level]}</li>; })}</ul>
      {!members.length && <p className="mt-2 text-xs text-muted-foreground">{t.addMembers}</p>}
    </Gate>
  </section>;
}