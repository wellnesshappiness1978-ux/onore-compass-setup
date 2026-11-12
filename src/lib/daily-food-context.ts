import { computeCoreLayers } from './ai/core-layers';
import { nineStarProfile } from './calendar-traditions';
import { dayElement, type Element } from './team-analysis';
import { seasonOf } from './seasonal-recipes';

const births = new Map<string, ReturnType<typeof birthContext>>();
function birthContext(birthDate: string) {
  const core = computeCoreLayers({birthDate,birthTime:'',birthTimeUnknown:true,nameKanji:'',nameRomaji:'',bloodType:''},new Date(`${birthDate}T03:00:00Z`));
  return {birthDate,honmei:nineStarProfile(birthDate)?.honmei ?? null,sunSign:core?.western.sun ?? null,lifePath:core?.numerology.lifePath ?? null,natalBalance:core?.shichu.balance ?? null};
}
export function dailyFoodContext(dates: readonly string[], day: string) {
  const members = [...dates].filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d) && Number.isFinite(Date.parse(d))).sort().map(date=>{
    const saved=births.get(date); if(saved) return saved;
    const value=birthContext(date); if(births.size>=128) {const key=births.keys().next().value;if(key) births.delete(key);} births.set(date,value); return value;
  });
  const seasonElement: Element = ({spring:'wood',summer:'fire',autumn:'metal',winter:'water'} as const)[seasonOf(day)];
  const todayElement=dayElement(day);
  // This is an explicit two-signal seasonal/day reference, not a complete natal chart or measurement.
  const dailyBalance = Object.fromEntries((['wood','fire','earth','metal','water'] as const).map(e=>[e,Number(e===todayElement)+Number(e===seasonElement)]));
  return {members,day,todayElement,seasonElement,dailyBalance,balanceModel:'day stem + Japanese seasonal element; symbolic meal planning, not measured health or energy'};
}