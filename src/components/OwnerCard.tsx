import { Crown } from "lucide-react";
import { teamCopy } from "@/lib/team-copy";
import { ownerBadgeCopy } from "@/lib/focus";
import type { UserProfile } from "./Onboarding";
import type { Plan } from "@/lib/design-modes";
import type { Language } from "@/lib/translations";

/** Gold owner card: name, birth details and current plan — shown first wherever people are listed. */
export default function OwnerCard({ profile, plan, language, compact = false }: { profile: UserProfile; plan: Plan; language: Language; compact?: boolean }) {
  const name = profile.nameKanji || profile.nameRomaji || "—";
  const birth = [profile.birthDate || "—", profile.birthTimeUnknown ? "--:--" : profile.birthTime || "--:--", profile.birthPlace || profile.birthCity || "—"].join(" · ");
  return (
    <div data-owner-card className="rounded-lg border-2 border-primary/60 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-3 shadow-champagne">
      <p className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-champagne-gradient px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground"><Crown className="size-3" aria-hidden="true" />{ownerBadgeCopy[language]}</span>
        <span className="ml-auto text-xs font-bold text-primary">{teamCopy[language].planNames[plan]}</span>
      </p>
      <p className="mt-1.5 font-serif text-base font-bold text-foreground">{name}</p>
      {!compact && <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{birth}</p>}
    </div>
  );
}
