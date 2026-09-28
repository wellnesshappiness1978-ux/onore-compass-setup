import { useState } from "react";
import { CalendarDays, Clock3, Compass, Droplets, MapPin, Network, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prefecturesRomanized, translations, type Language } from "@/lib/translations";

export type UserProfile = {
  birthDate: string;
  birthTime: string;
  birthTimeUnknown: boolean;
  birthPlace: string;
  bloodType: string;
  siblingOrder: string;
};

const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

const BLOOD_TYPES = [
  { value: "A", label: "A型" },
  { value: "B", label: "B型" },
  { value: "O", label: "O型" },
  { value: "AB", label: "AB型" },
];

const SIBLING_ORDERS = [
  { value: "first", label: "長子" },
  { value: "middle", label: "中子" },
  { value: "last", label: "末っ子" },
  { value: "only", label: "一人っ子" },
];

const inputClass =
  "field-luminous w-full rounded-lg border border-primary/15 bg-background/45 px-4 py-3 text-base text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground focus:border-primary/70 disabled:cursor-not-allowed disabled:opacity-40";

const chipBase =
  "h-12 rounded-lg border px-2 text-sm font-medium transition-all duration-300";

const chipSelected = "border-primary/80 bg-primary/15 text-primary shadow-champagne";
const chipIdle = "border-primary/15 bg-background/40 text-foreground hover:border-primary/45 hover:bg-primary/5";

type Props = { onComplete: (profile: UserProfile) => void; language: Language };

