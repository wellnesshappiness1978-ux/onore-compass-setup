# バースカラー曼陀羅：外部画像サービスを撤去し、アプリ内描画へ一本化

## 目的
外部の画像生成サービスへの通信をすべてやめ、あなたの7色だけを使った高精細な曼陀羅をアプリ内で一瞬で描きます。待ち時間・通信エラー・費用がなくなり、オフラインでも同じ絵が表示されます。

## 見た目
- 背景：深い漆黒の宇宙（中央がわずかに紺色に沈むグラデーション）
- 中心：立体感のある黄金の羅針盤（16方位の星形、明暗2面で立体に見せる刃、中央に総合カラーの宝石）
- その外側：6つのバースカラーが内側から順に花弁・幾何学の層として重なる（蓮の花弁、八角星、重なる円、12枚花弁、レース縁など）。隣の色へなめらかにつながるグラデーション
- 発光：各色の層にやわらかなネオンの光彩、金色の細かな粒子（毎回同じ配置）
- 色はあなたの7色をそのまま使用（金色は羅針盤と粒子のみ）

## 動き
- 表示時に約1秒で中心から浮かび上がり、その後ごくゆっくり回転、金の粒子が静かにまたたく
- 「動きを減らす」設定では静止

## 変えない部分
全画面表示、画像保存（スマホ・PC）、プランによる制限、免責表示、7言語の画面文。「別の配置で再生成」ボタンは、花弁の角度・粒子配置を変えた別バリエーションを描く形で残します。

## 技術メモ
- 新規 `src/components/MandalaCanvas.tsx`：純粋なSVG Reactコンポーネント。props は現行と同じ（colors, language, variation, reduced, onCapture）。`NineStarsPanel` の読み込み先を差し替え、`MandalaScene.tsx` は削除（`Capture` 型は新ファイルへ移し、`CosmicAlchemyArtwork` のimportも更新）。
- 発光はSVGの `feGaussianBlur` フィルター、粒子は `seededUnit` による決定的配置。動きはCSSアニメーション＋`prefers-reduced-motion`。
- 保存：SVG文字列→Image→2048×2048 canvas→PNG Blob（外部通信なし）。
- 幾何計算は `src/lib/art-geometry.ts` に純粋関数 `compassMandalaLayout(colors, variation)`（羅針盤の刃、6層の花弁パス、粒子）として追加し、テストを追加。
- `src/lib/mandala-image.ts` と `mandala-image.test.ts` を削除（URL・プロンプト・seed送信をすべて撤去）。`MandalaColor` 型は新コンポーネント側へ移動。コード全体で `pollinations` が残らないことを検索で確認。
- `src/lib/AGENTS.md` と project knowledge の曼陀羅ルールを「アプリ内SVG描画のみ、外部画像サービス不使用、7色を加工せず使用」に置き換え。memory `mem://features/ai-mandala` も同様に更新。`roadmap.md` の「外部サービス待ち」項目を閉じる。
- 確認：vitest実行、PlaywrightでPC・スマホ表示、全画面、保存、通信ログに外部画像リクエストがないこと。
