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

- Profile persists in localStorage (key onore-profile) for auto-restore plus private `profiles` rows when signed in; sign-out clears local copy. Why: user requested no re-entry on reload.
- Keep dashboard tabs, compass interaction, and daily demo state local to `Dashboard.tsx`; there is no calculation service or persistent account yet, so avoid implying real readings or VIP entitlement.
- Keep the synthesized Torisetsu profile, color profiles, compatibility scoring, and VIP lock state as clearly labeled deterministic previews in `Dashboard.tsx` until a real analysis and entitlement service exists; this avoids presenting sample copy as actual readings.
- Keep the arts-tab portrait illustrative and Home self-core as an AI-generated, session-cached reflective preview derived only from available profile calculations; never claim verified 15-art assessment, exact personal biorhythm, or entitlement.
- Keep AI consultation as one session-only conversation with no persistence; the AI endpoint may use profile fields as reflective context but must never present divination, timing, VIP, or the free-use counter as verified calculations or entitlements.
- Keep the nine-stars wheel locked and illustrative: date-based main/sub colors tint it, but star positions are decorative; no download until verified calculations and VIP access exist.
- Keep My Page plan badge, B2B team data, notification toggles, and the Earth Calendar biorhythm timeline preview as local, clearly labeled previews in `SettingsPanel.tsx`; the plan test toggle changes only the preview rendering and must never unlock gated features until real billing and entitlements exist.
- Keep seven appearance modes session-local, tier-limited (1/3/5/7) and CSS-scoped; vary typography, textures, compass, panels and navigation by tier, never imply actual paid access.
- Plan limits/feature gates live in `src/lib/plans.ts` and are UI-only (preview plan toggle); no server enforcement until real billing exists. Why: no entitlement service yet.
- Team members persist in `team_members` (owner-only RLS) when signed in, else localStorage `onore-team`; team scores come from deterministic `src/lib/team-analysis.ts`, AI draft/1on1 via `src/lib/ai/team-ai.functions.ts`. Why: keep scores reproducible and labeled as reference values.
