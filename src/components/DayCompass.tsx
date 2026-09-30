import { useMemo, useRef, useState } from "react";
import { BriefcaseBusiness, Compass, Crown, LockKeyhole, Navigation, Sparkles, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Plan } from "@/lib/design-modes";
import { planOrder } from "@/lib/plans";
import { teamCopy } from "@/lib/team-copy";
import type { Language } from "@/lib/translations";
import SolfeggioPlayer from "./SolfeggioPlayer";
import type { UserProfile } from "./Onboarding";
import {
  dateAt, dayOfYear, dayProfile, daysInYear, directionAt, directionEnergy, directions,
  personal, roadmap, zodiacSigns, type Direction, type Phase,
} from "@/lib/day-compass";
import type { Element } from "@/lib/team-analysis";

const ja = {
  hint: "盤面をなぞって回すと、1年365日の日付を指し示します。指の位置で8方位も切り替わります。",
  today: "今日に戻る", selected: "指し示した日", preview: "表示テスト · 参考値（正式な鑑定・課金ではありません）",
  dayTitle: "この日の特性", earthTitle: "地球の1年のなかの現在地", personalTitle: "あなたへの今日の心がけ",
  dirTitle: "吉方位・開運エネルギー", bizTitle: "企業の365日ロードマップ", staffTitle: "従業員サポート", navTitle: "ビジネス吉方位ナビ",
  lockedFor: (p: string) => `${p}以上で開放`, upgrade: "プランを見る", needBirth: "生年月日を登録すると表示されます。",
  energy: "エネルギー", months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
  dirs: { N: "北", NE: "北東", E: "東", SE: "南東", S: "南", SW: "南西", W: "西", NW: "北西" } as Record<Direction, string>,
  el: { wood: "木", fire: "火", earth: "土", metal: "金", water: "水" } as Record<Element, string>,
  elDay: {
    wood: "芽吹きと成長の気が強い日。新しい計画を立て、枝葉を伸ばすのに向いています。",
    fire: "情熱と発信の気が高まる日。人前に出る・想いを伝えることが輝きます。",
    earth: "土台と信頼を固める日。整理・継続・約束を丁寧に守る流れです。",
    metal: "決断と選別の気が澄む日。手放す・仕上げる・ルールを整えるのに向きます。",
    water: "知恵と内省の気が満ちる日。情報収集や学び、静かな対話が実ります。",
  } as Record<Element, string>,
  seasons: ["冬至", "小寒", "大寒", "立春", "雨水", "啓蟄", "春分", "清明", "穀雨", "立夏", "小満", "芒種", "夏至", "小暑", "大暑", "立秋", "処暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪"],
  rel: {
    same: "この日の気はあなたと同じ質。自分のペースを信じ、得意なことに集中すると力が倍増します。",
    support: "この日の気があなたを後押しします。頼みごと・挑戦・人に会う予定を入れると追い風になります。",
    give: "あなたの力が周りへ流れ出る日。サポート役や教える側に回ると感謝が返ってきます。",
    pressure: "少し負荷を感じやすい日。予定を詰め込みすぎず、確認と休息を多めに取りましょう。",
    lead: "あなたが場をリードできる日。迷っている案件は今日のうちに方向を決めると進みます。",
  },
  body: (p: number, e: number, i: number) => `身体 ${p}% · 感情 ${e}% · 知性 ${i}%`,
  bodyTip: (low: string) => `今日いちばん低いのは「${low}」。そこを無理せず補う一日にしてください。`,
  lows: { physical: "身体", emotional: "感情", intellectual: "知性" },
  actions: {
    desk: (d: string) => `デスクや作業の向きを「${d}」にして、大事な作業をする`,
    move: (d: string) => `「${d}」方面へ散歩・外出・カフェ移動をして気を取り込む`,
    intuition: (d: string) => `「${d}」を向いて3分間深呼吸し、浮かんだ直感をメモする`,
  },
  phases: { attack: "攻め時", defend: "守り時", newBiz: "新事業", contract: "契約" } as Record<Phase, string>,
  staff: {
    wood: "新しい役割や挑戦の機会を渡し、「期待している」と伝えましょう。",
    fire: "成果を人前で認め、熱量を言葉で返しましょう。過熱には休憩の声かけを。",
    earth: "1on1で近況を丁寧に聞き、安心感と役割の明確さを届けましょう。",
    metal: "判断基準をはっきり示し、やり切った仕事を具体的に評価しましょう。",
    water: "急がせず、考える時間と情報を渡しましょう。静かな対話が信頼を深めます。",
  } as Record<Element, string>,
  lowTeam: "チーム全体の波が低めの日です。叱責は避け、負荷調整と労いを優先してください。",
  highTeam: "チームの波が高い日です。目標共有や難しい相談を持ちかけるのに適しています。",
  nav: { deal: "重要な商談", trip: "出張・移動", seat: "リーダーの席の向き" },
};
type Copy = typeof ja;
const en: Copy = {
  ...ja,
  hint: "Trace and rotate the dial to point at any of the 365 days. Your finger position also switches the eight directions.",
  today: "Back to today", selected: "Selected day", preview: "Display test · reference values (not a verified reading or paid access)",
  dayTitle: "Character of the day", earthTitle: "Where you are in Earth's year", personalTitle: "Your personal focus",
  dirTitle: "Lucky direction energy", bizTitle: "365-day company roadmap", staffTitle: "Team support", navTitle: "Business direction guide",
  lockedFor: (p: string) => `Unlocks with ${p}+`, upgrade: "View plans", needBirth: "Add your birth date to see this.",
  energy: "Energy", months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  dirs: { N: "N", NE: "NE", E: "E", SE: "SE", S: "S", SW: "SW", W: "W", NW: "NW" },
  el: { wood: "Wood", fire: "Fire", earth: "Earth", metal: "Metal", water: "Water" },
  elDay: {
    wood: "Growth energy is strong. Good for planning and expanding.",
    fire: "Passion and expression rise. Speak up and be seen.",
    earth: "A day to build trust and foundations. Keep promises carefully.",
    metal: "Clear, decisive energy. Finish, let go and set rules.",
    water: "Wisdom and reflection. Learning and quiet talks bear fruit.",
  },
  seasons: ja.seasons,
  rel: {
    same: "The day matches your nature. Trust your pace and focus on your strengths.",
    support: "The day supports you. Ask, try, and meet people.",
    give: "Your energy flows to others. Helping and teaching pays back.",
    pressure: "A slightly heavier day. Don't overbook; check twice and rest.",
    lead: "You can lead today. Decide the direction of pending matters.",
  },
  body: (p, e, i) => `Body ${p}% · Emotion ${e}% · Mind ${i}%`,
  bodyTip: (low) => `Your lowest today is "${low}". Go easy there.`,
  lows: { physical: "Body", emotional: "Emotion", intellectual: "Mind" },
  actions: {
    desk: (d) => `Face your desk ${d} for important work`,
    move: (d) => `Take a walk or work trip toward the ${d}`,
    intuition: (d) => `Face ${d}, breathe for 3 minutes and note your intuition`,
  },
  phases: { attack: "Push", defend: "Protect", newBiz: "New ventures", contract: "Contracts" },
  staff: {
    wood: "Offer new roles or challenges and say you believe in them.",
    fire: "Praise results publicly; suggest breaks if things overheat.",
    earth: "Listen carefully in 1on1s and clarify roles.",
    metal: "Share clear criteria and praise finished work specifically.",
    water: "Don't rush them; give time and information.",
  },
  lowTeam: "Team energy is low. Avoid criticism; reduce load and show appreciation.",
  highTeam: "Team energy is high. Good for sharing goals or hard conversations.",
  nav: { deal: "Key negotiation", trip: "Business trip", seat: "Leader's seat facing" },
};

