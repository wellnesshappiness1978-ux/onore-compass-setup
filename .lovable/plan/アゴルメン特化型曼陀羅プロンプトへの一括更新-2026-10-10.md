# アゴルメン特化型曼陀羅プロンプトへの一括更新

## 目的
バースカラー曼陀羅アートの生成プロンプトを、ユーザー指定の最高品質「アゴルメンの羅針盤・特化型プロンプト」へ固定する。URL パラメータ・Seed 制御は現行の決定的ロジックを維持する。

## 変更内容

### 1. プロンプト固定（`src/lib/mandala-image.ts`）
- `mandalaPrompt()` の戻り値を、以下の固定英文へ完全に置き換える（ユーザー指定の文面を一字一句そのまま使用）:

  `masterpiece, breathtaking circular sacred geometry mandala embodying 'Agolmen's Compass', central glowing golden starburst compass with intricate filigree, radiating spiral patterns seamlessly integrating all 7 vivid personal birth colors (sapphire blue, ruby red, emerald green, golden yellow, royal violet, vibrant orange, diamond white), rich non-transparent impasto oil painting texture, glowing crystal luminescence, shimmering golden sparkles, intricate fine lines, set against a pitch-black deep cosmic space background, 8k resolution, highly detailed, flawless radial symmetry`

- これに伴い、従来の「総合色を宝石核＋6色を外側へ」の色コード注入はプロンプトから外れる（ご指定の固定文面が優先）。7色の実際のコードは Seed 算出にのみ使われ、個人情報は依然として画像サービスへ送信しない。
- `colorMap` / `birthColorKeyword` はローカル SVG フォールバック等で参照される可能性があるため削除せず維持。

### 2. URL 構成（`mandalaImageUrl()`）
- 現行と同じ構成を維持・確認:
  `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux&seed=${seed}`
- `nologo=true` と `model=flux` は必須パラメータとして既に実装済み。ロゴ完全削除のため必ず付与されたままを保証する（テストで検証）。

### 3. Seed 制御（1点もの再現）
- 現行の決定的ロジックを維持:
  - `mandalaSeed(colors)`: 7バースカラー（名前＋コード）の FNV ハッシュ → 0〜2147483646
  - `seed = (mandalaSeed(colors) + variation * 104729) % 2147483647`
- 同じ7色なら同じ曼陀羅、再生成（variation を進める）で別の1点ものになる。ユーザーID・生年月日等の個人情報は Seed に含めない。

### 4. テスト更新（`src/lib/mandala-image.test.ts`）
- プロンプト検証を新固定文面へ置き換え:
  - 含まれること: `Agolmen's Compass`、`central glowing golden starburst compass`、`impasto oil painting texture`、`pitch-black deep cosmic space background`、`8k resolution`、`flawless radial symmetry`
  - 含まれないこと: 旧文面の断片（`hyper-detailed fine lines` 単独前提の断言など旧文言依存部分）、個人情報（user / birthdate / name 等）
- URL 検証は維持: `width=1024&height=1024&nologo=true&model=flux&seed=`、再生成で seed のみ変化、空白なしのエンコード。
- Seed 検証は維持: 決定的・範囲内・再生成で変化。

## 変更しないもの
- ローカル 7色 SVG フォールバック（Pollinations 障害時の自動切替・PNG保存）
- 全画面表示・Blob ダウンロード・再生成 UI
- `src/lib/AGENTS.md` のルール文言（Flux URL + nologo + Seed + フォールバックの記述は引き続き正しい）

## 検証
1. `bunx vitest run src/lib/mandala-image.test.ts` — プロンプト固定文面・URL・Seed の全テスト
2. `bunx tsgo --noEmit` — 型確認
3. 実 URL を 1 回 curl でステータス確認（Pollinations 側 402/524 の場合はフォールバック SVG が表示される既知の挙動として報告し、代替サービスは導入しない）
