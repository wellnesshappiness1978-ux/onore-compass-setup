import { describe, expect, it } from "vitest";
import { bandOf, memberToday, roleAssignment, subjectDailyMessage } from "./group-today";
import { replaceSubject } from "@/components/FocusPanels";
const m = (id: string, birthDate: string) => ({ id, name: id, birthDate, gender: "undisclosed", bloodType: "", role: "", skills: [] });
describe("group today", () => {
  it("bands at 70 and 45", () => { expect(bandOf(70)).toBe("high"); expect(bandOf(45)).toBe("steady"); expect(bandOf(44)).toBe("care"); });
  it("gives every member a reading and assigns every role", () => {
    const list = [m("a", "1990-01-01"), m("b", "1985-06-15")].map(x => memberToday(x, "2026-10-21"));
    expect(list).toHaveLength(2);
    expect(Object.values(roleAssignment(list, "2026-10-21")).every(Boolean)).toBe(true);
  });
  it("daily message changes with the date", () => {
    const days = ["2026-10-21", "2026-10-22", "2026-10-23", "2026-10-24"].map(d => subjectDailyMessage("self", null, d, "", "ja")[0]);
    expect(new Set(days).size).toBeGreaterThan(1);
  });
  it("replaces あなた with the subject name", () => { expect(replaceSubject("あなたの特性", "花子さん")).toBe("花子さんの特性"); });
  it("keeps quoted speech where あなた means someone else", () => { expect(replaceSubject("「あなたの意見を聞かせて」とあなたが先に", "花子さん")).toBe("「あなたの意見を聞かせて」と花子さんが先に"); });
  it("keeps the flower meaning phrase", () => { expect(replaceSubject("憧れ・あなただけを見つめる", "花子さん")).toBe("憧れ・あなただけを見つめる"); });
});

import { describe as d2, it as i2, expect as e2 } from "vitest";
d2("daily message depth", () => {
  i2("includes meaning, action and reflection beyond the short line", () => {
    const lines = subjectDailyMessage("self", "1990-05-05", "2026-10-24", "", "ja");
    e2(lines.length).toBeGreaterThanOrEqual(5);
    e2(lines.join("").length).toBeGreaterThan(200);
  });
});
