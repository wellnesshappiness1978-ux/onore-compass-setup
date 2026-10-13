import { describe, expect, it } from "vitest";
import { cosmicGenesis, earthViewAtBirth } from "./cosmic-astronomy";
import { daylight, eclipticNorthView, latLonVector, orthoBasis, projectOrtho, unprojectOrtho, vectorLatLon } from "./earth-globe";

describe("earth globe", () => {
  it("puts the birthplace at the exact front center", () => {
    const b = orthoBasis(35.68, 139.65);
    const p = projectOrtho(b, latLonVector(35.68, 139.65));
    expect(p.x).toBeCloseTo(0, 10); expect(p.y).toBeCloseTo(0, 10); expect(p.visible).toBe(true);
    const back = vectorLatLon(unprojectOrtho(b, 0, 0)!);
    expect(back.lat).toBeCloseTo(35.68, 8); expect(back.lon).toBeCloseTo(139.65, 8);
  });
  it("lights the subsolar point and darkens its antipode", () => {
    const g = cosmicGenesis("1990-04-15", "08:30", false)!;
    const v = earthViewAtBirth(g, "東京都");
    const sun = latLonVector(v.subsolarLatitude, v.subsolarLongitude);
    expect(daylight(sun, sun)).toBe(1);
    expect(daylight({ x: -sun.x, y: -sun.y, z: -sun.z }, sun)).toBe(0);
    // 08:30 JST morning in Tokyo: subsolar point is east of Tokyo by roughly 3.5 hours.
    expect(v.subsolarLongitude).toBeGreaterThan(160);
  });
  it("views the orbital Earth from ecliptic north so the Sun lies on the limb", () => {
    const g = cosmicGenesis("2000-06-21", "12:00", false)!;
    const v = earthViewAtBirth(g, "東京都");
    const c = eclipticNorthView(v.siderealRotation);
    const p = projectOrtho(orthoBasis(c.lat, c.lon), latLonVector(v.subsolarLatitude, v.subsolarLongitude));
    expect(Math.hypot(p.x, p.y)).toBeGreaterThan(.98);
  });
});
