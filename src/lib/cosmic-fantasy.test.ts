import { describe, expect, it } from 'vitest';
import { distantPhenomena, distantGrain } from './cosmic-fantasy';

describe('Distant fantasy phenomena', () => {
  it('distinguishes every morphology and contains luminous grains', () => {
    const kinds = distantPhenomena(42).map(f => f.kind);
    expect(new Set(kinds.map(k => JSON.stringify(distantGrain(k,.61,1.1,.24)))).size).toBe(7);
    for (const kind of kinds) for (let i=0;i<=100;i++) {
      const point=distantGrain(kind,i/100,i*.73,Math.sin(i)*.5);
      expect(Math.abs(point.x)).toBeLessThanOrEqual(1.5);
      expect(Math.abs(point.y)).toBeLessThanOrEqual(1);
    }
  });
  it('keeps all seven prioritized roles deterministic and away from the solar core', () => {
    const fields = distantPhenomena(42);
    expect(fields).toEqual(distantPhenomena(42));
    expect(fields).not.toEqual(distantPhenomena(43));
    expect(new Set(fields.map(f => f.kind)).size).toBe(7);
    expect(fields.map(f => f.role)).toEqual([0,1,2,3,4,5,6]);
    fields.forEach((f,i) => {
      expect(f.x - f.radius * 1.65).toBeGreaterThan(0);
      expect(f.x + f.radius * 1.65).toBeLessThan(1);
      expect(f.y - f.radius).toBeGreaterThan(0);
      expect(f.y + f.radius).toBeLessThan(1);
      if(i) expect(f.weight).toBeLessThan(fields[i-1]?.weight ?? 0);
      expect(Math.hypot(f.x-.5,f.y-.47)).toBeGreaterThan(.2);
    });
  });
});