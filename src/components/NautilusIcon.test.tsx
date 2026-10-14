import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NautilusIcon } from './NautilusIcon';

describe('nautilus jewelry geometry', () => {
  it('keeps the 90% circular rim and closed shell within its viewBox', () => {
    const svg = renderToStaticMarkup(<NautilusIcon family="sovereign" />);
    const path = svg.match(/class="nautilus-shell" d="([^"]+)"/)?.[1];
    expect(path).toBeDefined();
    if (!path) return;
    expect(path.endsWith('Z')).toBe(true);
    const points = [...path.matchAll(/[ML]([\d.]+) ([\d.]+)/g)].map(m => [Number(m[1]), Number(m[2])] as [number, number]);
    expect(points).toHaveLength(290);
    for (const [x, y] of points) {
      expect(x).toBeGreaterThan(7);
      expect(x).toBeLessThan(91);
      expect(y).toBeGreaterThan(7);
      expect(y).toBeLessThan(91);
    }
    const rim = points.slice(0, 145);
    let sweep = 0;
    for (let i = 1; i < rim.length; i++) {
      const a = rim[i - 1], b = rim[i];
      if (!a || !b) continue;
      const delta = Math.atan2(b[1] - 49, b[0] - 49) - Math.atan2(a[1] - 49, a[0] - 49);
      sweep += (delta + Math.PI * 2) % (Math.PI * 2);
    }
    expect(sweep / (Math.PI * 2)).toBeCloseTo(.9, 3);
    expect(svg.match(/class="nautilus-chamber"/g)).toHaveLength(22);
  });
});