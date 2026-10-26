import type { TeamMember } from './team-analysis';
import type { PartnerInput } from './compatibility-analysis';
import { memberDisplayName, memberToProfile, type TeamGroup } from './focus';
import { SELF_MEMBER_ID } from './group-insight';

export function savedPartner(member: TeamMember): PartnerInput {
  const p = memberToProfile(member);
  return { name: memberDisplayName(member).slice(0, 40), nameKana: p.nameKana, gender: p.gender,
    birthDate: p.birthDate, birthTime: p.birthTimeUnknown ? '' : p.birthTime.slice(0, 5),
    birthPlace: p.birthPlace, birthCity: p.birthCity,
    bloodType: (['A', 'B', 'O', 'AB'] as const).find(v => v === p.bloodType) ?? '',
    siblingOrder: String(p.siblingOrder ?? '').slice(0, 80) };
}

/** Every registered member of the group, in group order, merged across roster sources and never the owner. */
export function savedGroupMembers(group: TeamGroup, ...lists: TeamMember[][]): TeamMember[] {
  const byId = new Map<string, TeamMember>();
  for (const list of lists) for (const m of list) if (!byId.has(m.id)) byId.set(m.id, m);
  return [...new Set(group.memberIds)].filter(id => id !== SELF_MEMBER_ID).flatMap(id => { const m = byId.get(id); return m ? [m] : []; });
}

/** Splits the first reading paragraph so the owner's traits show once and each member keeps only pair-specific text. */
export function splitGroupReading(first: string): { owner: string; pair: string } {
  const [intro = '', ...rest] = first.split('\n\n');
  const at = intro.indexOf('お相手は、');
  if (at < 0) return { owner: first, pair: '' };
  const partner = intro.slice(at + 'お相手は、'.length);
  return { owner: intro.slice(0, at).trim(), pair: [`この方は、${partner}`, ...rest].join('\n\n') };
}
