import { expect, it } from 'vitest';
import { buildTodayDepth } from './today-depth';
const context={date:'2026-10-19',day:292,total:60,physical:35,emotional:-20,intellectual:80,goal:'毎朝10分勉強する',members:4};
it('keeps richer personal advice on Standard+, rhythms on VIP+, family on Family+',()=>{
  expect(buildTodayDepth('starPath','free','ja',context)).toBeNull();
  expect(buildTodayDepth('starPath','standard','ja',context)?.paragraphs).toHaveLength(4);
  expect(buildTodayDepth('biorhythm','standard','ja',context)).toBeNull();
  expect(buildTodayDepth('biorhythm','vip','ja',context)?.paragraphs).toHaveLength(4);
  expect(buildTodayDepth('family','vip','ja',context)).toBeNull();
  expect(buildTodayDepth('family','b2b','ja',context)?.paragraphs).toHaveLength(2);
});
it('is deterministic and never mutates calculated signals',()=>{
  const original={...context};
  expect(buildTodayDepth('helio','vip','ja',context)).toEqual(buildTodayDepth('helio','vip','ja',context));
  expect(context).toEqual(original);
});