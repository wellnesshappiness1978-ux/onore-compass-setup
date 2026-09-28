# Step 3: トリセツ・相性診断

## Build
- Replace the current placeholder under the 15占術 tab with a two-option segmented selector for the personal manual and compatibility preview.
- Add 15 expandable divination summaries and a six-category personal color palette, using the existing celestial glass and champagne-gold styling.
- Add a validated partner birth-date input, deterministic preview score, changing advice, and a clearly locked VIP details area with an unlock action.
- Extend all seven language dictionaries so every new label and message changes with the global language selector.

## Technical details
- Keep all Step 3 state and preview calculations local to `Dashboard.tsx`; no persistence, payments, entitlement, or real divination engine will be implied.
- Use native disclosure controls for accessible expandable summaries and the existing shared Button component for actions.
- Verify the complete onboarding → 15占術 → manual/compatibility flow on desktop and mobile, then confirm the latest build is clean.
