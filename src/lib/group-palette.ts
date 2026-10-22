import { birthColorNameForHex, birthColorSpectrum } from "./birth-color-spectrum";
import { mixHex } from "./focus";
import type { BirthColorRole } from "./birth-color-copy";

type Birth = { birthDate: string; birthTime?: string; birthTimeUnknown?: boolean; birthPlace?: string };
export const groupPaletteRoles: BirthColorRole[] = ["main", "sub", "money", "work", "love", "health", "mind"];
type Swatch = { slot: number; name: string; code: string };

/** Seven group colors: each role is the RGB mean of every member's color for that role (illustrative). */
export function groupBirthPalette(members: Birth[]) {
  const palettes = members.map(m => birthColorSpectrum({ birthDate: m.birthDate, birthTime: m.birthTime ?? "", birthTimeUnknown: m.birthTimeUnknown ?? true, birthPlace: m.birthPlace ?? "" })).filter(p => p !== null);
  if (!palettes.length) return null;
  const entry = (role: BirthColorRole): Swatch => {
    const code = (mixHex(palettes.map(p => p[role].code)) ?? "#D4AF37").toUpperCase();
    return { slot: 0, name: birthColorNameForHex(code), code };
  };
  return { main: entry("main"), sub: entry("sub"), money: entry("money"), work: entry("work"), love: entry("love"), health: entry("health"), mind: entry("mind"), provisional: palettes.some(p => p.provisional), placeDefault: palettes.some(p => p.placeDefault) };
}
