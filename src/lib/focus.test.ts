import { describe, expect, it } from "vitest";
import { groupLimit } from "./plans";
import { autoGroupLetter, canAddGroup, groupDisplayName, memberDisplayName, mixHex } from "./focus";

describe("group limits per plan", () => {
  it("free 0, standard 1, vip 3, family 10, premium 30", () => {
    expect(groupLimit).toEqual({ free: 0, standard: 1, vip: 3, b2b: 10, "b2b-premium": 30 });
  });
  it("blocks adding beyond the cap", () => {
    expect(canAddGroup("standard", 0)).toBe(true);
    expect(canAddGroup("standard", 1)).toBe(false);
    expect(canAddGroup("vip", 3)).toBe(false);
    expect(canAddGroup("free", 0)).toBe(false);
  });
});

describe("display names", () => {
  it("nickname wins, family falls back to full name", () => {
    expect(memberDisplayName({ name: "山田花子", nickname: "はなちゃん" })).toBe("はなちゃん");
    expect(memberDisplayName({ name: "山田花子", nickname: "" })).toBe("山田花子");
  });
  it("unnamed groups become グループA, グループB", () => {
    expect(groupDisplayName({ id: "1", name: "", nickname: "", memberIds: [] }, 0, "ja")).toBe("グループA");
    expect(groupDisplayName({ id: "2", name: "", nickname: "", memberIds: [] }, 1, "ja")).toBe("グループB");
    expect(autoGroupLetter(26)).toBe("AA");
  });
});

it("mixes colors as RGB mean", () => {
  expect(mixHex(["#000000", "#ffffff"])).toBe("#808080");
});
