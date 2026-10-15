import { useMemo, useRef, useState } from "react";
import { BriefcaseBusiness, Compass, Crown, Moon, LockKeyhole, Navigation, Sparkles, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Plan } from "@/lib/design-modes";
import { planOrder } from "@/lib/plans";
import { teamCopy } from "@/lib/team-copy";
import type { Language } from "@/lib/translations";
import HelioCalendar from "./HelioCalendar";
import FengShuiGuide from "./FengShuiGuide";
import type { UserProfile } from "./Onboarding";
import {
  dateAt, dayOfYear, dayProfile, daysInYear, directionAt, directionEnergy, directions,
  personal, roadmap, zodiacSigns, type Direction, type Phase,
} from "@/lib/day-compass";
import type { Element } from "@/lib/team-analysis";
import ShareCardButton from "./ShareCardButton";
import { birthColorSpectrum } from "@/lib/birth-color-spectrum";
import { companionCopy } from "@/lib/companion-copy";
import { rokuyo } from "@/lib/calendar-traditions";
import HelioAlmanacStrip from "./HelioAlmanacStrip";
import { almanacYear } from "@/lib/helio-almanac";
import { almanacUi, gloss } from "@/lib/almanac-i18n";

const ja = {
  hint: "盤面をなぞって前後100年の日付を巡れます。指の位置で8方位も切り替わります。",
  today: "今日に戻る", selected: "指し示した日", preview: "表示テスト · 参考値（正式な鑑定・課金ではありません）",
  dayTitle: "この日の特性", earthTitle: "地球の1年のなかの現在地", personalTitle: "あなたへの今日の心がけ",
  dirTitle: "吉方位・開運エネルギー", bizTitle: "ファミリーの365日ロードマップ", staffTitle: "ファミリーサポート", navTitle: "ファミリー吉方位ナビ",
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
  dateSearch: "日付を検索", previousYear: "前年", nextYear: "翌年", rokuyo: "六曜",
};
type Copy = typeof ja;
const en: Copy = {
  ...ja,
  hint: "Trace and rotate the dial to point at any of the 365 days. Your finger position also switches the eight directions.",
  today: "Back to today", selected: "Selected day", preview: "Display test · reference values (not a verified reading or paid access)",
  dayTitle: "Character of the day", earthTitle: "Where you are in Earth's year", personalTitle: "Your personal focus",
  dirTitle: "Lucky direction energy", bizTitle: "365-day family roadmap", staffTitle: "Team support", navTitle: "Family direction guide",
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
  nav: { deal: "Key negotiation", trip: "Family trip", seat: "Leader's seat facing" },
  dateSearch: "Find a date", previousYear: "Previous year", nextYear: "Next year", rokuyo: "Rokuyo",
};
const translatedCopy: Record<Language, Copy> = {
  ja, en,
  "zh-CN": { ...en, hint: "转动圆盘，可查看前后100年中的任意日期；触碰位置也会切换八个方位。", today: "返回今天", selected: "所选日期", preview: "显示测试 · 参考值（并非正式鉴定或付费权限）", dayTitle: "这一天的特质", earthTitle: "地球一年中的当前位置", personalTitle: "今天给你的提醒", dirTitle: "吉方位能量", bizTitle: "家庭365日路线图", staffTitle: "团队支持", navTitle: "家庭方位指南", lockedFor: p => `${p}以上开放`, upgrade: "查看方案", needBirth: "填写生日后即可显示。", energy: "能量", dirs: { N: "北", NE: "东北", E: "东", SE: "东南", S: "南", SW: "西南", W: "西", NW: "西北" }, dateSearch: "查找日期", previousYear: "上一年", nextYear: "下一年", rokuyo: "六曜" },
  "zh-TW": { ...en, hint: "轉動圓盤，可查看前後100年中的任意日期；觸碰位置也會切換八個方位。", today: "返回今天", selected: "所選日期", preview: "顯示測試 · 參考值（並非正式鑑定或付費權限）", dayTitle: "這一天的特質", earthTitle: "地球一年中的目前位置", personalTitle: "今天給你的提醒", dirTitle: "吉方位能量", bizTitle: "家庭365日路線圖", staffTitle: "團隊支援", navTitle: "家庭方位指南", lockedFor: p => `${p}以上開放`, upgrade: "查看方案", needBirth: "填寫生日後即可顯示。", energy: "能量", dirs: { N: "北", NE: "東北", E: "東", SE: "東南", S: "南", SW: "西南", W: "西", NW: "西北" }, dateSearch: "查找日期", previousYear: "上一年", nextYear: "下一年", rokuyo: "六曜" },
  ko: { ...en, hint: "다이얼을 돌려 앞뒤 100년의 날짜를 살펴보세요. 손가락 위치에 따라 여덟 방위도 바뀝니다.", today: "오늘로 돌아가기", selected: "선택한 날짜", preview: "표시 테스트 · 참고값(정식 감정이나 유료 권한이 아님)", dayTitle: "이날의 특성", earthTitle: "지구의 한 해 속 현재 위치", personalTitle: "오늘의 마음가짐", dirTitle: "길방위 에너지", bizTitle: "패밀리 365일 로드맵", staffTitle: "팀 지원", navTitle: "패밀리 방위 가이드", lockedFor: p => `${p} 이상에서 이용`, upgrade: "플랜 보기", needBirth: "생년월일을 입력하면 표시됩니다.", energy: "에너지", dirs: { N: "북", NE: "북동", E: "동", SE: "남동", S: "남", SW: "남서", W: "서", NW: "북서" }, dateSearch: "날짜 찾기", previousYear: "이전 해", nextYear: "다음 해", rokuyo: "육요" },
  es: { ...en, hint: "Gira el dial para recorrer fechas de cien años antes o después. La posición también cambia las ocho direcciones.", today: "Volver a hoy", selected: "Fecha elegida", preview: "Prueba visual · valores orientativos (no es una lectura ni acceso de pago)", dayTitle: "Carácter del día", earthTitle: "Tu posición en el año terrestre", personalTitle: "Tu enfoque de hoy", dirTitle: "Energía de la dirección favorable", bizTitle: "Plan familiar de 365 días", staffTitle: "Apoyo al equipo", navTitle: "Guía de dirección familiar", lockedFor: p => `Disponible con ${p} o superior`, upgrade: "Ver planes", needBirth: "Añade tu fecha de nacimiento para verlo.", energy: "Energía", dirs: { N: "N", NE: "NE", E: "E", SE: "SE", S: "S", SW: "SO", W: "O", NW: "NO" }, dateSearch: "Buscar fecha", previousYear: "Año anterior", nextYear: "Año siguiente", rokuyo: "Rokuyō" },
  fr: { ...en, hint: "Tournez le cadran pour parcourir les dates sur cent ans avant ou après. La position change aussi les huit directions.", today: "Revenir à aujourd’hui", selected: "Date choisie", preview: "Test d’affichage · valeurs indicatives (ni consultation ni accès payant)", dayTitle: "Caractère du jour", earthTitle: "Votre position dans l’année terrestre", personalTitle: "Votre repère du jour", dirTitle: "Énergie de la direction favorable", bizTitle: "Feuille de route annuelle de la famille", staffTitle: "Soutien de l’équipe", navTitle: "Guide des directions familiales", lockedFor: p => `Accessible avec ${p} ou plus`, upgrade: "Voir les offres", needBirth: "Ajoutez votre date de naissance pour l’afficher.", energy: "Énergie", dirs: { N: "N", NE: "NE", E: "E", SE: "SE", S: "S", SW: "SO", W: "O", NW: "NO" }, dateSearch: "Chercher une date", previousYear: "Année précédente", nextYear: "Année suivante", rokuyo: "Rokuyō" },
};

