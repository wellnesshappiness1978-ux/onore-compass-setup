import { describe, expect, it } from 'vitest';
import { COSMIC_NEBULA_WEIGHTS, deepNebulaPixels, lunarLightNormal, lunarSurfacePixels } from './cosmic-optics';

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
    expect(sample(48,32)).toBeGreaterThan(sample(16,32)*2);
    expect(image).toEqual(lunarSurfacePixels(moon,64,[184,183,177]));
    expect(image[3]).toBe(0);
    const reverse=lunarSurfacePixels({...moon,lightAngle:Math.PI},64,[184,183,177]);
    expect(reverse[(32*64+16)*4]).toBeGreaterThan(reverse[(32*64+48)*4]??0);
  });
  it('gives every exact birth-color role a strictly descending density budget', () => {
    expect(COSMIC_NEBULA_WEIGHTS).toHaveLength(7);
    for(let i=1;i<7;i++) expect(COSMIC_NEBULA_WEIGHTS[i-1]).toBeGreaterThan(COSMIC_NEBULA_WEIGHTS[i]??0);
  });
  it('reveals blue-silver shadow textures at new Moon without flattening its sunlit phase', () => {
    const moon={phaseAngle:180,lightAngle:0,poleAngle:-Math.PI/2,librationLongitude:0,librationLatitude:0};
    const shadow=lunarSurfacePixels(moon,96,[184,183,177],[159,189,221]);
    const tones=new Set<number>();
    for(let y=20;y<76;y++) for(let x=20;x<76;x++) {
      const i=(y*96+x)*4;
      if((shadow[i+3]??0)<250) continue;
      expect(shadow[i]).toBeGreaterThan(24);
      expect(shadow[i+2]).toBeGreaterThan(shadow[i]??0);
      tones.add(shadow[i]??0);
    }
    expect(tones.size).toBeGreaterThan(8);
    const full=lunarSurfacePixels({...moon,phaseAngle:0},96,[184,183,177],[159,189,221]);
    expect(full[(48*96+48)*4]).toBeGreaterThan((shadow[(48*96+48)*4]??0)*2);
    expect(shadow).toEqual(lunarSurfacePixels(moon,96,[184,183,177],[159,189,221]));
  });
  it('keeps shadow relief legible across crescent and quarter orientations', () => {
    for (const phaseAngle of [90,135,170,180]) for (const lightAngle of [0,1.2,Math.PI]) {
      const pixels=lunarSurfacePixels({phaseAngle,lightAngle,poleAngle:.4,librationLongitude:5,librationLatitude:-3},64,[184,183,177],[159,189,221]);
      const light=lunarLightNormal(phaseAngle,lightAngle), tones:number[]=[];
      for(let y=12;y<52;y++) for(let x=12;x<52;x++) {
        const nx=(x+.5)/32-1,ny=(y+.5)/32-1,nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny)),i=(y*64+x)*4;
        if((pixels[i+3]??0)<250 || nx*light.x+ny*light.y+nz*light.z>-.15) continue;
        tones.push((pixels[i]??0)*.2126+(pixels[i+1]??0)*.7152+(pixels[i+2]??0)*.0722);
      }
      expect(tones.length).toBeGreaterThan(10);
      expect(tones.reduce((a,b)=>a+b,0)/tones.length).toBeGreaterThan(38);
      expect(Math.max(...tones)-Math.min(...tones)).toBeGreaterThan(10);
    }
  });
  it('keeps seven exact sources in vivid transparent gas with dark lanes', () => {
    const colors=['#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff','#ffffff'];
    const pixels=deepNebulaPixels(colors,42,128);
    expect(pixels).toEqual(deepNebulaPixels(colors,42,128));
    expect(pixels).not.toEqual(deepNebulaPixels(colors,43,128));
    const observed=new Set<string>(); let quiet=0;
    for(let i=0;i<pixels.length;i+=4) {
      expect(pixels[i+3]).toBeLessThanOrEqual(133);
      if((pixels[i+3]??0)>0) observed.add(Array.from(pixels.slice(i,i+3)).join(','));
      if((pixels[i+3]??0)<3) quiet++;
    }
    expect(observed.size).toBe(7);
    // Vivid coverage still reserves at least a tenth of the field as deep extinction lanes.
    expect(quiet).toBeGreaterThan(128*128*.1);
    expect(quiet).toBeLessThan(128*128*.65);
    const visible=Array.from(pixels).filter((v,i)=>i%4===3&&v>25).length;
    expect(visible).toBeGreaterThan(128*128*.06);
  });
});