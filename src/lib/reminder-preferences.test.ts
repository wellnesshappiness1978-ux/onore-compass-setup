import { expect, it } from 'vitest';
import { validBgmPreference } from './reminder-preferences';
it('retains chosen BGM track and volume', () => expect(validBgmPreference({ hz: 639, volume: 0.31 })).toEqual({ hz: 639, volume: 0.31 }));
it('clamps volume and rejects unknown tracks', () => { expect(validBgmPreference({ hz: 528, volume: 2 })?.volume).toBe(1); expect(validBgmPreference({ hz: 999, volume: 0.5 })).toBeNull(); });