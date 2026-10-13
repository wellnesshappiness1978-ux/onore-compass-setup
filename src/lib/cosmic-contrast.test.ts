import { describe, expect, it } from 'vitest';
import { cosmicSilenceRegions } from './cosmic-contrast';
describe('rear celestial contrast masks',()=>{
 it('gives the Sun an opaque black core and includes Saturn rings without changing coordinates',()=>{
  const sun={x:512,y:480,radius:36},planets=[{x:240,y:300,radius:20,ringOuterRadius:40,id:'saturn'}];
  const regions=cosmicSilenceRegions(sun,planets);
  expect(regions[0]).toEqual({x:512,y:480,core:55.800000000000004,outer:122.39999999999999,opacity:1});
  expect(regions[1]?.core).toBeCloseTo(43.2);
  expect(regions[1]?.outer).toBe(96);
  expect(planets[0]?.x).toBe(240);
 });
});