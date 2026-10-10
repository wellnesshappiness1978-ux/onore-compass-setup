import { describe, expect, it } from "vitest";
import { compassMandalaLayout } from "./art-geometry";

const colors = ["#A17A21", "#C34232", "#B95E77", "#238A62", "#158D9C", "#2756A3", "#75459B"];

describe("compass mandala layout", () => {
  it("uses the overall color at the core and six birth colors unmodified, inner to outer", () => {
    const l = compassMandalaLayout(colors);
    expect(l.core).toBe(colors[0]);
    expect(l.layers.map(x => x.color)).toEqual(colors.slice(1));
    expect(l.layers[0]?.innerColor).toBe(colors[0]);
    expect(l.layers.every(x => x.path.length > 0 && !x.path.includes("NaN"))).toBe(true);
  });
  it("is deterministic and variation changes the arrangement", () => {
    expect(compassMandalaLayout(colors)).toEqual(compassMandalaLayout(colors));
    expect(compassMandalaLayout(colors, 1).particles).not.toEqual(compassMandalaLayout(colors).particles);
    expect(compassMandalaLayout(colors).blades).toHaveLength(32);
  });
});
