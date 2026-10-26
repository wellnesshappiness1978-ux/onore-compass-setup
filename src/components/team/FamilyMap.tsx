import { useState } from 'react';
import { UserRound } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { SacredDisclosure } from '../ui/sacred-disclosure';
import { familyVisualCopy } from '@/lib/family-visual-copy';
import { memberDisplayName } from '@/lib/focus';
import { matrixPoint, type TeamMember } from '@/lib/team-analysis';
import { teamCopy } from '@/lib/team-copy';
import { siblingLabels } from '@/lib/sibling-order';
import type { analyzeFamily } from '@/lib/family-analysis';
import type { Language } from '@/lib/translations';

export function memberRelationship(member: TeamMember, language: Language) {
  return [member.relationship || siblingLabels[language].relationTypes[member.relationshipType ?? ''],member.role].filter(Boolean).join(' · ') || '—';
}
export default function FamilyMap({ data, language }: { data: ReturnType<typeof analyzeFamily>; language: Language }) {
 const c=familyVisualCopy[language],t=teamCopy[language];
 const [selected,setSelected]=useState<string | null>(null);
 const positions = data.entries.map((e,i)=>{
   const [x,y]=matrixPoint(e.member);
   // Deterministic visible separation for coincident role points; no effect on pair scores.
   const angle=i*2.399963;
   const radius= data.entries.length > 12 ? 7 + (i%5)*3 : 3;
   return { ...e, index:i+1, x:Math.max(12,Math.min(88,50+x*28+Math.cos(angle)*radius)),y:Math.max(12,Math.min(88,50-y*28+Math.sin(angle)*radius)) };
 });
 const pos=new Map(positions.map(e=>[e.member.id,e]));
 const strongest=[...data.pairs].sort((a,b)=>b.score-a.score)[0];
 const flow=data.pairs.filter(p=>p.relation==='generate').sort((a,b)=>b.score-a.score)[0] ?? strongest;
 const roles=[...new Set(data.entries.map(e=>e.role))];
 const active=positions.find(e=>e.member.id===selected);
 return <section className="space-y-4" aria-label={c.legend}>
   <div className="relative mx-auto aspect-square w-full max-w-lg border border-primary/40 bg-background" data-family-map>
    <span className="absolute left-1 top-1/2 z-10 -translate-y-1/2 text-[10px] text-muted-foreground">{t.axisX[0]}</span>
    <span className="absolute right-1 top-1/2 z-10 -translate-y-1/2 text-[10px] text-muted-foreground">{t.axisX[1]}</span>
    <span className="absolute left-1/2 top-1 z-10 -translate-x-1/2 text-[10px] text-muted-foreground">{t.axisY[1]}</span>
    <span className="absolute bottom-1 left-1/2 z-10 -translate-x-1/2 text-[10px] text-muted-foreground">{t.axisY[0]}</span>
    <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden="true">
     <path d="M50 8V92M8 50H92" className="stroke-primary/25" strokeWidth=".3" fill="none"/>
     {data.pairs.filter(p=> selected ? p.a.member.id===selected || p.b.member.id===selected : p.score>=75 || p.relation==='control').slice(0,150).map(p=>{
      const a=pos.get(p.a.member.id),b=pos.get(p.b.member.id); if(!a||!b)return null;
      const caution=p.relation==='control'||p.rhythm<45;
      return <line key={`${a.member.id}:${b.member.id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={caution?'stroke-destructive/65':'stroke-primary/60'} strokeWidth={selected?'.7':'.4'} strokeDasharray={caution?'1.5 1':undefined}/>;
     })}
    </svg>
    {positions.map(e=><Button key={e.member.id} variant="outline" size="icon" aria-label={`${e.index}. ${memberDisplayName(e.member)} · ${memberRelationship(e.member,language)}`} aria-pressed={selected===e.member.id} title={memberDisplayName(e.member)} onClick={()=>setSelected(selected===e.member.id?null:e.member.id)} className={`absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-card text-[10px] font-bold text-foreground ${selected===e.member.id?'ring-2 ring-primary ring-offset-2 ring-offset-background':''}`} style={{left:`${e.x}%`,top:`${e.y}%`,borderColor:e.colors?.main.code}}>{e.index}</Button>)}
   </div>
   <div className="grid gap-3 border-y border-primary/30 py-4 sm:grid-cols-3">
    {[[c.circulation,flow?`${memberDisplayName(flow.a.member)} × ${memberDisplayName(flow.b.member)} · ${t.roles[flow.a.role]} + ${t.roles[flow.b.role]}`:'—'],[c.synergy,strongest?`${memberDisplayName(strongest.a.member)} × ${memberDisplayName(strongest.b.member)} · ${strongest.score}/100`:'—'],[c.complement,roles.map(r=>`${t.roles[r]}：${t.roleDesc[r]}`).join(' / ')]].map(([label,value])=><article key={label} className="min-w-0 border-l-2 border-primary/50 pl-3"><h4 className="text-sm font-semibold text-primary">{label}</h4><p className="mt-2 text-sm leading-7">{value}</p></article>)}
   </div>
   {active && <p role="status" className="border-l-2 border-primary pl-3 text-sm leading-7">{active.index}. {memberDisplayName(active.member)} · {memberRelationship(active.member,language)} · {t.roles[active.role]} · {t.roleDesc[active.role]}</p>}
   <h4 className="text-sm font-semibold text-primary">{c.legend}</h4>
   <ol className="grid gap-2 sm:grid-cols-2">{positions.map(e=><li key={e.member.id}><Button variant="ghost" className="h-auto min-h-14 w-full justify-start whitespace-normal px-2 text-left" onClick={()=>setSelected(selected===e.member.id?null:e.member.id)} aria-pressed={selected===e.member.id}>
    <Avatar className="size-9 border-2" style={{borderColor:e.colors?.main.code}}><AvatarFallback><UserRound className="size-4"/></AvatarFallback></Avatar><span className="min-w-0"><strong className="block text-sm">{e.index}. {memberDisplayName(e.member)}</strong><span className="block text-xs text-muted-foreground">{memberRelationship(e.member,language)}</span><span className="block text-xs text-primary">{t.roles[e.role]}</span></span>
   </Button></li>)}</ol>
   <SacredDisclosure title={c.guide} closeLabel={c.close}><p className="text-sm leading-7">{c.mapGuide}</p></SacredDisclosure>
 </section>;
}