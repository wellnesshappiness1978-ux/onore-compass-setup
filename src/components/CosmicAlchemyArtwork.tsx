import { useCallback, useEffect, useRef } from "react";
import type { ReturnTypeNatal } from "@/lib/natal-sky-types";
import type { Capture } from "./MandalaScene";
import type { NineStarProfile } from "@/lib/calendar-traditions";
import type { Language } from "@/lib/translations";
import { artSpecialistCopy } from "@/lib/art-specialist-copy";

type Props = { sky: ReturnTypeNatal; nine: NineStarProfile; colors: string[]; language: Language; onCapture: (capture: Capture | null) => void };
type PlanetStyle = { radius: number; base: string; light: string; kind: "sun" | "rock" | "cloud" | "earth" | "mars" | "gas" | "ring" | "ice" | "moon" };
const styles: PlanetStyle[] = [
  { radius: .095, base: "#f59e0b", light: "#fff7c2", kind: "sun" },
  { radius: .026, base: "#77736d", light: "#e8e2d8", kind: "moon" },
  { radius: .018, base: "#716b62", light: "#d7d0c3", kind: "rock" },
  { radius: .032, base: "#b96f32", light: "#ffe0a3", kind: "cloud" },
  { radius: .025, base: "#a83f22", light: "#ffb27b", kind: "mars" },
  { radius: .054, base: "#a77a55", light: "#ffe0b6", kind: "gas" },
  { radius: .047, base: "#ad9472", light: "#fff0bd", kind: "ring" },
  { radius: .036, base: "#77c6d8", light: "#d9fcff", kind: "ring" },
  { radius: .035, base: "#315eae", light: "#a9d9ff", kind: "ice" },
  { radius: .015, base: "#706b68", light: "#d7d2cd", kind: "rock" },
];
const fallbackPlanet: PlanetStyle = { radius: .018, base: "#77736d", light: "#d7d0c3", kind: "rock" };

const seeded = (seed: number) => { const value = Math.sin(seed * 91.73) * 43758.5453; return value - Math.floor(value); };

