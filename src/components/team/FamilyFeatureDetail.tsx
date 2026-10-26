import { useMemo } from "react";
import { useFocus, ownerAsMember } from "../FocusProvider";
import FamilyMap from "./FamilyMap";
import FamilyPlanningView from "./FamilyPlanningView";
import { analyzeFamily } from "@/lib/family-analysis";
import { familyFeatureCopy, type FamilyFeature } from "@/lib/family-features";
import { teamCopy } from "@/lib/team-copy";
import { memberDisplayName } from "@/lib/focus";
import { groupInsightCopy } from "@/lib/group-insight";
import { branchInfo, signInfo } from "@/lib/zodiac-signs";
import { todayIso } from "@/lib/team-analysis";
import type { Language } from "@/lib/translations";
import type { Plan } from "@/lib/design-modes";

export default function FamilyFeatureDetail({ feature, language, plan, actualPlan, signedIn, previewMode, onUpgrade }: {
  feature: FamilyFeature; language: Language; plan: Plan; actualPlan: Plan; signedIn: boolean; previewMode: boolean; onUpgrade: () => void;
}) {
  const focus = useFocus();
  const c = familyFeatureCopy[language], t = teamCopy[language], g = groupInsightCopy[language];
  const members = useMemo(() => focus?.group ? focus.group.members : focus ? [ownerAsMember(focus.owner), ...focus.members] : [], [focus?.group, focus?.owner, focus?.members]);
  const data = useMemo(() => analyzeFamily(members, todayIso()), [members]);
  const groupSubject = useMemo(() => ({ id: focus?.group?.group.id ?? "family-live", name: focus?.group ? focus.label(language) : c.title, nickname: "", memberIds: members.map(m=>m.id) }), [focus?.group?.group.id, focus?.group, language, members, c.title]);
  if (!focus || members.length < 2) return <p className="py-6 text-sm text-muted-foreground">{c.empty}</p>;
  const name = (m: typeof members[number]) => memberDisplayName(m);
  const personRows = data.entries.map(e => <article key={e.member.id} className="min-w-0 border-b border-primary/20 py-4">
    <h4 className="font-serif text-base text-primary">{name(e.member)}</h4>
    <p className="mt-2 text-sm leading-7">{t.roles[e.role]} · {t.roleDesc[e.role]}</p>
    <p className="mt-2 text-xs leading-6 text-muted-foreground">{e.core ? `${signInfo(e.core.western.sun,language)?.name ?? ""} · ${branchInfo(e.core.eastern.branchIndex,language).name}` : ""}</p>
    <p className="mt-2 text-sm leading-7">{c.support}：{t.roleWords[e.role]}</p>
    <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">{[[g.physical,e.rhythm.physical],[g.emotional,e.rhythm.emotional],[g.intellectual,e.rhythm.intellectual]].map(([label,v]) => <div key={String(label)} className="border-l border-primary/20 px-2"><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 font-semibold text-primary">{Math.round((Number(v)+1)*50)}/100</dd></div>)}</dl>
  </article>);
  const pairs = (feature === "friction" ? [...data.pairs].sort((a,b)=>a.score-b.score) : [...data.pairs].sort((a,b)=>b.score-a.score)).slice(0,30);
  return <div className="min-w-0">
    <p className="mb-4 text-xs leading-6 text-muted-foreground">{groupSubject.name} · {members.length} · {focus.focus.goal}</p>
    {feature === "matrix" && <FamilyMap data={data} language={language}/>}
    {(feature === "matrix" || feature === "layers" || feature === "friction") && <div className="mt-4 divide-y divide-primary/20">{pairs.map(p=><article key={`${p.a.member.id}:${p.b.member.id}`} className="py-4">
      <h4 className="font-semibold text-primary">{name(p.a.member)} × {name(p.b.member)} <span className="text-xs">{p.score}/100</span></h4>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-xs"><div><dt className="text-muted-foreground">{t.elements}</dt><dd>{p.element}/100</dd></div><div><dt className="text-muted-foreground">{t.bio}</dt><dd>{p.rhythm}/100</dd></div><div><dt className="text-muted-foreground">{language === "ja" ? "星配置" : c.titles[1]}</dt><dd>{p.sky ?? "—"}/100</dd></div></dl>
      <p className="mt-3 text-sm leading-7">{name(p.a.member)}：{t.roleDesc[p.a.role]}。{name(p.b.member)}：{t.roleDesc[p.b.role]}。</p>
      <p className="mt-2 text-sm leading-7">{p.relation === "control" || p.rhythm < 45 ? c.resolve : t.advice.mid}</p>
    </article>)}</div>}
    {feature === "layers" && personRows}
    {feature === "friction" && <p className="border-t border-primary/25 py-4 text-sm leading-7">{c.resolve}</p>}
    {feature === "roadmap" && <ol className="divide-y divide-primary/20">{data.roadmap.map(d=><li key={d.day} className="py-4">
      <h4 className="font-semibold text-primary">{new Intl.DateTimeFormat(language,{month:"long",day:"numeric",weekday:"short"}).format(new Date(`${d.day}T12:00:00Z`))} · {d.score}/100</h4>
      <p className="mt-2 text-sm leading-7">{c.decide}：{d.score>=65?t.advice.good:d.score<40?t.advice.bad:t.advice.mid}</p>
      {d.lead && <p className="mt-2 text-sm leading-7">{name(d.lead)} · {t.roles[data.entries.find(e=>e.member.id===d.lead?.id)?.role ?? "coordinator"]}</p>}
      {d.support && <p className="mt-1 text-xs leading-6 text-muted-foreground">{g.care(name(d.support))}</p>}
    </li>)}</ol>}
    {(feature === "directions" || feature === "rhythm") && <FamilyPlanningView members={members} day={todayIso()} language={language} mode={feature}/>}
    <p className="mt-5 text-xs leading-6 text-muted-foreground">{c.note}</p>
  </div>;
}