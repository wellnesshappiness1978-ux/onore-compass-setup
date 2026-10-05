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

- Restore guests from `onore-profile`; signed-in profiles use private rows and sign-out clears the local copy. Why: preserve privacy without losing guest work.
- Keep complete illustrative self-core reading free and before upgrade proposals; never claim verified 15-art results, paid access, or billing. Why: references are not entitlements.
- Preview plan overrides live in PlanProvider, work only on development/known preview hosts, and never bypass server membership or write caps (missing membership = Free). Why: tests cannot grant production access.
- Admin debug overrides require server-verified roles, expire after 24 hours, and restore original membership and team caps. Why: tests must not overwrite entitlements.
- Preserve legacy storage, event, and ICS identifiers and use the cropped brand logo. Why: avoid lost data and watermarks.
- Keep support authenticated with owner-only RLS and legal content in shareable leaf pages. Why: protect personal information and avoid invented legal identity.
- Open-app reminders only until push and LINE identities are connected. Why: browser timers stop when the app closes.
