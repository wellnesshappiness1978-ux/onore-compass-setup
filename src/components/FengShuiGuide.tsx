import { useMemo } from "react";
import { Compass, Leaf, Sparkles } from "lucide-react";
import { annualFlyingStars, fengDirectionNames, mingGua } from "@/lib/feng-shui";
import type { UserProfile } from "./Onboarding";
import type { Language } from "@/lib/translations";

export default function FengShuiGuide({ profile, date, language }: { profile: UserProfile; date: Date; language: Language }) {
  const gua = useMemo(() => mingGua(profile.birthDate, profile.gender), [profile.birthDate, profile.gender]);
  const annual = annualFlyingStars(date);
  const ja = language === "ja";
  return <section aria-labelledby="feng-heading" className="mx-auto mt-8 max-w-4xl border-t border-primary/30 pt-6 text-left">
    <div className="flex items-center gap-2 text-primary"><Compass className="size-5" /><h3 id="feng-heading" className="font-serif text-xl">{ja ? "風水｜生まれ持った吉方位タイプと今年の方位" : "Feng shui · Birth direction type & annual map"}</h3></div>
    <p className="mt-2 text-sm leading-7 text-muted-foreground">{ja ? "立春を年の境とする伝統的な参考値。家の向き・建築年を使う物件別の玄空飛星盤ではありません。方位の効果や健康・利益は保証されません。" : "Traditional reference based on the solar year's start at Li Chun. This is not a building-specific Flying Star chart and makes no health or financial promises."}</p>
    {gua ? <div className="mt-5 grid gap-4 sm:grid-cols-2">{gua.branches.map(b => <div key={b.branch} className="border-l-2 border-primary/50 bg-primary/5 px-4 py-3">
      <p className="font-serif text-lg text-primary">{ja ? `${b.branch === "male" ? "男性" : "女性"}の計算式 · 吉方位タイプ ${b.number}（本命卦）` : `${b.branch === "male" ? "Male" : "Female"} calculation · Type ${b.number}`}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{ja ? "プロフィールで選んだ性別区分と立春基準の生年を使う伝統式です。" : "A traditional formula using the profile's gender category and solar year."}</p>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm leading-6 text-foreground">{([["生気｜活動を広げる", b.shengQi], ["天医｜休息を整える", b.tianYi], ["延年｜関係を育てる", b.yanNian], ["伏位｜自分を落ち着ける", b.fuWei]] as const).map(([name, dir]) => <div key={name}><dt className="text-muted-foreground">{ja ? name : name.split("｜")[0]}</dt><dd className="font-semibold text-primary">{ja ? fengDirectionNames[dir] : dir}</dd></div>)}</dl>
    </div>)}</div> : <p className="mt-4 text-sm text-muted-foreground">{ja ? "本命卦の算出には生年月日と性別の入力が必要です。マイページのプロフィールで設定してください。" : "Add your birth date and gender in your profile to view Ming Gua."}</p>}
    {gua?.nearBoundary && <p className="mt-2 text-sm text-primary">{ja ? "立春前後の誕生日は出生時刻により年の判定が変わります。" : "Near Li Chun, birth time can change the solar-year assignment."}</p>}
    <div className="mt-6 flex items-center gap-2 text-primary"><Sparkles className="size-4" /><h4 className="font-serif text-lg">{ja ? `${annual.year}年｜今年の方位エネルギーの参考配置（年盤）` : `${annual.year} annual direction-energy reference`}</h4></div>
    <p className="mt-2 text-sm leading-7 text-muted-foreground">{ja ? "年ごとに変わる数字を九つの方位へ置いた伝統的な見取り図です。個人の運勢そのものを表すものではありません。" : "A traditional nine-area map that changes yearly; it does not determine personal fortune."}</p>
    <div className="mt-3 grid grid-cols-3 gap-px border border-primary/30 bg-primary/20">{annual.palaces.map(p => <div key={p.dir} className="min-h-24 bg-background p-2 text-center sm:min-h-28"><span className="text-xs text-muted-foreground">{ja ? p.trigram : p.dir}</span><p className="font-serif text-2xl text-primary">{p.star}</p><p className="text-xs text-muted-foreground">{ja ? p.element : p.dir === "C" ? "Center" : p.dir}</p></div>)}</div>
    <p className="mt-3 text-sm leading-7 text-muted-foreground">{ja ? "玄関・寝室・仕事机などの位置は住まいごとに異なります。下の案は各方位の五行に着想した一般的なインテリア例で、特定の部屋の吉凶判定ではありません。" : "Room locations vary by home. These are general design ideas inspired by directional elements, not judgments about a particular room."}</p>
    <div className="mt-3 grid gap-2 sm:grid-cols-2">{annual.palaces.filter(p => p.dir !== "C").map(p => <div key={p.dir} className="flex gap-3 border-b border-primary/15 py-3 text-sm leading-6"><Leaf className="mt-1 size-4 shrink-0 text-primary" /><p><strong className="text-primary">{ja ? fengDirectionNames[p.dir as keyof typeof fengDirectionNames] : p.dir}</strong> · {ja ? `${p.room}の参考案：${p.color}の小物と${p.plant}。通り道を片付け、空気を入れ替える。` : `${p.element} element: try ${p.color} accents and a houseplant; keep pathways clear and ventilate.`}</p></div>)}</div>
  </section>;
}
