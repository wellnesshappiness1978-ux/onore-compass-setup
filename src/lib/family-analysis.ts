import { computeCoreLayers } from "./ai/core-layers";
import { memberToProfile } from "./focus";
import { biorhythm, pairScore, relation, roleOf, type TeamMember } from "./team-analysis";
import { groupBirthPalette } from "./group-palette";
import { birthColorSpectrum } from "./birth-color-spectrum";
import { computeExtendedArts } from './extended-arts';
import { nineStarProfile } from './calendar-traditions';
import { helioPhase } from './ai/helio-phase';
import { approachStatuses } from './trait-reading';

/** Derived layers remain separately inspectable; scores are illustrative, not validated. */
export function analyzeFamily(members: TeamMember[], day: string) {
  const entries = members.map(member => {
    const profile = memberToProfile(member);
    const core = computeCoreLayers(profile, new Date(`${day}T12:00:00Z`));
    const colors = birthColorSpectrum(profile);
    const earth = helioPhase(profile.birthDate);
    const nineStars = nineStarProfile(profile.birthDate,profile.birthTime,profile.birthTimeUnknown,profile.gender);
    const extended = computeExtendedArts(profile.birthDate,profile.birthTime,profile.birthTimeUnknown);
    const availability = approachStatuses({core:Boolean(core),earth:Boolean(earth),nineStars:Boolean(nineStars),color:Boolean(colors),blood:Boolean(profile.bloodType),name:Boolean(core?.name),siblings:Boolean(profile.siblingOrder),region:Boolean(profile.birthPlace || profile.birthCity)});
    return { member, core, extended, nineStars, earth, availability, rhythm: biorhythm(member.birthDate, day), role: roleOf(member), colors };
  });
  const pairs = entries.flatMap((a, i) => entries.slice(i + 1).map(b => {
    const rhythm = Math.round((1 - (Math.abs(a.rhythm.physical-b.rhythm.physical) + Math.abs(a.rhythm.emotional-b.rhythm.emotional) + Math.abs(a.rhythm.intellectual-b.rhythm.intellectual))/6)*100);
    const sky = a.core && b.core ? (a.core.western.sunElement === b.core.western.sunElement ? 80 : 60) : null;
    return { a, b, element: pairScore(a.member,b.member), relation: relation(a.member,b.member), rhythm, sky,
      score: Math.round((pairScore(a.member,b.member) + rhythm + (sky ?? 0))/(sky === null ? 2 : 3)) };
  }));
  const roadmap = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(`${day}T12:00:00Z`); date.setUTCDate(date.getUTCDate()+i);
    const iso = date.toISOString().slice(0,10);
    const ranked = members.map(member => ({ member, rhythm: biorhythm(member.birthDate,iso) })).sort((a,b) => b.rhythm.total-a.rhythm.total);
    return { day: iso, score: ranked.length ? Math.round(ranked.reduce((s,r)=>s+r.rhythm.total,0)/ranked.length) : 0, lead: ranked[0]?.member, support: ranked.at(-1)?.member };
  });
  return { entries, pairs, roadmap, palette: groupBirthPalette(members) };
}