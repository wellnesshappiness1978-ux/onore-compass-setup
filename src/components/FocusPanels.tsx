import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, Sparkles, Target, Trash2, Users, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useFocus } from "./FocusProvider";
import { addTeamGroup, deleteTeamGroup, updateTeamGroup } from "@/lib/team-groups.functions";
import { canAddGroup, focusCopy, goalPresets, GROUPS_KEY, groupDisplayName, memberDisplayName, memberToProfile, mixHex, type TargetKind, type TeamGroup } from "@/lib/focus";
import { groupLimit } from "@/lib/plans";
import { birthColorSpectrum, localizeBirthColorName } from "@/lib/birth-color-spectrum";
import { biorhythm, pairScore, type TeamMember } from "@/lib/team-analysis";
import type { Language } from "@/lib/translations";
import type { Plan } from "@/lib/design-modes";

const mainColor = (m: TeamMember) => birthColorSpectrum(memberToProfile(m))?.main ?? null;

/** Settings card: goal + main subject. */
export function FocusSettingsCard({ language }: { language: Language }) {
  const ctx = useFocus();
  const t = focusCopy[language];
  const [draft, setDraft] = useState<import("@/lib/focus").Focus | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  if (!ctx) return null;
  const f = draft ?? ctx.focus;
  const set = (patch: Partial<typeof f>) => setDraft({ ...f, ...patch });
  const kinds: TargetKind[] = ["self", "family", "group"];
  return (
    <details className="group rounded-lg border border-primary/30 bg-card/60" aria-label={t.cardTitle}>
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2 font-serif text-lg text-primary"><Target className="size-5" />{t.cardTitle}</span>
        <span className="text-xs text-muted-foreground transition-transform group-open:rotate-180">▼</span>
      </summary>
      <div className="border-t border-primary/15 p-4 sm:p-5">
      <div role="note" className="relative overflow-hidden rounded-lg border-2 border-primary/70 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent p-4 shadow-champagne"><span className="mb-2 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground"><Sparkles className="size-3" aria-hidden="true" />{t.targetLabel}</span><p className="text-sm font-bold leading-6 text-foreground">{t.cardIntro}</p></div>
      <p className="mt-4 text-sm text-primary">{t.goalLabel}</p>
      <div className="mt-2 flex flex-wrap gap-2">{goalPresets.map(p => <Button key={p} type="button" size="sm" variant={f.goalPreset === p ? "default" : "outline"} aria-pressed={f.goalPreset === p} onClick={() => set({ goalPreset: f.goalPreset === p ? "" : p })}>{t.presets[p]}</Button>)}</div>
      <Input className="mt-2" aria-label={t.goalLabel} placeholder={t.goalPlaceholder} maxLength={200} value={f.goal} onChange={e => set({ goal: e.target.value })} />
      <p className="mt-4 text-sm text-primary">{t.targetLabel}</p>
      <div className="mt-2 grid grid-cols-3 gap-2">{kinds.map(k => <Button key={k} type="button" variant={f.targetKind === k ? "default" : "outline"} aria-pressed={f.targetKind === k} onClick={() => set({ targetKind: k, targetId: k === "self" ? null : (k === "family" ? ctx.members[0]?.id : ctx.groups[0]?.id) ?? null })}>{t[k]}</Button>)}</div>
      {f.targetKind !== "self" && (() => {
        const options = f.targetKind === "family" ? ctx.members.map(m => ({ id: m.id, label: memberDisplayName(m) })) : ctx.groups.map((g, i) => ({ id: g.id, label: groupDisplayName(g, i, language) }));
        return options.length ? <select aria-label={f.targetKind === "family" ? t.choosePerson : t.chooseGroup} value={f.targetId ?? ""} onChange={e => set({ targetId: e.target.value })} className="mt-2 min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm">{options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}</select> : <p className="mt-2 text-xs text-muted-foreground">{t.none}</p>;
      })()}
      <Button className="mt-4 w-full" disabled={saving || (f.targetKind !== "self" && !f.targetId)} onClick={async () => { setSaving(true); try { await ctx.setFocus(f); setDraft(undefined); toast.success(t.saved); } catch { toast.error("Error"); } finally { setSaving(false); } }}>{t.save}</Button>
      </div>
    </details>
  );
}

/** Small strip showing the current subject with a way back to self. */
export function SubjectBanner({ language }: { language: Language }) {
  const ctx = useFocus();
  if (!ctx || ctx.focus.targetKind === "self" || (!ctx.member && !ctx.group)) return null;
  const t = focusCopy[language];
  return <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm">
    <span className="flex items-center gap-2 text-primary">{ctx.group ? <Users className="size-4" /> : <UserRound className="size-4" />}{t.viewing(ctx.label(language))}</span>
    <Button size="sm" variant="ghost" onClick={() => ctx.setFocus({ ...ctx.focus, targetKind: "self", targetId: null })}>{t.backToSelf}</Button>
  </div>;
}

