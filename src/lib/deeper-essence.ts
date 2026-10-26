import { computeCoreLayers, type CoreInput, type CoreLayers } from './ai/core-layers';
import { computeExtendedArts } from './extended-arts';
import { birthColorSpectrum } from './birth-color-spectrum';
import { natalSky } from './natal-sky';

export const deeperEssenceKeys = ['roots', 'energy', 'learning', 'guidance'] as const;
export type DeeperEssenceKey = typeof deeperEssenceKeys[number];
export type DeeperProfile = CoreInput & { birthPlace: string; father?: { birthDate: string; birthPlace?: string; birthCity?: string } | null | undefined; mother?: { birthDate: string; birthPlace?: string; birthCity?: string } | null | undefined };
const mod = (n: number, m: number) => ((n % m) + m) % m;
const signNames = ['牡羊座', '牡牛座', '双子座', '蟹座', '獅子座', '乙女座', '天秤座', '蠍座', '射手座', '山羊座', '水瓶座', '魚座'];
const elementOrder = ['火', '地', '風', '水'];
const runeNames = ['Fehu', 'Uruz', 'Thurisaz', 'Ansuz', 'Raidho', 'Kenaz', 'Gebo', 'Wunjo', 'Hagalaz', 'Nauthiz', 'Isa', 'Jera', 'Eihwaz', 'Perthro', 'Algiz', 'Sowilo', 'Tiwaz', 'Berkano', 'Ehwaz', 'Mannaz', 'Laguz', 'Ingwaz', 'Dagaz', 'Othala'];

/** Astronomical references and explicitly original symbolic indices, never energy measurements. */
export function computeDeeperEssence(profile: DeeperProfile, core?: CoreLayers | null) {
  const sky = natalSky(profile.birthDate, profile.birthTime, profile.birthTimeUnknown);
  if (!sky) return null;
  // Fix the reference date: Traits describes birth structure, not a changing daily state.
  const layers = core ?? computeCoreLayers(profile, new Date(sky.instant));
  const extended = computeExtendedArts(profile.birthDate, profile.birthTime, profile.birthTimeUnknown);
  const palette = birthColorSpectrum(profile);
  if (!layers || !extended || !palette) return null;
  const t = (new Date(sky.instant).getTime() - Date.UTC(2000, 0, 1, 12)) / 864e5 / 36525;
  // Mean lunar ascending node (Meeus polynomial), not the osculating true node.
  const northLongitude = mod(125.04452 - 1934.136261 * t + .0020708 * t * t + t * t * t / 450000, 360);
  const southLongitude = mod(northLongitude + 180, 360);
  const elements = elementOrder.map((element, index) => ({ element, count: sky.bodies.filter(b => Math.floor(b.longitude / 30) % 4 === index).length }));
  const yang = elements[0]?.count ?? 0;
  const air = elements[2]?.count ?? 0;
  const birthNumber = Number(profile.birthDate.replaceAll('-', ''));
  const seed = birthNumber + layers.numerology.lifePath * 31 + palette.main.slot;
  const chakraThemes = Array.from({ length: 7 }, (_, i) => ({ chakra: i + 1, emphasis: mod(seed + (i + 1) * 37 + Math.round((sky.bodies[i]?.longitude ?? 0) * 4), 7) + 1 }));
  const tone = extended.maya.tone;
  // Solve both Tzolkin congruences; the existing legacy KIN is not used for this new wave reference.
  const sealIndex = mod(Math.floor(new Date(`${profile.birthDate}T00:00:00Z`).getTime() / 864e5) + 2440588 - 2456283 + 19, 20);
  const kin = Array.from({ length: 260 }, (_, i) => i + 1).find(k => mod(k - 1, 13) + 1 === tone && mod(k - 1, 20) === sealIndex) ?? 1;
  return {
    roots: { sun: layers.western.sun, moon: layers.western.moon, moonUncertain: layers.western.moonUncertain, ascendant: layers.western.ascendant, timeReference: sky.approximate ? 'JST noon' : 'entered time interpreted as JST', northLongitude, southLongitude, northSign: signNames[Math.floor(northLongitude / 30)], southSign: signNames[Math.floor(southLongitude / 30)], nodeModel: 'mean lunar node', lifePath: layers.numerology.lifePath, soul: layers.numerology.soul },
    energy: { chakraThemes, focusChakra: chakraThemes.reduce((a, b) => b.emphasis > a.emphasis ? b : a).chakra, elements, yang: yang + air, yin: 10 - yang - air, aura: palette.main, parentInfluence: palette.parentInfluence },
    learning: { tarot: mod(seed, 22), rune: runeNames[mod(seed + tone, 24)] ?? 'Fehu', runeIndex: mod(seed + tone, 24), maya: { ...extended.maya, kin, waveStart: kin - tone + 1 } },
    guidance: { archetype: mod(seed + layers.eastern.branchIndex, 4), release: mod(seed + layers.numerology.lifePath, 4), possibility: mod(seed + tone, 4) },
    reference: 'Original deterministic birth-symbolism: tarot/runes are not card draws; chakra emphasis and aura are not measured energy or current mental/physical state; guardians, past lives, karma and parallel futures are narrative metaphors, not verified entities, memories or predictions.',
  };
}
export type DeeperEssence = NonNullable<ReturnType<typeof computeDeeperEssence>>;
export const deeperEssencePrompt = `FOUR DEEPER DOMAINS: Use the supplied birth-based deeperEssence references, retaining all seventeen art inputs. Soul roots: connect Sun/Moon/available ASC, mean north/south lunar nodes and life path/available name-vowel soul number as familiar strengths versus a growth invitation. Energy: all seven chakra themes, birth aura, four-element counts and yin/yang are symbolic attention cues, NOT blocked organs, measured energy or a diagnosis of current emotions. Learning: birth-derived major arcana and rune archetypes (not divination draws), Maya seal/tone/wave as everyday learning metaphors. Guidance: a guardian/higher-self voice is an imagined compassionate perspective; past-life karma means a symbolic habit to release, never a factual past-life memory, curse, debt or trauma. Parallel futures are conditional possibilities following real choices, never promised events. Omit missing ASC/name numbers; keep noon/mean-node uncertainty. Do not disclose gated birth-color names/codes outside their separate color UI. In Today/consultation, occasionally (not every time) weave ONE relevant domain as a short solemn 'message' or 'present-state awareness' line (e.g. a one-sentence oracle about the soul's current state), then return to the concrete answer. Soul mission = where the familiar strength is now gathering toward the goal; chakra = which inner door is currently most alive, never a measured blockage; higher self = a brief solemn message; past-life karma = a pattern now loosening. Do not force all four, diagnose, or imply contact with a supernatural being. For groups use EACH member's own context, never substitute the owner. Traits remains birth structure, not today's measured state.`;
export function deeperEssenceContext(profile: DeeperProfile, core?: CoreLayers | null) {
  return { values: computeDeeperEssence(profile, core), instructions: deeperEssencePrompt };
}