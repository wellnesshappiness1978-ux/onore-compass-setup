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
- Keep AI consultation as one session-only conversation with no persistence; the AI endpoint may use profile fields as reflective context but must never present divination, timing, VIP, or the free-use counter as verified calculations or entitlements.