/** Group reading: group color, members' colors, harmony and today's average rhythm. */
export function GroupFocusCard({ language }: { language: Language }) {
  const ctx = useFocus();
  const t = focusCopy[language];
  const g = ctx?.group;
  const stats = useMemo(() => {
    if (!g) return null;
    const colors = g.members.map(m => ({ m, c: mainColor(m) }));
    const groupHex = mixHex(colors.map(x => x.c?.code ?? ""));
    const pairs: number[] = [];
    for (let i = 0; i < g.members.length; i++) for (let j = i + 1; j < g.members.length; j++) pairs.push(pairScore(g.members[i]!, g.members[j]!));
    const harmony = pairs.length ? Math.round(pairs.reduce((a, b) => a + b, 0) / pairs.length) : null;
    const today = new Date().toLocaleDateString("en-CA");
    const rhythm = g.members.length ? Math.round(g.members.reduce((a, m) => a + biorhythm(m.birthDate, today).total, 0) / g.members.length) : null;
    return { colors, groupHex, harmony, rhythm };
  }, [g]);
  if (!g || !stats) return null;
  const name = groupDisplayName(g.group, g.index, language);
  const goal = ctx?.focus.goal.trim();
  return <section className="mb-6 rounded-lg border border-primary/30 bg-card/60 p-4 sm:p-5">
    <h2 className="font-serif text-xl text-gradient-gold sm:text-2xl">{t.traitsGroup(name)}</h2>
    {goal && <p className="mt-1 text-xs text-muted-foreground">{t.goalNote(goal)}</p>}
    {!g.members.length ? <p className="mt-3 text-sm text-muted-foreground">{t.groupEmpty}</p> : <>
      {stats.groupHex && <div className="mt-4 rounded-md p-4" style={{ background: `linear-gradient(135deg, ${stats.groupHex}, ${stats.groupHex}66)` }}><p className="text-xs font-bold text-outline text-foreground">{t.groupColor}</p><p className="mt-1 font-serif text-2xl font-bold text-outline text-foreground">{name} · {stats.groupHex.toUpperCase()}</p></div>}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-md border border-primary/25 p-3 text-center"><p className="text-xs text-muted-foreground">{t.groupHarmony}</p><p className="font-serif text-2xl text-primary">{stats.harmony ?? "—"}{stats.harmony !== null && <span className="text-sm">/100</span>}</p></div>
        <div className="rounded-md border border-primary/25 p-3 text-center"><p className="text-xs text-muted-foreground">{t.groupRhythm}</p><p className="font-serif text-2xl text-primary">{stats.rhythm ?? "—"}<span className="text-sm">/100</span></p></div>
      </div>
      <h3 className="mt-4 text-sm text-primary">{t.groupMembers}</h3>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">{stats.colors.map(({ m, c }) => <li key={m.id} className="flex items-center gap-3 rounded-md border border-primary/20 p-2"><span className="size-8 shrink-0 rounded-full border border-primary/40" style={{ background: c?.code }} /><span className="min-w-0"><span className="block truncate font-bold text-outline">{memberDisplayName(m)}</span><span className="block truncate text-xs text-muted-foreground">{c ? `${localizeBirthColorName(c.name, language)} ${c.code}` : "—"}</span></span></li>)}</ul>
    </>}
  </section>;
}

export function ArtOwnerOnlyNotice({ language, onUpgrade }: { language: Language; onUpgrade: () => void }) {
  const ctx = useFocus();
  if (!ctx || ctx.focus.targetKind === "self" || (!ctx.member && !ctx.group)) return null;
  const t = focusCopy[language];
  return <div role="note" className="mb-5 rounded-md border border-primary/40 bg-primary/10 p-4"><p className="font-serif text-primary">{t.artOwnerOnly}</p><p className="mt-1 text-sm leading-6 text-foreground">{t.artOwnerOnlyBody}</p><Button size="sm" variant="outline" className="mt-3" onClick={onUpgrade}>{t.seePlans}</Button></div>;
}

