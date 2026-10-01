import { getBirthColorPair } from "@/lib/birth-colors";
import { computeCoreLayers } from "@/lib/ai/core-layers";
import type { UserProfile } from "./Onboarding";

const traits = [
  ["赤", "情熱・実行力", "暖色の視覚イメージ"], ["青", "冷静・直感力", "寒色の視覚イメージ"], ["金", "豊かさ・達成", "金属光沢の視覚イメージ"], ["緑", "安定・成長", "自然を想起する視覚イメージ"], ["黄", "表現・創造", "明るさを想起する視覚イメージ"], ["紫", "探究・内省", "深みを想起する視覚イメージ"],
];
export default function BirthColorGuide({ profile }: { profile: UserProfile }) {
  const pair = getBirthColorPair(profile.birthDate);
  const layers = computeCoreLayers(profile);
  return <section className="mt-8 border-y border-primary/25 py-7" aria-label="バースカラーと波動の解説">
    <h3 className="font-serif text-xl text-primary">そもそもバースカラーとは？</h3>
    <p className="mt-3 text-base leading-8 text-foreground">生年月日の数字を還元し、色のイメージに対応させる、このアプリ独自の参考表現です。物や音には物理的な振動・周波数がありますが、感情や誕生日に固有の周波数があり、色から運命を測定できるという科学的根拠はありません。「波動」は気分を色で表す比喩としてお楽しみください。</p>
    <h4 className="mt-6 font-serif text-lg leading-8 text-primary">あなたの［{profile.birthDate}・太陽{layers?.western.sun ?? "未算出"}／月{layers?.western.moon ?? "未算出"}］から導き出されたバースカラーは</h4>
    <p className="mt-2 text-base text-foreground">{pair ? <><strong className="text-primary">メイン：{pair.main.label}</strong> ／ サブ：{pair.sub.label}</> : "生年月日を入力すると表示されます"}</p>
    <p className="mt-1 text-sm text-muted-foreground">色は生年月日の数秘還元から求めています。天体配置は併記した参考情報であり、色の計算には使っていません。</p>
    <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[340px] border-collapse text-left text-sm"><caption className="mb-2 text-left font-serif text-lg text-primary">色のイメージ一覧</caption><thead><tr className="border-b border-primary/30 text-primary"><th scope="col" className="py-2 pr-3">色</th><th scope="col" className="py-2 pr-3">象徴する特性</th><th scope="col" className="py-2">波長のイメージ</th></tr></thead><tbody>{traits.map(([color, nature, wavelength]) => <tr key={color} className="border-b border-primary/15 text-foreground"><th scope="row" className="py-3 pr-3 text-primary">{color}</th><td className="py-3 pr-3">{nature}</td><td className="py-3">{wavelength}</td></tr>)}</tbody></table></div>
    <p className="mt-3 text-xs leading-6 text-muted-foreground">この表の「波長」は物理的な測定値ではなく色の印象を示すものです。</p>
  </section>;
}
