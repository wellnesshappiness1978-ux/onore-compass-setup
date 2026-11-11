import { describe, expect, it } from 'vitest';
import { TRIAL_PLANS } from './try';

describe('try-it-out preview', () => {
  it('shows the four requested plans in order', () => {
    expect(TRIAL_PLANS.map(p => p.id)).toEqual(['free', 'standard', 'vip', 'b2b']);
  });
});
