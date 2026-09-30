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
];

export function ArtsGuide() {
  return (
    <section className="mb-6 overflow-hidden rounded-3xl border border-primary/30 bg-card/60 backdrop-blur">
      <div className="relative px-6 py-10 text-center">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: "radial-gradient(1px 1px at 12% 20%, var(--primary), transparent), radial-gradient(1.5px 1.5px at 78% 30%, var(--primary), transparent), radial-gradient(1px 1px at 40% 70%, var(--foreground), transparent), radial-gradient(1px 1px at 88% 82%, var(--primary), transparent), radial-gradient(1px 1px at 24% 88%, var(--foreground), transparent), radial-gradient(ellipse at 50% 0%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 70%)" }} />
        <p className="relative text-xs tracking-[0.3em] text-primary">INTRODUCTION</p>
        <h3 className="relative mt-3 font-serif text-2xl text-primary">星々の引力と生命の原点</h3>
        <div className="relative mx-auto mt-6 max-w-xl space-y-4 font-serif text-[15px] leading-8 text-foreground/90">
          <p>私達すべての生命は、宇宙に浮かぶ星々が織りなす引力や磁場、天体の運行という大いなるエネルギーの影響を受けています。</p>
          <p>あなたが<span className="text-primary">「いつ、どこで」</span>生まれたのか——その瞬間の宇宙の星々の配置とエネルギーこそが、あなたの生命の特性や感情の波、潜在能力の原点を形作っています。</p>
          <p>世界の占星術や鑑定学は、太古よりこの<span className="text-primary">「星々と生命の共鳴法則」</span>を観察・体系化し、人が自らの天性を知り人生を豊かに航海するための知恵として活用してきたものです。</p>
          <p>オノレコンパスは、この15以上の分析ロジックを最新AIで統合し、あなたという存在を多次元で解き明かします。</p>
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
            {methods.map(([title, role, result], i) => (
              <details key={title} className="group rounded-2xl border border-border bg-background/40 p-4">
                <summary className="cursor-pointer list-none font-serif text-foreground marker:hidden"><span className="mr-2 text-primary">{i + 1}.</span>{title}</summary>
                <div className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
                  <p><span className="text-primary">特徴・役割：</span>{role}</p>
                  <p><span className="text-primary">導き出すもの：</span>{result}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">アプリ内の結果は生年月日・氏名などから算出した参考値で、占術ごとの正式な鑑定をすべて実施したものではありません。</p>
      </div>
    </section>
  );
}
