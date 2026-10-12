# VIP「出生宇宙創生図」現行設定での天体存在感アップ調整計画

## 方針
構図・天文計算・描画方式・保存仕様は一切変えず、**現行設定の係数調整のみ**で天体の大きさと存在感を高める。

## 1. 天体サイズ拡大（`src/lib/cosmic-art.ts`）
- `cosmicDisplayRadius`: 基準係数 `.05` → `.058`（全天体約16%拡大。太陽≫木星＞…＞水星の物理順序はそのまま）
- `cosmicSunPlacement` は同一関数を使うため太陽も同率で拡大
- 内側軌道の詰まり対策: `DISTANCE_CURVE` `1.8` → `2.4`（対数圧縮カーブ変更のみ。水星〜火星の軌道間隔が広がり、拡大した惑星同士・太陽との接触を避ける）
- `cosmicComposition`（centerX .5 / centerY .47 / scale .438）と `cosmicEarthPortrait`、外周ラベル、下端サイズ比較帯は現状維持

## 2. 光の存在感強化（`src/components/CosmicGenesisCanvas.tsx`）
- `paintSun`: irregularGlow 半径 `3.05→3.3` / `1.72→1.85`、shadowBlur `.052→.06`、レイ本数・明るさは維持
- `paintPlanet`: irregularGlow 半径 `2.05→2.35`、アルファ `.3+depth*.14 → .36+depth*.14`、縁光・sparkle は維持
- `paintOrbitalEarth`: glow 半径 `2.45→2.7`、アルファ `.48→.55`
- `paintEarth`（拡大細部図）: 大気縁光・オーラ半径を小幅に増幅
- 軌道線・星雲・天の川・星座・干支・ラベルの描画は現状維持（バランス崩壊防止）

## 3. テスト更新（`src/lib/cosmic-art.test.ts`）
- 地球ポートレート期待値は不変のため変更なし
- `cosmicDisplayRadius` 拡大に伴う軌道安全範囲テスト（.055〜.945 等）は現行値のままで通ることを確認
- 新規テスト追加: 拡大後も太陽円板と水星軌道、隣接軌道帯（水星-金星-地球-火星）が重ならないこと（`orbitRadius` と `radius` の余白検証）
- 物理順序・単調視認スケール・9天体線形比較の既存テストはすべて通過を維持

## 4. 検証
- `bunx vitest run`（cosmic-art / cosmic-astronomy / plans 全件）
- ビルド確認（build-errors.log）
- Playwright: 検証プロフィール（1990-04-15 08:30 東京都新宿区、`?plan=vip`）で PC／全画面／モバイル表示と 2048×2048 PNG 保存を確認

## 維持条件
- 出生黄経・軌道順・9天体実半径比・VIP限定・外部通信ゼロ・0秒即時表示・決定的描画・2048保存・7言語コピーはすべて現状のまま
