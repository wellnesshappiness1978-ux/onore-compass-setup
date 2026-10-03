import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CalendarPlus, Crown, Lock, Sparkles, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Plan } from "@/lib/design-modes";
import type { Language } from "@/lib/translations";
import { hasFeature, memberLimit, planForCount, requiredPlanFor, type TeamFeature } from "@/lib/plans";
import { teamCopy, type TeamCopy } from "@/lib/team-copy";
import {
  biorhythm, dayElement, dayScore, elements, lifePath, matrixPoint, orgBalance, pairScore, purposes, roleOf, teamDiagnosis, teamRoles, todayIso,
  type Purpose, type TeamMember, type TeamRole,
} from "@/lib/team-analysis";
import { addTeamMember, deleteTeamMember, listTeamMembers } from "@/lib/team-members.functions";
import { analyzeCandidate, draftProjectTeam, generateOneOnOneGuide } from "@/lib/ai/team-ai.functions";
import ShareCardButton from "@/components/ShareCardButton";
import GroupSimulator from "./GroupSimulator";

type Props = { plan: Plan; actualPlan: Plan; language: Language; signedIn: boolean; ownerBirthDate: string };
const LOCAL = "onore-team";
const card = "rounded-2xl border border-primary/15 bg-background/40 p-4";
const tabFeatures: TeamFeature[] = ["roster", "teamDiagnosis", "simulator", "draft", "catalog", "calendar", "balance", "oneOnOne", "recruit"];

const summary = (m: TeamMember, t: TeamCopy) => ({
  id: m.id, name: m.name, role: m.role, skills: m.skills, teamRole: t.roles[roleOf(m)],
  element: dayElement(m.birthDate), lifePath: lifePath(m.birthDate), biorhythm: biorhythm(m.birthDate, todayIso()).total,
});

