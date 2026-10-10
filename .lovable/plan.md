# Mandala image upgrade: Flux model + optimized prompt

## What changes

All edits stay inside `src/lib/mandala-image.ts` and `src/lib/mandala-image.test.ts` (plus a roadmap.md checkbox update). The Pollinations.ai URL, deterministic seed, logo removal, fallback SVG, saving, and regeneration flows all stay as they are.

### 1. Add `model=flux` to the image URL

`mandalaImageUrl` builds:

```
https://image.pollinations.ai/prompt/{encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux&seed={seed}
```

`nologo=true` stays, `model=flux` is inserted before `seed`, and the seed logic (user-color hash + variation offset, capped at 2147483647) is untouched — regeneration with a new variation still produces a different image.

### 2. Replace the prompt with the Flux-optimized high-detail prompt

The base prompt becomes exactly the specified text:

```
masterpiece, extremely intricate sacred geometry mandala, hyper-detailed fine lines, vivid vibrant 7 rainbow birth colors, glowing neon crystal luminescence, shimmering gold sparkles, non-transparent rich bold colors, pitch-black cosmic space background, 8k resolution, flawless symmetry
```

To keep the mandala personal and each birth color visible (spec item 3), the base prompt is followed by the seven birth-color phrases in the existing style, e.g. `gemstone core in shining imperial amber gold #A17A21`, then `six outer birth colors glowing harmoniously: ...` with each color's English keyword and hex code. No personal data (name, birthdate, location) is ever sent — only the seven color names/codes, as before.

### 3. Opaque, vivid colors on pitch-black background

Guaranteed by the base prompt terms `non-transparent rich bold colors` and `pitch-black cosmic space background`, plus the existing per-color keywords. Nothing changes in the fallback SVG painter.

### 4. Tests

Update `mandala-image.test.ts`:
- Assert the URL contains `width=1024&height=1024&nologo=true&model=flux&seed=`.
- Assert the prompt contains the exact new base phrases (`hyper-detailed fine lines`, `glowing neon crystal luminescence`, `non-transparent rich bold colors`, `pitch-black cosmic space background`, `8k resolution, flawless symmetry`).
- Keep existing assertions: deterministic seed, seed ≤ 2147483647, all 7 color codes present, no personal data, regeneration changes only the seed.

### 5. Verification

- Run `bunx vitest run` on the mandala-image tests and `tsgo --noEmit`.
- Verify the live URL returns HTTP 200 with the new `model=flux` parameter for the seven-color example; if the service still returns 402, the existing local SVG fallback keeps working and this is reported honestly (no alternate service substituted).
