import { describe, expect, it } from 'vitest';
import * as A from 'astronomy-engine';
import { natalSky } from './natal-sky';
describe('natal geometry', () => {
  it('uses ten bodies and the entered JST instant', () => {
    const sky = natalSky('1990-04-15', '08:30', false);
    expect(sky?.instant).toBe('1990-04-14T23:30:00.000Z');
    expect(sky?.approximate).toBe(false);
    expect(sky?.bodies).toHaveLength(10);
    expect(sky?.bodies[0]?.longitude).toBeCloseTo(A.SunPosition(new Date('1990-04-14T23:30:00Z')).elon, 8);
    sky?.bodies.forEach(body => {
      expect(body.longitude).toBeGreaterThanOrEqual(0);
      expect(body.longitude).toBeLessThan(360);
      expect(Math.hypot(body.chartPosition[0], body.chartPosition[1])).toBeCloseTo(3.5);
    });
  });
  it('labels unknown time and rejects invalid dates', () => {
    expect(natalSky('1990-04-15', '', true)?.approximate).toBe(true);
    expect(natalSky('1990-02-31', '12:00', false)).toBeNull();
  });
});