import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { dayElement, pairScore, relation, teamDiagnosis, type TeamMember } from "@/lib/team-analysis";
import type { Language } from "@/lib/translations";

const labels = {
  ja: { title: "組織相性シミュレーター", pool: "未配置", groups: ["プロジェクト A", "プロジェクト B", "プロジェクト C"], synergy: "相乗効果", complement: "補完関係", friction: "摩擦に注意", note: "五行・生年月日を用いた参考モデル。実際の成果や人事適性を保証しません。", move: "移動先", score: "参考スコア" },
  en: { title: "Team chemistry simulator", pool: "Unassigned", groups: ["Project A", "Project B", "Project C"], synergy: "Synergy", complement: "Complementary", friction: "Potential friction", note: "Illustrative birth-date and five-element model; not a hiring or performance prediction.", move: "Move to", score: "Reference score" },
  zh: { title: "團隊相性模擬器", pool: "未分配", groups: ["專案 A", "專案 B", "專案 C"], synergy: "協同效應", complement: "互補關係", friction: "留意摩擦", note: "依生日與五行建立的參考模型，不預測實際成果或人事適性。", move: "移至", score: "參考分數" },
};
const colors = { synergy: "text-emerald-300 border-emerald-400/40 bg-emerald-500/10", complement: "text-sky-300 border-sky-400/40 bg-sky-500/10", friction: "text-rose-300 border-rose-400/40 bg-rose-500/10" };
const classify = (a: TeamMember, b: TeamMember): "synergy" | "complement" | "friction" => {
  const rel = relation(a, b), score = pairScore(a, b);
  return rel === "control" || score < 60 ? "friction" : rel === "generate" && score >= 75 ? "synergy" : "complement";
};
export default function GroupSimulator({ members, language }: { members: TeamMember[]; language: Language }) {
  const t = language === "ja" ? labels.ja : language === "zh-TW" || language === "zh-CN" ? labels.zh : labels.en;
  const [placed, setPlaced] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => setPlaced(prev => Object.fromEntries(Object.entries(prev).filter(([id]) => members.some(m => m.id === id)))), [members]);
  const groups = useMemo(() => Array.from({ length: 4 }, (_, i) => members.filter(m => (placed[m.id] ?? 0) === i)), [members, placed]);
  const move = (id: string, group: number) => { setPlaced(prev => ({ ...prev, [id]: group })); setSelected(null); };
  return <section aria-label={t.title} className="space-y-4">
    <div><h4 className="font-serif text-lg text-primary">{t.title}</h4><p className="mt-1 text-xs text-muted-foreground">{t.note}</p></div>
    {selected && <div role="group" aria-label={t.move} className="flex flex-wrap items-center gap-2 rounded-md border border-primary/30 p-2 text-xs"><span>{members.find(m => m.id === selected)?.name} →</span>{[t.pool, ...t.groups].map((name, i) => <Button key={i} type="button" variant="outline" size="sm" onClick={() => move(selected, i)}>{name}</Button>)}<Button type="button" variant="ghost" size="sm" onClick={() => setSelected(null)}>×</Button></div>}
    <div className="grid gap-3 md:grid-cols-2">{groups.map((group, index) => {
      const pairs = group.flatMap((a, i) => group.slice(i + 1).map(b => ({ a, b, score: pairScore(a, b), category: classify(a, b) })));
      return <div key={index} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const id = event.dataTransfer.getData("text/plain"); if (members.some(m => m.id === id)) move(id, index); }} className="min-h-40 rounded-md border border-primary/30 bg-card/60 p-4">
        <div className="flex justify-between gap-2"><h5 className="font-serif text-primary">{index === 0 ? t.pool : t.groups[index - 1]}</h5>{index > 0 && group.length > 1 && <span className="text-xs text-primary">{t.score} {teamDiagnosis(group).total}</span>}</div>
        <div className="mt-3 flex min-h-12 flex-wrap gap-2">{group.map(m => <Button key={m.id} type="button" variant={selected === m.id ? "default" : "outline"} size="sm" draggable onDragStart={event => event.dataTransfer.setData("text/plain", m.id)} onClick={() => setSelected(m.id)} aria-label={`${m.name} · ${t.move}`} title={`${m.name} · ${dayElement(m.birthDate)}`} className="cursor-grab">{m.name}</Button>)}</div>
        {pairs.length > 0 && <div className="mt-3 space-y-1.5" aria-live="polite">{pairs.map(({a,b,score,category}) => <p key={`${a.id}-${b.id}`} className={`rounded-md border px-2 py-1 text-xs ${colors[category]}`}><span aria-hidden="true">━ </span>{a.name} ↔ {b.name} · {t[category]} · {score}</p>)}</div>}
      </div>;
    })}</div>
  </section>;
}
