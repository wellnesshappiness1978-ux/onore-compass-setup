/** Published fallback address; switch to the custom domain once it is connected and set as primary. */
export const PRIMARY_SITE_URL = 'https://cosmic-beginnings-onboard.lovable.app';
/** Address the visitor is actually on (custom domain, Lovable URL or preview), so links and sign-in returns never cross domains. */
export function currentSiteUrl(): string {
  if (typeof window !== 'undefined' && /^https?:/.test(window.location.origin)) return window.location.origin;
  return PRIMARY_SITE_URL;
}
