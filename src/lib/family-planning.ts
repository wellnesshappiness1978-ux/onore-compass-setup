import { biorhythm, type TeamMember } from './team-analysis';
import { directionEnergy, directions, type Direction } from './day-compass';
import { mingGua } from './feng-shui';

export const familyPlanningDay = (start: string, offset: number) => {
  const date = new Date(`${start}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};

/** Transparent original planning model, never a prediction of emotions or success. */
export function rhythmWindow(members: TeamMember[], start: string, length = 30) {
  return Array.from({ length }, (_, i) => {
    const day = familyPlanningDay(start, i);
    const readings = members.map(member => ({ id: member.id, ...biorhythm(member.birthDate, day) }));
    const minimum = readings.length ? Math.min(...readings.map(r => r.total)) : 0;
    const mean = readings.length ? readings.reduce((s, r) => s + r.total, 0) / readings.length : 0;
    const spread = readings.length ? (Math.max(...readings.map(r => r.emotional)) - Math.min(...readings.map(r => r.emotional))) / 2 : 0;
    const synchrony = Math.round(mean * .4 + minimum * .6);
    const caution = readings.length > 1 && (spread >= .65 || readings.filter(r => r.emotional < -.5).length >= Math.ceil(readings.length / 2));
    const allHigh = readings.length > 1 && readings.every(r => r.total >= 65 && r.emotional > 0);
    return { day, readings, minimum, mean: Math.round(mean), spread, synchrony, caution, allHigh };
  });
}

export function familyDirectionDay(members: TeamMember[], day: string) {
  const date = new Date(`${day}T12:00:00Z`);
  const individual = members.map(member => {
    const branch = mingGua(member.birthDate, member.gender)?.branches[0];
    const favorable = branch ? [branch.shengQi, branch.tianYi, branch.yanNian, branch.fuWei] : null;
    return { id: member.id, favorable, values: directionEnergy(member.birthDate, date) };
  });
  const complete = individual.length > 0 && individual.every(v => v.favorable !== null);
  const ranked = directions.map(dir => {
    const perMember = individual.map(v => ({ id: v.id, score: v.values.find(e => e.dir === dir)?.score ?? 0, favorable: v.favorable?.includes(dir) ?? null }));
    const minimum = perMember.length ? Math.min(...perMember.map(v => v.score)) : 0;
    const mean = perMember.length ? perMember.reduce((s, v) => s + v.score, 0) / perMember.length : 0;
    return { dir, score: Math.round(minimum * .6 + mean * .4), minimum, perMember, common: complete && perMember.every(v => v.favorable === true) };
  }).sort((a, b) => Number(b.common) - Number(a.common) || b.score - a.score || directions.indexOf(a.dir) - directions.indexOf(b.dir));
  return { ranked, complete, common: ranked.filter(v => v.common).map(v => v.dir), missing: individual.filter(v => !v.favorable).map(v => v.id) };
}

export function familyPlanning(members: TeamMember[], start: string) {
  const timeline = rhythmWindow(members, start);
  const dates = timeline.map(d => {
    const direction = familyDirectionDay(members, d.day).ranked[0];
    return { day: d.day, direction: direction?.dir as Direction | undefined, common: direction?.common ?? false, score: Math.round(d.synchrony * .6 + (direction?.score ?? 0) * .4), caution: d.caution, allHigh: d.allHigh };
  }).sort((a, b) => Number(a.caution) - Number(b.caution) || b.score - a.score || a.day.localeCompare(b.day));
  return { timeline, dates, directions: familyDirectionDay(members, start), best: [...timeline].sort((a, b) => b.synchrony - a.synchrony)[0] };
}