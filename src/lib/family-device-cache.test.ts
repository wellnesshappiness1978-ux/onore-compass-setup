// @vitest-environment happy-dom
import { afterEach,expect,it } from 'vitest';
import { familyReadingSchema } from './family-reading';
import { clearReadingCaches,readingCacheKey,readReadingCache,writeReadingCache } from './reading-cache';
afterEach(()=>{clearReadingCaches();localStorage.clear();});
it('restores all six completed Family analyses only for the same owner and full input',()=>{
 const key=readingCacheKey('family-v2-planning','2026-10-26',{memberBirth:'1980-02-12'},'owner');
 const value=Object.fromEntries(['matrix','layers','friction','roadmap','directions','rhythm'].map(k=>[k,'分析'.repeat(80)]));
 writeReadingCache(key,value);
 expect(readReadingCache(key,familyReadingSchema)).toEqual(value);
 expect(readReadingCache(readingCacheKey('family-v2-planning','2026-10-26',{memberBirth:'1980-02-12'},'other'),familyReadingSchema)).toBeUndefined();
 clearReadingCaches();expect(readReadingCache(key,familyReadingSchema)).toBeUndefined();
});