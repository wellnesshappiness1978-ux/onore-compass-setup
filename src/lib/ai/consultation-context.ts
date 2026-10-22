import { computeCoreLayers, coreLayersPrompt, type CoreInput } from "./core-layers";
import { birthColorSpectrum } from "../birth-color-spectrum";
import { natalSky } from "../natal-sky";
import { directionEnergy } from "../day-compass";
import { biorhythm } from "../team-analysis";
import { nineStarProfile } from "../calendar-traditions";
import { helioPhase } from "./helio-phase";
import { approachStatuses } from "../trait-reading";
import { parseSiblingComposition } from "../sibling-order";

type Input = CoreInput & {
  birthPlace: string;
  nameKana: string;
  birthCity: string;
  siblingOrder: string;
  gender?: "male" | "female" | "other" | "undisclosed";
};

export function consultationContext(profile: Input, day: string) {
  const date = new Date(`${day}T12:00:00Z`);
  const core = computeCoreLayers(profile, date);
  const colors = birthColorSpectrum(profile);
  const earth = helioPhase(profile.birthDate, date);
  const nineStars = nineStarProfile(
    profile.birthDate,
    profile.birthTime,
    profile.birthTimeUnknown,
    profile.gender,
  );
  const sky = natalSky(profile.birthDate, profile.birthTime, profile.birthTimeUnknown);
  const status = approachStatuses({
    core: Boolean(core),
    earth: Boolean(earth),
    nineStars: Boolean(nineStars),
    color: Boolean(colors),
    blood: Boolean(profile.bloodType),
    siblings: Boolean(profile.siblingOrder),
    region: Boolean(profile.birthPlace || profile.birthCity),
  });
  return {
    profileContext: {
      birthPlace: profile.birthPlace,
      birthCity: profile.birthCity,
      siblingOrder: profile.siblingOrder,
      siblingComposition: parseSiblingComposition(profile.siblingOrder),
      interpretation: "Use the exact entered location and sibling counts/order for contextual examples and questions, not as proven personality evidence. Never infer missing siblings, local culture, timezone or precise coordinates from a language or address alone.",
    },
    core: coreLayersPrompt(core),
    status,
    sky,
    colors,
    earth,
    nineStars,
    today: {
      day,
      rhythm: biorhythm(profile.birthDate, day),
      directions: directionEnergy(profile.birthDate, date),
    },
    boundaries:
      "15 perspective keys are availability markers, NOT fifteen computed charts. Indian, Ziwei, Sanmei, lunar mansion and Maya charts are unavailable: omit them entirely. Blood, siblings and birthplace are context only, never personality evidence. Unknown birth time uses JST noon reference for the sky; hour pillar/ASC stay unset. Biorhythm sinusoids, day direction scores, phase and colors are illustrative reflection tools, NOT measured energy, medical evidence, guaranteed luck or predictions. Use traditional Gua directions separately from daily direction scores. Never substitute another method for a missing chart.",
  };
}
