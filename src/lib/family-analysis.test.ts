import { expect, it } from "vitest";
import { analyzeFamily } from "./family-analysis";
const members = [{ id:"a",name:"A",birthDate:"1980-02-12",gender:"undisclosed",bloodType:"",role:"",skills:[] },{ id:"b",name:"B",birthDate:"1988-08-10",gender:"undisclosed",bloodType:"",role:"",skills:[] }];
it("uses both members for independent layers and seven shared dates", () => {
  const result = analyzeFamily(members,"2026-10-26");
  expect(result.entries.map(e=>e.member.id)).toEqual(["a","b"]);
  expect(result.pairs).toHaveLength(1);
  expect(result.roadmap.map(d=>d.day)).toEqual(["2026-10-26","2026-10-27","2026-10-28","2026-10-29","2026-10-30","2026-10-31","2026-11-01"]);
  expect(result.pairs[0]?.sky).not.toBeNull();
  expect(result.palette?.main.code).toMatch(/^#[A-F0-9]{6}$/);
});