import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { birthAddressCopy } from "@/lib/birth-address";
import { groupTodayCopy, memberToday, roleAssignment, subjectDailyMessage } from "@/lib/group-today";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, Sparkles, Target, Trash2, Users, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useFocus } from "./FocusProvider";
import { addTeamGroup, deleteTeamGroup, updateTeamGroup } from "@/lib/team-groups.functions";
import { canAddGroup, focusCopy, selfReadingLabel, goalText, goalPresets, GROUPS_KEY, groupDisplayName, memberDisplayName, memberToProfile, mixHex, type TargetKind, type TeamGroup } from "@/lib/focus";
import { canUse, groupLimit, memberLimit } from "@/lib/plans";
import { familyCapacityCopy, fitsMemberCapacity, registeredMemberCount } from '@/lib/family-capacity';
import { birthColorNameForHex, birthColorSpectrum, localizeBirthColorName } from "@/lib/birth-color-spectrum";
import { groupBirthPalette, groupPaletteRoles } from "@/lib/group-palette";
import { birthColorCopy } from "@/lib/birth-color-copy";
import { colorExperienceCopy } from "@/lib/color-experience-copy";
import { colorReference, colorReferenceCopy } from "@/lib/color-reference";
import { LockKeyhole } from "lucide-react";
import { biorhythm, pairScore, type TeamMember } from "@/lib/team-analysis";
import type { Language } from "@/lib/translations";
import type { Plan } from "@/lib/design-modes";
import { groupColorMeaning, groupDayLine, groupInsightCopy, SELF_MEMBER_ID } from "@/lib/group-insight";

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
    <details id="focus-settings" className="group mx-auto w-full max-w-2xl scroll-mt-28 rounded-lg border border-destructive bg-card/60" aria-label={t.cardTitle}>
      <summary className="grid min-h-12 cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-3 sm:px-4 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 items-start gap-2 font-serif text-[0.95rem] leading-snug text-primary sm:items-center sm:text-lg"><Target className="mt-0.5 size-5 shrink-0 sm:mt-0" /><span className="min-w-0 [overflow-wrap:anywhere]"><span className="mb-1 block w-fit rounded-sm bg-destructive px-2 py-0.5 font-sans text-[11px] font-bold text-destructive-foreground">{birthAddressCopy[language].important}</span>{t.cardTitle}</span></span>
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

/** Fixed header badge: who the readings are about; tap opens the focus settings. */
export function SubjectHeaderBadge({ language, ownerName, onOpen }: { language: Language; ownerName: string; onOpen: () => void }) {
  const ctx = useFocus();
  if (!ctx) return <span aria-hidden="true" />;
  const t = focusCopy[language];
  const icon = ctx.group ? "👥" : ctx.member ? "👨‍👩‍👧" : "👤";
  const self = selfReadingLabel[language];
  const who = ctx.group ? (subjectWord(ctx, language) ?? ctx.label(language)) : ctx.member ? `${subjectWord(ctx, language) ?? ctx.label(language)}（${t.family}）` : `${self}${ownerName ? `（${ownerName}）` : ""}`;
  const fullName = ownerName.trim().replace(/[\s　]+/g, " ");
  return <Button variant="ghost" type="button" onClick={onOpen} title={t.cardTitle} aria-label={t.viewing(who)} className="mx-auto flex min-h-10 min-w-0 max-w-full items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-3 text-xs font-bold text-primary"><span aria-hidden="true">{icon}</span><span className="truncate">{t.viewing("")}{ctx.group || ctx.member ? who : (fullName ? `${self}・${fullName}` : self)}</span></Button>;
}

/** Small strip showing the current subject with a way back to self. */
export function SubjectBanner({ language }: { language: Language }) {
  const ctx = useFocus();
  if (!ctx || ctx.focus.targetKind === "self" || (!ctx.member && !ctx.group)) return null;
  const t = focusCopy[language];
  return <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm">
    <span className="flex min-w-0 flex-1 items-center justify-center gap-2 text-center text-primary">{ctx.group ? <Users className="size-4" /> : <UserRound className="size-4" />}{t.viewing(ctx.label(language))}</span>
    <Button size="sm" variant="outline" className="border-2 border-primary/70" onClick={() => ctx.setFocus({ ...ctx.focus, targetKind: "self", targetId: null })}>{t.backToSelf}</Button>
  </div>;
}

