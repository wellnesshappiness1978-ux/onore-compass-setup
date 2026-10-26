import { describe, expect, it } from "vitest";
import { parentsFromRow, parentsToRow, validParent } from "./parent-data";

describe("owner and family parent persistence contract", () => {
  const father = { birthDate: "1950-02-28", birthPlace: "東京都", birthCity: "新宿区", gender: "male" };
  const mother = { birthDate: "1955-06-12", birthPlace: "大阪府", birthCity: "大阪市" };
  it.each([{ father, mother }, { father, mother: null }, { father: null, mother }, { father: null, mother: null }])("restores all entered parent fields without loss: %j", value => {
    expect(parentsFromRow(parentsToRow(value))).toEqual(value);
  });
  it("accepts legacy date-only parents without failing the whole profile", () => {
    expect(validParent({ birthDate: "1950-02-28" })).toEqual({ birthDate: "1950-02-28", birthPlace: "", birthCity: "" });
  });
  it("rejects impossible dates instead of silently discarding them", () => {
    expect(() => validParent({ birthDate: "1950-02-30" })).toThrow();
  });
});