function drawPlanet(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, style: PlanetStyle, seed: number) {
  ctx.save();
  if (style.kind === "ring") {
    ctx.strokeStyle = style.light; ctx.globalAlpha = .55; ctx.lineWidth = Math.max(1, radius * .13);
    ctx.beginPath(); ctx.ellipse(x, y, radius * 1.85, radius * .42, -.24, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.shadowColor = style.light; ctx.shadowBlur = style.kind === "sun" ? radius * 1.8 : radius * .7;
  const sphere = ctx.createRadialGradient(x-radius*.35, y-radius*.42, radius*.03, x+radius*.08, y+radius*.08, radius);
  sphere.addColorStop(0, style.light); sphere.addColorStop(.28, style.base); sphere.addColorStop(.78, style.base); sphere.addColorStop(1, "#030712");
  ctx.fillStyle = sphere; ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(x,y,radius,0,Math.PI*2); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x,y,radius*.96,0,Math.PI*2); ctx.clip(); ctx.shadowBlur = 0;
  if (style.kind === "gas" || style.kind === "cloud" || style.kind === "ring" || style.kind === "ice") {
    for (let i=0;i<10;i++) { const yy=y-radius*.8+i*radius*.17; ctx.strokeStyle=i%2?style.light:"#10182b"; ctx.globalAlpha=.08+(i%4)*.045; ctx.lineWidth=Math.max(1,radius*.09); ctx.beginPath(); ctx.moveTo(x-radius,yy); ctx.bezierCurveTo(x-radius*.35,yy+Math.sin(seed+i)*radius*.12,x+radius*.35,yy-Math.sin(seed+i)*radius*.1,x+radius,yy); ctx.stroke(); }
  } else {
    for (let i=0;i<12;i++) { const a=seeded(seed+i)*Math.PI*2, d=Math.sqrt(seeded(seed+i*3))*radius*.72, rr=radius*(.025+seeded(seed+i*7)*.09); ctx.fillStyle=i%3===0?style.light:"#07101d"; ctx.globalAlpha=.12+(i%4)*.035; ctx.beginPath(); ctx.arc(x+Math.cos(a)*d,y+Math.sin(a)*d,rr,0,Math.PI*2); ctx.fill(); }
    if (style.kind === "earth") { ctx.fillStyle="#5e9d63"; ctx.globalAlpha=.68; for(let i=0;i<6;i++){const a=seeded(seed+i*2)*Math.PI*2,d=radius*.5*seeded(seed+i);ctx.beginPath();ctx.ellipse(x+Math.cos(a)*d,y+Math.sin(a)*d,radius*.18,radius*.08,a,0,Math.PI*2);ctx.fill();} }
  }
  ctx.restore(); ctx.restore();
}

function drawSun(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, seed: number) {
  ctx.save(); ctx.globalCompositeOperation="lighter";
  for(let i=0;i<96;i++){const a=i/96*Math.PI*2, len=radius*(1.25+seeded(seed+i)*1.1);const g=ctx.createLinearGradient(x+Math.cos(a)*radius*.8,y+Math.sin(a)*radius*.8,x+Math.cos(a)*len,y+Math.sin(a)*len);g.addColorStop(0,"rgba(255,210,72,.32)");g.addColorStop(1,"rgba(255,210,72,0)");ctx.strokeStyle=g;ctx.lineWidth=Math.max(1,radius*(.01+seeded(seed+i*7)*.035));ctx.beginPath();ctx.moveTo(x+Math.cos(a)*radius*.75,y+Math.sin(a)*radius*.75);ctx.lineTo(x+Math.cos(a)*len,y+Math.sin(a)*len);ctx.stroke();}
  const halo=ctx.createRadialGradient(x,y,radius*.2,x,y,radius*2.7);halo.addColorStop(0,"rgba(255,255,224,.95)");halo.addColorStop(.22,"rgba(255,198,52,.75)");halo.addColorStop(.58,"rgba(255,122,18,.22)");halo.addColorStop(1,"rgba(255,122,18,0)");ctx.fillStyle=halo;ctx.fillRect(x-radius*2.8,y-radius*2.8,radius*5.6,radius*5.6);ctx.restore();
  drawPlanet(ctx,x,y,radius,styles[0] ?? fallbackPlanet,seed);
}

function paint(canvas: HTMLCanvasElement, sky: ReturnTypeNatal, nine: NineStarProfile, colors: string[], language: Language) {
  const ctx=canvas.getContext("2d"); if(!ctx) throw new Error("Canvas unavailable");
  const {width:w,height:h}=canvas,cx=w/2,cy=h*.44,unit=Math.min(w,h*.58),seed=sky.bodies.reduce((n,b)=>n+Math.round(b.longitude*100),nine.honmei*97+nine.getsumei*53+nine.keisha*31);
  const copy=artSpecialistCopy[language], root=getComputedStyle(document.documentElement), voidColor=root.getPropertyValue("--art-void").trim()||"#050816", gold=root.getPropertyValue("--gold-glow").trim()||"#f7dfa0";
  ctx.fillStyle=voidColor;ctx.fillRect(0,0,w,h);
  // Deep marine-nebula strata, independently composed rather than copying any artist.
  const clouds=[[.18,.22,.55,colors[4]??"#4ddddd"],[.82,.34,.52,colors[5]??"#6640ac"],[.4,.72,.6,colors[1]??"#ca60aa"]] as const;
  clouds.forEach(([nx,ny,nr,c],i)=>{const g=ctx.createRadialGradient(w*nx,h*ny,0,w*nx,h*ny,w*nr);g.addColorStop(0,`${c}88`);g.addColorStop(.25,`${c}3d`);g.addColorStop(1,"transparent");ctx.globalAlpha=.5-i*.08;ctx.fillStyle=g;ctx.fillRect(0,0,w,h);});
  ctx.save();ctx.globalCompositeOperation="lighter";
  for(let band=0;band<18;band++){const y0=h*(.12+band*.048),g=ctx.createLinearGradient(0,y0,w,y0+h*.08);g.addColorStop(0,"transparent");g.addColorStop(.5,colors[(band+2)%Math.max(colors.length,1)]??gold);g.addColorStop(1,"transparent");ctx.strokeStyle=g;ctx.globalAlpha=.028+band*.004;ctx.lineWidth=Math.max(1,w*(.012-band*.00045));ctx.beginPath();for(let x=-w*.1;x<=w*1.1;x+=w/100){const y=y0+Math.sin(x/w*Math.PI*(2.3+band*.11)+band*.8)*h*(.018+band*.002);if(x<0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();}ctx.restore();
  for(let i=0;i<1800;i++){const x=seeded(seed+i*3)*w,y=seeded(seed+i*7)*h,a=.1+seeded(seed+i*11)*.62;ctx.globalAlpha=a;ctx.fillStyle=i%19===0?(colors[i%Math.max(colors.length,1)]??gold):gold;ctx.beginPath();ctx.arc(x,y,(i%29===0?1.6:.42)*w/900,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
  const sunX=cx, sunY=cy;
  // Nine Star rings are calculated: star number controls tilt, color and eccentricity.
  nine.palaces.forEach((palace,i)=>{const rr=unit*(.12+i*.035);ctx.strokeStyle=palace.star===nine.honmei?gold:(colors[(palace.star+nine.keisha)%Math.max(colors.length,1)]??gold);ctx.globalAlpha=.12+palace.star*.018;ctx.lineWidth=Math.max(1,w/1000);ctx.beginPath();ctx.ellipse(cx,cy,rr,rr*(.64+(palace.star%3)*.045),(palace.star%2?-.22:.22)+nine.keisha*.012,0,Math.PI*2);ctx.stroke();});ctx.globalAlpha=1;
  const bodies=sky.bodies.slice(1);
  bodies.forEach((body,i)=>{const orbit=unit*(.13+i*.038),a=(body.longitude-90)*Math.PI/180;ctx.strokeStyle=colors[(i+1)%Math.max(colors.length,1)]??gold;ctx.globalAlpha=.14;ctx.lineWidth=Math.max(1,w/1200);ctx.beginPath();ctx.ellipse(cx,cy,orbit,orbit*.72,0,0,Math.PI*2);ctx.stroke();const x=cx+Math.cos(a)*orbit,y=cy+Math.sin(a)*orbit*.72;ctx.globalAlpha=.28;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.stroke();const style=styles[i+1]??fallbackPlanet;drawPlanet(ctx,x,y,Math.max(w*.008,w*style.radius),style,seed+i*47);});
  drawSun(ctx,sunX,sunY,w*.07,seed);
  ctx.globalAlpha=1;ctx.textAlign="center";ctx.fillStyle=gold;ctx.font=`${Math.round(w*.052)}px serif`;ctx.fillText("AGOLMEN'S COMPASS",cx,h*.1);ctx.font=`${Math.round(w*.034)}px serif`;ctx.fillText(copy.cosmic,cx,h*.79);ctx.font=`${Math.round(w*.017)}px sans-serif`;ctx.fillText(copy.cosmicDescription,cx,h*.83);ctx.fillText(`${copy.honmei} ${nine.honmei} · ${copy.getsumei} ${nine.getsumei} · ${copy.keisha} ${nine.keisha}`,cx,h*.86);ctx.fillText(sky.approximate?copy.noon:copy.registered,cx,h*.89);
}

export default function CosmicAlchemyArtwork({sky,nine,colors,language,onCapture}:Props){
  const ref=useRef<HTMLCanvasElement>(null);
  const capture=useCallback(async()=>{const out=document.createElement("canvas");out.width=2160;out.height=3840;paint(out,sky,nine,colors,language);const blob=await new Promise<Blob>((resolve,reject)=>out.toBlob(b=>b?resolve(b):reject(new Error("PNG unavailable")),"image/png"));return{blob,width:out.width,height:out.height};},[sky,nine,colors,language]);
  useEffect(()=>{if(ref.current)paint(ref.current,sky,nine,colors,language);onCapture(capture);return()=>onCapture(null);},[sky,nine,colors,language,capture,onCapture]);
  return <canvas ref={ref} width={1080} height={1600} role="img" aria-label={artSpecialistCopy[language].cosmicDescription} className="block h-full w-full object-cover"/>;
}