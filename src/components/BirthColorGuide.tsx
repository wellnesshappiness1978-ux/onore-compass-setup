import { birthColorSpectrum } from "@/lib/birth-color-spectrum";
import { computeCoreLayers } from "@/lib/ai/core-layers";
import { LockKeyhole } from "lucide-react";
import type { UserProfile } from "./Onboarding";
import type { Plan } from "@/lib/design-modes";
import { canUse } from "@/lib/plans";

const kinds = [
  ["main", "総合カラー（メイン）", "あなたの軸になる色。財布・スマホケースなど毎日触れる小物に一点取り入れて。"],
  ["sub", "サブカラー", "メインを支える色。服の差し色やペンなど、仕事道具に。"],
  ["money", "マネーカラー", "お金の扱いを整える色。財布の中のカードケースや家計簿の表紙に。"],
  ["love", "ラブ＆人脈カラー", "人と会う日の色。ハンカチ・アクセサリー・名刺入れに。"],
  ["health", "ヘルスカラー", "休息の色。寝具・タオル・観葉植物の鉢などくつろぐ場所に。"],
  ["mind", "マインドカラー", "気持ちを落ち着かせる色。スマホの壁紙やデスク周りの小物に。"],
] as const;

const traits = [
  ["赤", "情熱・実行力", "暖色の視覚イメージ"], ["青", "冷静・直感力", "寒色の視覚イメージ"], ["金", "豊かさ・達成", "金属光沢の視覚イメージ"], ["緑", "安定・成長", "自然を想起する視覚イメージ"], ["黄", "表現・創造", "明るさを想起する視覚イメージ"], ["紫", "探究・内省", "深みを想起する視覚イメージ"],
];
export default function BirthColorGuide({ profile, plan, onUpgrade }: { profile: UserProfile; plan: Plan; onUpgrade?: () => void }) {
  const full = canUse(plan, "birthColorsFull");
  const palette = birthColorSpectrum(profile);
  const layers = computeCoreLayers(profile);
  return <section className="mt-8 border-y border-primary/25 py-7" aria-label="バースカラーと波動の解説">
    <h3 className="font-serif text-xl text-primary">そもそもバースカラーとは？</h3>
    <p className="mt-3 text-base leading-8 text-foreground">バースカラーは、生まれた日の情報と色を結びつけ、自分らしさを色で表現する考え方です。このアプリでは生年月日・入力された出生地・出生時刻を使い、1,440段階の配色から色を選びます。色は生涯固定の参考パレットです。心身の状態や固有の波長を測定した結果ではありません。</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-3">{[
      ["✦ 一生変わらない", "登録された出生情報が同じなら、何度開いても同じ色を表示します。"],
      ["✦ 1,440段階の色", "1日の分数を着想にした独自の配色。色数は測定精度や天体との共鳴を意味しません。"],
      ["✦ パーソナルカラーとの違い", "似合う外見の色ではなく、気分や内面を表現するための参考色です。"],
    ].map(([title, body]) => <div key={title} className="border-l border-primary/50 pl-4"><h4 className="font-serif text-lg text-primary">{title}</h4><p className="mt-2 text-sm leading-7 text-foreground">{body}</p></div>)}</div>
    <h4 className="mt-7 font-serif text-lg leading-8 text-primary">あなたの［{profile.birthDate}・太陽{layers?.western.sun ?? "出生情報を確認"}／月{layers?.western.moon ?? "出生情報を確認"}］の参考パレット</h4>
    {palette ? <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{kinds.map(([key, title, tip], i) => { const open = i === 0 || full; const c = palette[key]; return open ? <div key={key} className="border border-primary/20 p-4"><div className="flex items-center gap-3"><span className="size-12 shrink-0 rounded-full border border-primary/30" style={{ backgroundColor: c.code }} aria-hidden="true"/><div><p className="text-xs text-muted-foreground">{title} · {c.slot} / 1440</p><strong className="text-base text-primary">{c.name}</strong><p className="text-sm text-foreground">{c.code}</p></div></div><p className="mt-3 text-sm leading-7 text-foreground">{tip}</p></div> : <div key={key} className="flex flex-col items-center justify-center gap-2 border border-dashed border-primary/30 p-4 text-center"><LockKeyhole className="size-5 text-primary" aria-hidden="true" /><p className="text-sm text-foreground">{title}</p><p className="text-xs text-primary">有料プランで開放</p>{onUpgrade && <button type="button" onClick={onUpgrade} className="text-xs text-primary underline">プランを見る</button>}</div>; })}</div> : <p className="mt-3 text-base text-muted-foreground">生年月日を登録すると、あなたの参考パレットを表示します。</p>}
    {palette?.provisional && <p className="mt-3 inline-block border border-primary/30 px-3 py-2 text-sm text-primary">※出生時間を設定すると参考色をより細かく選べます（現在は昼12:00を使用）</p>}
    <p className="mt-3 text-sm leading-7 text-muted-foreground">{palette?.placeDefault ? "出生地がないため東京を仮定しています。" : "出生地は入力文字列を配色の識別子として使用しています。地理座標への変換はしていません。"} 太陽の黄経計算を配色の一要素として使用します。月星座は参考情報として併記し、色の計算には使用していません。1440段階はこのアプリ独自の配色であり、科学的な波長や診断精度を示しません。</p>
    <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[340px] border-collapse text-left text-sm"><caption className="mb-2 text-left font-serif text-lg text-primary">色のイメージ一覧</caption><thead><tr className="border-b border-primary/30 text-primary"><th scope="col" className="py-2 pr-3">色</th><th scope="col" className="py-2 pr-3">象徴する特性</th><th scope="col" className="py-2">波長のイメージ</th></tr></thead><tbody>{traits.map(([color, nature, wavelength]) => <tr key={color} className="border-b border-primary/15 text-foreground"><th scope="row" className="py-3 pr-3 text-primary">{color}</th><td className="py-3 pr-3">{nature}</td><td className="py-3">{wavelength}</td></tr>)}</tbody></table></div>
    <p className="mt-3 text-xs leading-6 text-muted-foreground">この表の「波長」は物理的な測定値ではなく色の印象を示すものです。</p>
  </section>;
}
