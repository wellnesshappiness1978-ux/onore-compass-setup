import type { Plan } from './design-modes';
import { planOrder } from './plans';

export type ReminderSetting = { on: boolean; time: string };
export const REMINDER_KEY = 'onore-feature-notify';
export const PAUSE_KEY = 'onore-notify-paused';
export const REMINDER_EVENT = 'onore-notify-change';
export const canPlayFullBgm = (plan: Plan) => planOrder.indexOf(plan) >= planOrder.indexOf('standard');
export const canUseBgmNotify = (plan: Plan) => planOrder.indexOf(plan) >= planOrder.indexOf('vip');
export const canUseEveningReset = canUseBgmNotify;

export function effectiveReminder(setting: ReminderSetting | undefined, paused: boolean, available = true): boolean {
  return Boolean(setting?.on && !paused && available);
}
export function readReminderSettings(): Record<string, ReminderSetting> {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(REMINDER_KEY) ?? '{}');
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    return Object.fromEntries(Object.entries(raw).flatMap(([id, value]) => {
      if (!value || typeof value !== 'object' || !('on' in value) || !('time' in value)) return [];
      return typeof value.on === 'boolean' && typeof value.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value.time) ? [[id, { on: value.on, time: value.time }]] : [];
    }));
  } catch { return {}; }
}
export function remindersPaused(): boolean {
  try { return localStorage.getItem(PAUSE_KEY) === 'true'; } catch { return false; }
}
export function setRemindersPaused(paused: boolean): void {
  localStorage.setItem(PAUSE_KEY, String(paused));
  window.dispatchEvent(new Event(REMINDER_EVENT));
}
export function migrateEveningReminder(): void {
  try {
    const settings = readReminderSettings();
    if (settings.eveningReset) return;
    const old = JSON.parse(localStorage.getItem('onore-reminders') ?? '{}');
    if (typeof old.night !== 'boolean') return;
    const time = typeof old.nightTime === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(old.nightTime) ? old.nightTime : '21:00';
    localStorage.setItem(REMINDER_KEY, JSON.stringify({ ...settings, eveningReset: { on: old.night, time } }));
    window.dispatchEvent(new Event(REMINDER_EVENT));
  } catch { /* retain legacy storage unchanged */ }
}