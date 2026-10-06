import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Language } from "@/lib/translations";

const groups = [
  ["天体・宇宙系", "西洋占星術（ホロスコープ/10天体）、インド占星術、紫微斗数、地球暦"],
  ["東洋・命理系", "四柱推命（陰陽五行）、算命学、九星気学、宿曜占星術、動物占い（60分類）"],
  ["数理・構造系", "数秘術、マヤ暦（ツォルキン）、バースカラー理論"],
  ["身体・環境・心理系", "姓名判断、血液型気質学、兄弟構成心理学、地域風土心理学"],
];

const methods = [
  ["15の占術（多層統合解析）", "単一の占いでは見落とされがちな「矛盾」や「裏の本質」を補完し合う統合システムです。", "一面的な性格診断にとどまらず、表の顔・無意識の欲求・才能・人間関係の相性・ビジネスの決断タイミングを多次元で可視化します。"],
  ["姓名判断（五運・画数解析）", "名前の漢字やよみがなの画数から「天格・人格・地格・外格・総格」の五運を算出する東洋の吉凶解析手法です。", "人生全体の運勢の波、社会で評価される強み、対人関係での立ち位置、晩年運を明らかにします。"],
  ["数秘術（ヌメロロジー）", "西洋のピタゴラス式・カバラ数秘術を基盤とし、生年月日の数字を還元・計算する数理モデルです。", "魂が持って生まれた「ライフパスナンバー（人生のテーマ）」や「才能」「今期の課題」を可視化します。"],
  ["動物占い（個性心理學・60分類）", "四柱推命の十二運星をベースに現代の行動心理学を融合させた12タイプ×60分類の統計データです。", "意思決定のパターン、価値観（目標指向型/状況対応型など）、響く言葉やモチベーションのスイッチを具体的に解明します。"],
  ["地球暦（Helio Compass / 太陽系バイオリズム）", "太陽を中心に地球と各惑星の位置関係を可視化した1年（365日）の宇宙的カレンダーです。", "個人の感情やビジネスの「攻め時・守り時」、季節の転換点、1年を通した地球の現在地と個人のバイオリズムの交差点を示します。"],
  ["干支占い（十二支・陰陽五行）", "生まれ年の十二支（子・丑・寅…）と五行（木・火・土・金・水）の巡りを組み合わせた東洋の歴史ある周期法則です。", "根底にある粘り強さ、危機的状況での本能的な対応力、時代や環境に対する順応性を分析します。"],
  ["星座占い（西洋占星術・ホロスコープ）", "生まれた瞬間の太陽・月・水星・金星などの天体配置から個性の骨格を読み解く西洋の学問です。", "基本的なアイデンティティ、感性、恋愛傾向、知的な好奇心やコミュニケーションの取り方を解き明かします。"],
  ["血液型占い（血液型気質学・行動統計）", "A・B・O・ABの4パターンがもたらす気質傾向と行動傾向を掛け合わせた伝統的な見立てです（科学的に確立された性格判定ではありません）。", "感情の現れ方、対人関係での距離感の保ち方、無意識の警戒心やストレス反応のパターンを捉えます。"],
  ["本格風水学（環境力学・本命卦・玄空飛星九星風水）", "生年（立春区切り）と性別から本命卦（八卦）を求め、その年の飛星の巡りを重ねる東洋の環境学です。", "生気・天医・延年などの吉方位、部屋別のインテリア・色・植物、気の滞りを防ぐ配置の目安を示します（住まい固有の現地鑑定ではありません）。"],
];

