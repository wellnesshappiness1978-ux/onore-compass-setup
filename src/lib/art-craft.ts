/** Local craft geometry; material palette is read from semantic CSS tokens. */
/** Radius grows by phi per quarter-turn, shared by shell outlines and chamber partitions. */
export function goldenShellRadius(progress:number,outer:number,turns=2){return outer*Math.pow((1+Math.sqrt(5))/2,(progress-1)*turns*4);}
export function paintNautilusPartitions(ctx:CanvasRenderingContext2D,x:number,y:number,inner:number,outer:number,size:number,colors:readonly string[]){
 const p=craftPalette(),mid=(inner+outer)/2,width=outer-inner;
 ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.arc(0,0,outer,0,Math.PI*2);ctx.arc(0,0,inner,0,Math.PI*2,true);ctx.clip('evenodd');ctx.shadowBlur=0;
 for(let sector=0;sector<24;sector++){
  const a=(sector+.5)/24*Math.PI*2;ctx.save();ctx.translate(Math.cos(a)*mid,Math.sin(a)*mid);ctx.rotate(a+Math.PI/2);
  for(let pass=0;pass<2;pass++){
   ctx.beginPath();for(let step=0;step<=96;step++){const t=step/96,r=goldenShellRadius(t,width*.44,1.5),angle=t*Math.PI*3;const px=Math.cos(angle)*r,py=Math.sin(angle)*r+pass*size*.0006;step?ctx.lineTo(px,py):ctx.moveTo(px,py);}
   ctx.globalAlpha=pass?.88:.95;ctx.strokeStyle=pass?p.gold:p.shadow;ctx.lineWidth=size*(pass?.0007:.0022);ctx.stroke();
  }
  for(let chamber=1;chamber<=9;chamber++){const t=chamber/9,r=goldenShellRadius(t,width*.44,1.5),a=t*Math.PI*3;ctx.strokeStyle=p.light;ctx.globalAlpha=.62;ctx.lineWidth=size*.0004;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.62,Math.sin(a)*r*.62);ctx.quadraticCurveTo(Math.cos(a+.2)*r*.85,Math.sin(a+.2)*r*.85,Math.cos(a)*r,Math.sin(a)*r);ctx.stroke();}
  ctx.globalCompositeOperation='screen';ctx.strokeStyle=colors[sector%Math.max(1,colors.length)]??p.pearl;ctx.globalAlpha=.28;ctx.lineWidth=size*.001;ctx.beginPath();ctx.arc(0,0,width*.46,-2.6,-.6);ctx.stroke();ctx.restore();
 }
 ctx.globalCompositeOperation='screen';ctx.strokeStyle=p.light;ctx.lineWidth=size*.0018;
 for(let rail=0;rail<2;rail++)for(let arc=0;arc<8;arc++){const a=arc*Math.PI/4;ctx.globalAlpha=arc%3===0?.86:.24;ctx.beginPath();ctx.arc(0,0,rail?outer-size*.0018:inner+size*.0018,a+.02,a+.38);ctx.stroke();}
 ctx.restore();
}
export function guillochePoints(inner:number,outer:number,phase=0,waves=96,count=1536){return Array.from({length:count+1},(_,i)=>{const a=i/count*Math.PI*2;const r=(inner+outer)/2+Math.sin(a*waves+phase)*(outer-inner)*.42;return {x:Math.cos(a)*r,y:Math.sin(a)*r};});}
export function craftPalette(){const css=getComputedStyle(document.documentElement);const get=(key:string)=>css.getPropertyValue(key).trim();return {gold:get('--craft-gold'),light:get('--craft-light'),shadow:get('--craft-shadow'),pearl:get('--craft-pearl'),aqua:get('--craft-aqua'),rose:get('--craft-rose'),ink:get('--craft-ink')};}
export function paintEngravedRing(ctx:CanvasRenderingContext2D,x:number,y:number,inner:number,outer:number,size:number){
 const p=craftPalette();ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.arc(0,0,outer,0,Math.PI*2);ctx.arc(0,0,inner,0,Math.PI*2,true);ctx.clip('evenodd');ctx.shadowBlur=0;
 for(let rail=0;rail<3;rail++){const points=guillochePoints(inner+(outer-inner)*.12,outer-(outer-inner)*.12,rail*Math.PI*2/3);for(let pass=0;pass<2;pass++){ctx.beginPath();points.forEach((v,i)=>i?ctx.lineTo(v.x,v.y+pass*size*.00065):ctx.moveTo(v.x,v.y+pass*size*.00065));ctx.strokeStyle=pass?p.light:p.shadow;ctx.globalAlpha=pass?.72:.9;ctx.lineWidth=size*(pass?.00048:.0014);ctx.stroke();}}
 for(let i=0;i<48;i++){const a=(i+.5)/48*Math.PI*2,r=inner+(outer-inner)*.5;ctx.save();ctx.translate(Math.cos(a)*r,Math.sin(a)*r);ctx.rotate(a);const width=(outer-inner)*.3,length=size*.009;const g=ctx.createLinearGradient(-width,-length,width,length);g.addColorStop(0,p.shadow);g.addColorStop(.25,p.aqua);g.addColorStop(.48,p.pearl);g.addColorStop(.72,p.rose);g.addColorStop(1,p.gold);ctx.fillStyle=g;ctx.globalAlpha=.8;ctx.beginPath();ctx.moveTo(-width,0);ctx.quadraticCurveTo(0,-length,width,0);ctx.quadraticCurveTo(0,length,-width,0);ctx.fill();ctx.strokeStyle=p.light;ctx.lineWidth=size*.0004;ctx.stroke();ctx.restore();}
 ctx.restore();
}
export function paintBranchingFilaments(ctx:CanvasRenderingContext2D,size:number,colors:string[],seed:number){
 const p=craftPalette();ctx.save();ctx.lineCap='round';
 const random=(salt:number)=>{const v=Math.sin(seed+salt*78.233)*43758.5453;return v-Math.floor(v);};
 for(let arm=0;arm<7;arm++){const color=colors[arm];if(!color)continue;const points=Array.from({length:90},(_,i)=>{const t=i/89,a=arm*Math.PI*2/7+t*2.5+random(arm)*.4,r=size*(.15+t*.32);return {x:size*.5+Math.cos(a)*r,y:size*.47+Math.sin(a)*r,t};});
 ctx.globalCompositeOperation='source-over';ctx.strokeStyle=p.ink;ctx.globalAlpha=.38;ctx.lineWidth=size*.006;ctx.beginPath();points.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.stroke();
 ctx.globalCompositeOperation='screen';ctx.strokeStyle=color;
 for(let pass=0;pass<2;pass++){ctx.globalAlpha=pass?.28:.07;ctx.lineWidth=size*(pass?.00045:.006);ctx.beginPath();points.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.stroke();}
 points.filter((_,i)=>i%6===0).forEach((v,i)=>{const length=size*(.009+random(i+arm*30)*.035),angle=arm*Math.PI*2/7+v.t*2.5+1.2;ctx.lineWidth=size*.00032;ctx.globalAlpha=.22;ctx.beginPath();ctx.moveTo(v.x,v.y);ctx.quadraticCurveTo(v.x+Math.cos(angle)*length*.5,v.y+Math.sin(angle)*length*.3,v.x+Math.cos(angle)*length,v.y+Math.sin(angle)*length);ctx.stroke();ctx.fillStyle=color;ctx.globalAlpha=.54;ctx.beginPath();ctx.arc(v.x,v.y,size*.0007,0,Math.PI*2);ctx.fill();});
 }ctx.restore();
}
export function enamelMotif(path:string,innerPath:string,guillochePath:string,index:number){return `<g data-enamel-craft="${index}" clip-path="url(#motifClip${index})"><path d="${path}" fill="none" stroke="var(--craft-shadow)" stroke-opacity=".72" stroke-width="3.3"/><path d="${innerPath}" fill="none" stroke="var(--craft-light)" stroke-opacity=".42" stroke-width=".6"/><path d="${guillochePath}" fill="none" stroke="var(--craft-gold)" stroke-opacity=".76" stroke-width="1.05"/><path d="${guillochePath}" fill="none" stroke="var(--craft-light)" stroke-opacity=".75" stroke-width=".28"/><path d="${path}" fill="none" stroke="var(--craft-pearl)" stroke-opacity=".36" stroke-width=".52"/></g>`;}
