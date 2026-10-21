import { afterEach, describe, expect, it, vi } from 'vitest';
import { canPlayFullBgm, canUseBgmNotify, canUseEveningReset, effectiveReminder, migrateEveningReminder, PAUSE_KEY, readReminderSettings, REMINDER_KEY, remindersPaused, setRemindersPaused } from './daily-reminders';

afterEach(() => vi.unstubAllGlobals());

describe('daily reminder and music rules', () => {
  it('unlocks all nine frequencies at Standard, not Free', () => {
    expect(['free','standard','vip','b2b','b2b-premium'].map(p => canPlayFullBgm(p as Parameters<typeof canPlayFullBgm>[0]))).toEqual([false,true,true,true,true]);
  });
  it('unlocks daily BGM reminders only at VIP and above', () => {
    expect(['free','standard','vip','b2b','b2b-premium'].map(p => canUseBgmNotify(p as Parameters<typeof canUseBgmNotify>[0]))).toEqual([false,false,true,true,true]);
  });
  it('unlocks evening reset only at VIP and above', () => {
    expect(['free','standard','vip','b2b','b2b-premium'].map(p => canUseEveningReset(p as Parameters<typeof canUseEveningReset>[0]))).toEqual([false,false,true,true,true]);
  });
  it('master pause suppresses every enabled reminder without changing saved times or switches', () => {
    const saved = [{ on:true, time:'08:00' }, { on:false, time:'12:30' }, { on:true, time:'21:00' }];
    expect(saved.map(s => effectiveReminder(s,true))).toEqual([false,false,false]);
    expect(saved).toEqual([{ on:true,time:'08:00' },{ on:false,time:'12:30' },{ on:true,time:'21:00' }]);
    expect(saved.map(s => effectiveReminder(s,false))).toEqual([true,false,true]);
  });
  it('resuming never unlocks a reminder outside the current plan', () => {
    expect(effectiveReminder({on:true,time:'21:00'},false,false)).toBe(false);
  });
  it('persists pause and restores enabled reminders without overwriting their saved settings', () => {
    const saved = JSON.stringify({ eveningReset: { on: true, time: '22:15' }, bgm: { on: false, time: '08:00' } });
    const storage = new Map([[REMINDER_KEY, saved]]);
    vi.stubGlobal('localStorage', { getItem: (k: string) => storage.get(k) ?? null, setItem: (k: string, v: string) => storage.set(k,v) });
    vi.stubGlobal('window', new EventTarget());
    setRemindersPaused(true);
    expect(storage.get(PAUSE_KEY)).toBe('true');
    expect(effectiveReminder(readReminderSettings()['eveningReset'], remindersPaused())).toBe(false);
    setRemindersPaused(false);
    expect(storage.get(REMINDER_KEY)).toBe(saved);
    expect(effectiveReminder(readReminderSettings()['eveningReset'], remindersPaused())).toBe(true);
    expect(effectiveReminder(readReminderSettings()['bgm'], remindersPaused())).toBe(false);
  });
  it('migrates the saved legacy evening time without altering old data or existing reminders', () => {
    const old = JSON.stringify({ night: true, nightTime: '21:30', morning: true });
    const storage = new Map([['onore-reminders', old], [REMINDER_KEY, JSON.stringify({bgm:{on:false,time:'09:00'}})]]);
    vi.stubGlobal('localStorage', { getItem: (k: string) => storage.get(k) ?? null, setItem: (k: string, v: string) => storage.set(k,v) });
    vi.stubGlobal('window', new EventTarget());
    migrateEveningReminder();
    expect(readReminderSettings()).toEqual({bgm:{on:false,time:'09:00'},eveningReset:{on:true,time:'21:30'}});
    expect(storage.get('onore-reminders')).toBe(old);
  });
});