/** Family tab: two buttons for family and group editing; group dialog enforces plan caps. */
export function FamilyGroupButtons({ language, plan, onUpgrade }: { language: Language; plan: Plan; onUpgrade: () => void }) {
  const ctx = useFocus();
  const t = focusCopy[language];
  const [open, setOpen] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);
  const [editing, setEditing] = useState<TeamGroup | null>(null);
  const [name, setName] = useState(""); const [nick, setNick] = useState(""); const [ids, setIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const add = useServerFn(addTeamGroup); const upd = useServerFn(updateTeamGroup); const del = useServerFn(deleteTeamGroup);
  if (!ctx) return null;
  const limit = groupLimit[plan];
  const reset = () => { setEditing(null); setName(""); setNick(""); setIds([]); };
  const writeLocal = (groups: TeamGroup[]) => { localStorage.setItem(GROUPS_KEY, JSON.stringify(groups)); ctx.reload(); };
  const save = async () => {
    setBusy(true);
    try {
      const payload = { name: name.trim(), nickname: nick.trim(), memberIds: ids };
      if (editing) {
        if (ctx.serverBacked) await upd({ data: { ...payload, id: editing.id } }); else writeLocal(ctx.groups.map(g => g.id === editing.id ? { ...g, ...payload } : g));
      } else {
        if (!canAddGroup(plan, ctx.groups.length)) { setLimitOpen(true); return; }
        if (ctx.serverBacked) await add({ data: payload }); else writeLocal([...ctx.groups, { id: crypto.randomUUID(), ...payload }]);
      }
      if (ctx.serverBacked) ctx.reload();
      reset();
    } catch (e) { if (e instanceof Error && e.message.includes("GROUP_LIMIT")) setLimitOpen(true); else toast.error("Error"); }
    finally { setBusy(false); }
  };
  const remove = async (g: TeamGroup) => { if (ctx.serverBacked) { await del({ data: { id: g.id } }); ctx.reload(); } else writeLocal(ctx.groups.filter(x => x.id !== g.id)); };
  return <>
    <div className="mb-5 grid grid-cols-2 gap-2">
      <Button variant="outline" className="h-12 border-primary/40" onClick={() => document.getElementById("family-roster-form")?.scrollIntoView({ behavior: "smooth", block: "center" })}><UserRound className="size-4" />{t.familyEdit}</Button>
      <Button variant="outline" className="h-12 border-primary/40" onClick={() => { reset(); setOpen(true); }}><Users className="size-4" />{t.groupEdit}</Button>
    </div>
    {ctx.groups.length > 0 && <ul className="mb-5 grid gap-2 sm:grid-cols-2">{ctx.groups.map((g, i) => { const hex = mixHex(ctx.members.filter(m => g.memberIds.includes(m.id)).map(m => mainColor(m)?.code ?? "")); return <li key={g.id} className="rounded-md border-l-4 p-3" style={hex ? { borderLeftColor: hex, backgroundImage: `linear-gradient(90deg, ${hex}66, transparent 75%)` } : undefined}><p className="truncate font-serif text-lg font-bold text-outline">{groupDisplayName(g, i, language)}</p><p className="text-xs text-muted-foreground">{t.members} {g.memberIds.length}</p></li>; })}</ul>}
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="z-[200] max-h-[88dvh] w-[calc(100%-1.5rem)] max-w-lg overflow-y-auto border-primary/40">
        <DialogTitle className="font-serif text-primary">{t.groupEdit}</DialogTitle>
        <DialogDescription>{t.groupCount(ctx.groups.length, limit)}</DialogDescription>
        <ul className="space-y-2">{ctx.groups.map((g, i) => <li key={g.id} className="flex items-center gap-2 rounded-md border border-primary/20 p-2"><span className="min-w-0 flex-1 truncate font-bold">{groupDisplayName(g, i, language)} <span className="text-xs font-normal text-muted-foreground">({g.memberIds.length})</span></span><Button size="icon" variant="ghost" aria-label={t.edit} onClick={() => { setEditing(g); setName(g.name); setNick(g.nickname); setIds(g.memberIds); }}><Pencil className="size-4" /></Button><Button size="icon" variant="ghost" aria-label={t.remove} onClick={() => remove(g)}><Trash2 className="size-4" /></Button></li>)}</ul>
        <div className="space-y-2 border-t border-primary/20 pt-3">
          <label className="block text-sm text-primary" htmlFor="group-display-name">{t.groupName.replace(/（任意）| \(optional\)|（可选）|（選填）|（可選）|\(선택\)| \(opcional\)| \(facultatif\)/g, '')}</label>
          <Input id="group-display-name" maxLength={40} value={nick || name} onChange={e => { setNick(e.target.value); setName(e.target.value); }} />
          <p className="text-sm text-primary">{t.members}</p>
          {ctx.members.length ? <div className="flex flex-wrap gap-2">{ctx.members.map(m => { const on = ids.includes(m.id); return <Button key={m.id} type="button" size="sm" variant={on ? "default" : "outline"} aria-pressed={on} onClick={() => setIds(on ? ids.filter(x => x !== m.id) : [...ids, m.id])}>{memberDisplayName(m)}</Button>; })}</div> : <p className="text-xs text-muted-foreground">{t.noMembers}</p>}
          <div className="flex gap-2"><Button className="flex-1" disabled={busy} onClick={save}>{editing ? t.save : t.add}</Button>{editing && <Button variant="outline" onClick={reset}>{t.close}</Button>}</div>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={limitOpen} onOpenChange={setLimitOpen}>
      <DialogContent className="z-[210] w-[calc(100%-1.5rem)] max-w-sm border-primary/40">
        <DialogTitle className="font-serif text-primary">{t.groupLimitTitle}</DialogTitle>
        <DialogDescription>{t.groupLimitBody(limit)}</DialogDescription>
        <Button onClick={() => { setLimitOpen(false); setOpen(false); onUpgrade(); }}>{t.seePlans}</Button>
      </DialogContent>
    </Dialog>
  </>;
}
