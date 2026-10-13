import * as A from "astronomy-engine";
import { resolveBirthplace } from "./birthplace";

export const cosmicPlanetSpecs = [
  { id: "mercury", name: "水星", body: A.Body.Mercury, meanRadiusKm: 2439.7 },
  { id: "venus", name: "金星", body: A.Body.Venus, meanRadiusKm: 6051.8 },
  { id: "earth", name: "地球", body: A.Body.Earth, meanRadiusKm: 6371.0 },
  { id: "mars", name: "火星", body: A.Body.Mars, meanRadiusKm: 3389.5 },
  { id: "jupiter", name: "木星", body: A.Body.Jupiter, meanRadiusKm: 69911 },
  { id: "saturn", name: "土星", body: A.Body.Saturn, meanRadiusKm: 58232, ringOuterRadiusKm: 140220 },
  { id: "uranus", name: "天王星", body: A.Body.Uranus, meanRadiusKm: 25362 },
  { id: "neptune", name: "海王星", body: A.Body.Neptune, meanRadiusKm: 24622 },
] as const;

/** IAU/NASA nominal solar radius used by the physical size-comparison strip. */
export const COSMIC_SUN_MEAN_RADIUS_KM = 695_700;
export const COSMIC_MOON_MEAN_RADIUS_KM = 1737.4;

export type CosmicPlanetId = (typeof cosmicPlanetSpecs)[number]["id"];
export type CosmicPlanet = {
  id: CosmicPlanetId;
  name: string;
  longitude: number;
  distanceAu: number;
  eclipticX: number;
  eclipticY: number;
  eclipticZ: number;
  meanRadiusKm: number;
  ringOuterRadiusKm: number;
  orbit: CosmicOrbitPoint[];
  orbitIndex: number;
};

export type CosmicOrbitPoint = { x: number; y: number; z: number; distanceAu: number };

export type CosmicGenesis = {
  instant: string;
  approximate: boolean;
  planets: CosmicPlanet[];
  moon: CosmicMoon;
  sunSign: number;
  moonSign: number;
  animal: number;
  seed: number;
};

export type CosmicMoon = {
  longitude: number;
  latitude: number;
  distanceAu: number;
  phaseAngle: number;
  phaseFraction: number;
  phaseLongitude: number;
  lightAngle: number;
  poleAngle: number;
  librationLongitude: number;
  librationLatitude: number;
};

export type EarthView = {
  latitude: number;
  longitude: number;
  siderealRotation: number;
  solarHourAngle: number;
  axialTiltDegrees: number;
  subsolarLatitude: number;
  approximatePlace: boolean;
};

const signIndex = (longitude: number) => Math.floor((((longitude % 360) + 360) % 360) / 30);

function birthInstant(date: string, time: string, unknown: boolean) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const valid = new Date(Date.UTC(year, month - 1, day));
  if (valid.getUTCFullYear() !== year || valid.getUTCMonth() !== month - 1 || valid.getUTCDate() !== day) return null;
  const hasTime = !unknown && /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
  const hour = hasTime ? Number(time.slice(0, 2)) : 12;
  const minute = hasTime ? Number(time.slice(3, 5)) : 0;
  return { instant: new Date(Date.UTC(year, month - 1, day, hour - 9, minute)), approximate: !hasTime, year };
}

