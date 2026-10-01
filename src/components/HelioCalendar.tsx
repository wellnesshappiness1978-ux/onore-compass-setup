import * as A from "astronomy-engine";
import { useMemo } from "react";
import { CalendarDays, Download, ExternalLink, Orbit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dayProfile, directionEnergy, localIso, personal } from "@/lib/day-compass";
import type { UserProfile } from "./Onboarding";

const bodies: [string, A.Body, number][] = [
  ["水星", A.Body.Mercury, 14], ["金星", A.Body.Venus, 21], ["地球", A.Body.Earth, 30],
  ["火星", A.Body.Mars, 38], ["木星", A.Body.Jupiter, 46], ["土星", A.Body.Saturn, 54],
];
function escapeIcs(value: string) { return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (m) => `\\${m}`); }

export default function HelioCalendar({ date, profile }: { date: Date; profile: UserProfile }) {
  const iso = localIso(date);
  const positions = useMemo(() => bodies.map(([name, body, radius]) => {
    const v = A.HelioVector(body, new Date(`${iso}T03:00:00Z`)); // local noon in Japan
    const theta = Math.atan2(v.y, v.x);
    return { name, radius, x: 60 + radius * Math.cos(theta), y: 60 - radius * Math.sin(theta) };
  }), [iso]);
  const rhythm = personal(profile.birthDate, date);
  const best = [...directionEnergy(profile.birthDate, date)].sort((a, b) => b.score - a.score)[0];
  const label = rhythm.total >= 60 ? "予定を整える日（参考）" : "ペースを見直す日（参考）";
  const description = `オノレコンパスの参考指標。地球暦の天体位置は天文計算、日取りと方位は独自の参考値です。吉日・契約の成功を保証しません。方位: ${best?.dir ?? "—"}`;
  const start = iso.replaceAll("-", "");
  const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  const end = localIso(endDate).replaceAll("-", "");
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(label)}&dates=${start}/${end}&details=${encodeURIComponent(description)}`;
  const download = () => {
    const content = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Onore Compass//Reference Calendar//JA", "BEGIN:VEVENT", `UID:${start}-${profile.birthDate.replaceAll("-", "")}@onore-compass`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`, `DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${end}`, `SUMMARY:${escapeIcs(label)}`, `DESCRIPTION:${escapeIcs(description)}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n") + "\r\n";
    const url = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `onore-${iso}.ics`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <section aria-label="高精度 地球暦カレンダー" className="mt-7 border-y border-primary/30 py-7 text-left">
    <div className="flex items-center gap-3"><Orbit className="size-6 text-primary" /><h3 className="font-serif text-xl text-primary">地球暦 · Helio Compass</h3></div>
    <p className="mt-2 text-sm leading-7 text-muted-foreground">{iso} 日本時間12時の太陽中心の天体位置。軌道の半径は見やすさのため模式化しています。</p>
    <svg role="img" aria-label={`${iso}の太陽・水星・金星・地球・火星・木星・土星の位置`} viewBox="0 0 120 120" className="mx-auto mt-4 aspect-square w-full max-w-[480px]">
      {bodies.map(([, , r]) => <circle key={r} cx="60" cy="60" r={r} fill="none" className="stroke-primary/25" strokeWidth=".3" />)}
      <circle cx="60" cy="60" r="4" className="fill-primary" /><text x="60" y="69" textAnchor="middle" fontSize="3" className="fill-primary">太陽</text>
      {positions.map((p) => <g key={p.name}><circle cx={p.x} cy={p.y} r={p.name === "地球" ? 2.7 : 1.8} className={p.name === "地球" ? "fill-gold-glow" : "fill-foreground"} /><text x={p.x} y={p.y - 3.5} textAnchor="middle" fontSize="2.8" className="fill-foreground">{p.name}</text></g>)}
    </svg>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-primary/20 pt-5"><div><p className="text-base text-foreground">{dayProfile(date).season + 1} / 24 節気区間 · {label}</p><p className="text-sm text-muted-foreground">日取りは個人の参考リズムから表示。契約吉日の正式鑑定ではありません。</p></div>
      <div className="flex flex-wrap gap-2"><Button variant="outline" asChild><a href={google} target="_blank" rel="noopener noreferrer"><CalendarDays className="size-4" />Google カレンダー<ExternalLink className="size-3" /></a></Button><Button variant="outline" onClick={download}><Download className="size-4" />iOS / .ics</Button></div>
    </div>
    <p className="mt-3 text-xs text-muted-foreground">予定は選択した1日分を確認して登録します。自動同期や書き込み権限はありません。</p>
  </section>;
}