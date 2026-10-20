import { biorhythm, type TeamMember } from "./team-analysis";
import type { Language } from "./translations";

export type Axis = "physical" | "emotional" | "intellectual";
export type MemberToday = { member: TeamMember; total: number; band: "high" | "steady" | "care"; role: Axis; caution: Axis };

const axes: Axis[] = ["physical", "emotional", "intellectual"];
export const bandOf = (total: number): MemberToday["band"] => (total >= 70 ? "high" : total >= 45 ? "steady" : "care");

/** Deterministic per-member reading for one day: strongest axis = suggested role, weakest = caution. */
export function memberToday(member: TeamMember, day: string): MemberToday {
  const r = biorhythm(member.birthDate, day);
  const sorted = [...axes].sort((a, b) => r[b] - r[a]);
  return { member, total: r.total, band: bandOf(r.total), role: sorted[0]!, caution: sorted[2]! };
}

/** Today's role assignment: each axis goes to the member strongest in it (members may repeat when few). */
export function roleAssignment(list: MemberToday[], day: string): Record<Axis, string | null> {
  const out = { physical: null, emotional: null, intellectual: null } as Record<Axis, string | null>;
  for (const a of axes) {
    const best = [...list].sort((x, y) => biorhythm(y.member.birthDate, day)[a] - biorhythm(x.member.birthDate, day)[a])[0];
    out[a] = best ? best.member.id : null;
  }
  return out;
}

const seedOf = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

type Copy = {
  membersTitle: string; interactionTitle: string; synergyTitle: string; keyPerson: (n: string) => string;
  band: Record<MemberToday["band"], string>; role: Record<Axis, string>; caution: Record<Axis, string>; roleLabel: string; cautionLabel: string;
  assignTitle: string; strengths: string; issues: string; strengthLine: (roles: string) => string; issueLine: (n: number) => string; noIssue: string;
  dailyTitle: (who: string) => string; daily: string[]; goalLine: (g: string) => string; rhythmLine: Record<MemberToday["band"], string>;
};
const ja: Copy = {
  membersTitle: "構成メンバー全員の本日診断", interactionTitle: "本日のグループ内相互作用", synergyTitle: "グループ全体のシナジー（強み・課題）", keyPerson: n => `今日のキーパーソン：${n}さん`,
  band: { high: "勢いのある日。先頭に立つと流れを作れます", steady: "安定の日。いつものペースが最も力を発揮します", care: "充電の日。サポートを受けながら無理なく" },
  role: { physical: "実行・行動役", emotional: "ムード・調整役", intellectual: "企画・判断役" }, roleLabel: "おすすめ役割", cautionLabel: "本日の注意点",
  caution: { physical: "体力の消耗と睡眠不足に注意", emotional: "感情的な言葉の行き違いに注意", intellectual: "確認漏れ・早合点に注意" },
  assignTitle: "本日のおすすめ役割分担", strengths: "強み", issues: "課題", strengthLine: r => `今日は「${r}」の力が揃っています。役割を分けるほど成果が伸びます。`, issueLine: n => `${n}名が充電の日です。予定に余白をつくり、声かけでフォローしましょう。`, noIssue: "大きく落ち込むメンバーはいません。全員で一歩攻める日です。",
  dailyTitle: w => `${w}への本日のメッセージ`, goalLine: g => `目標「${g}」に向けて、今日はこの流れを一つの小さな行動に変えてみましょう。`,
  rhythmLine: { high: "バイオリズムは上向き。新しい挑戦や大事な連絡を午前中に。", steady: "バイオリズムは安定。積み重ねと丁寧な確認が実を結びます。", care: "バイオリズムは休息期。決断は急がず、整えることを優先に。" },
  daily: ["今日の星巡りは「始まり」の気配。小さく始めたことが、後で大きな流れになります。", "地球暦の巡りは「整え」の時。机や予定を一つ片づけると運が通ります。", "天体の配置は「つながり」を示します。一通の連絡が思わぬ縁を運びます。", "今日は「深める」日。いつもの物事を一段丁寧に扱うと気づきが訪れます。", "星の巡りは「解放」の合図。抱え込んだものを一つ手放すと軽くなります。", "地球暦は「実り」を告げます。これまでの努力を言葉にして認めましょう。", "今日の空は「直感」を後押し。最初に浮かんだ案を大切に。"],
};
const en: Copy = {
  membersTitle: "Today's reading for every member", interactionTitle: "Today's interactions in the group", synergyTitle: "Group synergy (strengths & challenges)", keyPerson: n => `Today's key person: ${n}`,
  band: { high: "Momentum day — leading sets the flow", steady: "Steady day — the usual pace works best", care: "Recharge day — accept support and go gently" },
  role: { physical: "Action / execution", emotional: "Mood / coordination", intellectual: "Planning / judgement" }, roleLabel: "Suggested role", cautionLabel: "Today's caution",
  caution: { physical: "Watch fatigue and sleep", emotional: "Watch emotional misunderstandings", intellectual: "Watch oversights and hasty conclusions" },
  assignTitle: "Suggested role assignment today", strengths: "Strengths", issues: "Challenges", strengthLine: r => `Today brings together "${r}". Splitting roles boosts results.`, issueLine: n => `${n} member(s) are recharging. Leave margin and check in with them.`, noIssue: "No one is in a deep dip. A day to push forward together.",
  dailyTitle: w => `Today's message for ${w}`, goalLine: g => `Toward your goal "${g}", turn today's flow into one small action.`,
  rhythmLine: { high: "Biorhythm rising — try new things and key messages in the morning.", steady: "Biorhythm steady — consistency and careful checks pay off.", care: "Biorhythm resting — don't rush decisions; prioritise restoring." },
  daily: ["Today's star path carries a sense of beginning — small starts grow into big flows.", "The Earth calendar points to tidying — clear one desk or plan to let luck through.", "The planets suggest connection — one message may bring an unexpected tie.", "A day to deepen — handle the familiar a little more carefully for new insight.", "The stars signal release — letting go of one burden lightens you.", "The Earth calendar speaks of harvest — name and honour your past effort.", "Today's sky supports intuition — value the first idea that comes."],
};
export const groupTodayCopy: Record<Language, Copy> = { ja, en, "zh-CN": en, "zh-TW": en, ko: en, es: en, fr: en };

/** Day-specific message for the fixed subject: date × subject × biorhythm × goal (deterministic, changes daily). */
export function subjectDailyMessage(subjectKey: string, birthDate: string | null, day: string, goal: string, language: Language): string[] {
  const c = groupTodayCopy[language];
  const seed = seedOf(`${day}|${subjectKey}`);
  const lines = [c.daily[seed % c.daily.length]!];
  if (birthDate) lines.push(c.rhythmLine[bandOf(biorhythm(birthDate, day).total)]);
  if (goal) lines.push(c.goalLine(goal));
  return lines;
}
