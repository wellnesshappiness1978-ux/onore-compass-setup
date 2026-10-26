import { expect, it } from 'vitest';
import { nextPlan } from './plans';
import { familyFingerprint, familyReadingSchema } from './family-reading';
import { cloudTables,syncedSettingKeys,canApplyRemoteSetting } from './account-sync';
it.each([['free','standard'],['standard','vip'],['vip','b2b'],['b2b','b2b-premium'],['b2b-premium',null]] as const)('prioritizes one higher tier from %s', (plan,target)=>expect(nextPlan(plan)).toBe(target));
it('requires complete content for all six saved features',()=>{
  expect(familyReadingSchema.safeParse({matrix:'x'.repeat(120)}).success).toBe(false);
  expect(familyReadingSchema.safeParse(Object.fromEntries(['matrix','layers','friction','roadmap','directions','rhythm'].map(k=>[k,'x'.repeat(120)]))).success).toBe(true);
});
it('changes the saved reading identity when birth or goal changes',()=>{
  expect(familyFingerprint({birthDate:'1980-01-01',goal:'health'})).not.toBe(familyFingerprint({birthDate:'1980-01-02',goal:'health'}));
  expect(familyFingerprint({birthDate:'1980-01-01',goal:'health'})).not.toBe(familyFingerprint({birthDate:'1980-01-01',goal:'family'}));
});
it('syncs private family/profile/results and account choices, not preview membership or device text size',()=>{
  expect(cloudTables).toContain('profiles'); expect(cloudTables).toContain('team_members'); expect(cloudTables).toContain('family_readings');
  expect(syncedSettingKeys).toContain('onore-notify-paused'); expect(syncedSettingKeys).not.toContain('devPlanOverride'); expect(syncedSettingKeys).not.toContain('onore-font-size');
});
it('preserves a local change during first hydration and while its save is pending',()=>{
  expect(canApplyRemoteSetting('false','true',false)).toBe(false);
  expect(canApplyRemoteSetting('false','false',true)).toBe(false);
  expect(canApplyRemoteSetting('false','false',false)).toBe(true);
});