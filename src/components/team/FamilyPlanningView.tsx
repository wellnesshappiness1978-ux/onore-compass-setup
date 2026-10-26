import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Compass, CalendarDays } from 'lucide-react';
import { Button } from '../ui/button';
import { SacredDisclosure } from '../ui/sacred-disclosure';
import { familyDirectionDay, familyPlanning, familyPlanningDay } from '@/lib/family-planning';
import { familyVisualCopy } from '@/lib/family-visual-copy';
import { memberDisplayName } from '@/lib/focus';
import { fengDirectionNames } from '@/lib/feng-shui';
import type { TeamMember } from '@/lib/team-analysis';
import type { Language } from '@/lib/translations';
import { directions } from '@/lib/day-compass';

const strokes=['stroke-primary','stroke-profile-work','stroke-profile-love','stroke-profile-social','stroke-fortune-good'];
const borders=['border-primary','border-profile-work','border-profile-love','border-profile-social','border-fortune-good'];
export default function FamilyPlanningView({members,day,language,mode}:{members:TeamMember[];day:string;language:Language;mode:'directions'|'rhythm'}) {
 const c=familyVisualCopy[language];
 const [offset,setOffset]=useState(0),[picked,setPicked]=useState<string | null>(null),[cycle,setCycle]=useState<'physical'|'emotional'|'intellectual'>('emotional');
 const start=familyPlanningDay(day,offset);
 const planning=useMemo(()=>familyPlanning(members,start),[members,start]);
 const selected=planning.timeline.find(d=>d.day===picked) ?? planning.best;
 const selectedDirection=useMemo(()=>familyDirectionDay(members,selected?.day ?? start),[members,selected?.day,start]);
 const dirName=(dir:string)=>language==='ja'?fengDirectionNames[dir as keyof typeof fengDirectionNames]:dir;
 const format=(iso:string)=>new Intl.DateTimeFormat(language,{month:'short',day:'numeric',weekday:'short',timeZone:'UTC'}).format(new Date(`${iso}T12:00:00Z`));
 const noHigh=!planning.timeline.some(d=>d.allHigh);
 return <section className="space-y-5 min-w-0">
  <div className="flex items-center justify-between gap-2"><Button size="icon" variant="outline" aria-label={c.selectDay+' −30'} onClick={()=>{setOffset(v=>v-30);setPicked(null);}}><ChevronLeft className="size-4"/></Button><h4 className="text-center text-sm font-semibold text-primary">{format(start)} — {format(familyPlanningDay(start,29))}</h4><Button size="icon" variant="outline" aria-label={c.selectDay+' +30'} onClick={()=>{setOffset(v=>v+30);setPicked(null);}}><ChevronRight className="size-4"/></Button></div>
  {mode==='directions'?<>
   <div className="relative mx-auto aspect-square w-full max-w-xs rounded-full border border-primary/40 bg-background">
    <Compass className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 text-primary/40" aria-hidden="true"/>
    {directions.map((dir,i)=>{const value=selectedDirection.ranked.find(v=>v.dir===dir);const angle=i*Math.PI/4;return <div key={dir} className="absolute w-14 -translate-x-1/2 -translate-y-1/2 text-center text-xs" style={{left:`${50+Math.sin(angle)*35}%`,top:`${50-Math.cos(angle)*35}%`}}><strong className={value?.common?'text-primary':'text-foreground'}>{dirName(dir)}</strong><span className="block tabular-nums">{value?.score}/100</span>{value?.common&&<span className="text-primary">✓</span>}</div>;})}
   </div>
   <h4 className="text-sm font-semibold text-primary">{selectedDirection.common.length?c.common:c.compromise}</h4><p className="text-sm">{(selectedDirection.common.length?selectedDirection.common:selectedDirection.ranked.slice(0,2).map(v=>v.dir)).map(dirName).join(' · ')}</p>
   {selectedDirection.missing.length>0&&<p className="text-xs leading-6 text-muted-foreground">{c.missing}：{members.filter(m=>selectedDirection.missing.includes(m.id)).map(memberDisplayName).join(' · ')}</p>}
   <h4 className="flex items-center gap-2 text-sm font-semibold text-primary"><CalendarDays className="size-4"/>{c.candidates}</h4>
   <div className="grid gap-2 sm:grid-cols-3">{planning.dates.slice(0,3).map(d=><Button key={d.day} variant="outline" className="h-auto min-h-20 flex-col whitespace-normal" onClick={()=>setPicked(d.day)} aria-pressed={selected?.day===d.day}><strong>{format(d.day)}</strong><span>{d.direction?dirName(d.direction):'—'} · {d.score}/100</span><span className="text-xs text-muted-foreground">{d.common?c.common:c.compromise}</span></Button>)}</div>
  </>:<>
   <div className="flex flex-wrap gap-2" role="group" aria-label={c.timelineGuide}>{(['physical','emotional','intellectual'] as const).map(key=><Button key={key} size="sm" variant={cycle===key?'default':'outline'} aria-pressed={cycle===key} onClick={()=>setCycle(key)}>{c[key]}</Button>)}</div>
   <svg viewBox="0 0 600 220" className="h-56 w-full overflow-visible" preserveAspectRatio="none" role="img" aria-label={c.best}>
    <path d="M0 110H600M0 10V210" className="stroke-muted-foreground/40" fill="none"/>
    {planning.timeline.map((d,i)=>d.caution||d.allHigh?<rect key={d.day} x={i*20} y="10" width="19" height="200" className={d.allHigh?'fill-primary/10':'fill-destructive/10'}/>:null)}
    {members.map((m,i)=><polyline key={m.id} className={strokes[i%5]} fill="none" strokeWidth={members.length>12?'1':'2'} vectorEffect="non-scaling-stroke" strokeDasharray={i>=5?`${2+i%4} 3`:undefined} points={planning.timeline.map((d,j)=>`${j*600/29},${110-(d.readings.find(r=>r.id===m.id)?.[cycle] ?? 0)*90}`).join(' ')}><title>{i+1}. {memberDisplayName(m)}</title></polyline>)}
   </svg>
   <ol className="grid gap-2 text-xs sm:grid-cols-2">{members.map((m,i)=><li key={m.id} className="flex items-center gap-2"><span className={`w-6 shrink-0 border-t-2 ${borders[i%5]} ${i>=5?'border-dashed':''}`}/>{i+1}. {memberDisplayName(m)}</li>)}</ol>
   <p className="text-xs leading-6 text-muted-foreground">{noHigh?c.noHigh:c.best} · {planning.best?format(planning.best.day):'—'}</p>
  </>}
  <div className="flex flex-wrap gap-3 text-xs"><span className="border-l-4 border-destructive pl-2">{c.caution}</span><span className="border-l-4 border-primary pl-2">{c.best}</span><span className="border-l-4 border-muted-foreground pl-2">{c.steady}</span></div>
  <div className="grid grid-cols-7 gap-1" aria-label={c.selectDay}>{Array.from({length:new Date(`${start}T12:00:00Z`).getUTCDay()},(_,i)=><span key={`space${i}`}/>)}{planning.timeline.map(d=><Button key={d.day} variant="outline" aria-label={`${format(d.day)} · ${d.caution?c.caution:d.allHigh?c.best:c.steady} · ${d.synchrony}`} aria-pressed={selected?.day===d.day} onClick={()=>setPicked(d.day)} className={`h-auto min-h-14 min-w-0 flex-col gap-0 px-0.5 text-xs ${d.caution?'border-destructive/60 bg-destructive/10':d.allHigh?'border-primary bg-primary/10':'border-border'} ${selected?.day===d.day?'ring-2 ring-ring':''}`}><span>{Number(d.day.slice(8))}</span><strong className="tabular-nums">{d.synchrony}</strong></Button>)}</div>
  {selected&&<section className="space-y-3 border-y border-primary/30 py-4"><h4 className="text-base font-semibold text-primary">{format(selected.day)} · {selected.caution?c.caution:selected.allHigh?c.best:c.steady}</h4><p className="text-sm leading-7">{c.actions[selected.caution?1:selected.allHigh?0:2]}</p><ul className="space-y-2 text-xs">{selected.readings.map(r=>{const m=members.find(m=>m.id===r.id);return <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2"><strong>{m?memberDisplayName(m):'—'}</strong><span>{Math.round((r[cycle]+1)*50)}/100</span></li>;})}</ul></section>}
  <SacredDisclosure title={mode==='directions'?c.direction:c.guide} closeLabel={c.close}><p className="text-sm leading-7">{mode==='directions'?c.directionGuide:c.timelineGuide}</p></SacredDisclosure>
  <p className="text-xs leading-6 text-muted-foreground">{c.reference}</p>
 </section>;
}