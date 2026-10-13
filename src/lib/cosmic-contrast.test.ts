import { describe, expect, it } from 'vitest';
import { cosmicGiantDust, cosmicSilenceRegions } from './cosmic-contrast';
describe('rear celestial contrast masks',()=>{
 it('keeps local dust deterministic, bounded to giants and outside the solar silence core',()=>{
  const sun={x:500,y:470,radius:60}, planets=[{x:800,y:400,radius:40,ringOuterRadius:40,id:'jupiter'},{x:250,y:300,radius:30,ringOuterRadius:65,id:'saturn'},{x:520,y:500,radius:20,ringOuterRadius:20,id:'earth'}];
  const dust=cosmicGiantDust(sun,planets,91);
  expect(dust).toEqual(cosmicGiantDust(sun,planets,91));
  expect(dust.length).toBeGreaterThan(300);
  expect(dust.every(p=>Math.hypot(p.x-sun.x,p.y-sun.y)>sun.radius*3.4)).toBe(true);
  expect(dust.every(p=>planets.slice(0,2).some(g=>{const d=Math.hypot(p.x-g.x,p.y-g.y),r=g.id==='saturn'?g.ringOuterRadius:g.radius;return d>=r*1.12-1e-8&&d<=r*2.07+1e-8}))).toBe(true);
 });
 it('gives the Sun an opaque black core and includes Saturn rings without changing coordinates',()=>{
  const sun={x:512,y:480,radius:36},planets=[{x:240,y:300,radius:20,ringOuterRadius:40,id:'saturn'}];
  const regions=cosmicSilenceRegions(sun,planets);
  expect(regions[0]).toEqual({x:512,y:480,core:55.800000000000004,outer:122.39999999999999,opacity:1});
  expect(regions[1]?.core).toBeCloseTo(36.8);
  expect(regions[1]?.outer).toBe(74);
  expect(regions[1]?.opacity).toBe(.68);
  expect(planets[0]?.x).toBe(240);
 });
});