// Pure orthographic globe math shared by the birthplace detail and the orbital Earth.
export type Vec3 = { x: number; y: number; z: number };
const rad = Math.PI / 180;
export const OBLIQUITY_DEG = 23.439281;
export const wrapLon = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180;

export function latLonVector(latDeg: number, lonDeg: number): Vec3 {
  const la = latDeg * rad, lo = lonDeg * rad;
  return { x: Math.cos(la) * Math.cos(lo), y: Math.cos(la) * Math.sin(lo), z: Math.sin(la) };
}

export function vectorLatLon(v: Vec3) {
  return { lat: Math.asin(Math.max(-1, Math.min(1, v.z))) / rad, lon: Math.atan2(v.y, v.x) / rad };
}

/** Screen basis: forward points at the viewer, east is screen-right, north is screen-up. */
export function orthoBasis(centerLat: number, centerLon: number) {
  const la = centerLat * rad, lo = centerLon * rad;
  const forward = latLonVector(centerLat, centerLon);
  const east = { x: -Math.sin(lo), y: Math.cos(lo), z: 0 };
  const north = { x: -Math.sin(la) * Math.cos(lo), y: -Math.sin(la) * Math.sin(lo), z: Math.cos(la) };
  return { forward, east, north };
}

const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;

/** Unit-disc screen coordinates (y up) of a direction; visible when facing the viewer. */
export function projectOrtho(basis: ReturnType<typeof orthoBasis>, v: Vec3) {
  return { x: dot(v, basis.east), y: dot(v, basis.north), visible: dot(v, basis.forward) >= 0 };
}

/** World direction for a unit-disc pixel (y up); null outside the disc. */
export function unprojectOrtho(basis: ReturnType<typeof orthoBasis>, nx: number, ny: number): Vec3 | null {
  const sq = nx * nx + ny * ny; if (sq > 1) return null;
  const nz = Math.sqrt(1 - sq), { east: e, north: n, forward: f } = basis;
  return { x: nx * e.x + ny * n.x + nz * f.x, y: nx * e.y + ny * n.y + nz * f.y, z: nx * e.z + ny * n.z + nz * f.z };
}

/** Subsolar point from the Sun's local hour angle at a known longitude. */
export const subsolarLongitude = (observerLon: number, solarHourAngleDeg: number) => wrapLon(observerLon - solarHourAngleDeg);

/** Earth-fixed direction of the ecliptic north pole (RA 270°, Dec 90°−ε) at a sidereal rotation angle. */
export const eclipticNorthView = (siderealRotationDeg: number) => ({ lat: 90 - OBLIQUITY_DEG, lon: wrapLon(270 - siderealRotationDeg) });

/** Daylight 0..1 with a soft civil-twilight band. */
export const daylight = (normal: Vec3, sun: Vec3) => Math.max(0, Math.min(1, (dot(normal, sun) + .1) / .2));
