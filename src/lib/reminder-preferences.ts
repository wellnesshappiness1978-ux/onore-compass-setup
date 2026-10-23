import { pianoTones } from './ambient-piano';
import { defaultFocus, goalPresets, goalText, type Focus } from './focus';
import type { Language } from './translations';
export const BGM_PREF_KEY = 'onore-bgm-reminder-preferences';
export const RELATION_PREF_KEY = 'onore-relations-reminder-person';
export function validBgmPreference(value: unknown): { hz: number; volume: number } | null {
  if (!value || typeof value !== 'object' || !('hz' in value) || !('volume' in value)) return null;
  if (typeof value.hz !== 'number' || !pianoTones.some(h => h === value.hz) || typeof value.volume !== 'number' || !Number.isFinite(value.volume)) return null;
  return { hz: value.hz, volume: Math.max(0, Math.min(1, value.volume)) };
}
export const RELATION_GOAL_KEY = 'onore-relations-reminder-goal';
export const RELATION_PREF_EVENT = 'onore-relations-preferences-change';
export type RelationshipGoal = Pick<Focus, 'goal' | 'goalPreset'>;
export const defaultRelationshipGoal: RelationshipGoal = { goal: '', goalPreset: '' };
export function validRelationshipGoal(value: unknown): RelationshipGoal {
 if (!value || typeof value !== 'object') return { ...defaultRelationshipGoal };
 return { goal: 'goal' in value && typeof value.goal === 'string' ? value.goal.trim().slice(0,200) : '', goalPreset: 'goalPreset' in value && goalPresets.some(p => p === value.goalPreset) ? String(value.goalPreset) : '' };
}
/** Never inherits the app default goal. */
export function relationshipGoalText(value: RelationshipGoal, language: Language): string {
 return goalText({ ...defaultFocus, ...validRelationshipGoal(value) }, language);
}
