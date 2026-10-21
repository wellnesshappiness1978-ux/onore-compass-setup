import { describe, expect, it } from "vitest";
import { buildSiblingComposition, parseSiblingComposition, siblingCategory, siblingDisplay } from "./sibling-order";
import { kindFromRelationshipType } from "./compatibility-context";

describe("sibling composition", () => {
  it("builds and parses a full composition round-trip", () => {
    const s = buildSiblingComposition({ count: "3人", order: "長子", up: ["姉"], down: ["弟", "妹"] });
    expect(s).toBe("3人・長子・上に姉・下に弟と妹");
    expect(parseSiblingComposition(s)).toEqual({ count: "3人", order: "長子", up: ["姉"], down: ["弟", "妹"] });
  });
  it("forces 一人っ子 order and no sides for an only child", () => {
    const s = buildSiblingComposition({ count: "ひとりっ子", order: "", up: [], down: [] });
    expect(s).toBe("ひとりっ子・一人っ子");
    expect(siblingCategory(s)).toBe("only");
  });
  it("maps composition orders to legacy categories", () => {
    expect(siblingCategory("3人・長子・上に姉")).toBe("first");
    expect(siblingCategory("4人以上・中間子・上に兄と姉・下に妹")).toBe("middle");
    expect(siblingCategory("2人・末っ子・上に兄")).toBe("last");
  });
  it("keeps legacy and simple values valid", () => {
    expect(siblingCategory("長女")).toBe("first");
    expect(siblingCategory("first")).toBe("first");
    expect(parseSiblingComposition("長女")).toBeNull();
  });
  it("localizes compositions at render time only", () => {
    const s = "3人・長子・上に姉";
    expect(siblingDisplay(s, "ja")).toBe(s);
    const en = siblingDisplay(s, "en");
    expect(en).toContain("Three");
    expect(en).toContain("Eldest");
    expect(en).toContain("Sister");
  });
});

describe("relationship type to compatibility kind", () => {
  it("maps romantic, hierarchy and business types", () => {
    expect(kindFromRelationshipType("lover")).toBe("romance");
    expect(kindFromRelationshipType("fiance")).toBe("romance");
    expect(kindFromRelationshipType("partner")).toBe("romance");
    expect(kindFromRelationshipType("boss")).toBe("hierarchy");
    expect(kindFromRelationshipType("subordinate")).toBe("hierarchy");
    expect(kindFromRelationshipType("business")).toBe("business");
    expect(kindFromRelationshipType("employee")).toBe("business");
  });
  it("treats family, sibling, relative, friend and other as close", () => {
    for (const t of ["family", "sibling", "relative", "friend", "other", ""]) {
      expect(kindFromRelationshipType(t)).toBe("close");
    }
  });
});