export default function Onboarding({ onComplete, language }: Props) {
  const t = translations[language];
  const [step, setStep] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    birthDate: "",
    birthTime: "",
    birthTimeUnknown: false,
    birthPlace: "",
    bloodType: "",
    siblingOrder: "",
  });

  const set = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const stepValid = [
    profile.birthDate !== "" && (profile.birthTimeUnknown || profile.birthTime !== ""),
    profile.birthPlace !== "",
    profile.bloodType !== "" && profile.siblingOrder !== "",
  ][step];

  const isLast = step === t.steps.length - 1;

  const handlePrimary = () => {
    if (!stepValid) return;
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    setAnalyzing(true);
    window.setTimeout(() => onComplete(profile), 1400);
  };

  return (
    <div className="celestial-scene relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-10 sm:py-14">
      <div aria-hidden="true" className="celestial-stars" />
      <div aria-hidden="true" className="celestial-orbit -left-64 -top-64 sm:-left-52 sm:-top-72" />
      <div aria-hidden="true" className="celestial-orbit -bottom-80 -right-72 sm:-right-52" />
      <svg aria-hidden="true" className="pointer-events-none absolute right-[8%] top-[12%] hidden h-36 w-40 text-primary/25 md:block" viewBox="0 0 160 144" fill="none">
        <path d="M10 96 51 30 97 58 143 12M51 30l17 100 29-72 46 58" stroke="currentColor" strokeWidth=".7" />
        {[ [10,96], [51,30], [97,58], [143,12], [68,130], [143,116] ].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" fill="currentColor" />)}
      </svg>
      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full border border-primary/40 bg-primary/5 text-primary shadow-champagne">
            <Compass className="size-6 stroke-[1.2]" aria-hidden="true" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/90">
            Onore Compass
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-gradient-gold sm:text-4xl">{t.brand}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        {/* Card */}
        <div className="card-lux rounded-2xl p-6 sm:p-8">
          <h2 className="mb-5 font-serif text-base font-semibold text-gradient-gold">{t.profileEntry}</h2>
          {/* Progress */}
          <div className="mb-7">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-primary">
                {t.step} {step + 1} / {t.steps.length}
              </span>
              <span className="font-serif text-gradient-gold font-semibold text-right">{t.steps[step]}</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-primary/10">
              <div
                className="h-full rounded-full bg-champagne-gradient shadow-champagne transition-all duration-500 ease-out"
                 style={{ width: `${((step + 1) / t.steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Birth date & time */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="birth-date" className="mb-2 flex items-center gap-2 font-serif text-sm font-semibold text-primary">
                  <CalendarDays className="size-4 stroke-[1.4]" aria-hidden="true" />
                  {t.birthDate} <span className="text-xs font-normal text-primary/70">{t.required}</span>
                </label>
                <input
                  id="birth-date"
                  type="date"
                  value={profile.birthDate}
                  max="2026-12-31"
                  onChange={(e) => set("birthDate", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="birth-time" className="mb-2 flex items-center gap-2 font-serif text-sm font-semibold text-primary">
                  <Clock3 className="size-4 stroke-[1.4]" aria-hidden="true" />
                  {t.birthTime}
                </label>
                <input
                  id="birth-time"
                  type="time"
                  value={profile.birthTime}
                  disabled={profile.birthTimeUnknown}
                  onChange={(e) => set("birthTime", e.target.value)}
                  className={inputClass}
                />
                <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={profile.birthTimeUnknown}
                    onChange={(e) => {
                      set("birthTimeUnknown", e.target.checked);
                      if (e.target.checked) set("birthTime", "");
                    }}
                    className="size-4 rounded border-input accent-[var(--primary)]"
                  />
                  {t.timeUnknown}
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Birth place */}
          {step === 1 && (
            <div>
              <label htmlFor="birth-place" className="mb-2 flex items-center gap-2 font-serif text-sm font-semibold text-primary">
                <MapPin className="size-4 stroke-[1.4]" aria-hidden="true" />
                 {t.birthPlace} <span className="text-xs font-normal text-primary/70">{t.required}</span>
              </label>
              <select
                id="birth-place"
                value={profile.birthPlace}
                onChange={(e) => set("birthPlace", e.target.value)}
                className={`${inputClass} appearance-none pr-10`}
              >
                <option value="" disabled>
                   {t.selectPlace}
                </option>
                 {PREFECTURES.map((pref, index) => (
                  <option key={pref} value={pref}>
                     {["en", "es", "fr"].includes(language) ? prefecturesRomanized[index] : pref}
                  </option>
                ))}
              </select>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                 {t.placeHint}
              </p>
            </div>
          )}

          {/* Step 3: Blood type & sibling order */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="mb-2 flex items-center gap-2 font-serif text-sm font-semibold text-primary">
                  <Droplets className="size-4 stroke-[1.4]" aria-hidden="true" />
                   {t.bloodType} <span className="text-xs font-normal text-primary/70">{t.required}</span>
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_TYPES.map((bt) => (
                    <Button
                      key={bt.value}
                      type="button"
                      variant="outline"
                      onClick={() => set("bloodType", bt.value)}
                      aria-pressed={profile.bloodType === bt.value}
                      className={`${chipBase} ${
                        profile.bloodType === bt.value ? chipSelected : chipIdle
                      }`}
                    >
                       {language === "ja" ? bt.label : bt.value}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-2 font-serif text-sm font-semibold text-primary">
                  <Network className="size-4 stroke-[1.4]" aria-hidden="true" />
                   {t.siblingOrder} <span className="text-xs font-normal text-primary/70">{t.required}</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SIBLING_ORDERS.map((s) => (
                    <Button
                      key={s.value}
                      type="button"
                      variant="outline"
                       onClick={() => set("siblingOrder", s.value)}
                       aria-pressed={profile.siblingOrder === s.value}
                      className={`${chipBase} ${
                         profile.siblingOrder === s.value ? chipSelected : chipIdle
                      }`}
                    >
                       {t.siblings[SIBLING_ORDERS.indexOf(s)]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 space-y-3">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                disabled={analyzing}
                className="h-11 w-full rounded-lg border-primary/20 bg-transparent text-sm text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
              >
                 {t.back}
              </Button>
            )}
            <Button
              type="button"
              variant="champagne"
              onClick={handlePrimary}
              disabled={!stepValid || analyzing}
              className="h-14 w-full rounded-lg px-3 text-sm font-bold transition-all duration-300 sm:text-base disabled:opacity-35 disabled:shadow-none"
            >
              {analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block size-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                   {t.analyzing}
                </span>
              ) : isLast ? (
                 <><Sparkles className="size-4" aria-hidden="true" />{t.analyze}</>
              ) : (
                 t.next
              )}
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
           {t.privacy}
        </p>
      </div>
    </div>
  );
}