const polar = (deg: number, r: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r };
};
const rank = (p: Plan) => planOrder.indexOf(p);

type Props = { profile: UserProfile; language: Language; plan: Plan; onUpgrade: () => void };

export default function DayCompass({ profile, language, plan, onUpgrade }: Props) {
  const c = language === "ja" ? ja : en;
  const names = teamCopy[language].planNames;
  const now = useMemo(() => new Date(), []);
  const year = now.getFullYear();
  const total = daysInYear(year);
  const todayIdx = dayOfYear(now);
  const [angle, setAngle] = useState(0);
  const [heading, setHeading] = useState<Direction>("N");
  const start = useRef<{ pointer: number; angle: number } | null>(null);
  const wheel = useRef<HTMLDivElement>(null);

  const offset = Math.round((angle / 360) * total);
  const idx = (((todayIdx + offset) % total) + total) % total;
  const date = dateAt(year, idx);
  const day = dayProfile(date);
  const localDeg = (d: number) => -((d - todayIdx) * 360) / total; // rotor-local angle of a day

  const screenDeg = (x: number, y: number) => {
    const r = wheel.current?.getBoundingClientRect();
    if (!r) return 0;
    return (Math.atan2(y - (r.top + r.height / 2), x - (r.left + r.width / 2)) * 180) / Math.PI + 90;
  };
  const birth = profile.birthDate;
  const me = birth ? personal(birth, date) : null;
  const energy = useMemo(() => directionEnergy(birth, date), [birth, day.iso]);
  const best = [...energy].sort((a, b) => b.score - a.score)[0]!;
  const current = energy.find((e) => e.dir === heading)!;
  const map = useMemo(() => (birth ? roadmap(birth, year) : null), [birth, year]);
  const fmt = new Intl.DateTimeFormat(language, { month: "long", day: "numeric", weekday: "short" });

  const Lock = ({ min, children }: { min: Plan; children: React.ReactNode }) =>
    rank(plan) >= rank(min) ? <>{children}</> : (
      <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-primary/25 bg-background/40 p-5 text-center">
        <LockKeyhole className="size-5 text-primary" />
        <p className="text-xs text-muted-foreground">{c.lockedFor(names[min])}</p>
        <Button size="sm" variant="outline" onClick={onUpgrade} className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary">
          <Crown className="size-3.5" />{c.upgrade}
        </Button>
      </div>
    );

  const Card = ({ icon: Icon, title, tier, children }: { icon: typeof Compass; title: string; tier: Plan; children: React.ReactNode }) => (
    <section className="design-daily-panel card-lux rounded-lg p-5 text-left">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-serif text-base text-foreground"><Icon className="size-4 text-primary" />{title}</h3>
        <span className="rounded-full border border-primary/25 px-2 py-0.5 text-[10px] text-primary">{names[tier]}+</span>
      </div>
      {children}
    </section>
  );

  return (
    <div id="day-compass" className="scroll-mt-4">
      {rank(plan) >= rank("vip") && <SolfeggioPlayer language={language} compact />}
      <div
        ref={wheel}
        className="compass-wheel relative mx-auto mt-3 aspect-square w-full max-w-[430px] touch-none select-none"
        role="slider" tabIndex={0} aria-label={c.hint}
        aria-valuemin={1} aria-valuemax={total} aria-valuenow={idx + 1} aria-valuetext={fmt.format(date)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            const step = e.key === "ArrowRight" ? 1 : -1;
            if (e.shiftKey) setHeading(directions[(directions.indexOf(heading) + step + 8) % 8]!);
            else setAngle((a) => a + (step * 360) / total);
          }
        }}
        onPointerDown={(e) => {
          const p = screenDeg(e.clientX, e.clientY);
          start.current = { pointer: p, angle };
          setHeading(directionAt(p));
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!start.current) return;
          const p = screenDeg(e.clientX, e.clientY);
          let delta = p - start.current.pointer;
          if (delta > 180) delta -= 360;
          if (delta < -180) delta += 360;
          start.current = { pointer: p, angle: start.current.angle + delta };
          setAngle(start.current.angle);
          setHeading(directionAt(p));
        }}
        onPointerUp={() => { start.current = null; }}
        onPointerCancel={() => { start.current = null; }}
      >
        <div className="compass-halo absolute inset-[3%] rounded-full" />
        {/* fixed needle */}
        <div className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 text-primary drop-shadow-[0_0_8px_var(--primary)]">▼</div>
        {/* fixed 8-direction ring with heading highlight */}
        <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 z-10 size-full">
          {directions.map((d, i) => {
            const p = polar(i * 45, 49);
            const on = d === heading;
            return (
              <text key={d} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={on ? 3.6 : 2.6}
                className={on ? "fill-primary font-bold" : "fill-muted-foreground"}>{c.dirs[d]}</text>
            );
          })}
          <path d={(() => { const a = polar(directions.indexOf(heading) * 45 - 16, 46); const b = polar(directions.indexOf(heading) * 45 + 16, 46); return `M ${a.x} ${a.y} A 46 46 0 0 1 ${b.x} ${b.y}`; })()}
            className="stroke-primary" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        </svg>
        <div className="compass-rotor absolute inset-[6%] rounded-full" style={{ transform: `rotate(${angle}deg)` }}>
          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible">
            <defs>
              <radialGradient id="monument" cx="40%" cy="35%" r="70%">
                <stop offset="0%" stopColor="var(--gold-glow)" />
                <stop offset="55%" stopColor="var(--primary)" />
                <stop offset="100%" stopColor="color-mix(in oklab, var(--primary) 35%, var(--background))" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="49" className="stroke-primary/50" fill="none" strokeWidth="0.4" />
            <circle cx="50" cy="50" r="38" className="stroke-primary/25" fill="none" strokeWidth="0.3" />
            <circle cx="50" cy="50" r="30" className="stroke-primary/35" fill="none" strokeWidth="0.3" strokeDasharray="0.6 1.2" />
            {/* day ticks */}
            {Array.from({ length: total }, (_, d) => {
              const first = dateAt(year, d).getDate() === 1;
              const a = polar(localDeg(d), 49), b = polar(localDeg(d), first ? 44.5 : 47.6);
              return <line key={d} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={first ? "stroke-primary" : "stroke-primary/30"} strokeWidth={first ? 0.45 : 0.15} />;
            })}
            {/* months */}
            {c.months.map((m, i) => {
              const d = dayOfYear(new Date(year, i, 15));
              const p = polar(localDeg(d), 41.5);
              return <text key={m} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="2.8" className="fill-foreground/80 font-serif" transform={`rotate(${localDeg(d)} ${p.x} ${p.y})`}>{m}</text>;
            })}
            {/* zodiac monuments */}
            {zodiacSigns.map((s, i) => {
              const deg = localDeg(dayOfYear(new Date(year, s.m - 1, s.d)) + 15);
              const p = polar(deg, 33.5);
              const on = i === day.sign;
              return (
                <g key={s.glyph} transform={`rotate(${deg} ${p.x} ${p.y})`}>
                  <path d={`M ${p.x - 3.4} ${p.y + 3.6} L ${p.x - 2.6} ${p.y - 2.2} Q ${p.x} ${p.y - 5.4} ${p.x + 2.6} ${p.y - 2.2} L ${p.x + 3.4} ${p.y + 3.6} Z`}
                    fill="url(#monument)" opacity={on ? 1 : 0.55} className={on ? "zodiac-monument-on" : undefined} />
                  <rect x={p.x - 4} y={p.y + 3.4} width="8" height="1" rx="0.3" fill="url(#monument)" opacity={on ? 1 : 0.5} />
                  <text x={p.x} y={p.y + 0.6} textAnchor="middle" dominantBaseline="middle" fontSize="3.4" className="fill-background font-serif">{s.glyph}</text>
                  {on && [0, 1, 2, 3, 4].map((k) => { const q = polar(k * 72, 1); return <circle key={k} cx={p.x + (q.x - 50) * 5.5} cy={p.y + (q.y - 50) * 5.5} r="0.35" className="fill-primary zodiac-spark" style={{ animationDelay: `${k * 0.3}s` }} />; })}
                </g>
              );
            })}
          </svg>
        </div>
        <div className="compass-center pointer-events-none absolute inset-[31%] z-10 flex flex-col items-center justify-center rounded-full border border-primary/40 text-center shadow-champagne">
          <span className="text-[10px] text-primary/80">{c.selected}</span>
          <strong className="font-serif text-xl text-gradient-gold sm:text-2xl">{fmt.format(date)}</strong>
          <span className="mt-1 text-[10px] text-muted-foreground">{c.el[day.element]} · {c.seasons[day.season]}</span>
          <span className="text-[10px] text-primary">{c.dirs[heading]} {current.score}</span>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{c.hint}</p>
      {offset !== 0 && (
        <Button size="sm" variant="ghost" className="mt-1 text-primary hover:bg-primary/10 hover:text-primary" onClick={() => setAngle(0)}>{c.today}</Button>
      )}
      <p className="mt-1 text-[10px] text-muted-foreground/80">{c.preview}</p>

      <div className="mx-auto mt-6 grid max-w-4xl gap-4 md:grid-cols-2">
        <Card icon={Sparkles} title={c.dayTitle} tier="free">
          <p className="text-sm leading-7 text-foreground">{c.elDay[day.element]}</p>
          <p className="mt-4 text-xs text-primary/80">{c.earthTitle}</p>
          <div className="mt-2 flex items-center gap-4">
            <svg viewBox="0 0 60 60" className="size-20 shrink-0">
              <circle cx="30" cy="30" r="24" className="stroke-primary/25" fill="none" strokeWidth="1" />
              <circle cx="30" cy="30" r="24" className="stroke-primary" fill="none" strokeWidth="2" strokeDasharray={`${day.yearProgress * 150.8} 150.8`} transform="rotate(-90 30 30)" strokeLinecap="round" />
              <circle cx="30" cy="30" r="5" className="fill-primary/80" />
              {(() => { const p = polar(day.yearProgress * 360, 24); return <circle cx={(p.x - 50) * 1 + 30} cy={(p.y - 50) * 1 + 30} r="2.6" className="fill-gold-glow" />; })()}
            </svg>
            <div className="text-xs leading-6 text-muted-foreground">
              <p><strong className="text-lg text-primary">{day.doy + 1}</strong> / {day.total}</p>
              <p>{c.seasons[day.season]} · {Math.round(day.yearProgress * 100)}%</p>
            </div>
          </div>
        </Card>

        <Card icon={Compass} title={c.personalTitle} tier="standard">
          <Lock min="standard">
            {me ? (
              <div className="text-sm leading-7">
                <p className="text-foreground">{c.rel[me.rel]}</p>
                <p className="mt-3 text-xs text-primary">{c.body(Math.round((me.physical + 1) * 50), Math.round((me.emotional + 1) * 50), Math.round((me.intellectual + 1) * 50))}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.bodyTip(c.lows[(["physical", "emotional", "intellectual"] as const).reduce((a, b) => (me[a] <= me[b] ? a : b))])}
                </p>
              </div>
            ) : <p className="text-xs text-muted-foreground">{c.needBirth}</p>}
          </Lock>
        </Card>

        <Card icon={Navigation} title={c.dirTitle} tier="vip">
          <Lock min="vip">
            <div className="grid grid-cols-4 gap-1.5">
              {energy.map((e) => (
                <button key={e.dir} type="button" onClick={() => setHeading(e.dir)}
                  className={`rounded-md border px-1 py-2 text-center text-[11px] transition ${e.dir === heading ? "border-primary bg-primary/15 text-primary" : "border-primary/15 text-muted-foreground hover:border-primary/40"}`}>
                  <span className="block font-semibold">{c.dirs[e.dir]}{e.dir === best.dir ? " ★" : ""}</span>
                  <span className="block">{e.score}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-foreground">{c.dirs[heading]} · {c.el[current.element]} · {c.energy} {current.score}</p>
            <ul className="mt-2 space-y-1.5 text-xs leading-6 text-muted-foreground">
              <li>🪑 {c.actions.desk(c.dirs[heading])}</li>
              <li>🚶 {c.actions.move(c.dirs[heading])}</li>
              <li>✨ {c.actions.intuition(c.dirs[heading])}</li>
            </ul>
          </Lock>
        </Card>

        <Card icon={UsersRound} title={c.staffTitle} tier="b2b">
          <Lock min="b2b">
            <p className="text-sm leading-7 text-foreground">{c.staff[day.element]}</p>
            {me && <p className="mt-2 text-xs text-muted-foreground">{me.total < 45 ? c.lowTeam : me.total > 60 ? c.highTeam : ""}</p>}
            <p className="mt-4 text-xs text-primary/80">{c.navTitle}</p>
            <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
              {(["deal", "trip", "seat"] as const).map((k, i) => {
                const pick = [...energy].sort((a, b) => b.score - a.score)[i]!;
                return <li key={k}>{c.nav[k]}: <strong className="text-primary">{c.dirs[pick.dir]}</strong> ({pick.score})</li>;
              })}
            </ul>
          </Lock>
        </Card>

        <div className="md:col-span-2">
          <Card icon={BriefcaseBusiness} title={c.bizTitle} tier="b2b">
            <Lock min="b2b">
              {map ? (
                <div className="overflow-x-auto">
                  <div className="min-w-[520px] text-[10px]">
                    <div className="grid grid-cols-[72px_repeat(12,1fr)] gap-0.5 text-muted-foreground">
                      <span />
                      {c.months.map((m, i) => <span key={m} className={`text-center ${i === date.getMonth() ? "text-primary font-bold" : ""}`}>{m}</span>)}
                    </div>
                    {(Object.keys(c.phases) as Phase[]).map((ph) => (
                      <div key={ph} className="mt-1 grid grid-cols-[72px_repeat(12,1fr)] items-center gap-0.5">
                        <span className="text-foreground">{c.phases[ph]}</span>
                        {c.months.map((m, i) => (
                          <span key={m} className={`h-4 rounded-sm ${map[ph].includes(i) ? (ph === "defend" ? "bg-muted-foreground/50" : "bg-champagne-gradient") : "bg-primary/5"} ${i === date.getMonth() ? "ring-1 ring-primary" : ""}`} />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : <p className="text-xs text-muted-foreground">{c.needBirth}</p>}
            </Lock>
          </Card>
        </div>
      </div>
    </div>
  );
}
