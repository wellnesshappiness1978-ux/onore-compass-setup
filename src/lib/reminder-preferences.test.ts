import { expect, it } from 'vitest';
import { defaultRelationshipGoal, relationshipGoalText, validRelationshipGoal, validBgmPreference } from './reminder-preferences';
it('retains chosen BGM track and volume', () => expect(validBgmPreference({ hz: 639, volume: 0.31 })).toEqual({ hz: 639, volume: 0.31 }));
it('clamps volume and rejects unknown tracks', () => { expect(validBgmPreference({ hz: 528, volume: 2 })?.volume).toBe(1); expect(validBgmPreference({ hz: 999, volume: 0.5 })).toBeNull(); });
it('keeps the relationship goal separate from a work default and combines its own preset/text', () => {
 const appGoal = { goalPreset: 'work', goal: '昇進したい' };
 const independent = { goalPreset: 'health', goal: '一緒に休む時間を作りたい' };
 expect(relationshipGoalText(independent, 'ja')).toBe('健康 / 一緒に休む時間を作りたい');
 expect(appGoal).toEqual({ goalPreset: 'work', goal: '昇進したい' });
 expect(relationshipGoalText(defaultRelationshipGoal, 'ja')).toBe('');
});
it('restores valid independent goals and rejects unknown presets', () => {
 expect(validRelationshipGoal(JSON.parse(JSON.stringify({ goalPreset: 'love', goal: '二人の時間' })))).toEqual({ goalPreset: 'love', goal: '二人の時間' });
 expect(validRelationshipGoal({ goalPreset: 'unknown', goal: 1 })).toEqual(defaultRelationshipGoal);
});
