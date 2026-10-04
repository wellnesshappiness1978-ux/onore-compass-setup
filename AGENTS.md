<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Auto-restore profiles from localStorage `onore-profile`; signed-in users use private `profiles` rows. Sign-out clears the local copy.
- Dashboard owns tabs and daily state. Torisetsu and compatibility remain references, not verified readings or paid entitlement.
- Show complete illustrative self-core readings before upsells on every plan; never claim verified 15-art results or paid entitlement. Why: Free remains complete and honest.
- Home day compass lives in `DayCompass.tsx` + deterministic `src/lib/day-compass.ts` (rotation = day of year, pointer = 8 directions), gated by preview plan and labeled reference values. Why: no real calculation or billing yet.
- AI consultation daily caps (1/3/10/30/unlimited) live in `plans.ts`, counted per device in localStorage by preview plan; display test only.
- Keep consultation session-only; profile context, timing and usage counts are reflective previews, not verified readings or entitlements. Why: avoid false claims.
- Keep nine-stars fixed grid explicitly illustrative, never natal. Save/share only labelled preview art after test unlock; no verified chart or entitlement without calculations/billing. Why: neither exists yet.
- Centralize preview overrides in PlanProvider and use the shared effective plan for every UI gate; enable only on development/known preview hosts and keep server membership validation intact. Why: guest tests must work without granting production entitlements.
- Keep seven appearance modes session-local, tier-limited (1/3/5/7) and CSS-scoped; vary typography, textures, compass, panels and navigation by tier, never imply actual paid access.
- Plan caps live in `src/lib/plans.ts`; member writes use read-only `plan_memberships` and a DB cap (missing row = Free). Preview toggles grant no paid writes.
- Team members persist in `team_members` (owner-only RLS) when signed in outside preview override; guest and override tests use localStorage `onore-team`; team scores come from deterministic `src/lib/team-analysis.ts`, AI draft/1on1 via `src/lib/ai/team-ai.functions.ts`. Why: keep scores reproducible and labeled as reference values.
- Five-grid displays share Unihan strokes for spaced surname/given name, never synthetic counts. Animal core uses published 60-day map; other three are labeled original day-offset models, not official classifications. Home portraits give no moral advice. Why: avoid fabricated claims.
- My Page's four paid cards use seven-language `src/lib/plan-cards.ts` copy and `settings-translations` prices plus Premium in `SettingsPanel.tsx`. Buttons switch preview plans only on test hosts; production shows information until billing is connected.
- Share cards use a shared client canvas renderer, language-specific readings and effective-plan palettes (Free main only); names default hidden and native sharing falls back to save. Why: prevent language/color leaks and false automatic SNS upload claims.
- Team simulator uses the existing deterministic pair model and the effective preview plan; consultation voice uses browser speech and one 528Hz ambient piano instance. Why: reference scores are reproducible and concurrent audio must not overlap.
- Reminders remain open-app only until a push service and LINE identity connection exist. Why: local browser timers cannot deliver after the app closes.

- Quick compatibility uses deterministic birth-date reference copy and a local-day per-device usage counter keyed by profile and actual membership; do not describe it as verified astrology or server-enforced billing. Why: partner details are not saved and billing is not connected.
- HelioCalendar calculates heliocentric planet positions for the selected day, but calendar events use only illustrative daily rhythm and require a user-confirmed Google or ICS import; never call these verified auspicious dates or automatic sync. Why: astronomical positions do not validate personal timing.
- Birth colors map profile fields and solar longitude to illustrative 1440-slot colors, not measured frequencies or validated correspondences. Why: no established mapping exists.
- Debug plan changes require a server-verified admin role and expire after 24 hours; membership reads and team-write caps restore the original plan after expiry. Why: testing tiers must not overwrite paid entitlements.
- Feng shui uses gender-specific Li Chun Ming Gua and a common annual chart. Birthplace centroids affect timed ascendants only; attribute Geolonia CC BY 4.0. Why: property charts require facing and period.
- Mandala uses 10 geocentric bodies plus ecliptic longitude/aspect lines; JST missing-time noon is labeled. PNG is illustrative, not paid entitlement.

- Use HelioCalendar for both Home and My Page and BirthColorGuide for color output; remove independent fake panels. Why: duplicate render paths bypassed tier gates.
- Legal content has shareable leaf pages and footer dialogs; support requests require authentication and owner-only RLS. Why: avoid invented legal identity and anonymous personal-data exposure.
- Sales cards use isUpgradePlan; active tier is status. Tier CSS defaults are automatic. One Dashboard audio instance uses gesture-started ambient-piano; no overlapping players.
