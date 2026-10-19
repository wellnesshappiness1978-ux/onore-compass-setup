import type { TeamMember } from './team-analysis';
import type { PartnerInput } from './compatibility-analysis';
import { memberToProfile, type TeamGroup } from './focus';

export function savedPartner(member: TeamMember): PartnerInput {
  const p = memberToProfile(member);
  return { name: p.nameKanji, nameKana: p.nameKana, gender: p.gender,
    birthDate: p.birthDate, birthTime: p.birthTimeUnknown ? '' : p.birthTime.slice(0, 5),
    birthPlace: p.birthPlace, birthCity: p.birthCity,
    bloodType: (['A', 'B', 'O', 'AB'] as const).find(v => v === p.bloodType) ?? '',
    siblingOrder: (['first', 'middle', 'last', 'only'] as const).find(v => v === p.siblingOrder) ?? '' };
}
export const savedGroupMembers = (group: TeamGroup, members: TeamMember[]) =>
  members.filter(member => group.memberIds.includes(member.id));