/** Group reading: group color, members' colors, harmony and today's average rhythm. */
export function GroupFocusCard({ language, plan, onUpgrade }: { language: Language; plan: Plan; onUpgrade: () => void }) {
  const ctx = useFocus();
  const t = focusCopy[language];
  const g = ctx?.group;
  const stats = useMemo(() => {
    if (!g) return null;
    const colors = g.members.map(m => ({ m, c: mainColor(m) }));
    const groupHex = mixHex(colors.map(x => x.c?.code ?? ""));
    const pairList: { a: TeamMember; b: TeamMember; score: number }[] = [];
    for (let i = 0; i < g.members.length; i++) for (let j = i + 1; j < g.members.length; j++) pairList.push({ a: g.members[i]!, b: g.members[j]!, score: pairScore(g.members[i]!, g.members[j]!) });
    pairList.sort((x, y) => y.score - x.score);
    const harmony = pairList.length ? Math.round(pairList.reduce((a, p) => a + p.score, 0) / pairList.length) : null;
    const today = new Date().toLocaleDateString("en-CA");
    const rhythms = g.members.map(m => ({ m, r: biorhythm(m.birthDate, today) })).sort((x, y) => y.r.total - x.r.total);
    const rhythm = rhythms.length ? Math.round(rhythms.reduce((a, x) => a + x.r.total, 0) / rhythms.length) : null;
    return { colors, groupHex, harmony, rhythm, pairList, rhythms };
  }, [g]);
  if (!g || !stats) return null;
  const name = groupDisplayName(g.group, g.index, language);
  const goal = ctx?.focus.goal.trim();
  return <section className="mb-6 rounded-lg border border-primary/30 bg-card/60 p-4 sm:p-5">
    <h2 className="font-serif text-xl text-gradient-gold sm:text-2xl">{t.traitsGroup(name)}</h2>
    {goal && <p className="mt-1 text-xs text-muted-foreground">{t.goalNote(goal)}</p>}
    {!g.members.length ? <p className="mt-3 text-sm text-muted-foreground">{t.groupEmpty}</p> : <>
      {stats.groupHex && <div className="mt-4 rounded-md p-4" style={{ background: `linear-gradient(135deg, ${stats.groupHex}, ${stats.groupHex}66)` }}><p className="text-xs font-bold text-outline text-foreground">{t.groupColor}</p><p className="mt-1 font-serif text-2xl font-bold text-outline text-foreground">{name} · {localizeBirthColorName(birthColorNameForHex(stats.groupHex), language)}</p><p className="mt-1 font-mono text-sm font-bold text-outline text-foreground">{stats.groupHex.toUpperCase()}</p></div>}
      <GroupSevenColors language={language} plan={plan} onUpgrade={onUpgrade} members={g.members} />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-md border border-primary/25 p-3 text-center"><p className="text-xs text-muted-foreground">{t.groupHarmony}</p><p className="font-serif text-2xl text-primary">{stats.harmony ?? "—"}{stats.harmony !== null && <span className="text-sm">/100</span>}</p></div>
        <div className="rounded-md border border-primary/25 p-3 text-center"><p className="text-xs text-muted-foreground">{t.groupRhythm}</p><p className="font-serif text-2xl text-primary">{stats.rhythm ?? "—"}<span className="text-sm">/100</span></p></div>
      </div>
      {stats.groupHex && (() => { const gm = groupColorMeaning(stats.groupHex, language); const gi = groupInsightCopy[language]; return <div className="mt-3 rounded-md border border-primary/25 p-3 text-sm leading-6"><p className="font-serif text-lg font-bold text-primary">{gm.name}</p><dl className="mt-2 space-y-2"><div><dt className="text-xs font-bold text-primary">{gi.essence}</dt><dd>{gm.essence}</dd></div><div><dt className="text-xs font-bold text-primary">{gi.energy}</dt><dd>{gm.energy}</dd></div><div><dt className="text-xs font-bold text-primary">{gi.role}</dt><dd>{gm.role}</dd></div><div><dt className="text-xs font-bold text-primary">{gi.advice}</dt><dd>{gm.advice}</dd></div></dl></div>; })()}
      {(() => { const gi = groupInsightCopy[language]; const pct = (v: number) => Math.round((v + 1) * 50); const top = stats.rhythms[0]; const low = stats.rhythms[stats.rhythms.length - 1]; const best = stats.pairList[0]; return <>
        <div className="mt-4 rounded-md border border-primary/25 p-3 text-sm leading-6"><h3 className="text-sm font-bold text-primary">{gi.today}</h3><p className="mt-1">{groupDayLine(stats.rhythm ?? 50, language)}</p>{top && <p className="mt-1">{gi.peak(memberDisplayName(top.m))}</p>}{low && low !== top && low.r.total < 45 && <p className="mt-1">{gi.care(memberDisplayName(low.m))}</p>}{best && <p className="mt-1">{gi.best(memberDisplayName(best.a), memberDisplayName(best.b))}</p>}</div>
        <h3 className="mt-4 text-sm text-primary">{gi.rhythmTable}</h3>
        <div className="mt-2 overflow-x-auto"><table className="w-full text-xs"><thead><tr className="text-muted-foreground"><th className="p-1 text-left"></th><th className="p-1">{gi.physical}</th><th className="p-1">{gi.emotional}</th><th className="p-1">{gi.intellectual}</th><th className="p-1">∑</th></tr></thead><tbody>{stats.rhythms.map(({ m, r }) => <tr key={m.id} className="border-t border-primary/15"><td className="max-w-28 truncate p-1 font-bold">{memberDisplayName(m)}</td><td className="p-1 text-center">{pct(r.physical)}</td><td className="p-1 text-center">{pct(r.emotional)}</td><td className="p-1 text-center">{pct(r.intellectual)}</td><td className="p-1 text-center text-primary">{r.total}</td></tr>)}</tbody></table></div>
        {stats.pairList.length > 0 && <><h3 className="mt-4 text-sm text-primary">{gi.map}</h3><ul className="mt-2 space-y-1.5">{stats.pairList.map(p => <li key={p.a.id + p.b.id} className="text-xs"><div className="flex justify-between gap-2"><span className="truncate">{memberDisplayName(p.a)} × {memberDisplayName(p.b)}</span><span className="text-primary">{p.score}</span></div><div className="mt-0.5 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${p.score}%` }} /></div></li>)}</ul></>}
        <p className="mt-3 text-[11px] text-muted-foreground">{gi.note}</p>
      </>; })()}
      <h3 className="mt-4 text-sm text-primary">{t.groupMembers}</h3>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">{stats.colors.map(({ m, c }) => <li key={m.id} className="flex items-center gap-3 rounded-md border border-primary/20 p-2"><span className="size-8 shrink-0 rounded-full border border-primary/40" style={{ background: c?.code }} /><span className="min-w-0"><span className="block truncate font-bold text-outline">{memberDisplayName(m)}</span><span className="block truncate text-xs text-muted-foreground">{c ? `${localizeBirthColorName(c.name, language)} ${c.code}` : "—"}</span></span></li>)}</ul>
    </>}
  </section>;
}

export function ArtOwnerOnlyNotice({ language, plan, onUpgrade }: { language: Language; plan: Plan; onUpgrade: () => void }) {
  const ctx = useFocus();
  if (!ctx || canUse(plan, "subjectArt") || ctx.focus.targetKind === "self" || (!ctx.member && !ctx.group)) return null;
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
  const [name, setName] = useState(""); const [nick, setNick] = useState(""); const [ids, setIds] = useState<string[]>([SELF_MEMBER_ID]);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState<"family" | "group" | null>(null);
  const add = useServerFn(addTeamGroup); const upd = useServerFn(updateTeamGroup); const del = useServerFn(deleteTeamGroup);
  if (!ctx) return null;
  const limit = groupLimit[plan];
  const capacity = memberLimit[plan];
  const capacityText = familyCapacityCopy[language];
  const reset = () => { setEditing(null); setName(""); setNick(""); setIds([SELF_MEMBER_ID]); };
  const writeLocal = (groups: TeamGroup[]) => { localStorage.setItem(GROUPS_KEY, JSON.stringify(groups)); ctx.reload(); };
  const save = async () => {
    if (!fitsMemberCapacity(ids, capacity)) { onUpgrade(); return; }
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
    } catch (e) { if (e instanceof Error && e.message.includes("GROUP_MEMBER_LIMIT")) onUpgrade(); else if (e instanceof Error && e.message.includes("GROUP_LIMIT")) setLimitOpen(true); else toast.error("Error"); }
    finally { setBusy(false); }
  };
  const remove = async (g: TeamGroup) => { if (ctx.serverBacked) { await del({ data: { id: g.id } }); ctx.reload(); } else writeLocal(ctx.groups.filter(x => x.id !== g.id)); };
  return <>
    <div role="tablist" className="mb-5 grid grid-cols-2 gap-2">
      {([["family", UserRound, t.familyEdit, () => { window.dispatchEvent(new Event("onore-family-edit")); window.setTimeout(() => document.getElementById("family-roster-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }], ["group", Users, t.groupEdit, () => { reset(); setOpen(true); }]] as const).map(([key, Icon, label, act]) => { const on = active === key; return <Button key={key} role="tab" aria-selected={on} variant="outline" className={`h-12 border-2 transition-all md:h-14 md:text-base ${on ? "border-primary bg-primary/20 font-bold text-primary shadow-champagne after:absolute after:inset-x-3 after:bottom-1 after:h-1 after:rounded-full after:bg-primary relative" : "border-primary/30 text-muted-foreground hover:text-foreground"}`} onClick={() => { setActive(key); act(); }}><Icon className={on ? "size-5 text-primary" : "size-4"} />{label}</Button>; })}
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
          <p className="text-sm text-primary">{t.members} · {capacityText.capacity(registeredMemberCount(ids), capacity)}</p>
          <p className="text-xs text-muted-foreground">{capacityText.excluded}</p>
          {<div className="flex flex-wrap gap-2">{[{ id: SELF_MEMBER_ID, label: groupInsightCopy[language].self }, ...ctx.members.map(m => ({ id: m.id, label: memberDisplayName(m) }))].map(m => { const on = ids.includes(m.id); return <Button key={m.id} type="button" size="sm" variant={on ? "default" : "outline"} aria-pressed={on} disabled={!on && m.id !== SELF_MEMBER_ID && registeredMemberCount(ids) >= capacity} onClick={() => setIds(on ? ids.filter(x => x !== m.id) : [...ids, m.id])}>{m.label}</Button>; })}</div>}{!ctx.members.length && <p className="text-xs text-muted-foreground">{t.noMembers}</p>}
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

/** Japanese subject wording: "あなた" → "〇〇さん" / "〇〇グループ" inside rendered readings (incl. AI text) while a non-self subject is fixed. */
export function subjectWord(ctx: NonNullable<ReturnType<typeof useFocus>>, language: Language): string | null {
  if (language !== "ja") return null;
  if (ctx.member) return `${memberDisplayName(ctx.member)}さん`;
  if (ctx.group) { const n = groupDisplayName(ctx.group.group, ctx.group.index, language); return n.includes("グループ") ? n : `${n}グループ`; }
  return null;
}
/** Quoted speech (「…」/『…』) and set phrases where あなた means someone else are kept verbatim. */
const SUBJECT_KEEP = /「[^」]*」|『[^』]*』|あなただけを見つめる/g;
export const replaceSubject = (text: string, word: string) => {
  let out = "", last = 0;
  for (const m of text.matchAll(SUBJECT_KEEP)) {
    out += text.slice(last, m.index).replace(/あなた(さん|様)?/g, word) + m[0];
    last = m.index + m[0].length;
  }
  return out + text.slice(last).replace(/あなた(さん|様)?/g, word);
};

export function SubjectVoice({ language, children }: { language: Language; children: ReactNode }) {
  const ctx = useFocus();
  const ref = useRef<HTMLDivElement>(null);
  const word = ctx ? subjectWord(ctx, language) : null;
  useEffect(() => {
    const root = ref.current;
    if (!root || !word) return;
    // Remember every original value so switching back to self restores JSX text exactly.
    const texts = new Map<Node, string>();
    const written = new WeakMap<Node, string>();
    const placeholders = new Map<Element, string>();
    // Fixed UI copy (buttons, labels, form controls, inputs, opted-out regions) is never rewritten.
    const skip = (n: Node) => !!n.parentElement?.closest("button,label,select,option,input,textarea,a,[role='button'],[role='tab'],[role='menuitem'],[contenteditable='true'],[data-subject-fixed]");
    const rewrite = (n: Node) => {
      const v = n.nodeValue;
      if (!v?.includes("あなた") || skip(n)) return;
      if (!texts.has(n)) texts.set(n, v);
      const next = replaceSubject(v, word);
      if (next !== v) { written.set(n, next); n.nodeValue = next; }
    };
    const fix = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) { rewrite(node); return; }
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) rewrite(n);
      if (node instanceof Element) node.querySelectorAll("input[placeholder*='あなた'],textarea[placeholder*='あなた']").forEach(el => {
        if (el.closest("[data-subject-fixed]")) return;
        const v = el.getAttribute("placeholder") ?? "";
        if (!placeholders.has(el)) placeholders.set(el, v);
        el.setAttribute("placeholder", replaceSubject(v, word));
      });
    };
    fix(root);
    // Ignore our own writes so the remembered original is never overwritten by replaced text.
    const obs = new MutationObserver(list => { for (const m of list) { if (m.type === "characterData") { if (written.get(m.target) === m.target.nodeValue) continue; texts.delete(m.target); rewrite(m.target); } else m.addedNodes.forEach(fix); } });
    obs.observe(root, { subtree: true, childList: true, characterData: true });
    return () => {
      obs.disconnect();
      texts.forEach((v, n) => { if (n.isConnected) n.nodeValue = v; });
      placeholders.forEach((v, el) => { if (el.isConnected) el.setAttribute("placeholder", v); });
    };
  }, [word]);
  // Keyed by subject so React re-renders pristine JSX text whenever the subject changes.
  return <div ref={ref} key={word ?? "self"} className="min-w-0">{children}</div>;
}

/** Daily message tailored to the fixed subject (self / person / group) and goal. */
export function SubjectDailyNote({ language }: { language: Language }) {
  const ctx = useFocus();
  if (!ctx) return null;
  const day = new Date().toLocaleDateString("en-CA");
  const who = ctx.group ? groupDisplayName(ctx.group.group, ctx.group.index, language) : ctx.member ? memberDisplayName(ctx.member) : selfReadingLabel[language];
  const birth = ctx.group ? null : ctx.readingProfile.birthDate || null;
  const key = ctx.group?.group.id ?? ctx.member?.id ?? "self";
  const lines = subjectDailyMessage(key, birth, day, goalText(ctx.focus, language), language);
  return <section className="mb-5 rounded-lg border border-primary/40 bg-primary/5 p-4 text-left">
    <h3 className="font-serif text-lg text-primary">✦ {groupTodayCopy[language].dailyTitle(language === "ja" && (ctx.group || ctx.member) ? (subjectWord(ctx, language) ?? who) : who)}</h3>
    {lines.map(l => <p key={l} className="mt-2 text-sm leading-7">{l}</p>)}
  </section>;
}

/** Group extras: every member's reading for today, interactions, role assignment and synergy. */
export function GroupMembersToday({ language }: { language: Language }) {
  const ctx = useFocus();
  const g = ctx?.group;
  if (!g || !g.members.length) return null;
  const c = groupTodayCopy[language];
  const day = new Date().toLocaleDateString("en-CA");
  const list = g.members.map(m => memberToday(m, day)).sort((a, b) => b.total - a.total);
  const roles = roleAssignment(list, day);
  const nameOf = (id: string | null) => { const m = g.members.find(x => x.id === id); return m ? memberDisplayName(m) : "—"; };
  const roleNames = [...new Set(list.map(x => c.role[x.role]))].join("・");
  const care = list.filter(x => x.band === "care").length;
  return <section className="mb-6 space-y-4 rounded-lg border border-primary/30 bg-card/60 p-4 text-left sm:p-5">
    <div><h3 className="font-serif text-lg text-primary">{c.synergyTitle}</h3>
      <p className="mt-2 text-sm leading-7"><strong className="text-primary">{c.strengths}：</strong>{c.strengthLine(roleNames)}</p>
      <p className="mt-1 text-sm leading-7"><strong className="text-primary">{c.issues}：</strong>{care ? c.issueLine(care) : c.noIssue}</p></div>
    <div><h3 className="font-serif text-lg text-primary">{c.interactionTitle}</h3>
      <p className="mt-2 text-sm font-bold">{c.keyPerson(memberDisplayName(list[0]!.member))}</p>
      <h4 className="mt-3 text-sm text-primary">{c.assignTitle}</h4>
      <ul className="mt-1 grid gap-1 text-sm sm:grid-cols-3">{(["physical", "emotional", "intellectual"] as const).map(a => <li key={a} className="rounded-md border border-primary/20 p-2"><span className="block text-xs text-muted-foreground">{c.role[a]}</span><strong>{nameOf(roles[a])}</strong></li>)}</ul></div>
    <div><h3 className="font-serif text-lg text-primary">{c.membersTitle}</h3>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">{list.map(x => <li key={x.member.id} className="rounded-md border border-primary/20 p-3 text-sm leading-6">
        <div className="flex justify-between gap-2"><strong className="truncate">{memberDisplayName(x.member)}</strong><span className="text-primary">{x.total}/100</span></div>
        <p>{c.band[x.band]}</p>
        <p className="text-xs"><span className="text-primary">{c.roleLabel}：</span>{c.role[x.role]}</p>
        <p className="text-xs"><span className="text-primary">{c.cautionLabel}：</span>{c.caution[x.caution]}</p>
      </li>)}</ul></div>
  </section>;
}

const groupColorsCopy: Record<Language, { title: string; intro: string; lockTitle: string; lockBody: string; cta: string; psych: string; cue: string }> = {
  ja: { title: "グループの全7カラー", intro: "メンバー全員の各ジャンルのカラーを重ね合わせた、グループの7色です。", lockTitle: "グループの全7色はVIPプラン以上で解放", lockBody: "VIPプラン以上で、グループ全員の7つのカラーの名称と、ご本人の診断と同じ詳しさの解説をご覧いただけます。", cta: "VIPプランを見る", psych: "色の印象", cue: "活かし方のヒント" },
  en: { title: "The group's seven colors", intro: "Seven group colors blended from every member's color in each genre.", lockTitle: "All seven group colors unlock with VIP", lockBody: "With VIP or above, see the names of all seven group colors and explanations as detailed as your own reading.", cta: "View VIP plan", psych: "Impression", cue: "How to use it" },
  "zh-CN": { title: "群组全部7色", intro: "将全体成员各类别颜色叠加而成的群组7色。", lockTitle: "群组全部7色在VIP方案及以上解锁", lockBody: "VIP方案及以上可查看群组全部7色的名称，以及与本人诊断同等详细的解说。", cta: "查看VIP方案", psych: "颜色印象", cue: "运用提示" },
  "zh-TW": { title: "群組全部7色", intro: "將全體成員各類別顏色疊加而成的群組7色。", lockTitle: "群組全部7色在VIP方案以上解鎖", lockBody: "VIP方案以上可查看群組全部7色的名稱，以及與本人診斷同等詳細的解說。", cta: "查看VIP方案", psych: "顏色印象", cue: "運用提示" },
  ko: { title: "그룹의 전체 7컬러", intro: "멤버 전원의 장르별 컬러를 겹쳐 만든 그룹의 7색입니다.", lockTitle: "그룹 전체 7색은 VIP 플랜 이상에서 해제", lockBody: "VIP 플랜 이상에서 그룹 7색의 이름과 본인 진단과 같은 수준의 자세한 해설을 볼 수 있습니다.", cta: "VIP 플랜 보기", psych: "색의 인상", cue: "활용 힌트" },
  es: { title: "Los siete colores del grupo", intro: "Siete colores del grupo mezclando el color de cada miembro en cada género.", lockTitle: "Los siete colores del grupo se desbloquean con VIP", lockBody: "Con VIP o superior verás los nombres de los siete colores del grupo y explicaciones tan detalladas como tu propia lectura.", cta: "Ver plan VIP", psych: "Impresión", cue: "Cómo aprovecharlo" },
  fr: { title: "Les sept couleurs du groupe", intro: "Sept couleurs de groupe issues du mélange des couleurs de chaque membre par genre.", lockTitle: "Les sept couleurs du groupe se débloquent avec VIP", lockBody: "Avec VIP ou plus, découvrez les noms des sept couleurs du groupe et des explications aussi détaillées que votre lecture.", cta: "Voir l'offre VIP", psych: "Impression", cue: "Comment l'utiliser" },
};

/** VIP+: the group's seven named colors with full explanations; lower plans see an upgrade prompt. */
function GroupSevenColors({ language, plan, onUpgrade, members }: { language: Language; plan: Plan; onUpgrade: () => void; members: TeamMember[] }) {
  const palette = useMemo(() => groupBirthPalette(members), [members]);
  if (!palette) return null;
  const c = groupColorsCopy[language], roles = birthColorCopy[language].roles, exp = colorExperienceCopy[language], ref = colorReferenceCopy[language];
  if (!canUse(plan, "groupColorsFull")) return <div role="note" className="mt-4 rounded-md border border-dashed border-primary/50 p-4 text-center" data-testid="group-colors-locked"><LockKeyhole className="mx-auto size-5 text-primary" aria-hidden="true" /><p className="mt-2 font-serif text-primary">{c.lockTitle}</p><p className="mt-1 text-sm leading-6">{c.lockBody}</p><Button size="sm" variant="champagne" className="mt-3" onClick={onUpgrade}>{c.cta}</Button></div>;
  return <section className="mt-4" data-testid="group-seven-colors"><h3 className="text-sm font-bold text-primary">{c.title}</h3><p className="mt-1 text-xs text-muted-foreground">{c.intro}</p>
    <ul className="mt-3 grid gap-3 sm:grid-cols-2">{groupPaletteRoles.map(r => { const col = palette[r]; const e = colorReference(col.code); return <li key={r} className="min-w-0 rounded-md border border-primary/25 p-3 [overflow-wrap:anywhere]">
      <div className="flex items-center gap-3"><span className="size-9 shrink-0 rounded-full border border-primary/40" style={{ backgroundColor: col.code }} aria-hidden="true" /><div className="min-w-0"><p className="text-xs text-muted-foreground">{roles[r].label}</p><p className="font-serif font-bold text-primary">{localizeBirthColorName(col.name, language)} <span className="font-mono text-xs">{col.code}</span></p></div></div>
      <p className="mt-2 text-xs leading-6">{roles[r].detail}</p>
      <p className="mt-2 text-xs font-bold text-primary">{c.psych}</p><p className="text-xs leading-6">{exp.psych[e.index]}</p>
      <p className="mt-2 text-xs font-bold text-primary">{c.cue}</p><p className="text-xs leading-6">{ref.cues[e.index]}</p>
    </li>; })}</ul></section>;
}
