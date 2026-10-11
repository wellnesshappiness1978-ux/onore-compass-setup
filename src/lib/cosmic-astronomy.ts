import * as A from "astronomy-engine";

export const cosmicPlanetSpecs = [
  { id: "mercury", name: "水星", body: A.Body.Mercury, relativeVolume: 0.056, displayRadius: 9 },
  { id: "venus", name: "金星", body: A.Body.Venus, relativeVolume: 0.857, displayRadius: 15 },
  { id: "earth", name: "地球", body: A.Body.Earth, relativeVolume: 1, displayRadius: 17 },
  { id: "mars", name: "火星", body: A.Body.Mars, relativeVolume: 0.151, displayRadius: 11 },
  { id: "jupiter", name: "木星", body: A.Body.Jupiter, relativeVolume: 1321, displayRadius: 34 },
  { id: "saturn", name: "土星", body: A.Body.Saturn, relativeVolume: 764, displayRadius: 30 },
  { id: "uranus", name: "天王星", body: A.Body.Uranus, relativeVolume: 63.1, displayRadius: 24 },
  { id: "neptune", name: "海王星", body: A.Body.Neptune, relativeVolume: 57.7, displayRadius: 22 },
] as const;

export type CosmicPlanetId = (typeof cosmicPlanetSpecs)[number]["id"];
export type CosmicPlanet = {
  id: CosmicPlanetId;
  name: string;
  longitude: number;
  distanceAu: number;
  relativeVolume: number;
  displayRadius: number;
  orbitIndex: number;
};

export type CosmicGenesis = {
  instant: string;
  approximate: boolean;
  planets: CosmicPlanet[];
  sunSign: number;
  moonSign: number;
  animal: number;
  seed: number;
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
    return {
      id: spec.id,
      name: spec.name,
      longitude: A.EclipticLongitude(spec.body, birth.instant),
      distanceAu: Math.hypot(vector.x, vector.y, vector.z),
      relativeVolume: spec.relativeVolume,
      displayRadius: spec.displayRadius,
      orbitIndex,
    };
  });
  const sunSign = signIndex(A.SunPosition(birth.instant).elon);
  const moonSign = signIndex(A.EclipticGeoMoon(birth.instant).lon);
  const animal = ((birth.year - 4) % 12 + 12) % 12;
  const seed = planets.reduce((total, planet, index) => total + Math.round(planet.longitude * (index + 3) * 10), birth.year * 37 + animal * 101);
  return { instant: birth.instant.toISOString(), approximate: birth.approximate, planets, sunSign, moonSign, animal, seed };
}