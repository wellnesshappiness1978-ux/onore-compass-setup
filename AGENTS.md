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

- Keep language selection in the index screen's React state and translate onboarding/dashboard through `src/lib/translations.ts`; this preserves the selected language across the in-page transition without persistence or a backend.
- Keep dashboard tabs, compass interaction, and daily demo state local to `Dashboard.tsx`; there is no calculation service or persistent account yet, so avoid implying real readings or VIP entitlement.
- Keep the synthesized Torisetsu profile, color profiles, compatibility scoring, and VIP lock state as clearly labeled deterministic previews in `Dashboard.tsx` until a real analysis and entitlement service exists; this avoids presenting sample copy as actual readings.
- Keep the person portrait illustrative: only sun-sign approximation, calendar-year animal, and digit-sum numerology derive from the birth date; personality text is deterministic sample copy, never a verified assessment.
- Keep AI consultation as one session-only conversation with no persistence; the AI endpoint may use profile fields as reflective context but must never present divination, timing, VIP, or the free-use counter as verified calculations or entitlements.
- Keep the natal nine-stars wheel as a locked illustrative preview in the existing Mandala tab until validated nine-stars calculations and server-verified VIP access exist; never expose a downloadable personalized chart based on demo data.
- Keep My Page plan badge, B2B team data, notification toggles, and the Earth Calendar biorhythm timeline preview as local, clearly labeled previews in `SettingsPanel.tsx`; the plan test toggle changes only the preview rendering and must never unlock gated features until real billing and entitlements exist.
- Keep seven appearance modes session-local, tier-limited (1/3/5/7) and CSS-scoped; vary typography, textures, compass, panels and navigation by tier, never imply actual paid access.
