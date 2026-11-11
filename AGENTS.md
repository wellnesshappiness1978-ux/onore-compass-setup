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
- Self-core stays free. Authenticated Stripe billing verifies owner, price, paid invoice and expiry; previews grant nothing. No webhooks. Why: protect readings and entitlements.
- Previews grant no access; nullable consultation JSON compiles into SQL. Server-only reservations settle successful answers; owner status resolves plan/counts together; compatibility keeps separate caps. Why: prevent quota races and forged consumption.
- Admin debug overrides require server-verified roles, expire after 24 hours, and restore original membership and team caps. Why: tests must not overwrite entitlements.
- The pinned administrator test-plan bar mounted in Dashboard is the only plan-switch UI; no read-only duplicate may be mounted elsewhere, and it publishes its measured height into `--preview-bar-height`. Why: one place to change plans and no layout gap where a bar was removed.
- Preserve legacy storage, event, and ICS identifiers and use the cropped brand logo. Why: avoid lost data and watermarks.
- Keep support owner-only; legal-content and LegalText serve all four footer/leaf documents with commerce tables. Why: private data and consistent legal text.
- Read scoped AGENTS.md; they own local contracts.
- Support preserves authenticated ticket saving and offers an explicit administrator mailto handoff, never claims automatic delivery; Settings links to the same legal leaf pages as the footer. Why: an unconfigured sender must not silently imply delivered email or duplicate legal copy.
- SettingsPanel owns profile/focus overview, account, plan, appearance and reminders after account settings; other switches stay beside Today readings, header owns language/music. Why: one composition without duplicate controls.
- Mandala preserves the bundled painted master texture with birth-fixed mandala-design pigments and filled surrounding motifs; shares painting, member-count nodes and the personal raster gem between live/export, using DPR-aware Canvas without finished-jewel CSS filters or vector facet outlines. Why: recognizable craft and distinct subject designs stay identical in private captures.
- Related-person records share one backward-compatible extended shape across storage, preview, consultation and team tools. Why: retain birth context.
- All profile surfaces reuse BirthplaceFields and SiblingSelect; country-tagged overseas addresses stay in existing text columns, static country files load on demand, and reading schemas/context are shared. Why: preserve stored profiles, avoid language-driven location changes and prevent detailed context truncation.
- Keep user-facing localization in typed seven-language dictionaries and translate stable domain IDs only at render time. Why: calculations and stored data must remain language-independent while every locale stays complete.
- Keep profile, settings-profile, and related-person copy in the typed profile UI dictionary; persisted prefecture IDs remain Japanese while labels localize at render time. Why: language switching must never alter saved data or leak fallback copy.
- Shared writing-voice owns tone; companion/theory copy localizes advice. Preserve schemas. Why: consistent scientific/symbolic boundaries.
- Keep legacy `b2b` plan IDs, `team_members`, and `onore-team` storage stable while rendering Family plan and Family roster terminology through localized copy. Why: rename the experience without breaking saved profiles, URLs, or entitlements.
- Artwork records share a certificate renderer for private local captures. Disclosure resets off, shared art omits scientific birth captions, and random commemorative IDs contain no personal data. Why: prevent birth details leaking through labels.
- Read src/components and src/lib AGENTS.md for Canvas and monthly lucky contracts.
- App appearance uses five cumulative manually applied families, bundled imagery and same-origin storage-event synchronization; keep legacy palette/corporate IDs separate from membership. Why: synchronize browser tabs without changing entitlements or artwork.
- Personal readings share usePersonalReading with owner/day/full-input device cache and one in-flight request per key; /api/readings emits progressive structured fields from server-only generators, while fast essence stays a separate call. Home/Traits reuse MethodExplanationList and integratedArts; sign-out clears reading caches. Why: eliminate duplicate generation, preserve personal context and show real arriving text without weakening availability.
- AI tabs keep sessions; compatibility compares people separately. Consultation shares request validation and builds group context only from structured members. Why: no invented births or goal overflow.
- Today uses shared TodayCard, shared presentation gates in plans.ts, per-subject daily AI fields and full-profile cache fingerprints; group signals aggregate each member, never a substituted owner. The twelve-category catalogue is not an access gate. Why: consistent subject-specific cards without altering server membership.
- Today samples stay localized, static and separate from paid readings; DailyLuckyColor owns color dialogs. Native zoom stays browser-owned; multi-touch cancels swipes. Dashboard uses tested dialog-swipe: transform-only drag, reset inline styles on end/cancel, downward dismiss only from unscrolled content. Why: preserve access, centering and scrolling.
- BGM uses one shared audio context and offline-testable graph with normalized voices and smooth gain. Why: avoid driver churn, clipping and clicks.
- Settings BGM and relationship selections persist through reminder-preferences; the relationship guide owns an independent goal via use-relationship-preferences, never inherits default focus. BgmReminderSettings shares header/modal/settings controls and piano-store; live notification entries merge with the catalogue for push using mount-scoped ownership. Why: preserve choices and accurate advice without duplicate audio or reminder paths.
- Reminders: no LINE. Background push stores signed-in devices in owner-only push_devices; a per-minute schedule hits /api/public/jobs/send-push, matching local time, deduped by last_sent. Why: closed-app delivery without duplicates.

