import {describe,it,expect} from 'vitest';
import {artDimensions,privateDisclosure,recordLines,newArtSerial} from './art-certificate';
import {artCertificateCopy} from './art-certificate-copy';
const record={title:'Art',serial:'AG-ABCDEF',name:'Private name',birthDate:'1990-04-15',birthTime:'08:30',birthTimeUnknown:false,birthPlace:'東京都',birthCity:'新宿区'};
describe('private artwork records',()=>{
 it('starts without disclosure every time',()=>{expect(recordLines(record,privateDisclosure(),'ja')).toEqual([]);const a=privateDisclosure();a.name=true;expect(privateDisclosure().name).toBe(false);});
 it('reveals each field only by consent',()=>{expect(recordLines(record,{name:true,time:false,coordinates:false},'en')).toEqual(['Private name']);expect(recordLines(record,{name:false,time:true,coordinates:false},'en')).toEqual(['1990-04-15 · 08:30 JST']);});
 it('qualifies approximate points and never invents missing ones',()=>{expect(recordLines(record,{name:false,time:false,coordinates:true},'ja')[0]).toContain('市区町村の代表座標');expect(recordLines({...record,birthPlace:'',birthCity:''},{name:false,time:false,coordinates:true},'en')).toEqual(['Birth coordinates unavailable']);});
 it('labels unknown time in every language',()=>{for(const lang of Object.keys(artCertificateCopy) as (keyof typeof artCertificateCopy)[]){expect(recordLines({...record,birthTimeUnknown:true},{name:false,time:true,coordinates:false},lang)[0]).toContain(artCertificateCopy[lang].noon);expect(artCertificateCopy[lang].formats).toHaveLength(5);}});
 it('keeps exact dimensions and independent random numbers',()=>{expect(artDimensions.art).toEqual([2048,2048]);expect(artDimensions.story[0]/artDimensions.story[1]).toBeCloseTo(9/16);expect(artDimensions.wallpaper[0]/artDimensions.wallpaper[1]).toBeCloseTo(9/19.5);expect(newArtSerial()).toMatch(/^AG-[A-F0-9]{12}$/);expect(newArtSerial()).not.toBe(newArtSerial());});
});