const localized = {
  ja: { originTitle: "星々の引力と生命の原点", origin: "地球上のすべての生命は、潮の満ち引きや太陽エネルギーに象徴されるように、月・太陽・星々と関わる大きな自然の循環の中で生きています。古くから人々は、その重力や磁気、引力の巡りに心身のバイオリズムを重ね、誕生の瞬間の天体配置を潜在意識や運命の波を考える「生命の原点」として見つめてきました。アゴルメンの羅針盤は、天体の実位置と伝統的な暦を手がかりに、自分の状態を振り返り、よりよい航路を選ぶための象徴的な地図を届けます。これは天体が性格や未来を決定するという科学的主張ではなく、自然の周期から自分を見つめ直すための参考となる見立てです。", helio: "太陽からのエネルギーや星々の磁気・引力を、人間が自然の周期を考えるための象徴として読み解きます。企業を率いるリーダーも、商品を選ぶ消費者も、市場を動かす人々も、一人ひとり感情と生活のリズムを持つ人間です。地球暦は、その人間集団の心理と周期を整理し、事業の意思決定を考える参考視点を示します。成功を保証する予測ではありません。" },
  en: { originTitle: "The stars and the origin of life", origin: "All life on Earth moves within vast natural cycles, symbolized by the tides and the Sun's energy. Across history, people have linked the motion, gravity and magnetism of the Moon, Sun and stars with bodily and emotional rhythms, viewing the sky at birth as an origin point for reflection. Agolmen's Compass combines calculated celestial positions with traditional calendars to offer a symbolic map for understanding your present state and choosing a better course. It does not claim that celestial bodies scientifically determine personality or the future; it is a reflective framework inspired by nature's cycles.", helio: "Helio Compass treats solar energy and celestial cycles as symbols for considering human rhythms. Leaders, customers and the people who move markets are all individuals with emotions and daily cycles. It organizes those shared patterns as one perspective for business decisions, not a guarantee of success." },
} as const;

const stars = [
  { top: "8%", left: "8%", size: 2, delay: "0s" },
  { top: "18%", left: "20%", size: 1.5, delay: "0.8s", soft: true },
  { top: "6%", left: "36%", size: 1.5, delay: "1.6s", soft: true },
  { top: "14%", left: "58%", size: 2, delay: "0.4s" },
  { top: "9%", left: "78%", size: 2.5, delay: "1.1s" },
  { top: "22%", left: "90%", size: 1.5, delay: "2s", soft: true },
  { top: "34%", left: "5%", size: 1.5, delay: "1.4s" },
  { top: "44%", left: "14%", size: 2, delay: "2.6s", soft: true },
  { top: "40%", left: "86%", size: 1.5, delay: "0.6s" },
  { top: "58%", left: "92%", size: 2, delay: "1.9s", soft: true },
  { top: "70%", left: "7%", size: 2, delay: "2.2s" },
  { top: "78%", left: "26%", size: 1.5, delay: "1s", soft: true },
  { top: "84%", left: "70%", size: 2, delay: "0.3s" },
  { top: "74%", left: "88%", size: 1.5, delay: "2.4s", soft: true },
];

function IntroStars() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {stars.map((s, i) => (
        <span
          key={i}
          className={`arts-star${s.soft ? " arts-star--soft" : ""}`}
          style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }}
        />
      ))}
      <span className="arts-orb" style={{ top: "-14%", left: "50%", width: 340, height: 340, transform: "translateX(-50%)" }} />
      <span className="arts-orb" style={{ bottom: "-18%", left: "-10%", width: 260, height: 260, animationDelay: "2.5s" }} />
      <span className="arts-orb" style={{ bottom: "-10%", right: "-12%", width: 220, height: 220, animationDelay: "4s" }} />
    </div>
  );
}

