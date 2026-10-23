import * as A from "astronomy-engine";

/** Tropical Sun sign index (0 = Aries … 11 = Pisces) at JST noon of the birth date. */
export function sunSignIndex(birthDate: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;
  const d = new Date(`${birthDate}T03:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor(A.SunPosition(d).elon / 30) % 12;
}

export const SIGN_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

/** Simplified, recognisable stick figures in a unit box (artistic, not a star catalogue).
 * stars: [x, y, magnitude-weight]; lines: index pairs. */
export const CONSTELLATIONS: { stars: [number, number, number][]; lines: [number, number][] }[] = [
  { stars: [[.15, .55, 1], [.45, .4, 1.6], [.7, .45, 1.2], [.85, .6, .8]], lines: [[0, 1], [1, 2], [2, 3]] },
  { stars: [[.2, .2, .9], [.4, .45, 1], [.5, .55, 1.7], [.62, .48, 1], [.85, .25, 1], [.3, .8, .8]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5]] },
  { stars: [[.3, .15, 1.5], [.6, .15, 1.6], [.3, .5, .9], [.6, .5, .9], [.25, .85, .8], [.65, .85, .8]], lines: [[0, 2], [2, 4], [1, 3], [3, 5], [2, 3]] },
  { stars: [[.5, .2, .8], [.5, .5, 1], [.25, .8, 1.1], [.78, .78, 1]], lines: [[0, 1], [1, 2], [1, 3]] },
  { stars: [[.2, .3, 1], [.35, .2, .9], [.45, .35, 1], [.4, .55, 1.6], [.7, .55, 1], [.85, .75, 1.2]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
  { stars: [[.15, .3, .9], [.35, .4, 1], [.5, .5, 1], [.65, .45, .9], [.8, .75, 1.6], [.45, .8, .8]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5]] },
  { stars: [[.2, .6, 1.1], [.5, .3, 1.2], [.8, .6, 1], [.5, .7, .8]], lines: [[0, 1], [1, 2], [0, 3], [3, 2]] },
  { stars: [[.1, .25, .9], [.25, .35, 1.6], [.4, .5, 1], [.5, .7, .9], [.7, .8, .9], [.85, .65, 1], [.9, .45, .8]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]] },
  { stars: [[.2, .7, 1], [.4, .55, 1.2], [.55, .4, 1], [.75, .25, .9], [.5, .7, .9], [.65, .6, 1]], lines: [[0, 1], [1, 2], [2, 3], [1, 4], [4, 5], [5, 2]] },
  { stars: [[.15, .3, 1], [.5, .75, 1], [.85, .3, 1.1], [.6, .45, .8]], lines: [[0, 1], [1, 2], [2, 3], [3, 0]] },
  { stars: [[.2, .2, 1], [.4, .35, 1.1], [.55, .3, .9], [.45, .6, .9], [.6, .8, 1], [.8, .7, .8]], lines: [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5]] },
  { stars: [[.15, .2, .9], [.25, .45, 1], [.45, .7, 1.1], [.7, .55, 1], [.85, .4, .9]], lines: [[0, 1], [1, 2], [2, 3], [3, 4]] },
];

/** Up to four corner slots: top-left, top-right, bottom-left, bottom-right. */
export function cornerSlots(count: number) {
  return [[0, 0], [1, 0], [0, 1], [1, 1]].slice(0, Math.max(0, Math.min(4, count))) as [number, number][];
}

/** Deterministic 32-bit hash of the seven colors: drives per-person light placement. */
export function paletteSeed(colors: string[]) {
  return colors.join("|").split("").reduce((h, ch) => (Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0), 2166136261);
}
