import points from "./japan-birthplace-centroids.json";

// Municipality and prefecture representative points from Geolonia Japanese Addresses
// (CC BY 4.0, https://github.com/geolonia/japanese-addresses).
// These are approximate centroids, never a hospital's exact location.
const municipalities: Record<string, number[]> = points.municipalities;
const prefectures: Record<string, number[]> = points.prefectures;
const normalize = (value: string) => value.normalize("NFKC").replace(/ヶ|ケ|ヵ/g, "ケ").replace(/[\s　]/g, "");
const names = Object.keys(municipalities).sort((a, b) => b.length - a.length);

export function resolveBirthplace(birthPlace: string, birthCity = "") {
  const prefecture = normalize(birthPlace);
  const city = normalize(birthCity);
  const full = city.startsWith(prefecture) ? city : prefecture + city;
  const found = names.find(name => normalize(name).startsWith(prefecture) && full.startsWith(normalize(name)));
  const coordinates = (found && municipalities[found]) || prefectures[birthPlace];
  if (!coordinates || coordinates[0] === undefined || coordinates[1] === undefined) return null;
  return { lat: coordinates[0], lon: coordinates[1], label: found || birthPlace, precision: found ? "municipality" as const : "prefecture" as const };
}