import { describe, expect, it } from "vitest";
import { mergeRosterMembers } from "./consultation-targets";
import type { TeamMember } from "./team-analysis";

const member = (id: string, name: string): TeamMember => ({
  id, name, birthDate: "1990-01-01", gender: "undisclosed", bloodType: "", role: "", skills: [],
});

describe("mergeRosterMembers", () => {
  it("appends device-local test members after server rows", () => {
    const server = [member("a", "サーバー花子")];
    const local = [member("b", "テスト太郎")];
    expect(mergeRosterMembers(server, local).map(m => m.id)).toEqual(["a", "b"]);
  });

  it("never duplicates an id that already exists on the server", () => {
    const server = [member("a", "サーバー花子")];
    const local = [member("a", "重複"), member("c", "テスト次郎")];
    const merged = mergeRosterMembers(server, local);
    expect(merged.map(m => m.id)).toEqual(["a", "c"]);
    expect(merged[0]?.name).toBe("サーバー花子");
  });

  it("returns local rows when the server roster is empty (test preview on a free account)", () => {
    expect(mergeRosterMembers([], [member("b", "テスト太郎")]).map(m => m.name)).toEqual(["テスト太郎"]);
  });
});
