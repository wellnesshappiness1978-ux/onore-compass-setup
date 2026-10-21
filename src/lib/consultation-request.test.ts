import { describe, expect, it } from "vitest";
import { consultationGoal, consultationRequestSchema } from "./consultation-request";
import { buildGroupContext } from "./group-context";

const profile = {
  birthDate: "1990-05-05", birthTime: "", birthTimeUnknown: true,
  birthPlace: "", bloodType: "", siblingOrder: "",
};
const request = (size: number, goal = "家族で役割を分担したい") => ({
  messages: [{ id: "question", role: "user", parts: [{ type: "text", text: "協力する方法は？" }] }],
  profile, language: "ja", goal: consultationGoal(goal),
  group: { name: "相談グループ", members: Array.from({ length: size }, (_, i) => ({ name: `メンバー${i + 1}`, birthDate: "1990-05-05" })) },
});

describe("group consultation goal isolation", () => {
  it.each([10, 100, 101])("accepts %i structured members without appending their details to goal", size => {
    const parsed = consultationRequestSchema.parse(request(size));
    expect(parsed.goal).toBe("家族で役割を分担したい");
    expect(parsed.group?.members).toHaveLength(size);
    if (!parsed.group) throw new Error("Missing group");
    const context = buildGroupContext(parsed.group.name, parsed.group.members, "2026-10-21");
    expect(context).toContain(`メンバー${size} (born 1990-05-05`);
  });
  it("preserves a 240-character goal and rejects 241 characters at the server boundary", () => {
    const body = request(10, "目".repeat(240));
    expect(consultationRequestSchema.parse(body).goal).toBe("目".repeat(240));
    expect(consultationRequestSchema.safeParse({ ...body, goal: "目".repeat(241) }).success).toBe(false);
  });
  it("bounds the transmitted goal even when a preset and saved text exceed 240 characters", () => {
    expect(consultationGoal(`  家族 / ${"目".repeat(240)}  `)).toBe(`家族 / ${"目".repeat(235)}`);
    expect(consultationGoal("   ")).toBeUndefined();
  });
});