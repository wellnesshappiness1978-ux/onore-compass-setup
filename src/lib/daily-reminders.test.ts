import { describe, expect, it } from 'vitest';
import { canPlayFullBgm, canUseBgmNotify, canUseEveningReset, effectiveReminder } from './daily-reminders';

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
});