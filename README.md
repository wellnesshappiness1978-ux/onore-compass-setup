# Agolmen's Compass Setup

Build Step 1: Onboarding & User Profile Input Screen for "Agolmen's Compass (アゴルメンの羅針盤)".

Design & UI:
- Modern luxury dark mode (#0B132B navy, #F4D03F gold highlights).
- Clean, multi-step card layout with progress bar.

Input Fields Required:
1. Birth Date (生年月日 - Date picker)
2. Birth Time (出生時間 - Time picker / "不明" checkbox)
3. Birth Place (出生地 - Prefecture dropdown)
4. Blood Type (血液型 - A, B, O, AB select buttons)
5. Sibling Order (兄弟構成 - 長子, 中子, 末っ子, 一人っ子 buttons)

Action:
- Prominent Gold CTA Button: "15の占術で自分を解析する" (Analyzes user profile and transitions to Home Dashboard).
- Store these inputs in React local state for now.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b9d3304b-2d60-4bc1-820f-5d9babca69a8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