export default function TeamStudio({ plan, actualPlan, language, signedIn, ownerBirthDate }: Props) {
  const t = teamCopy[language];
  const [tab, setTab] = useState(0);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [limitDialog, setLimitDialog] = useState<Plan | "max" | null>(null);
  const list = useServerFn(listTeamMembers);
  const add = useServerFn(addTeamMember);
  const del = useServerFn(deleteTeamMember);
  const max = memberLimit[actualPlan];

  useEffect(() => {
    let active = true;
    if (signedIn) list().then((m) => active && setMembers(m)).catch(() => undefined);
    else { try { setMembers(JSON.parse(localStorage.getItem(LOCAL) ?? "[]")); } catch { setMembers([]); } }
    return () => { active = false; };
  }, [signedIn, list]);
  const persistLocal = (next: TeamMember[]) => { setMembers(next); try { localStorage.setItem(LOCAL, JSON.stringify(next)); } catch { /* ignore */ } };

  const addMember = async (m: Omit<TeamMember, "id">) => {
    if (members.length + 1 > max) { setLimitDialog(planForCount(members.length + 1) ?? "max"); return false; }
    if (signedIn) setMembers([...members, await add({ data: m as never })]);
    else persistLocal([...members, { ...m, id: crypto.randomUUID() }]);
    return true;
  };
  const removeMember = async (id: string) => {
    if (signedIn) { await del({ data: { id } }); setMembers(members.filter((m) => m.id !== id)); }
    else persistLocal(members.filter((m) => m.id !== id));
  };
  const feature = tabFeatures[tab]!;
  const unlocked = hasFeature(plan, feature);

  return (
    <section className="rounded-3xl border border-primary/20 bg-card/60 p-4 backdrop-blur-md sm:p-5" aria-label={t.title}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-serif text-lg text-primary">{t.title}</h3>
        <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary">{t.planNames[actualPlan]} · {t.limit(members.length, max)}</span>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">{t.note}</p>
      {plan === "b2b-premium" && <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary"><Crown className="size-3" />{t.priority}</p>}

      <div role="tablist" className="mt-4 flex gap-1 overflow-x-auto pb-1">
        {tabFeatures.map((featureName, i) => { const label = featureName === "simulator" ? (language === "ja" ? "組織相性シミュレーター" : language === "zh-TW" ? "團隊相性模擬" : "Team simulator") : t.tabs[i > 2 ? i - 1 : i]; return (
          <button key={label} role="tab" aria-selected={tab === i} onClick={() => setTab(i)}
            className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs ${tab === i ? "border-primary bg-primary/20 text-primary" : "border-primary/20 text-muted-foreground"}`}>
            {!hasFeature(plan, tabFeatures[i]!) && i !== 0 && <Lock className="size-3" />}{label}
          </button>
        ); })}
      </div>

      <div className="mt-4">
        {!unlocked && feature !== "roster" ? (
          <div className={`${card} text-center`}>
            <Lock className="mx-auto size-6 text-primary" />
            <p className="mt-2 text-sm">{t.locked(t.planNames[requiredPlanFor(feature)])}</p>
            <Button size="sm" className="mt-3" onClick={() => document.getElementById("membership-plans")?.scrollIntoView({ behavior: "smooth", block: "start" })}>{t.seePlans}</Button>
          </div>
        ) : feature === "roster" ? (
          <Roster t={t} members={members} max={max} signedIn={signedIn} onAdd={addMember} onRemove={removeMember} />
        ) : members.length === 0 ? (
          <p className={`${card} text-sm text-muted-foreground`}>{t.empty}</p>
        ) : feature === "teamDiagnosis" ? (
          <Diagnosis t={t} members={members} max={Math.max(1, max)} language={language} />
        ) : feature === "simulator" ? (
          <GroupSimulator members={members} language={language} />
        ) : feature === "draft" ? (
          <Draft t={t} members={members} language={language} max={Math.max(1, max)} />
        ) : feature === "catalog" ? (
          <Catalog t={t} members={members} />
        ) : feature === "calendar" ? (
          <BizCalendar t={t} members={members} ownerBirthDate={ownerBirthDate} language={language} />
        ) : feature === "balance" ? (
          <Balance t={t} members={members} />
        ) : feature === "oneOnOne" ? (
          <OneOnOne t={t} members={members} language={language} />
        ) : (
          <Recruit t={t} members={members} language={language} />
        )}
      </div>

      <Dialog open={limitDialog !== null} onOpenChange={(o) => !o && setLimitDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.limitTitle}</DialogTitle>
            <DialogDescription>{limitDialog === "max" ? t.absoluteLimit : limitDialog && t.limitBody(t.planNames[limitDialog], memberLimit[limitDialog])}</DialogDescription>
          </DialogHeader>
          {limitDialog !== "max" && <p className="text-xs text-muted-foreground">{t.upgradePending}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setLimitDialog(null)}>{t.later}</Button>
            {limitDialog !== "max" && <Button onClick={() => { setLimitDialog(null); document.getElementById("membership-plans")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>{t.switchPlan}</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function RoleBadge({ role, t }: { role: TeamRole; t: TeamCopy }) {
  return <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{t.roles[role]}</span>;
}

function Roster({ t, members, max, signedIn, onAdd, onRemove }: { t: TeamCopy; members: TeamMember[]; max: number; signedIn: boolean; onAdd: (m: Omit<TeamMember, "id">) => Promise<boolean>; onRemove: (id: string) => void }) {
  const [form, setForm] = useState({ name: "", birthDate: "", role: "", skills: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.birthDate) return;
    setBusy(true);
    setError(false);
    try {
      const ok = await onAdd({ name: form.name.trim(), birthDate: form.birthDate, gender: "undisclosed", bloodType: "", role: form.role.trim(), skills: form.skills.split(/[,、，]/).map((s) => s.trim()).filter(Boolean).slice(0, 12) });
      if (ok) setForm({ name: "", birthDate: "", role: "", skills: "" });
    } catch { setError(true);
    } finally { setBusy(false); }
  };
  return (
    <div className="space-y-4">
      {!signedIn && <p className="text-[11px] text-muted-foreground">{t.guestNote}</p>}
      <form onSubmit={submit} className={`${card} grid gap-2 sm:grid-cols-2`}>
        <Input aria-label={t.name} placeholder={t.name} value={form.name} maxLength={60} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input aria-label={t.birthDate} type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
        <Input aria-label={t.jobRole} placeholder={t.jobRole} value={form.role} maxLength={60} onChange={(e) => setForm({ ...form, role: e.target.value })} />
        <Input aria-label={t.skills} placeholder={`${t.skills}（${t.skillsHint}）`} value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
        <Button type="submit" disabled={busy} className="sm:col-span-2"><UserPlus className="size-4" />{t.add} ({members.length}/{max})</Button>
        {error && <p role="alert" className="text-xs text-destructive sm:col-span-2">{t.saveError}</p>}
      </form>
      {members.length === 0 ? <p className="text-sm text-muted-foreground">{t.empty}</p> : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {members.map((m) => (
            <li key={m.id} className={`${card} flex items-center gap-2 p-3`}>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{m.name} <RoleBadge role={roleOf(m)} t={t} /></p>
                <p className="truncate text-[11px] text-muted-foreground">{m.birthDate} · {m.role || "—"}</p>
              </div>
              <Button size="icon" variant="ghost" aria-label={`${t.remove} ${m.name}`} onClick={() => onRemove(m.id)}><Trash2 className="size-4" /></Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MemberPicker({ t, members, selected, setSelected, max }: { t: TeamCopy; members: TeamMember[]; selected: string[]; setSelected: (s: string[]) => void; max: number }) {
  return (
    <div>
      <p className="mb-2 text-xs text-muted-foreground">{t.select} · {t.selectedOf(selected.length, max)}</p>
      <div className="flex flex-wrap gap-1.5">
        {members.map((m) => {
          const on = selected.includes(m.id);
          return (
            <button key={m.id} aria-pressed={on} disabled={!on && selected.length >= max}
              onClick={() => setSelected(on ? selected.filter((x) => x !== m.id) : [...selected, m.id])}
              className={`rounded-full border px-3 py-1 text-xs disabled:opacity-40 ${on ? "border-primary bg-primary/20 text-primary" : "border-primary/20 text-muted-foreground"}`}>{m.name}</button>
          );
        })}
      </div>
    </div>
  );
}

function Diagnosis({ t, members, max, language }: { t: TeamCopy; members: TeamMember[]; max: number; language: Language }) {
  const [selected, setSelected] = useState<string[]>(() => members.slice(0, max).map((m) => m.id));
  const team = members.filter((m) => selected.includes(m.id));
  const d = useMemo(() => teamDiagnosis(team), [team]);
  const pos = (m: TeamMember) => { const [x, y] = matrixPoint(m); return { left: `${50 + x * 42}%`, top: `${50 - y * 42}%` }; };
  return (
    <div className="space-y-4">
      <MemberPicker t={t} members={members} selected={selected} setSelected={setSelected} max={max} />
      {team.length < 2 ? <p className="text-sm text-muted-foreground">{t.pickTwo}</p> : (
        <>
          <div className={`${card} flex items-center gap-4`}>
            <div className="grid size-20 shrink-0 place-items-center rounded-full border-2 border-primary text-2xl font-semibold text-primary shadow-[0_0_24px_var(--gold-glow)]">{d.total}</div>
            <div><p className="font-serif text-primary">{t.balance}</p><p className="text-xs text-muted-foreground">{team.length} · {[...new Set(team.map(roleOf))].map((r) => t.roles[r]).join(" / ")}</p></div>
          </div>
          <div className="flex justify-center">
            <ShareCardButton language={language} data={{ kicker: language === "ja" ? "チーム相性診断" : "Team chemistry", title: [...new Set(team.map(roleOf))].map((r) => t.roles[r]).join(" / "), score: d.total, names: team.slice(0, 5).map((m) => m.name), lines: [t.balance] }} />
          </div>
          <div className={`${card} relative aspect-square max-w-md`}>
            <div className="absolute inset-4 border-l border-t border-primary/10" style={{ left: "50%", top: "50%" }} />
            <div className="absolute left-1/2 top-4 bottom-4 border-l border-primary/20" /><div className="absolute top-1/2 left-4 right-4 border-t border-primary/20" />
            <span className="absolute left-2 top-1/2 text-[10px] text-muted-foreground">{t.axisX[0]}</span>
            <span className="absolute right-2 top-1/2 text-[10px] text-muted-foreground">{t.axisX[1]}</span>
            <span className="absolute left-1/2 bottom-1 -translate-x-1/2 text-[10px] text-muted-foreground">{t.axisY[0]}</span>
            <span className="absolute left-1/2 top-1 -translate-x-1/2 text-[10px] text-muted-foreground">{t.axisY[1]}</span>
            <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {d.synergies.map((p) => { const [ax, ay] = matrixPoint(p.a), [bx, by] = matrixPoint(p.b); return <line key={p.a.id + p.b.id} x1={50 + ax * 42} y1={50 - ay * 42} x2={50 + bx * 42} y2={50 - by * 42} stroke="var(--primary)" strokeWidth="0.5" opacity="0.7" />; })}
              {d.conflicts.map((p) => { const [ax, ay] = matrixPoint(p.a), [bx, by] = matrixPoint(p.b); return <line key={"c" + p.a.id + p.b.id} x1={50 + ax * 42} y1={50 - ay * 42} x2={50 + bx * 42} y2={50 - by * 42} stroke="var(--destructive)" strokeWidth="0.5" strokeDasharray="1.5 1" opacity="0.8" />; })}
            </svg>
            {team.map((m) => (
              <div key={m.id} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={pos(m)}>
                <span className="block size-3 mx-auto rounded-full bg-primary shadow-[0_0_10px_var(--gold-glow)]" />
                <span className="mt-0.5 block whitespace-nowrap text-[10px]">{m.name}</span>
                <span className="block text-[9px] text-primary">{t.roles[roleOf(m)]}</span>
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className={card}><p className="mb-2 text-sm text-primary">{t.synergy}</p><ul className="space-y-1 text-xs">{d.synergies.length ? d.synergies.map((p) => <li key={p.a.id + p.b.id}>{p.a.name} × {p.b.name} <span className="text-primary">{p.score}</span></li>) : <li className="text-muted-foreground">{t.none}</li>}</ul></div>
            <div className={card}><p className="mb-2 text-sm text-destructive">{t.conflict}</p><ul className="space-y-1 text-xs">{d.conflicts.length ? d.conflicts.map((p) => <li key={p.a.id + p.b.id}>{p.a.name} × {p.b.name} <span className="text-destructive">{p.score}</span></li>) : <li className="text-muted-foreground">{t.none}</li>}</ul></div>
          </div>
          <section aria-label={language === "ja" ? "相性と組織最適化マトリクス" : "Team compatibility matrix"} className="border-y border-primary/25 py-5">
            <h3 className="font-serif text-xl text-primary">{language === "ja" ? "相性＆組織最適化マトリクス" : "Compatibility & organization matrix"}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{language === "ja" ? "80以上は協働候補、65未満は役割・連絡方法を先に確認する参考値。採用・評価・利益を保証する指標ではありません。" : "Reference scores: 80+ for collaboration exploration, below 65 for discussing roles first. Not a hiring or performance measure."}</p>
            <div className="mt-4 overflow-auto"><table className="w-full border-collapse text-sm"><thead><tr><th scope="col" className="p-3 text-left text-primary">{language === "ja" ? "関係者" : "Member"}</th>{team.map(m => <th key={m.id} scope="col" className="min-w-24 p-3 text-primary">{m.name}</th>)}</tr></thead><tbody>{team.map(a => <tr key={a.id} className="border-t border-primary/15"><th scope="row" className="whitespace-nowrap p-3 text-left font-normal">{a.name}</th>{team.map(b => { const score = a.id === b.id ? null : pairScore(a, b); return <td key={b.id} className={`p-3 text-center ${score === null ? "text-muted-foreground" : score >= 80 ? "bg-primary/20 text-primary" : score < 65 ? "bg-destructive/10 text-foreground" : "text-foreground"}`}>{score ?? "—"}</td>; })}</tr>)}</tbody></table></div>
          </section>
        </>
      )}
    </div>
  );
}

type DraftResult = { recommendedSize: number; ranking: { id: string; score: number; reason: string }[]; features: string; evaluation: string; cautions: string };
function Draft({ t, members, language, max }: { t: TeamCopy; members: TeamMember[]; language: Language; max: number }) {
  const run = useServerFn(draftProjectTeam);
  const [goal, setGoal] = useState("");
  const [headcount, setHeadcount] = useState(0);
  const [result, setResult] = useState<DraftResult | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const exec = async (fixedIds?: string[]) => {
    setBusy(true); setError(false);
    try {
      const r = await run({ data: { goal, headcount, members: members.map((m) => summary(m, t)), language, ...(fixedIds ? { fixedIds } : {}) } });
      setResult(r); setPicked(r.ranking.map((x) => x.id));
    } catch { setError(true); } finally { setBusy(false); }
  };
  const byId = new Map(members.map((m) => [m.id, m]));
  return (
    <div className="space-y-3">
      <div className={`${card} space-y-2`}>
        <label className="text-xs text-muted-foreground" htmlFor="draft-goal">{t.goal}</label>
        <textarea id="draft-goal" value={goal} maxLength={500} onChange={(e) => setGoal(e.target.value)} placeholder={t.goalPh} className="min-h-20 w-full rounded-md border border-input bg-background/60 p-2 text-sm" />
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-muted-foreground" htmlFor="draft-n">{t.headcount}</label>
          <select id="draft-n" value={headcount} onChange={(e) => setHeadcount(Number(e.target.value))} className="rounded-md border border-input bg-background/60 px-2 py-1 text-sm">
            <option value={0}>{t.auto}</option>
            {Array.from({ length: Math.min(max, members.length) }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
          </select>
          <Button size="sm" disabled={busy || goal.trim().length < 3} onClick={() => exec()}><Sparkles className="size-4" />{busy ? t.generating : t.runDraft}</Button>
        </div>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{t.aiError}</p>}
      {result && (
        <div className="space-y-3">
          <p className="text-sm text-primary">{t.recommended(result.recommendedSize)}</p>
          <ol className="space-y-2">
            {result.ranking.map((r, i) => { const m = byId.get(r.id); if (!m) return null; return (
              <li key={r.id} className={`${card} flex gap-3 p-3`}>
                <span className="font-serif text-lg text-primary">#{i + 1}</span>
                <div className="min-w-0 flex-1"><p className="text-sm">{m.name} <RoleBadge role={roleOf(m)} t={t} /> <span className="text-primary">{r.score}</span></p><p className="text-xs text-muted-foreground">{r.reason}</p></div>
              </li>); })}
          </ol>
          {[[t.features, result.features], [t.evaluation, result.evaluation], [t.cautions, result.cautions]].map(([h, b]) => <div key={h} className={card}><p className="text-sm text-primary">{h}</p><p className="mt-1 text-xs leading-6">{b}</p></div>)}
          <div className={card}>
            <p className="mb-2 text-xs text-muted-foreground">{t.swapHint}</p>
            <div className="flex flex-wrap gap-1.5">{members.map((m) => { const on = picked.includes(m.id); return <button key={m.id} aria-pressed={on} onClick={() => setPicked(on ? picked.filter((x) => x !== m.id) : [...picked, m.id].slice(0, max))} className={`rounded-full border px-3 py-1 text-xs ${on ? "border-primary bg-primary/20 text-primary" : "border-primary/20 text-muted-foreground"}`}>{m.name}</button>; })}</div>
            <Button size="sm" variant="outline" className="mt-3" disabled={busy || picked.length === 0} onClick={() => exec(picked)}>{t.reevaluate}</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Catalog({ t, members }: { t: TeamCopy; members: TeamMember[] }) {
  const [q, setQ] = useState("");
  const [role, setRole] = useState<TeamRole | "">("");
  const today = todayIso();
  const shown = members.filter((m) => (!role || roleOf(m) === role) && (!q || `${m.name} ${m.role} ${m.skills.join(" ")}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input aria-label={t.search} placeholder={t.search} value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <select aria-label={t.filterAll} value={role} onChange={(e) => setRole(e.target.value as TeamRole | "")} className="rounded-md border border-input bg-background/60 px-2 text-sm">
          <option value="">{t.filterAll}</option>{teamRoles.map((r) => <option key={r} value={r}>{t.roles[r]}</option>)}
        </select>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {shown.map((m) => { const r = roleOf(m); const bio = biorhythm(m.birthDate, today).total; return (
          <li key={m.id} className="overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 to-background/40 p-4">
            <div className="flex items-start justify-between gap-2"><div><p className="font-serif text-base">{m.name}</p><p className="text-[11px] text-muted-foreground">{m.role || "—"}</p></div><RoleBadge role={r} t={t} /></div>
            {m.skills.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{m.skills.map((s) => <span key={s} className="rounded bg-secondary px-1.5 py-0.5 text-[10px]">{s}</span>)}</div>}
            <dl className="mt-3 space-y-1 text-xs">
              <div><dt className="inline text-muted-foreground">{t.thinking}：</dt><dd className="inline">{t.roleDesc[r]}</dd></div>
              <div><dt className="inline text-muted-foreground">{t.words}：</dt><dd className="inline">{t.roleWords[r]}</dd></div>
              <div className="flex items-center gap-2"><dt className="text-muted-foreground">{t.bio}</dt><dd className="h-1.5 flex-1 rounded-full bg-secondary"><span className="block h-full rounded-full bg-primary" style={{ width: `${bio}%` }} /></dd><span className="text-primary">{bio}</span></div>
            </dl>
          </li>); })}
      </ul>
    </div>
  );
}

const ymd = (d: Date) => d.toISOString().slice(0, 10);
function BizCalendar({ t, members, ownerBirthDate, language }: { t: TeamCopy; members: TeamMember[]; ownerBirthDate: string; language: Language }) {
  const [purpose, setPurpose] = useState<Purpose>("negotiation");
  const [who, setWho] = useState<string>("");
  const [day, setDay] = useState<string | null>(null);
  const births = [ownerBirthDate, ...(who ? [members.find((m) => m.id === who)?.birthDate ?? ""] : [])].filter(Boolean);
  const now = new Date(); const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => { const d = new Date(start); d.setUTCDate(i + 1); const iso = ymd(d); return { iso, n: i + 1, score: dayScore(purpose, iso, births) }; });
  const badge = (s: number) => (s >= 68 ? "bg-primary text-primary-foreground" : s <= 35 ? "bg-destructive text-destructive-foreground" : "bg-secondary text-secondary-foreground");
  const sel = days.find((d) => d.iso === day);
  const title = `${t.purposes[purpose]}${who ? ` · ${members.find((m) => m.id === who)?.name}` : ""}`;
  const google = (iso: string) => { const a = iso.replace(/-/g, ""); const n = new Date(iso); n.setUTCDate(n.getUTCDate() + 1); return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${a}/${ymd(n).replace(/-/g, "")}`; };
  const ics = (iso: string) => {
    const a = iso.replace(/-/g, ""); const n = new Date(iso); n.setUTCDate(n.getUTCDate() + 1);
    const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Onore Compass//EN", "BEGIN:VEVENT", `UID:${a}-${purpose}@onore`, `DTSTART;VALUE=DATE:${a}`, `DTEND;VALUE=DATE:${ymd(n).replace(/-/g, "")}`, `SUMMARY:${title}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
    const link = document.createElement("a"); link.href = url; link.download = `onore-${a}.ics`; link.click(); URL.revokeObjectURL(url);
  };
  const lead = (start.getUTCDay() + 6) % 7;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <div role="radiogroup" aria-label={t.purpose} className="flex flex-wrap gap-1">
          {purposes.map((p) => <button key={p} role="radio" aria-checked={purpose === p} onClick={() => setPurpose(p)} className={`rounded-full border px-3 py-1 text-xs ${purpose === p ? "border-primary bg-primary/20 text-primary" : "border-primary/20 text-muted-foreground"}`}>{t.purposes[p]}</button>)}
        </div>
        <select aria-label={t.select} value={who} onChange={(e) => setWho(e.target.value)} className="rounded-md border border-input bg-background/60 px-2 text-xs">
          <option value="">—</option>{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      <div className="flex gap-3 text-[10px]"><span className="flex items-center gap-1"><i className="size-2.5 rounded-full bg-primary" />{t.best}</span><span className="flex items-center gap-1"><i className="size-2.5 rounded-full bg-destructive" />{t.caution}</span></div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: lead }, (_, i) => <span key={`l${i}`} />)}
        {days.map((d) => (
          <button key={d.iso} onClick={() => setDay(d.iso)} aria-pressed={day === d.iso} className={`rounded-lg border p-1 text-[11px] ${day === d.iso ? "border-primary" : "border-primary/10"}`}>
            <span className="block">{d.n}</span><span className={`mx-auto mt-0.5 block w-fit rounded px-1 text-[9px] ${badge(d.score)}`}>{d.score}</span>
          </button>
        ))}
      </div>
      {sel && (
        <div className={card}>
          <p className="text-sm text-primary">{new Intl.DateTimeFormat(language, { month: "long", day: "numeric", weekday: "short" }).format(new Date(sel.iso))} · {t.dayAdvice} ({sel.score})</p>
          <p className="mt-1 text-xs leading-6">{sel.score >= 68 ? t.advice.good : sel.score <= 35 ? t.advice.bad : t.advice.mid}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild><a href={google(sel.iso)} target="_blank" rel="noopener noreferrer"><CalendarPlus className="size-4" />{t.addGoogle}</a></Button>
            <Button size="sm" variant="outline" onClick={() => ics(sel.iso)}><CalendarPlus className="size-4" />{t.addApple}</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Balance({ t, members }: { t: TeamCopy; members: TeamMember[] }) {
  const b = orgBalance(members);
  const maxRole = Math.max(1, ...Object.values(b.roleCount));
  const maxEl = Math.max(1, ...Object.values(b.elementCount));
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className={card}>
        <ul className="space-y-1.5">{teamRoles.map((r) => <li key={r} className="flex items-center gap-2 text-xs"><span className="w-24 shrink-0">{t.roles[r]}</span><span className="h-2 flex-1 rounded-full bg-secondary"><span className="block h-full rounded-full bg-primary" style={{ width: `${(b.roleCount[r] / maxRole) * 100}%` }} /></span><span className="w-5 text-right">{b.roleCount[r]}</span></li>)}</ul>
      </div>
      <div className={card}>
        <p className="mb-2 text-sm text-primary">{t.elements}</p>
        <div className="flex h-28 items-end gap-2">{elements.map((e) => <div key={e} className="flex flex-1 flex-col items-center gap-1"><span className="w-full rounded-t bg-primary/70" style={{ height: `${(b.elementCount[e] / maxEl) * 90 + 4}px` }} /><span className="text-[10px]">{t.elementNames[e]}</span></div>)}</div>
      </div>
      <div className={card}><p className="text-sm text-destructive">{t.missing}</p><p className="mt-1 text-xs">{b.missing.length ? b.missing.map((r) => t.roles[r]).join(" / ") : t.none}</p><p className="mt-3 text-sm text-primary">{t.excess}</p><p className="mt-1 text-xs">{b.excess.length ? b.excess.map((r) => t.roles[r]).join(" / ") : t.none}</p></div>
      <div className="rounded-2xl border border-primary/50 bg-primary/10 p-4"><p className="text-sm text-primary">{t.target}</p><p className="mt-1 font-serif text-lg">{t.roles[b.target]}</p><p className="text-xs text-muted-foreground">{t.roleDesc[b.target]}</p></div>
    </div>
  );
}

function OneOnOne({ t, members, language }: { t: TeamCopy; members: TeamMember[]; language: Language }) {
  const gen = useServerFn(generateOneOnOneGuide);
  const [id, setId] = useState(members[0]?.id ?? "");
  const [guides, setGuides] = useState<Record<string, { praise: string; ngInstructions: string; lowMotivation: string }>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const m = members.find((x) => x.id === id);
  const g = guides[`${id}:${language}`];
  const run = async () => { if (!m) return; setBusy(true); setError(false); try { const r = await gen({ data: { member: summary(m, t), language } }); setGuides((s) => ({ ...s, [`${id}:${language}`]: r })); } catch { setError(true); } finally { setBusy(false); } };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <select aria-label={t.select} value={id} onChange={(e) => setId(e.target.value)} className="rounded-md border border-input bg-background/60 px-2 text-sm">{members.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
        <Button size="sm" disabled={busy || !m} onClick={run}><Sparkles className="size-4" />{busy ? t.generating : t.generate}</Button>
      </div>
      {m && <p className="text-xs text-muted-foreground">{m.name} · <RoleBadge role={roleOf(m)} t={t} /> {t.roleDesc[roleOf(m)]}</p>}
      {error && <p role="alert" className="text-sm text-destructive">{t.aiError}</p>}
      {g && <div className="grid gap-3 sm:grid-cols-3">{[[t.praise, g.praise, "text-primary"], [t.ng, g.ngInstructions, "text-destructive"], [t.low, g.lowMotivation, "text-primary"]].map(([h, b, c]) => <div key={h} className={card}><p className={`text-sm ${c}`}>{h}</p><p className="mt-1 text-xs leading-6">{b}</p></div>)}</div>}
    </div>
  );
}

const recruitCopy = {
  ja: { title: "採用面接AIフィットネス診断", sub: "応募者の生年月日から、既存チームとの相性・役割予測・定着のヒントを参考表示します。", name: "応募者名（任意）", birth: "生年月日", run: "AI分析する", busy: "分析中…", fit: "既存チームとの相性", role: "組織内での役割予測", mot: "入社後のモチベーション維持", onb: "最初の90日のサポート", avg: "チーム平均相性", top: "相性の高いメンバー", note: "※生年月日から算出した参考値です。合否判断には使用せず、スキル・経験・面接内容で判断してください。応募者情報は保存されません。" },
  en: { title: "Hiring interview AI fit report", sub: "Reference view of team chemistry, likely role and retention tips from a candidate's birth date.", name: "Candidate name (optional)", birth: "Birth date", run: "Analyze with AI", busy: "Analyzing…", fit: "Fit with current team", role: "Predicted role", mot: "Sustaining motivation", onb: "First 90 days support", avg: "Avg. team fit", top: "Best-matched members", note: "Reference values from birth dates. Never use for pass/fail; decide on skills, experience and the interview. Candidate data is not saved." },
};

function Recruit({ t, members, language }: { t: TeamCopy; members: TeamMember[]; language: Language }) {
  const c = language === "ja" ? recruitCopy.ja : recruitCopy.en;
  const run = useServerFn(analyzeCandidate);
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [report, setReport] = useState<{ teamFit: string; rolePrediction: string; motivation: string; onboarding: string } | null>(null);
  const cand: TeamMember | null = /^\d{4}-\d{2}-\d{2}$/.test(birth) ? { id: "candidate", name: name || "?", birthDate: birth, gender: "", bloodType: "", role: "", skills: [] } : null;
  const pairs = cand ? members.map((m) => ({ m, score: pairScore(cand, m) })).sort((a, b) => b.score - a.score) : [];
  const avg = pairs.length ? Math.round(pairs.reduce((s, p) => s + p.score, 0) / pairs.length) : 0;
  const go = async () => {
    if (!cand) return; setBusy(true); setError(false); setReport(null);
    try {
      setReport(await run({ data: { candidate: { name: name.slice(0, 60), role: t.roles[roleOf(cand)], element: dayElement(birth), lifePath: lifePath(birth), avgFit: avg }, pairs: pairs.slice(0, 100).map((p) => ({ name: p.m.name, teamRole: t.roles[roleOf(p.m)], score: p.score })), language } }));
    } catch { setError(true); } finally { setBusy(false); }
  };
  return (
    <div className="space-y-3">
      <div className={card}>
        <p className="font-serif text-primary">{c.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <Input aria-label={c.name} placeholder={c.name} value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
          <Input aria-label={c.birth} type="date" value={birth} max={todayIso()} onChange={(e) => setBirth(e.target.value)} />
          <Button disabled={!cand || busy} onClick={go}><Sparkles className="size-4" />{busy ? c.busy : c.run}</Button>
        </div>
      </div>
      {cand && (
        <div className={`${card} flex items-center gap-4`}>
          <div className="grid size-16 shrink-0 place-items-center rounded-full border-2 border-primary text-xl font-semibold text-primary">{avg}</div>
          <div className="min-w-0 text-xs">
            <p className="text-primary">{c.avg} · <RoleBadge role={roleOf(cand)} t={t} /></p>
            <p className="mt-1 text-muted-foreground">{c.top}: {pairs.slice(0, 3).map((p) => `${p.m.name} ${p.score}`).join(" / ")}</p>
          </div>
        </div>
      )}
      {error && <p role="alert" className="text-sm text-destructive">{t.aiError}</p>}
      {report && <div className="grid gap-3 sm:grid-cols-2">{([[c.fit, report.teamFit], [c.role, report.rolePrediction], [c.mot, report.motivation], [c.onb, report.onboarding]] as const).map(([h, b]) => <div key={h} className={card}><p className="text-sm text-primary">{h}</p><p className="mt-1 text-xs leading-6">{b}</p></div>)}</div>}
      <p className="text-[10px] leading-4 text-muted-foreground">{c.note}</p>
    </div>
  );
}
