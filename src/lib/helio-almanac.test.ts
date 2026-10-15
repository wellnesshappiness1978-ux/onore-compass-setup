import { describe, expect, it } from "vitest";
import { almanacDay } from "./helio-almanac";

describe("helio almanac 2026", () => {
  it("summer solstice", () => {
    const d = almanacDay(new Date(2026, 5, 21));
    expect(d.term).toBe("夏至");
    expect(d.half).toBe("上半期");
    expect(d.halfLength).toBe(187);
    expect(d.halfDay).toBe(94);
    expect(Math.round(d.sunLon)).toBe(90);
    expect(d.lunarMonthName).toBe("皐月");
  });
  it("zassetsu and moon", () => {
    expect(almanacDay(new Date(2026, 6, 2)).zassetsu).toContain("半夏生");
    expect(almanacDay(new Date(2026, 5, 11)).zassetsu).toContain("入梅");
    expect(almanacDay(new Date(2026, 5, 25)).lunarDayLabel).toBe("新月");
    expect(almanacDay(new Date(2026, 6, 6)).apsis).toBe("遠日点");
  });
});
