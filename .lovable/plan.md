# Plan buttons switch the plan instantly (test preview)

## What changes
1. **Remove the "coming soon" notices** on the plan cards in My Page and on the home screen's 4 plan cards (all 7 languages).
2. **Plan buttons switch plans right away.** Tapping "このプランで可能性を開放する" (My Page) or "〇〇プラン案内をみる" (home) switches the whole app to that plan, with no dialog. The link updates to `?plan=...`, and the screen jumps to the newly unlocked feature: art for VIP, team tools for Business.
3. **Links keep working in new tabs.** `?plan=free / standard / vip / business / business_premium` already works. Every lock (art, sound, 8-direction guide, calendar, team tools, AI limits, birth colors, earth calendar) uses this same plan setting. I'll check each one in the browser.
4. **"Unlocked" label.** When you're already on a plan, its button shows "利用中" instead.

## Limit (safety)
This instant switch works only in the test preview. On the live site, anyone could tap it and get paid features free. So on the live site the buttons keep showing the plan info until payments are connected. I can set up payments (Stripe or Paddle) next if you want.

## Technical details
- `Dashboard.tsx`: pass `applyDevOverride` (dev-only) down as an `onSelectPlan` prop to `SettingsPanel` and `SelfCoreCard`; after switching, scroll or switch tabs to the feature.
- `SettingsPanel.tsx` / `SelfCoreCard.tsx`: when `onSelectPlan` is given, call it instead of opening the dialog, and hide `upgradeNote` / `dialogNote`.
- Map plan cards to the IDs `standard|vip|b2b|b2b-premium`; the server-side team-save cap stays tied to the real plan.
- Playwright: fresh tab with `?plan=vip`, tap the Business card, confirm team tabs and art open with no locks and no page errors.