export function cosmicGenesis(date: string, time: string, unknown: boolean): CosmicGenesis | null {
  const birth = birthInstant(date, time, unknown);
  if (!birth) return null;
  const planets = cosmicPlanetSpecs.map((spec, orbitIndex) => {
    const vector = A.HelioVector(spec.body, birth.instant);
    const ecliptic = A.Ecliptic(vector);
    const period = A.PlanetOrbitalPeriod(spec.body);
    const orbit = Array.from({ length: 96 }, (_, index) => {
      const sampleInstant = new Date(birth.instant.getTime() + period * index / 96 * 86_400_000);
      const sample = A.Ecliptic(A.HelioVector(spec.body, sampleInstant)).vec;
      return { x: sample.x, y: sample.y, z: sample.z, distanceAu: Math.hypot(sample.x, sample.y, sample.z) };
    });
    return {
      id: spec.id,
      name: spec.name,
      longitude: ecliptic.elon,
      distanceAu: Math.hypot(vector.x, vector.y, vector.z),
      eclipticX: ecliptic.vec.x,
      eclipticY: ecliptic.vec.y,
      eclipticZ: ecliptic.vec.z,
      meanRadiusKm: spec.meanRadiusKm,
      ringOuterRadiusKm: "ringOuterRadiusKm" in spec ? spec.ringOuterRadiusKm : spec.meanRadiusKm,
      orbit,
      orbitIndex,
    };
  });
  const sunSign = signIndex(A.SunPosition(birth.instant).elon);
  const lunar = A.EclipticGeoMoon(birth.instant);
  const illumination = A.Illumination(A.Body.Moon, birth.instant);
  const moonVector = A.GeoMoon(birth.instant);
  const length = Math.hypot(moonVector.x, moonVector.y, moonVector.z);
  const normal = { x: moonVector.x / length, y: moonVector.y / length, z: moonVector.z / length };
  const eastLength = Math.hypot(normal.x, normal.y);
  const east = { x: -normal.y / eastLength, y: normal.x / eastLength, z: 0 };
  const north = { x: -normal.z * east.y, y: normal.z * east.x, z: eastLength };
  const projectAngle = (vector: { x: number; y: number; z: number }) => Math.atan2(-(vector.x * north.x + vector.y * north.y + vector.z * north.z), vector.x * east.x + vector.y * east.y);
  // hc is heliocentric Moon, so its negative is the Moon-to-Sun direction.
  const lunarSun = { x: -illumination.hc.x, y: -illumination.hc.y, z: -illumination.hc.z };
  const libration = A.Libration(birth.instant);
  const moon: CosmicMoon = {
    longitude: lunar.lon,
    latitude: lunar.lat,
    distanceAu: lunar.dist,
    phaseAngle: illumination.phase_angle,
    phaseFraction: illumination.phase_fraction,
    phaseLongitude: A.MoonPhase(birth.instant),
    lightAngle: projectAngle(lunarSun),
    poleAngle: projectAngle(A.RotationAxis(A.Body.Moon, birth.instant).north),
    librationLongitude: libration.elon,
    librationLatitude: libration.elat,
  };
  const moonSign = signIndex(moon.longitude);
  const animal = ((birth.year - 4) % 12 + 12) % 12;
  const seed = planets.reduce((total, planet, index) => total + Math.round(planet.longitude * (index + 3) * 10), birth.year * 37 + animal * 101);
  return { instant: birth.instant.toISOString(), approximate: birth.approximate, planets, moon, sunSign, moonSign, animal, seed };
}

const wrapDegrees = (value: number) => ((value % 360) + 360) % 360;

/** Keeps the saved birthplace visible while deriving rotation and the day/night face from the birth instant. */
export function earthViewAtBirth(genesis: CosmicGenesis, birthPlace: string, birthCity = ""): EarthView {
  const resolved = resolveBirthplace(birthPlace, birthCity);
  const latitude = resolved?.lat ?? 35.6762;
  const longitude = resolved?.lon ?? 139.6503;
  const instant = new Date(genesis.instant);
  const siderealRotation = wrapDegrees(A.SiderealTime(instant) * 15);
  const sun = A.Equator(A.Body.Sun, instant, new A.Observer(latitude, longitude, 0), true, true);
  const solarHourAngle = wrapDegrees((A.SiderealTime(instant) + longitude / 15 - sun.ra) * 15 + 180) - 180;
  return {
    latitude,
    longitude,
    siderealRotation,
    solarHourAngle,
    axialTiltDegrees: 23.439281,
    subsolarLatitude: sun.dec,
    approximatePlace: !resolved,
  };
}