const polar = (deg: number, r: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r };
};
const rank = (p: Plan) => planOrder.indexOf(p);

type Props = { profile: UserProfile; language: Language; plan: Plan; onUpgrade: () => void; dialOnly?: boolean; rangeDays?: number; afterDial?: import("react").ReactNode };

export default function DayCompass({ profile, language, plan, onUpgrade, dialOnly = false, rangeDays = Infinity, afterDial }: Props) {
  const c = { ...translatedCopy[language], elDay: companionCopy[language].day, rel: companionCopy[language].relation, bodyTip: companionCopy[language].rhythm };
  const names = teamCopy[language].planNames;
  const now = useMemo(() => new Date(), []);
  const minDate = useMemo(() => Number.isFinite(rangeDays) ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - rangeDays) : new Date(now.getFullYear() - 100, 0, 1), [now, rangeDays]);
  const maxDate = useMemo(() => Number.isFinite(rangeDays) ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + rangeDays) : new Date(now.getFullYear() + 100, 11, 31), [now, rangeDays]);
  const [selectedDate, setSelectedDate] = useState(() => new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  const year = selectedDate.getFullYear();
  const total = daysInYear(year);
  const [angle, setAngle] = useState(0);
  const [heading, setHeading] = useState<Direction>("N");
  const start = useRef<{ pointer: number; angle: number } | null>(null);
  const wheel = useRef<HTMLDivElement>(null);

  const selectedIdx = dayOfYear(selectedDate);
  const rawOffset = Math.round((angle / 360) * total);
  const dayMs = 864e5;
  const lo = Math.round((minDate.getTime() - selectedDate.getTime()) / dayMs), hi = Math.round((maxDate.getTime() - selectedDate.getTime()) / dayMs);
  const offset = Math.min(hi, Math.max(lo, rawOffset));
  const idx = (((selectedIdx + offset) % total) + total) % total;
  const date = dateAt(year, idx);
  const day = dayProfile(date);
  const localDeg = (d: number) => -((d - selectedIdx) * 360) / total; // rotor-local angle of a day
  const sixDay = rokuyo(date);
  const clamp = (next: Date) => next < minDate ? minDate : next > maxDate ? maxDate : next;
  const choose = (next: Date) => { const safe = clamp(next); setSelectedDate(safe); setAngle(0); };

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
  const shareColor = birthColorSpectrum(profile)?.main;
  const almanac = useMemo(() => dialOnly ? almanacYear(year) : [], [dialOnly, year]);
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
    <section className="design-daily-panel card-lux min-w-0 w-full max-w-full rounded-lg p-3 text-left md:p-5">
      <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 md:mb-4">
        <h3 className="flex min-w-0 items-start gap-2 font-serif text-base text-foreground"><Icon className="mt-1 size-4 shrink-0 text-primary" /><span className="min-w-0 break-words">{title}</span></h3>
        {rank(plan) < rank(tier) && <span className="max-w-24 shrink-0 rounded-md border border-primary/25 px-2 py-0.5 text-[10px] text-primary">{names[tier]}+</span>}
      </div>
      {children}
    </section>
  );

  return (
    <div id="day-compass" className="box-border min-w-0 w-full max-w-full scroll-mt-4">
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
            else choose(new Date(date.getFullYear(), date.getMonth(), date.getDate() + step));
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
        onPointerUp={() => { if (offset) choose(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + offset)); start.current = null; }}
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
            {/* almanac rings: solar terms, lunar month starts, moon quarters, apsides */}
            {dialOnly && almanac.map((a, d) => {
              const deg = localDeg(d);
              const out: React.ReactNode[] = [];
              if (a.term) { const p = polar(deg, 39.2), q = polar(deg, 37.6); const major = ["春分", "夏至", "秋分", "冬至"].includes(a.term);
                out.push(<line key="tl" x1={q.x} y1={q.y} x2={polar(deg, 38.2).x} y2={polar(deg, 38.2).y} className="stroke-primary" strokeWidth={major ? 0.5 : 0.25} />);
                out.push(<text key="t" x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={major ? 2.5 : 1.95} className={major ? "fill-primary font-serif font-bold" : "fill-primary/75 font-serif"} transform={`rotate(${deg} ${p.x} ${p.y})`}><title>{gloss(a.term, language)}</title>{a.term}</text>); }
              if (a.quarter) { const p = polar(deg, 43.4); const full = a.quarter === "満月", fresh = a.quarter === "新月";
                out.push(<circle key="m" cx={p.x} cy={p.y} r="0.85" className={full ? "fill-gold-glow" : fresh ? "fill-background stroke-primary/70" : "fill-primary/50"} strokeWidth="0.22"><title>{gloss(a.quarter, language)}</title></circle>); }
              if (a.lunarDay === 1) { const p = polar(deg, 36.2); out.push(<text key="l" x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="1.8" className="fill-foreground/80 font-serif" transform={`rotate(${deg} ${p.x} ${p.y})`}><title>{gloss(a.lunarMonthName, language)}</title>{a.lunarMonthName}</text>); }
              if (a.apsis) { const p = polar(deg, 46); out.push(<text key="a" x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="2.2" className="fill-primary font-bold"><title>{gloss(a.apsis, language)}</title>{a.apsis === "遠日点" ? "遠" : "近"}</text>); }
              return out.length ? <g key={`al-${d}`}>{out}</g> : null;
            })}
            {dialOnly && <circle cx="50" cy="50" r="37.3" className="stroke-primary/20" fill="none" strokeWidth="0.2" />}
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
          {sixDay && <span className="text-[10px] text-primary">{c.rokuyo} · {sixDay.name}</span>}
          <span className="text-[10px] text-primary">{c.dirs[heading]} {current.score}</span>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{c.hint}</p>
      <div className="mx-auto mt-4 flex max-w-md flex-wrap items-center justify-center gap-2">
        <Button type="button" size="icon" variant="outline" aria-label={c.previousYear} disabled={year <= minDate.getFullYear()} onClick={() => choose(new Date(year - 1, date.getMonth(), date.getDate()))}>−</Button>
        <label className="text-xs text-muted-foreground"><span className="sr-only">{c.dateSearch}</span><input type="date" aria-label={c.dateSearch} min={`${minDate.getFullYear()}-01-01`} max={`${maxDate.getFullYear()}-12-31`} value={day.iso} onChange={(event) => { if (event.target.value) choose(new Date(`${event.target.value}T12:00:00`)); }} className="h-9 rounded-md border border-input bg-background px-3 text-foreground" /></label>
        <Button type="button" size="icon" variant="outline" aria-label={c.nextYear} disabled={year >= maxDate.getFullYear()} onClick={() => choose(new Date(year + 1, date.getMonth(), date.getDate()))}>＋</Button>
      </div>
      {(day.iso !== dayProfile(now).iso || offset !== 0) && (
        <Button size="sm" variant="ghost" className="mt-1 text-primary hover:bg-primary/10 hover:text-primary" onClick={() => choose(now)}>{c.today}</Button>
      )}
      <p className="mt-1 text-[10px] text-muted-foreground/80">{c.preview}</p>
      {dialOnly && <HelioAlmanacStrip date={date} language={language} onPick={choose} minDate={minDate} maxDate={maxDate} />}
      {afterDial}
      <div className="daily-card-grid mx-auto mt-4 grid min-w-0 w-full max-w-4xl grid-cols-[minmax(0,1fr)] gap-3 md:mt-6 md:grid-cols-[repeat(2,minmax(0,1fr))] md:gap-4">
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
            <div className="min-w-0 text-xs leading-6 text-muted-foreground">
              <p><strong className="text-lg text-primary">{day.doy + 1}</strong> / {day.total}</p>
              <p>{c.seasons[day.season]} · {Math.round(day.yearProgress * 100)}%</p>
            </div>
          </div>
        </Card>

        {dialOnly && (() => {
          const age = (((date.getTime() - Date.UTC(2000, 0, 6, 18, 14)) / 86400000) % 29.530589 + 29.530589) % 29.530589;
          const ja = language === "ja";
          const u = almanacUi[language];
          const moon = u.moons[age < 1.8 ? 0 : age < 7.4 ? 1 : age < 9.2 ? 2 : age < 14 ? 3 : age < 16 ? 4 : age < 22 ? 5 : age < 23.8 ? 6 : 7];
          const active = map ? (Object.keys(c.phases) as Phase[]).filter((ph) => map[ph].includes(date.getMonth())) : [];
          return <Card icon={Moon} title={u.phase} tier="free">
            <p className="text-sm leading-7 text-foreground">{u.moonCycle}：<strong className="text-primary">{moon}</strong>（{u.age} {age.toFixed(1)}）</p>
            <p className="mt-1 text-sm leading-7 text-foreground">{u.season}：<strong className="text-primary">{c.seasons[day.season]}</strong> · {Math.round(day.yearProgress * 100)}%</p>
            <p className="mt-1 text-sm leading-7 text-foreground">{u.myPhase}：{map ? (active.length ? active.map((ph) => <strong key={ph} className="mr-2 text-primary">{c.phases[ph]}</strong>) : <strong className="text-primary">{u.steady}</strong>) : <span className="text-muted-foreground">{c.needBirth}</span>}</p>
            <p className="mt-2 text-[10px] text-muted-foreground">{u.phaseNote}</p>
          </Card>;
        })()}

        {!dialOnly && <>
        {rank(plan) >= rank("standard") && <Card icon={Compass} title={c.personalTitle} tier="standard">
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
        </Card>}

        {rank(plan) >= rank("standard") && me && <div className="md:col-span-2"><ShareCardButton language={language} autoOpen={false} label={language === "ja" ? "バイオリズムグラフをシェア" : "Share biorhythm"} data={{ kicker: c.personalTitle, title: fmt.format(date), score: Math.round(me.total), names: profile.nameKanji ? [profile.nameKanji] : [], lines: [c.body(Math.round((me.physical + 1) * 50), Math.round((me.emotional + 1) * 50), Math.round((me.intellectual + 1) * 50)), c.rel[me.rel]], kind: "biorhythm", palette: shareColor ? [{ label: language === "ja" ? "守護バースカラー" : "Guardian color", code: shareColor.code }] : [] }} /></div>}

        {rank(plan) >= rank("vip") && <Card icon={Navigation} title={c.dirTitle} tier="vip">
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
        </Card>}

        {rank(plan) >= rank("b2b") && <Card icon={UsersRound} title={c.staffTitle} tier="b2b">
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
        </Card>}

        {rank(plan) >= rank("b2b") && <div className="min-w-0 md:col-span-2">
          <Card icon={BriefcaseBusiness} title={c.bizTitle} tier="b2b">
            <Lock min="b2b">
              {map ? (
                <div className="max-w-full overflow-x-auto">
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
        </div>}
        </>}
      </div>
      {!dialOnly && <HelioCalendar date={date} profile={profile} plan={plan} language={language} onUpgrade={onUpgrade} />}
      {!dialOnly && rank(plan) < rank("b2b") && <section className="mx-auto mt-7 max-w-4xl border-t border-primary/25 pt-6 text-left" aria-label={language === "ja" ? "未開放の占い" : "Locked guidance"}>
        <h3 className="mb-4 font-serif text-lg text-primary">{language === "ja" ? "未開放の占い" : "More guidance"}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {rank(plan) < rank("standard") && <Card icon={Compass} title={c.personalTitle} tier="standard"><Lock min="standard"><span /></Lock></Card>}
          {rank(plan) < rank("vip") && <Card icon={Navigation} title={c.dirTitle} tier="vip"><Lock min="vip"><span /></Lock></Card>}
          {rank(plan) < rank("b2b") && <Card icon={UsersRound} title={c.staffTitle} tier="b2b"><Lock min="b2b"><span /></Lock></Card>}
          {rank(plan) < rank("b2b") && <Card icon={BriefcaseBusiness} title={c.bizTitle} tier="b2b"><Lock min="b2b"><span /></Lock></Card>}
        </div>
      </section>}
      {!dialOnly && <FengShuiGuide profile={profile} date={date} language={language} />}
    </div>
  );
}
