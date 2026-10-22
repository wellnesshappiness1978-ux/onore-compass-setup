import { describe, expect, it } from "vitest";
import { avoidFromHistory, cacheKey, dailyAngle, daySeed, normalizeFortune, todayFortuneRequestSchema, type TodayFortune } from "./today-fortune";

const food = (name: string) => ({ name, why: "w", servings: "2人分", ingredients: [{ item: "豆腐", amount: "300g" }], seasonings: [{ item: "しょうゆ", amount: "大さじ1" }], steps: [{ text: "切る", tip: "t" }] });
const guidance = { action: 'a', reason: 'r', benefit: 'b' };
const base: TodayFortune = { decision: { advance: 'a', protect: 'p', reason: 'r' }, shopping: guidance, maintenance: guidance, monthly: { flower: guidance, action: guidance, item: guidance, outlook: 'o' }, headline: "h", insight: "i", dynamics: "d", actions: ["a"], caution: "c", luckyColor: { name: "若葉", hex: "#aabbcc", reason: "r" }, luckyWord: { word: "w", message: "m" }, foods: [] };

describe("today fortune", () => {
  it("returns exactly five complete foods", () => {
    const f = normalizeFortune({ ...base, foods: [1, 2, 3, 4, 5, 6, 7].map(n => food(`料理${n}`)) });
    expect(f.foods).toHaveLength(5);
    expect(f.luckyColor.hex).toBe("#AABBCC");
  });
  it("differs per subject and per day", () => {
    expect(daySeed("self", "2026-10-22")).not.toBe(daySeed("self", "2026-10-23"));
    expect(daySeed("g-1", "2026-10-22")).not.toBe(daySeed("self", "2026-10-22"));
    expect(cacheKey({ subject: { key: "g-1" }, day: "2026-10-22", language: "ja", goal: "" })).not.toBe(cacheKey({ subject: { key: "self" }, day: "2026-10-22", language: "ja", goal: "" }));
    expect(typeof dailyAngle("self", "2026-10-22")).toBe("string");
  });
  it("avoids recent foods of every subject and colors of the same subject", () => {
    const history = [
      { key: "self", day: "2026-10-21", color: "赤", word: "一歩", foods: ["肉じゃが"] },
      { key: "g-1", day: "2026-10-20", color: "青", word: "流れ", foods: ["鮭のホイル焼き"] },
      { key: "self", day: "2026-10-01", color: "黄", word: "古い", foods: ["古い料理"] },
    ];
    const avoid = avoidFromHistory(history, "self", "2026-10-22");
    expect(avoid.colors).toEqual(["赤"]);
    expect(avoid.foods).toEqual(["肉じゃが", "鮭のホイル焼き"]);
  });
  it("accepts a group of members", () => {
    const m = { nameKanji: "花子", nameKana: "", nameRomaji: "", birthDate: "1990-05-05", birthTime: "", birthTimeUnknown: true, birthPlace: "", birthCity: "", bloodType: "", siblingOrder: "" };
    expect(todayFortuneRequestSchema.parse({ language: "ja", day: "2026-10-22", subject: { kind: "group", key: "g-1", label: "家族" }, members: [m, { ...m, nameKanji: "太郎" }] }).members).toHaveLength(2);
  });
});
