import { APP_SHARE_URL } from './share-content';

export const APP_INVITE_TEXT = '17占術の叡智とAIが織りなす究極の人生羅針盤『アゴルメンの羅針盤』で、あなたの運命とバイオリズムを診断しよう✨ #アゴルメンの羅針盤 #AI占い #バイオリズム';

export type InviteNetwork = 'x' | 'line' | 'facebook';

/** Share intent URLs that pre-fill the app invitation text and link. */
export function appInviteLinks(url = APP_SHARE_URL, text = APP_INVITE_TEXT): Record<InviteNetwork, string> {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  return {
    x: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
    line: `https://social-plugins.line.me/lineit/share?url=${u}&text=${t}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${t}`,
  };
}
