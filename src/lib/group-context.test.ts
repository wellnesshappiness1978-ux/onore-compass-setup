import { describe, expect, it } from "vitest";
import { buildGroupContext, groupMemberSchema } from "./group-context";
import { siblingCategory, siblingDisplay } from "./sibling-order";

describe("group consultation context", () => {
  it("includes members, pairs and rhythm for the AI", () => {
    const members = [{ name: "花子", birthDate: "1990-05-05" }, { name: "太郎", birthDate: "1988-11-20" }].map(m => groupMemberSchema.parse(m));
    const text = buildGroupContext("家族", members, "2026-10-19");
    expect(text).toContain("花子 × 太郎");
    expect(text).toContain("group average rhythm");
    expect(text).toContain("Group color:");
  });
});
describe("sibling order", () => {
  it("maps detailed values to legacy categories and localizes", () => {
    expect(siblingCategory("長女")).toBe("first");
    expect(siblingCategory("末っ子")).toBe("last");
    expect(siblingDisplay("次男", "en")).toBe("Second son");
    expect(siblingDisplay("双子の兄", "en")).toBe("双子の兄");
  });
});
