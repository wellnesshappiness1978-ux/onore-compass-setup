import {describe,it,expect} from 'vitest';
import {guillochePoints,enamelMotif} from './art-craft';
describe('local jewelry craft',()=>{
 it('keeps engraving in its annulus and deterministic',()=>{const a=guillochePoints(430,470);expect(a).toEqual(guillochePoints(430,470));expect(a.every(p=>Math.hypot(p.x,p.y)>=430&&Math.hypot(p.x,p.y)<=470)).toBe(true);expect(a).not.toEqual(guillochePoints(430,470,1));});
 it('clips enamel to the shared motif boundary with material tokens',()=>{const svg=enamelMotif('M0 0Z','M1 1Z','M2 2Z',2);expect(svg).toContain('clip-path="url(#motifClip2)"');expect(svg).toContain('--craft-pearl');expect(svg).not.toMatch(/https?:/);});
});
