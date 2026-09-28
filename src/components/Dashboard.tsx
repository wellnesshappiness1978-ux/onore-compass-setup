import { PREFECTURES, type UserProfile } from "./Onboarding";
import { Button } from "@/components/ui/button";
import { prefecturesRomanized, translations, type Language } from "@/lib/translations";

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

type Props = { profile: UserProfile; onEdit: () => void; language: Language };

export default function Dashboard({ profile, onEdit, language }: Props) {
  const t = translations[language];
  const birthDate = profile.birthDate
    ? new Date(`${profile.birthDate}T12:00:00`).toLocaleDateString(language, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="min-h-screen bg-background bg-lux-glow">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/40 backdrop-blur">
         <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4 pr-32 sm:pr-36">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-primary/80">
              Onore Compass
            </p>
            <h1 className="font-serif text-xl font-bold text-foreground">
              {t.brand}
            </h1>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onEdit}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {t.edit}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* Welcome */}
        <section className="text-center">
           <p className="text-sm text-muted-foreground">{t.welcome}</p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-foreground">
             {t.dashboardTitle}
          </h2>
        </section>

        {/* Profile summary */}
        <section className="card-lux mt-8 rounded-2xl p-6">
           <h3 className="mb-2 font-serif text-lg font-semibold text-primary">{t.registeredProfile}</h3>
           {row(t.birthDate, birthDate)}
           {row(t.birthTime, profile.birthTimeUnknown ? t.unknown : profile.birthTime || "—")}
           {row(t.birthPlace, ["en", "es", "fr"].includes(language) && profile.birthPlace
             ? prefecturesRomanized[PREFECTURES.indexOf(profile.birthPlace)] || profile.birthPlace
             : profile.birthPlace || "—")}
           {row(t.bloodType, profile.bloodType ? `${profile.bloodType}${t.bloodSuffix}` : "—")}
           {row(t.siblingOrder, t.siblings[["first", "middle", "last", "only"].indexOf(profile.siblingOrder)] || "—")}
        </section>

        {/* Arts status */}
        <section className="mt-8">
          <h3 className="mb-4 font-serif text-lg font-semibold text-foreground">
             {t.artsTitle} <span className="text-sm font-normal text-muted-foreground">— {t.preparing}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
             {ARTS.map((a, index) => (
              <span
                key={a}
                className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
              >
                 {t.arts[index]}
              </span>
            ))}
             {ARTS_SOON.map((a, index) => (
              <span
                key={a}
                className="rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground"
              >
                 {t.arts[ARTS.length + index]}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
             {t.comingSoon}
          </p>
        </section>
      </main>
    </div>
  );
}