export function ArtsGuide({ language = "ja" }: { language?: Language }) {
  const [selected, setSelected] = useState<(typeof methods)[number] | null>(null);
  const words = language === "ja" ? localized.ja : localized.en;
  const shownMethods: string[][] = methods.map((method) => method[0]?.startsWith("地球暦") ? [method[0] ?? "", method[1] ?? "", words.helio] : [...method]);
  return (
    <section className="mb-6 overflow-hidden rounded-3xl border border-primary/30 bg-card/60 backdrop-blur">
      <div className="relative px-6 py-14 text-center">
        <IntroStars />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: "radial-gradient(1px 1px at 12% 20%, var(--primary), transparent), radial-gradient(1.5px 1.5px at 78% 30%, var(--primary), transparent), radial-gradient(1px 1px at 40% 70%, var(--foreground), transparent), radial-gradient(1px 1px at 88% 82%, var(--primary), transparent), radial-gradient(1px 1px at 24% 88%, var(--foreground), transparent), radial-gradient(ellipse at 50% 0%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 70%)" }} />
        <p className="arts-rise relative text-[11px] tracking-[0.55em] text-primary/80">INTRODUCTION</p>
        <div className="relative mt-4 flex items-center justify-center gap-3" aria-hidden>
          <span className="h-px w-14 bg-gradient-to-r from-transparent to-primary/60" />
          <span className="text-primary/90" style={{ fontSize: 10 }}>✦</span>
          <span className="h-px w-14 bg-gradient-to-l from-transparent to-primary/60" />
        </div>
        <h3 className="arts-rise relative mt-4 font-serif text-3xl" style={{ animationDelay: "0.15s", textShadow: "0 0 24px color-mix(in oklab, var(--gold-glow) 35%, transparent)" }}>
          <span className="arts-shimmer">{words.originTitle}</span>
        </h3>
        <div className="relative mx-auto mt-8 max-w-2xl space-y-6 font-serif text-xl leading-[2.1] text-foreground/90 sm:text-2xl">
          <p className="arts-rise" style={{ animationDelay: "0.3s" }}>{words.origin}</p>
          <div className="flex items-center justify-center gap-3 pt-2" aria-hidden>
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-primary/50" />
            <span className="text-primary/80" style={{ fontSize: 9 }}>✧</span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-primary/50" />
          </div>
          <div className="arts-rise border-t border-primary/25 pt-8 text-left" style={{ animationDelay: "0.75s" }}><h4 className="text-center font-serif text-3xl text-primary">アゴルメンの由来</h4><p className="mt-6">「アゴルメン」とは、宇宙の絶対調和とされる「カタツムリやオウムガイの殻（対数螺旋／フィボナッチスパイラル）」に由来します。自然界が描く「黄金比（1:1.618）」は、外界の乱れから自分の強固な軸を護る聖なる家であり、中心から外側へ無限に豊かさの波動を広げる発展の象徴です。</p><p className="mt-5">殻の中心は、周囲の声に揺らいだときも自分の本質へ戻る場所。そこから途切れず広がる螺旋は、経験を重ねるほど可能性が開き、新しい方向へ進み続ける生命の姿を映します。羅針盤は答えを押しつけるものではなく、自分の内側にある方角を確かめるための道具です。複数の伝統的な見立てと現代的な整理を重ね、自分らしい選択へ戻るための静かな案内役でありたいという願いを、この名に込めています。</p></div><p className="arts-rise text-lg text-primary sm:text-xl" style={{ animationDelay: "0.85s" }}>15以上の分析視点を重ね、あなた自身の羅針盤を見つけるための参考情報を届けます。</p>
        </div>
      </div>
      <div className="space-y-6 border-t border-primary/20 px-5 py-6">
        <div>
          <h4 className="font-serif text-lg text-primary">統合解析する15の分析ロジック</h4>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {groups.map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-border bg-background/40 p-4">
                <dt className="text-sm text-primary">{k}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h4 className="font-serif text-lg text-primary">主要な分析手法と役割</h4>
          <div className="mt-3 space-y-2">
            {shownMethods.map((method, i) => <Button key={method[0]} type="button" variant="outline" onClick={() => setSelected(method)} className="h-auto min-h-16 w-full justify-start whitespace-normal rounded-md border-primary/25 bg-background/40 p-4 text-left font-serif text-foreground"><span className="mr-2 text-primary">{i + 1}.</span>{method[0]}</Button>)}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">アプリ内の結果は生年月日・氏名などから算出した参考値で、占術ごとの正式な鑑定をすべて実施したものではありません。</p>
      </div>
      <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}><DialogContent className="max-w-lg border-primary/30 bg-card text-foreground">{selected && <><DialogTitle className="font-serif text-xl text-primary">{selected[0]}</DialogTitle><DialogDescription className="text-sm leading-7 text-muted-foreground">計算の背景と、このアプリで読み取る範囲</DialogDescription><div className="space-y-4"><div className="border-l-2 border-primary/50 bg-primary/5 p-4"><p className="text-xs text-primary">仕組み・背景</p><p className="mt-2 text-sm leading-7">{selected[1]}</p></div><div className="border-l-2 border-primary/25 p-4"><p className="text-xs text-primary">読み取る範囲</p><p className="mt-2 text-sm leading-7">{selected[2]}</p></div><p className="text-xs leading-6 text-muted-foreground">自己理解のための参考情報です。健康、利益、適性、未来の結果を確定するものではありません。</p></div></>}</DialogContent></Dialog>
    </section>
  );
}
