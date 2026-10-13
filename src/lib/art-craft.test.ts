import {describe,it,expect} from 'vitest';
import {guillochePoints,enamelMotif,goldenShellRadius,arabesquePoints} from './art-craft';
describe('local jewelry craft',()=>{
 it('bounds mirrored arabesque scrollwork to the annulus at live and export sizes',()=>{for(const scale of [1,2])for(let sector=0;sector<48;sector++)for(const side of [-1,1]){const points=arabesquePoints(430*scale,470*scale,sector,side);expect(points).toEqual(arabesquePoints(430*scale,470*scale,sector,side));expect(points.every(p=>Math.hypot(p.x,p.y)>430*scale&&Math.hypot(p.x,p.y)<470*scale)).toBe(true);}});
 it('grows true golden shell chambers by phi each quarter turn',()=>{const phi=(1+Math.sqrt(5))/2;expect(goldenShellRadius(1,40)).toBe(40);for(const t of [.125,.25,.5,.75])expect(goldenShellRadius(t+.125,40)/goldenShellRadius(t,40)).toBeCloseTo(phi,12);});
 it('keeps engraving in its annulus and deterministic',()=>{const a=guillochePoints(430,470);expect(a).toEqual(guillochePoints(430,470));expect(a.every(p=>Math.hypot(p.x,p.y)>=430&&Math.hypot(p.x,p.y)<=470)).toBe(true);expect(a).not.toEqual(guillochePoints(430,470,1));});
 it('clips enamel to the shared motif boundary with material tokens',()=>{const svg=enamelMotif('M0 0Z','M1 1Z','M2 2Z',2);expect(svg).toContain('clip-path="url(#motifClip2)"');expect(svg).toContain('--craft-pearl');expect(svg).not.toMatch(/https?:/);});
});