- Regional explanations use regional-context-copy for seven-language symbolic birth-sky/environment framing in overview and AI prompts; gravity remains orbital/tidal physics, never personality evidence. Why: retain poetic depth with factual boundaries.
- Deeper essence uses one pure birth-reference module for sections 7–10 and personal/Today/consultation context; mean lunar nodes are separate from original chakra/tarot/rune/guardian archetypes and missing ASC/soul values stay unset. Full reading cache versions change when its output contract changes; group sections retain each member's inputs. Why: consistent symbolic reflection without measurements, supernatural assertions or stale results.
- Recipe course/photo resolve by catalogue ID; dessert also requires sweet-method and non-savory ingredients. Normalize old cache course order locally, validate new AI IDs before caching. Why: faithful menus without extra generation.
- Group integrated readings pass every structured profile through the shared full-reading contract, and only the group axisSummary interprets the joint goal. Why: never reuse the owner's individual capstone for a group.
- Font-size preference is device-local, applied after hydration at the HTML rem root and synchronized across tabs; Settings owns its three-size selector. Why: global accessible sizing without altering appearance or artwork pixels.
- SessionPrefetch parallel-loads private completed copies, bookmarks, core and eligible Family READs, never AI. Session caches persist; device copies stay bounded. Sign-out clears both; usage stays live. Why: fast private re-entry without extra charges.
- Profile text fields that the UI composes (e.g. sibling_order) use DB length limits, not value-list CHECK constraints. Why: legacy enums silently rejected new structured values.
- Parent persistence uses the shared parent-data contract and database-returned parent records; omitted parent keys never clear saved parents. Signed-in family CRUD always uses actual membership, independently of display previews. Why: avoid silent field loss and device-only saves mistaken for cloud persistence.
- Family catalogue shares its gate and owner-inclusive roster. Why: consistency.
- Shares reuse readings and paginate full prose; Today exports unlocked bodies; footer shares only the app. Why: no extra AI or artwork disclosure.

- Family registration uses familyRegistrationAccess independently of analytics gates; signed-in capacity always uses server membership. TeamStudio owns editor state and opens idempotently from onore-family-edit, closing on tab departure or successful save. Why: registration remains available to Standard+ without accidental form opening or preview write access.
- Account sync owns one owner-filtered Realtime channel; refresh reads, not AI. Private reading copies use hashed cloud keys; font size/preview stay local. Why: cross-device freshness without repeat charges.
- Family narratives use a server-resolved fingerprint and unique pending lock before explicit AI generation; failed/pending never regenerate. Owner/input-scoped bounded device copies clear on sign-out; pending polls only reads. Why: fast private reopening without duplicate charges.

- Family v2 keys are matrix/layers/friction/roadmap/directions/rhythm; versioned identity excludes old outputs. Shared family-planning drives timelines/consensus directions; 17-lens inputs retain missing values. Why: replace duplicates without asserting universal luck.
- Effective plan resolves in SQL effective_membership_plan (active debug override > vip_whitelists email > Stripe-expiry plan); all limits and getMyMembership read it. Why: one source so whitelist/test switches apply everywhere.
- Serve LP at /, app at /app, and redirect /lp to /. Keep LP tokens/footer and shared prices/caps. Why: introduce visitors without changing app access or data.
- Guest plan previews live on the public /try page as static samples and never change membership; traits readings fall back to localized static sample prose (reading-fallback) when failed or slow, never cached as real output; runtime links and OAuth returns use the current origin (site-url) so any connected domain works. Why: no stalled screens, no free unlocks, domain moves without code changes.
