import { Fragment, useState, type ReactNode } from "react";
import {
  Bell,
  Building2,
  CalendarDays,
  Check,
  Crown,
  FileText,
  Globe,
  HelpCircle,
  LockKeyhole,
  Pencil,
  Shield,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { languages, type Language } from "@/lib/translations";
import { settingsTranslations } from "@/lib/settings-translations";

type Plan = "free" | "vip" | "b2b";
type Props = {
  language: Language;
  onLanguageChange: (language: Language) => void;
  onEdit: () => void;
  profileRows: ReactNode;
};

const TEAM = ["A. Sato", "K. Mori", "Y. Ito", "R. Kato"];
// Fixed sample values for the illustrative matrix (not computed).
const MATRIX = [
  [0, 86, 72, 64],
  [86, 0, 78, 81],
  [72, 78, 0, 69],
  [64, 81, 69, 0],
];

export default function SettingsPanel({ language, onLanguageChange, onEdit, profileRows }: Props) {
  const t = settingsTranslations[language];
  const [plan, setPlan] = useState<Plan>("free");
  const [b2b, setB2b] = useState(false);
  const [notify, setNotify] = useState({ decision: true, bio: false });
  const [notice, setNotice] = useState<string | null>(null);
  const planLabel = { free: t.planFree, vip: t.planVip, b2b: t.planB2b }[plan];
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-2xl text-primary">{t.title}</h2>

      <section className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <span className="grid size-16 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary">
            <UserRound className="size-8" strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <p className="font-serif text-lg text-foreground">{t.guest}</p>
            <span
              className={`mt-1 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${plan === "free" ? "border-border text-muted-foreground" : "border-primary/50 bg-primary/10 text-primary shadow-[0_0_16px_var(--gold-glow)]"}`}
            >
              {plan === "b2b" ? <Building2 className="size-3.5" /> : <Crown className="size-3.5" />}
              {planLabel}
            </span>
          </div>
        </div>
        {profileRows}
        <div className="mt-4 rounded-xl border border-dashed border-primary/25 p-3">
          <p className="text-xs text-muted-foreground">{t.testToggle}</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(["free", "vip", "b2b"] as Plan[]).map((p) => (
              <Button
                key={p}
                size="sm"
                variant="outline"
                aria-pressed={plan === p}
                onClick={() => setPlan(p)}
                className={`h-auto whitespace-normal py-2 text-[11px] ${plan === p ? "border-primary bg-primary/15 text-primary" : "border-primary/20 bg-transparent text-muted-foreground"}`}
              >
                {{ free: t.planFree, vip: "VIP", b2b: "B2B" }[p]}
              </Button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">{t.testNote}</p>
        </div>
      </section>

      <section className="glass-card rounded-2xl p-5">
        <h3 className="font-serif text-lg text-primary">{t.membership}</h3>
        <div className="mt-3 overflow-hidden rounded-xl border border-primary/15 text-sm">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
            <span />
            <span className="w-14 text-center">{t.free}</span>
            <span className="w-14 text-center text-primary">{t.vip}</span>
          </div>
          {t.benefits.map((b, i) => (
            <div
              key={b}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-t border-primary/10 px-3 py-2.5"
            >
              <span>{b}</span>
              <span className="w-14 text-center text-xs text-muted-foreground">
                {i === 2 ? <LockKeyhole className="mx-auto size-4" /> : t.freeValues[i]}
              </span>
              <Check className="mx-auto size-4 w-14 text-primary" />
            </div>
          ))}
        </div>
        <Button
          className="mt-4 h-auto w-full whitespace-normal py-3"
          onClick={() => setNotice(t.upgradeNote)}
        >
          <Crown className="size-4" /> {t.upgrade}
        </Button>
      </section>

      <section className="glass-card rounded-2xl p-5">
        <h3 className="font-serif text-lg text-primary">{t.b2bTitle}</h3>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-primary/15 p-3 text-sm">
          <span className={b2b ? "text-muted-foreground" : "text-primary"}>{t.personal}</span>
          <Switch checked={b2b} onCheckedChange={setB2b} aria-label={t.b2b} />
          <span className={`text-right ${b2b ? "text-primary" : "text-muted-foreground"}`}>
            {t.b2b}
          </span>
        </div>
        {b2b && (
          <div className="mt-4 space-y-5">
            <p className="text-xs text-muted-foreground">{t.sampleNote}</p>
            <div>
              <h4 className="text-sm text-foreground">{t.members}</h4>
              <ul className="mt-2 grid grid-cols-2 gap-2">
                {TEAM.map((name, i) => (
                  <li
                    key={name}
                    className="rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-sm"
                  >
                    {name}
                    <span className="block text-xs text-primary">{t.roles[i]}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm text-foreground">{t.matrix}</h4>
              <div className="mt-2 grid grid-cols-5 gap-1 text-center text-[11px]">
                <span />
                {TEAM.map((n) => (
                  <span key={n} className="truncate text-muted-foreground">
                    {n.split(" ")[1]}
                  </span>
                ))}
                {MATRIX.map((row, r) => (
                  <Fragment key={r}>
                    <span className="truncate text-muted-foreground">{TEAM[r].split(" ")[1]}</span>
                    {row.map((v, c) => (
                      <span
                        key={`${r}-${c}`}
                        className="rounded-md py-1.5 text-foreground"
                        style={{
                          background: v
                            ? `color-mix(in oklab, var(--primary) ${Math.round((v - 50) * 1.4)}%, transparent)`
                            : "transparent",
                        }}
                      >
                        {v ? `${v}%` : "—"}
                      </span>
                    ))}
                  </Fragment>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm text-foreground">{t.roleMap}</h4>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {t.roleAreas.map((area, i) => (
                  <div key={area} className="rounded-xl border border-primary/20 p-3 text-center">
                    <p className="text-xs text-primary">{area}</p>
                    <p className="mt-1 text-sm">{TEAM[i]}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="flex items-center gap-2 text-sm text-foreground">
                <CalendarDays className="size-4 text-primary" /> {t.calendar}
              </h4>
              <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px]">
                {days.map((d, i) => {
                  const level = [0, 1, 2, 0, 1, 1, 2][i];
                  return (
                    <div
                      key={i}
                      className={`rounded-lg border py-2 ${level === 0 ? "border-primary/50 bg-primary/15 text-primary" : "border-primary/10 text-muted-foreground"}`}
                    >
                      <p>{new Intl.DateTimeFormat(language, { weekday: "short" }).format(d)}</p>
                      <p className="text-sm text-foreground">{d.getDate()}</p>
                      <p>{t.timing[level]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="glass-card rounded-2xl p-5">
        <h3 className="font-serif text-lg text-primary">{t.account}</h3>
        <Button
          variant="outline"
          onClick={onEdit}
          className="mt-3 w-full justify-start border-primary/25 bg-primary/5 text-foreground"
        >
          <Pencil className="size-4 text-primary" /> {t.editProfile}
        </Button>
        <div className="mt-4">
          <p className="flex items-center gap-2 text-sm">
            <Globe className="size-4 text-primary" /> {t.language}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {languages.map((l) => (
              <Button
                key={l.code}
                size="sm"
                variant="outline"
                aria-pressed={language === l.code}
                onClick={() => onLanguageChange(l.code)}
                className={
                  language === l.code
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-primary/20 bg-transparent text-muted-foreground"
                }
              >
                {l.flag} {l.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-5 space-y-3">
          <p className="flex items-center gap-2 text-sm">
            <Bell className="size-4 text-primary" /> {t.notifications}
          </p>
          {(
            [
              ["decision", t.notifyDecision],
              ["bio", t.notifyBio],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex items-center justify-between rounded-xl border border-primary/15 px-3 py-2.5 text-sm"
            >
              {label}
              <Switch
                checked={notify[key]}
                onCheckedChange={(v) => setNotify((n) => ({ ...n, [key]: v }))}
              />
            </label>
          ))}
          <p className="text-[11px] text-muted-foreground">{t.notifyNote}</p>
        </div>
        <div className="mt-5 divide-y divide-primary/10 border-y border-primary/10">
          {(
            [
              [FileText, t.terms],
              [Shield, t.privacy],
              [HelpCircle, t.help],
            ] as const
          ).map(([Icon, label]) => (
            <button
              key={label}
              type="button"
              onClick={() => setNotice(t.preparing)}
              className="flex w-full items-center gap-3 py-3 text-left text-sm hover:text-primary"
            >
              <Icon className="size-4 text-primary" /> {label}
            </button>
          ))}
        </div>
      </section>

      {notice && (
        <p
          role="status"
          className="fixed bottom-24 left-1/2 z-40 w-[min(90vw,420px)] -translate-x-1/2 rounded-xl border border-primary/30 bg-card/95 px-4 py-3 text-center text-sm backdrop-blur"
        >
          {notice}
          <button
            type="button"
            className="ml-3 text-primary"
            onClick={() => setNotice(null)}
            aria-label="close"
          >
            ×
          </button>
        </p>
      )}
    </div>
  );
}
