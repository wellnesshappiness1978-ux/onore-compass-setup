import type { Language } from './translations';
import { resolveBirthplace } from './birthplace';
import { artCertificateCopy } from './art-certificate-copy';
import logoAsset from '@/assets/agolmen-v10-compass-final.png.asset.json';
export const artFormats = ['art','square','story','landscape','wallpaper'] as const;
export type ArtFormat = typeof artFormats[number];
export type Disclosure = { name: boolean; time: boolean; coordinates: boolean };
export const privateDisclosure = (): Disclosure => ({ name:false,time:false,coordinates:false });
export const artDimensions: Record<ArtFormat, readonly [number,number]> = { art:[2048,2048],square:[2048,2048],story:[1080,1920],landscape:[1920,1080],wallpaper:[1440,2560] };
export type ArtRecord = { title:string; serial:string; name:string; birthDate:string; birthTime:string; birthTimeUnknown:boolean; birthPlace:string; birthCity:string };
// Independent random identifier: never derived from a user ID, name or birth data.
export function newArtSerial(): string { const bytes = new Uint8Array(6); crypto.getRandomValues(bytes); return `AG-${Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('').toUpperCase()}`; }
export function birthJulianDay(record: ArtRecord): number | null {
 if (!/^\d{4}-\d{2}-\d{2}$/.test(record.birthDate)) return null;
 const time = !record.birthTimeUnknown && /^([01]\d|2[0-3]):[0-5]\d$/.test(record.birthTime) ? record.birthTime : '12:00';
 const instant = Date.parse(`${record.birthDate}T${time}:00+09:00`);
 return Number.isFinite(instant) ? instant / 86400000 + 2440587.5 : null;
}
// Only the displayed inscription may contain consented data; file names keep the private random ID.
export function inscriptionSerial(record: ArtRecord, disclosure: Disclosure): string {
 if (!disclosure.time || !disclosure.coordinates) return record.serial;
 const place = [record.birthPlace, record.birthCity].filter(Boolean).join('');
 if (!place) return record.serial;
 return `AGL-${record.birthDate.replaceAll('-', '')}-${place}-${record.serial.slice(-4)}`;
}
export function recordLines(record:ArtRecord, disclosure:Disclosure, language:Language):string[] {
 const t=artCertificateCopy[language]; const lines:string[]=[];
 if(disclosure.name && record.name) lines.push(record.name);
 if(disclosure.time) lines.push(`${record.birthDate} · ${record.birthTimeUnknown || !/^([01]\d|2[0-3]):[0-5]\d$/.test(record.birthTime) ? t.noon : `${record.birthTime} JST`}`);
 if(disclosure.coordinates) { const point=resolveBirthplace(record.birthPlace,record.birthCity); lines.push(point?`${point.lat.toFixed(3)}° N · ${point.lon.toFixed(3)}° E · ${point.precision==='municipality'?t.municipality:t.prefecture}`:t.unknown); }
 return lines;
}
export async function composeArtRecord(blob:Blob,format:ArtFormat,record:ArtRecord,disclosure:Disclosure,language:Language):Promise<Blob> {
 if(format==='art') return blob;
 await document.fonts.ready;
 const [w,h]=artDimensions[format], canvas=document.createElement('canvas'); canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d'); if(!ctx) throw new Error('Canvas unavailable');
 const css=getComputedStyle(document.documentElement),token=(n:string)=>css.getPropertyValue(n).trim();
 const gold=token('--cosmic-text-main'),paper=token('--cosmic-text-data'),ink=token('--share-midnight');
 ctx.fillStyle=ink;ctx.fillRect(0,0,w,h);ctx.strokeStyle=gold;ctx.lineWidth=w*.001;
 const margin=w*.04;ctx.strokeRect(margin,margin,w-2*margin,h-2*margin);
 ctx.globalAlpha=.35;ctx.strokeRect(margin+w*.007,margin+w*.007,w-2*(margin+w*.007),h-2*(margin+w*.007));ctx.globalAlpha=1;
 const landscape=format==='landscape',wallpaper=format==='wallpaper';
 const imageSize=landscape?h*.79:format==='square'?w*.60:w*.84, x=landscape?w*.06:(w-imageSize)/2, y=landscape?(h-imageSize)/2:wallpaper?h*.30:format==='story'?h*.17:h*.14;
 const url=URL.createObjectURL(blob);
 try { const image=new Image();image.src=url;await image.decode();ctx.drawImage(image,x,y,imageSize,imageSize); } finally { URL.revokeObjectURL(url); }
 const textX=landscape?w*.735:w*.5, textW=landscape?w*.38:w*.85;
 ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.shadowColor=token('--cosmic-text-shadow');ctx.shadowBlur=4*w/1024;ctx.shadowOffsetY=w/1024;
 const text=(value:string,yy:number,size:number,color=paper,serif=false)=>{ctx.fillStyle=color;let s=size;ctx.font=`${serif?500:400} ${s}px "${serif?'Noto Serif JP':'Noto Sans JP'}", sans-serif`;while(ctx.measureText(value).width>textW && s>size*.45){s-=1;ctx.font=`${serif?500:400} ${s}px "${serif?'Noto Serif JP':'Noto Sans JP'}", sans-serif`;}ctx.fillText(value,textX,yy,textW);};
 const t=artCertificateCopy[language],titleY=landscape?h*.36:wallpaper?h*.272:h*.102;
 text(t.brand,landscape?h*.30:wallpaper?h*.25:h*.073,w*.017,gold,true);text(record.title,titleY,w*.026,paper,true);
 const logo=new Image();logo.src=logoAsset.url;await logo.decode();const logoSize=w*.035;ctx.drawImage(logo,textX-logoSize/2,(landscape?h*.20:wallpaper?h*.22:h*.022),logoSize,logoSize);
 const baseY=landscape?h*.47:y+imageSize+w*.046;
 text(t.record,baseY,w*.013,gold);text(inscriptionSerial(record,disclosure),baseY+w*.026,w*.0135,gold,true);
 const rows=recordLines(record,disclosure,language);rows.forEach((line,i)=>text(line,baseY+w*(.057+i*.025),w*.013));
 const jd = disclosure.time ? birthJulianDay(record) : null;
 if (jd !== null) text(`JD ${jd.toFixed(5)}`,baseY+w*(.057+rows.length*.025),w*.011);
 text(t.preview,landscape?h*.78:h-margin-w*.026,w*.011);
 return new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('PNG unavailable')),'image/png'));
}
