import { describe, expect, it } from "vitest";
import { compassMandalaLayout } from "./art-geometry";
import { buildMandalaColorPlate } from "@/components/MandalaCanvas";

const colors = ["#A17A21", "#C34232", "#B95E77", "#238A62", "#158D9C", "#2756A3", "#75459B"];

describe("compass mandala layout", () => {
  it("uses the overall color at the core and six birth colors unmodified, inner to outer", () => {
    const l = compassMandalaLayout(colors);
    expect(l.core).toBe(colors[0]);
    expect(l.layers.map(x => x.color)).toEqual(colors.slice(1));
    expect(l.layers[0]?.innerColor).toBe(colors[0]);
    expect(l.layers.every(x => x.path.length > 0 && !x.path.includes("NaN"))).toBe(true);
    expect(l.layers.every(x => x.innerPath.length > 0 && x.facetPath.length > 0 && x.guillochePath.length > 0)).toBe(true);
  });
  it("is deterministic and variation changes the arrangement", () => {
    expect(compassMandalaLayout(colors)).toEqual(compassMandalaLayout(colors));
    expect(compassMandalaLayout(colors, 1).particles).not.toEqual(compassMandalaLayout(colors).particles);
    expect(compassMandalaLayout(colors).blades).toHaveLength(32);
  });
  it("places every exact birth color in the local SVG plate", () => {
    const plate = buildMandalaColorPlate(colors, 0, false);
    colors.forEach(color => expect(plate).toContain(`data-birth-color="${color}"`));
    expect(plate).toContain("mix-blend-mode:color");
    expect(plate).toContain("fractalNoise");
    expect(plate).toContain("roughGold");
    expect(plate).toContain("stroke-dasharray");
    const paintScales = [...plate.matchAll(/id="pigment\d"[\s\S]*?<feDisplacementMap[^>]+scale="([\d.]+)"/g)].map(match => Number(match[1]));
    expect(paintScales).toHaveLength(6);
    expect(paintScales.every(scale => scale >= 7)).toBe(true);
    expect(plate).not.toContain("mc-rot");
    expect(plate).not.toContain("jewelGlow");
    expect(plate).not.toContain("<rect");
    expect(plate).not.toContain("image.pollinations");
    expect(plate).not.toContain("<image");
  });
  it("keeps still and exported compositions identical while regeneration changes the paintwork", () => {
    expect(buildMandalaColorPlate(colors, 0, true)).toBe(buildMandalaColorPlate(colors, 0, false));
    expect(buildMandalaColorPlate(colors, 1, false)).not.toBe(buildMandalaColorPlate(colors, 0, false));
  });
});
