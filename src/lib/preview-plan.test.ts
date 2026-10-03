import { describe, expect, it } from "vitest";
import { isTestPreview, parsePlan, planQuery } from "./preview-plan";
import { canUse, consultationDailyLimit, memberLimit, planOrder } from "./plans";

describe("preview plan and gates", () => {
  it("round trips every public query and rejects unknown plans", () => {
    for (const plan of planOrder) expect(parsePlan(planQuery[plan])).toBe(plan);
    expect(parsePlan("admin")).toBeNull(); expect(parsePlan(null)).toBeNull();
  });
  it("recognizes only known preview host formats", () => {
    expect(isTestPreview("id-preview--b9d3304b-2d60-4bc1-820f-5d9babca69a8.lovable.app")).toBe(true);
  });
  it("keeps Free limited and gives paid tiers monotonic access", () => {
    expect(canUse("free", "birthColorsFull")).toBe(false);
    expect(canUse("free", "helioPersonal")).toBe(false);
    expect(canUse("standard", "helioPersonal")).toBe(true);
    expect(canUse("standard", "helioBusiness")).toBe(false);
    expect(canUse("vip", "helioDirections")).toBe(true);
    expect(canUse("b2b", "helioBusiness")).toBe(true);
    expect(planOrder.map(plan => memberLimit[plan])).toEqual([0, 2, 5, 30, 100]);
    expect(planOrder.map(plan => consultationDailyLimit[plan])).toEqual([1, 3, 10, 30, Infinity]);
  });
});