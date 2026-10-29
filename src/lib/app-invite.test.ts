import { describe, it, expect } from 'vitest';
import { APP_INVITE_TEXT, appInviteLinks } from './app-invite';
import { APP_SHARE_URL } from './share-content';

describe('app invite share', () => {
  it('pre-fills invitation text and app URL for each network', () => {
    const links = appInviteLinks();
    for (const url of Object.values(links)) expect(url).toContain(encodeURIComponent(APP_SHARE_URL));
    expect(links.x).toContain(encodeURIComponent(APP_INVITE_TEXT));
    expect(links.line).toContain(encodeURIComponent(APP_INVITE_TEXT));
    expect(APP_INVITE_TEXT).toContain('#アゴルメンの羅針盤');
  });
});
