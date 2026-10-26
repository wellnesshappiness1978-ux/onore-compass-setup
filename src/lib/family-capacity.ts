import { z } from 'zod';
import { SELF_MEMBER_ID } from './group-insight';
import type { Language } from './translations';
import type { Plan } from './design-modes';
import { memberLimit } from './plans';

/** Registration never depends on Family analytics or a signed-in display preview. */
export function familyRegistrationAccess(signedIn: boolean, actualPlan: Plan, displayPlan: Plan, count: number) {
  const plan = signedIn ? actualPlan : displayPlan;
  const limit = memberLimit[plan];
  return { plan, limit, canAdd: count < limit };
}

export const otherMemberIds = (ids: readonly string[]) => [...new Set(ids)].filter(id => id !== SELF_MEMBER_ID);
export const registeredMemberCount = (ids: readonly string[]) => otherMemberIds(ids).length;
export const fitsMemberCapacity = (ids: readonly string[], limit: number) => registeredMemberCount(ids) <= limit;
export const groupInput = z.object({
  name: z.string().trim().max(60),
  nickname: z.string().trim().max(40),
  memberIds: z.array(z.string().uuid()).max(101).transform(ids => [...new Set(ids)])
    .refine(ids => registeredMemberCount(ids) <= 100, 'GROUP_MEMBER_LIMIT'),
});
type OwnerCopy = { owner: string; excluded: string; capacity: (used: number, limit: number) => string };
export const familyCapacityCopy: Record<Language, OwnerCopy> = {
  ja: { owner: '契約者本人', excluded: '本人は登録枠を消費しません', capacity: (n,l) => `本人以外 ${n} / ${l}名` },
  en: { owner: 'Account holder', excluded: 'The account holder uses no member slot', capacity: (n,l) => `Other members ${n} / ${l}` },
  'zh-CN': { owner: '账户本人', excluded: '本人不占用成员名额', capacity: (n,l) => `其他成员 ${n} / ${l}人` },
  'zh-TW': { owner: '帳戶本人', excluded: '本人不佔用成員名額', capacity: (n,l) => `其他成員 ${n} / ${l}人` },
  ko: { owner: '계정 본인', excluded: '본인은 등록 인원 한도를 사용하지 않습니다', capacity: (n,l) => `다른 구성원 ${n} / ${l}명` },
  es: { owner: 'Titular de la cuenta', excluded: 'El titular no ocupa una plaza', capacity: (n,l) => `Otros miembros ${n} / ${l}` },
  fr: { owner: 'Titulaire du compte', excluded: 'Le titulaire ne prend aucune place', capacity: (n,l) => `Autres membres ${n} / ${l}` },
};