import { pianoTones } from './ambient-piano';
export const BGM_PREF_KEY = 'onore-bgm-reminder-preferences';
export const RELATION_PREF_KEY = 'onore-relations-reminder-person';
export function validBgmPreference(value: unknown): { hz: number; volume: number } | null {
  if (!value || typeof value !== 'object' || !('hz' in value) || !('volume' in value)) return null;
  if (typeof value.hz !== 'number' || !pianoTones.some(h => h === value.hz) || typeof value.volume !== 'number' || !Number.isFinite(value.volume)) return null;
  return { hz: value.hz, volume: Math.max(0, Math.min(1, value.volume)) };
}