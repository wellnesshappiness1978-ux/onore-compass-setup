import { expect,it } from 'vitest';
import { familyReadingSchema, familyFingerprint } from './family-reading';
it('requires both new planning narratives before a six-feature result can complete',()=>{
 const old={matrix:'文'.repeat(120),layers:'文'.repeat(120),friction:'文'.repeat(120),roadmap:'文'.repeat(120),consult:'文'.repeat(120),colors:'文'.repeat(120)};
 expect(familyReadingSchema.safeParse(old).success).toBe(false);
 expect(familyReadingSchema.safeParse({...old,directions:'文'.repeat(120),rhythm:'文'.repeat(120)}).success).toBe(true);
});
it('versions the saved identity so old consultation/color prose cannot masquerade as new planning',()=>{
 expect(familyFingerprint({day:'2026-10-26'})).not.toEqual(JSON.stringify(['family-v1',{day:'2026-10-26'}]));
 expect(familyFingerprint({day:'2026-10-26'})).toEqual(JSON.stringify(['family-v2-planning',{day:'2026-10-26'}]));
});