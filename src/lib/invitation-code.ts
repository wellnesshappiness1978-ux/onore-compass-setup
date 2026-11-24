export type InvitationResult = 'ok' | 'full' | 'invalid' | 'already' | 'signin' | 'app_only' | 'error';
export function detectPlatform(): 'ios' | 'android' | 'web' {
  if (typeof window === 'undefined') return 'web';
  const cap = (window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor;
  const p = cap?.getPlatform?.();
  return p === 'ios' || p === 'android' ? p : 'web';
}
/** Slot used for redemption: native platform, else browser user agent (Android → android, others → ios). */
export function detectInvitationSlot(ua = typeof navigator === 'undefined' ? '' : navigator.userAgent): 'ios' | 'android' {
  const p = detectPlatform();
  if (p !== 'web') return p;
  return /android/i.test(ua) ? 'android' : 'ios';
}
export const normalizeInvitationCode = (raw: string) => raw.trim().toUpperCase();
export const invitationMessages: Record<InvitationResult, string> = {
  ok: 'テスター特典（VIPアクセス）が解放されました！すべての機能をご自由にお試しいただけます',
  full: '申し訳ありません。このプラットフォームでの先着上限（30名）に達したため終了しました。',
  invalid: '無効なコードか、有効期限が切れています。',
  already: 'このアカウントではすでに招待コードを使用済みです。',
  signin: '招待コードの適用にはサインインが必要です。',
  app_only: 'この環境では招待コードを適用できません。',
  error: '通信エラーが発生しました。時間をおいて再度お試しください。',
};
export function toInvitationResult(value: unknown): InvitationResult {
  return typeof value === 'string' && value in invitationMessages ? value as InvitationResult : 'error';
}
