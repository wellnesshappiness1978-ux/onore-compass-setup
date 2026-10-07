// Traditional Ba Zhai and annual Flying Star reference, not a property-specific assessment.
import * as A from "astronomy-engine";
import type { Direction } from "./day-compass";

const wrap = (n: number) => ((n - 1 + 900) % 9) + 1;
const digit = (n: number): number => n < 10 ? n : digit(String(n).split("").reduce((v, d) => v + Number(d), 0));
const palaces = [
  { dir: "SE", base: 4, trigram: "son", element: "wood", room: "desk", color: "green", plant: "pothos" },
  { dir: "S", base: 9, trigram: "ri", element: "fire", room: "living", color: "coral", plant: "snakePlant" },
  { dir: "SW", base: 2, trigram: "kon", element: "earth", room: "dining", color: "yellow", plant: "pachira" },
  { dir: "E", base: 3, trigram: "shin", element: "wood", room: "entry", color: "green", plant: "pothos" },
  { dir: "C", base: 5, trigram: "center", element: "earth", room: "shared", color: "yellow", plant: "pachira" },
  { dir: "W", base: 7, trigram: "da", element: "metal", room: "study", color: "white", plant: "snakePlant" },
  { dir: "NE", base: 8, trigram: "gon", element: "earth", room: "bedroom", color: "yellow", plant: "pachira" },
  { dir: "N", base: 1, trigram: "kan", element: "water", room: "bath", color: "blue", plant: "pothos" },
  { dir: "NW", base: 6, trigram: "ken", element: "metal", room: "office", color: "white", plant: "snakePlant" },
] as const;
const directionsByKua: Record<number, [Direction, Direction, Direction, Direction]> = {
  1: ["SE", "E", "S", "N"], 2: ["NE", "W", "NW", "SW"],
  3: ["S", "N", "SE", "E"], 4: ["N", "S", "E", "SE"],
  6: ["W", "NE", "SW", "NW"], 7: ["NW", "SW", "NE", "W"],
  8: ["SW", "NW", "W", "NE"], 9: ["E", "SE", "N", "S"],
};
export const fengDirectionNames: Record<Direction, string> = { N: "北", NE: "北東", E: "東", SE: "南東", S: "南", SW: "南西", W: "西", NW: "北西" };

export function solarYear(date: string) {
  const parsed = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!parsed) return null;
  const y = Number(parsed[1]);
  const d = new Date(`${date}T03:00:00Z`); // local noon JST; date-only input cannot resolve birth-hour boundary
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== date) return null;
  const start = A.SearchSunLongitude(315, (Date.UTC(y, 0, 25) - Date.UTC(2000, 0, 1, 12)) / 86400000, 25);
  if (!start) return null;
  return { year: d.getTime() < start.date.getTime() ? y - 1 : y, nearBoundary: Math.abs(d.getTime() - start.date.getTime()) < 86400000 };
}

export function mingGua(date: string, gender: string) {
  const solar = solarYear(date);
  if (!solar || solar.year < 1900 || solar.year > 2099 || (gender !== "male" && gender !== "female")) return null;
  const root = digit(solar.year % 100);
  const male = wrap((solar.year >= 2000 ? 9 : 10) - root);
  const female = digit(root + (solar.year >= 2000 ? 6 : 5));
  const normalize = (n: number, branch: "male" | "female") => n === 5 ? branch === "male" ? 2 : 8 : n;
  const selected = [gender] as ("male" | "female")[];
  return { ...solar, branches: selected.map(branch => {
    const number = normalize(branch === "male" ? male : female, branch);
    const [shengQi, tianYi, yanNian, fuWei] = directionsByKua[number] ?? ["SE", "E", "S", "N"];
    return { branch, number, group: [1, 3, 4, 9].includes(number) ? "east" : "west", shengQi, tianYi, yanNian, fuWei };
  }) };
}

export function annualFlyingStars(date: Date) {
  const year = solarYear(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`)?.year ?? date.getFullYear();
  const center = wrap(3 - (year - 2024));
  return { year, center, palaces: palaces.map(p => ({ ...p, star: wrap(center + p.base - 5) })) };
}
