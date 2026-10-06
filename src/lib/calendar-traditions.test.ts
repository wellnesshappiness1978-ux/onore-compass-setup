import { describe, expect, it } from "vitest";
import { nineStarProfile, rokuyo } from "./calendar-traditions";

describe("traditional calendar helpers", () => {
  it("calculates rokuyo from the Japanese lunisolar month and day", () => {
    expect(rokuyo(new Date("2024-02-10T12:00:00+09:00"))?.name).toBe("先勝");
    expect(rokuyo(new Date("2026-02-17T12:00:00+09:00"))?.name).toBe("先勝");
  });

  it("changes the nine-star solar year at the calculated start of spring", () => {
    expect(nineStarProfile("2024-02-02")?.solarYear).toBe(2023);
    expect(nineStarProfile("2024-02-06")?.solarYear).toBe(2024);
  });

  it("returns a complete personal nine-star result", () => {
    const result = nineStarProfile("1985-08-12", "10:30", false);
    expect(result?.palaces).toHaveLength(9);
    expect(new Set(result?.palaces.map((palace) => palace.star)).size).toBe(9);
    expect(result?.honmeiName).toBeTruthy();
    expect(result?.getsumeiName).toBeTruthy();
    expect(result?.keishaName).toBeTruthy();
  });
});