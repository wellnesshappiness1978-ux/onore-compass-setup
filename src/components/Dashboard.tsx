import type { UserProfile } from "./Onboarding";

const ARTS = [
  "四柱推命", "数秘術", "西洋占星術", "タロット", "姓名判断",
  "九星気学", "ルーン", "手相", "動物占い", "カラー占い",
];

const ARTS_SOON = ["算命学", "宿曜占星術", "易占い", "カバラ数秘術", "紫微斗数"];

function row(label: string, value: string) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

type Props = { profile: UserProfile; onEdit: () => void };

export default function Dashboard({ profile, onEdit }: Props) {
  const birthDate = profile.birthDate
    ? new Date(profile.birthDate).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="min-h-screen bg-background bg-lux-glow">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/40 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-primary/80">
              Onore Compass
            </p>
            <h1 className="font-serif text-xl font-bold text-foreground">
              オノレ<span className="text-gradient-gold">コンパス</span>
            </h1>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            プロフィールを編集
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* Welcome */}
        <section className="text-center">
          <p className="text-sm text-muted-foreground">ようこそ</p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-foreground">
            あなたの<span className="text-gradient-gold">羅針盤</span>を解析します
          </h2>
        </section>

        {/* Profile summary */}
        <section className="card-lux mt-8 rounded-2xl p-6">
          <h3 className="mb-2 font-serif text-lg font-semibold text-primary">登録プロフィール</h3>
          {row("生年月日", birthDate)}
          {row("出生時間", profile.birthTimeUnknown ? "不明" : profile.birthTime || "—")}
          {row("出生地", profile.birthPlace || "—")}
          {row("血液型", profile.bloodType ? `${profile.bloodType}型` : "—")}
          {row("兄弟構成", profile.siblingOrder || "—")}
        </section>

        {/* Arts status */}
        <section className="mt-8">
          <h3 className="mb-4 font-serif text-lg font-semibold text-foreground">
            15の占術 <span className="text-sm font-normal text-muted-foreground">— 解析準備中</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {ARTS.map((a) => (
              <span
                key={a}
                className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
              >
                {a}
              </span>
            ))}
            {ARTS_SOON.map((a) => (
              <span
                key={a}
                className="rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground"
              >
                {a}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Step 2 では、これらの占術による総合解析レポートがここに表示されます。
          </p>
        </section>
      </main>
    </div>
  );
}
