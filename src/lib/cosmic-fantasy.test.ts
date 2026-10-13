import { describe, expect, it } from 'vitest';
import { distantPhenomena, distantGrain, fbm, interstellarSample, interstellarPixels, paintFantasyDepth, paintInterstellarMedium } from './cosmic-fantasy';

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

describe('Native-resolution sharp interstellar field', () => {
  const colors = ['#bb2266','#3366bb','#aa7722','#228866','#7733aa','#2299aa','#aa3322'];
  it('shares spatial noise between preview and export and protects the solar center', () => {
    expect(interstellarSample(256/1024, 768/1024, 42)).toEqual(interstellarSample(512/2048, 1536/2048, 42));
    expect(interstellarSample(.5, .47, 42).emission).toBe(0);
    for (let i=0; i<100; i++) {
      const s = interstellarSample(i/100, (i*7%100)/100, 42);
      expect(s.emission).toBeGreaterThanOrEqual(0); expect(s.emission).toBeLessThanOrEqual(1);
      expect(s.extinction).toBeGreaterThanOrEqual(0); expect(s.extinction).toBeLessThanOrEqual(1);
      expect(fbm(i*.1,i*.07,42)).toBeGreaterThanOrEqual(0);
    }
  });
  it('produces deterministic native pixels, black void and separate luminous cores', () => {
    const pixels = interstellarPixels(96,colors,42,'#010105','#edf5ff');
    expect(pixels).toEqual(interstellarPixels(96,colors,42,'#010105','#edf5ff'));
    expect(pixels).not.toEqual(interstellarPixels(96,colors,43,'#010105','#edf5ff'));
    let dark=0, bright=0, sharp=0;
    for(let i=0;i<pixels.length;i+=4) {
      expect(pixels[i+3]).toBe(255);
      const value=Math.max(pixels[i]??0,pixels[i+1]??0,pixels[i+2]??0);
      if(value<12) dark++; if(value>100) bright++;
      if(i>=4 && Math.abs(value-Math.max(pixels[i-4]??0,pixels[i-3]??0,pixels[i-2]??0))>40) sharp++;
    }
    expect(dark).toBeGreaterThan(1000); expect(bright).toBeGreaterThan(20); expect(sharp).toBeGreaterThan(100);
    expect(paintInterstellarMedium.toString()).not.toContain('drawImage');
    expect(paintFantasyDepth.toString()).not.toContain('createRadialGradient');
  });
});