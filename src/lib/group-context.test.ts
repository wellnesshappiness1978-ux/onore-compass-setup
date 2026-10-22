import { describe, expect, it } from "vitest";
import { buildGroupContext, groupMemberSchema } from "./group-context";
import { siblingCategory, siblingDisplay } from "./sibling-order";

describe("group consultation context", () => {
  it("preserves municipality and counted siblings in the named group prompt", () => {
    const m = groupMemberSchema.parse({ name: "はなちゃん", birthDate: "1990-05-05", birthPlace: "神奈川県", birthCity: "横浜市保土ケ谷区", siblingOrder: "10人・中間子・上に兄2人と姉・下に弟3人と妹3人", relationshipType: "sibling" });
    const text = buildGroupContext("星の家族", [m], "2026-10-22");
    expect(text).toContain('group "星の家族"');
    expect(text).toContain("birth municipality 横浜市保土ケ谷区");
    expect(text).toContain(m.siblingOrder);
    expect(text).toContain("relationship type sibling");
  });
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
