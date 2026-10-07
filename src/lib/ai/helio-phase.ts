// Illustrative "earth calendar" phase: angle Earth has travelled around the Sun since its birth-day position.
// Real heliocentric longitudes; the four-phase mapping is a reflective convention, not a verified timing system.
import * as A from "astronomy-engine";

export type HelioPhase = { phase: "seed" | "grow" | "harvest" | "rest"; degrees: number };

const earthLon = (d: Date) => {
  const v = A.HelioVector(A.Body.Earth, d);
  return ((Math.atan2(v.y, v.x) * 180) / Math.PI + 360) % 360;
};

export function helioPhase(birthDate: string, now = new Date()): HelioPhase | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;
  const birth = new Date(`${birthDate}T03:00:00Z`);
  if (Number.isNaN(birth.getTime())) return null;
  const degrees = Math.round((earthLon(now) - earthLon(birth) + 360) % 360);
  const phase = degrees < 90 ? "seed" : degrees < 180 ? "grow" : degrees < 270 ? "harvest" : "rest";
  return { phase, degrees };
}
