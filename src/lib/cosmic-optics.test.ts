import { describe, expect, it } from 'vitest';
import { COSMIC_NEBULA_WEIGHTS, lunarLightNormal, lunarSurfacePixels } from './cosmic-optics';

describe('Lunar spherical optics and ranked gas', () => {
  it('uses a unit light vector at new, quarter and full phases', () => {
    for (const phase of [0,45,90,135,180]) {
      const v=lunarLightNormal(phase,.63);
      expect(Math.hypot(v.x,v.y,v.z)).toBeCloseTo(1,12);
      expect((1+v.z)/2).toBeCloseTo((1+Math.cos(phase*Math.PI/180))/2,12);
    }
    expect(lunarLightNormal(0,0).z).toBe(1);
    expect(lunarLightNormal(180,0).z).toBe(-1);
  });
  it('turns the bright hemisphere with the calculated limb and keeps pixels deterministic', () => {
    const moon={phaseAngle:90,lightAngle:0,poleAngle:-Math.PI/2,librationLongitude:0,librationLatitude:0};
    const image=lunarSurfacePixels(moon,64,[184,183,177]);
    const sample=(x:number,y:number)=>image[(y*64+x)*4]??0;
    expect(sample(48,32)).toBeGreaterThan(sample(16,32)*3);
    expect(image).toEqual(lunarSurfacePixels(moon,64,[184,183,177]));
    expect(image[3]).toBe(0);
    const reverse=lunarSurfacePixels({...moon,lightAngle:Math.PI},64,[184,183,177]);
    expect(reverse[(32*64+16)*4]).toBeGreaterThan(reverse[(32*64+48)*4]??0);
  });
  it('gives every exact birth-color role a strictly descending density budget', () => {
    expect(COSMIC_NEBULA_WEIGHTS).toHaveLength(7);
    for(let i=1;i<7;i++) expect(COSMIC_NEBULA_WEIGHTS[i-1]).toBeGreaterThan(COSMIC_NEBULA_WEIGHTS[i]??0);
  });
});