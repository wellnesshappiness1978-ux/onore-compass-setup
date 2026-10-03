// Geocentric J2000 equatorial coordinates, converted to a display-normalized celestial sphere.
import * as A from "astronomy-engine";

export const natalBodies = [
  ["太陽", A.Body.Sun], ["月", A.Body.Moon], ["水星", A.Body.Mercury],
  ["金星", A.Body.Venus], ["火星", A.Body.Mars], ["木星", A.Body.Jupiter], ["土星", A.Body.Saturn],
  ["天王星", A.Body.Uranus], ["海王星", A.Body.Neptune], ["冥王星", A.Body.Pluto],
] as const;

export function natalSky(date: string, time: string, unknown: boolean) {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!d) return null;
  const valid = new Date(`${date}T03:00:00Z`);
  if (Number.isNaN(valid.getTime()) || valid.toISOString().slice(0, 10) !== date) return null;
  const hasTime = !unknown && /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
  const hh = hasTime ? Number(time.slice(0, 2)) : 12;
  const mm = hasTime ? Number(time.slice(3, 5)) : 0;
  const instant = new Date(Date.UTC(Number(d[1]), Number(d[2]) - 1, Number(d[3]), hh - 9, mm));
  return { approximate: !hasTime, instant: instant.toISOString(), bodies: natalBodies.map(([name, body], i) => {
    const vector = A.GeoVector(body, instant, true);
    const ecliptic = A.Ecliptic(vector);
    const longitude = body === A.Body.Sun ? A.SunPosition(instant).elon : body === A.Body.Moon ? A.EclipticGeoMoon(instant).lon : ecliptic.elon;
    const latitude = body === A.Body.Moon ? A.EclipticGeoMoon(instant).lat : ecliptic.elat;
    const distance = Math.hypot(vector.x, vector.y, vector.z) || 1;
    const angle = longitude * Math.PI / 180;
    return { name, longitude, latitude, chartPosition: [Math.cos(angle) * 3.5, Math.sin(angle) * 3.5, 0.25] as [number, number, number], position: [vector.x / distance * (1.35 + i * .22), vector.z / distance * (1.35 + i * .22), vector.y / distance * (1.35 + i * .22)] as [number, number, number] };
  }) };
}
