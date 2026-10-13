import { describe, expect, it } from 'vitest';
import { distantPhenomena } from './cosmic-fantasy';

describe('Distant fantasy phenomena', () => {
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