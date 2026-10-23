import { expect, it } from 'vitest';
import { todaySample } from './today-samples';
it('keeps free fictional samples fixed across dates without random or AI generation',()=>{
  const clock = Date.now;
  try {
    Date.now = () => Date.UTC(2026,9,23);
    const first = todaySample('shopping','ja');
    Date.now = () => Date.UTC(2026,9,24);
    expect(todaySample('shopping','ja')).toBe(first);
    expect(first.length).toBeGreaterThan(60);
    expect(todaySample('monthlyLucky','ja')).not.toBe(first);
  } finally { Date.now = clock; }
});