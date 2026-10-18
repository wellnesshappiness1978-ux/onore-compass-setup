import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listTeamMembers } from "@/lib/team-members.functions";
import { getFocus, listTeamGroups, saveFocus } from "@/lib/team-groups.functions";
import { readPreviewMembers } from "@/lib/consultation-targets";
import type { TeamMember } from "@/lib/team-analysis";
import type { Language } from "@/lib/translations";
import { defaultFocus, FOCUS_KEY, focusCopy, groupDisplayName, memberDisplayName, memberToProfile, readLocalFocus, readLocalGroups, type Focus, type TeamGroup } from "@/lib/focus";
import type { UserProfile } from "./Onboarding";

type Ctx = {
  focus: Focus; setFocus: (f: Focus) => Promise<void>;
  members: TeamMember[]; groups: TeamGroup[]; reload: () => void; serverBacked: boolean;
  /** Selected family member (resolved), or null. */
  member: TeamMember | null;
  /** Selected group (resolved) with its index, or null. */
  group: { group: TeamGroup; index: number; members: TeamMember[] } | null;
  /** Display label for the current subject. */
  label: (language: Language) => string;
  /** Profile for personal readings: selected family member or owner. */
  readingProfile: UserProfile;
};
const FocusContext = createContext<Ctx | null>(null);

export function FocusProvider({ owner, serverBacked, children }: { owner: UserProfile; serverBacked: boolean; children: ReactNode }) {
  const [focus, setLocal] = useState<Focus>(defaultFocus);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [groups, setGroups] = useState<TeamGroup[]>([]);
  const [tick, setTick] = useState(0);
  const listM = useServerFn(listTeamMembers);
  const listG = useServerFn(listTeamGroups);
  const getF = useServerFn(getFocus);
  const saveF = useServerFn(saveFocus);
  const reload = useCallback(() => setTick(t => t + 1), []);
  useEffect(() => {
    let active = true;
    setLocal(readLocalFocus());
    if (serverBacked) {
      listM().then(v => active && setMembers(v)).catch(() => active && setMembers([]));
      listG().then(v => active && setGroups(v)).catch(() => active && setGroups([]));
      getF().then(v => { if (active && v) { setLocal(v); localStorage.setItem(FOCUS_KEY, JSON.stringify(v)); } }).catch(() => undefined);
    } else { setMembers(readPreviewMembers()); setGroups(readLocalGroups()); }
    return () => { active = false; };
  }, [serverBacked, tick, listM, listG, getF]);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => { if (e.key === "onore-team" || e.key === "onore-groups") reload(); };
    window.addEventListener("storage", onStorage);
    window.addEventListener("onore-focus-reload", reload);
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("onore-focus-reload", reload); };
  }, [reload]);
  const setFocus = useCallback(async (f: Focus) => {
    setLocal(f);
    localStorage.setItem(FOCUS_KEY, JSON.stringify(f));
    if (serverBacked) await saveF({ data: f });
  }, [serverBacked, saveF]);
  const value = useMemo<Ctx>(() => {
    const member = focus.targetKind === "family" ? members.find(m => m.id === focus.targetId) ?? null : null;
    const gi = focus.targetKind === "group" ? groups.findIndex(g => g.id === focus.targetId) : -1;
    const g = gi >= 0 ? groups[gi]! : null;
    const group = g ? { group: g, index: gi, members: members.filter(m => g.memberIds.includes(m.id)) } : null;
    return {
      focus, setFocus, members, groups, reload, serverBacked, member, group,
      label: (language) => member ? memberDisplayName(member) : group ? groupDisplayName(group.group, group.index, language) : focusCopy[language].self,
      readingProfile: member ? memberToProfile(member) : owner,
    };
  }, [focus, setFocus, members, groups, reload, serverBacked, owner]);
  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

export function useFocus(): Ctx | null { return useContext(FocusContext); }
