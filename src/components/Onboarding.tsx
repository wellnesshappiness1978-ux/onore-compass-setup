import { useState } from "react";

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

const STEP_LABELS = ["生年月日・時間", "出生地", "血液型・兄弟構成"] as const;

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
  "w-full rounded-xl border border-input bg-secondary/40 px-4 py-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/30";

const chipBase =
  "rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200";

const chipSelected = "border-primary/70 bg-primary/15 text-primary shadow-gold";
const chipIdle = "border-border bg-secondary/40 text-foreground hover:border-primary/40 hover:bg-secondary";

type Props = { onComplete: (profile: UserProfile) => void };

export default function Onboarding({ onComplete }: Props) {
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

  const isLast = step === STEP_LABELS.length - 1;

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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background bg-lux-glow px-4 py-10">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-primary/80">
            Onore Compass
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold tracking-wide text-foreground">
            オノレ<span className="text-gradient-gold">コンパス</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            あなたの生まれた秘密を、15の占術で解き明かします
          </p>
        </div>

        {/* Card */}
        <div className="card-lux rounded-3xl p-6 sm:p-8">
          {/* Progress */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold tracking-widest text-primary">
                STEP {step + 1} / {STEP_LABELS.length}
              </span>
              <span className="text-muted-foreground">{STEP_LABELS[step]}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gold-gradient transition-all duration-500 ease-out"
                style={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Birth date & time */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="birth-date" className="mb-2 block text-sm font-medium text-foreground">
                  生年月日 <span className="text-primary/70">必須</span>
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
                <label htmlFor="birth-time" className="mb-2 block text-sm font-medium text-foreground">
                  出生時間
                </label>
                <input
                  id="birth-time"
                  type="time"
                  value={profile.birthTime}
                  disabled={profile.birthTimeUnknown}
                  onChange={(e) => set("birthTime", e.target.value)}
                  className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-40`}
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
                  出生時間が不明
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Birth place */}
          {step === 1 && (
            <div>
              <label htmlFor="birth-place" className="mb-2 block text-sm font-medium text-foreground">
                出生地（都道府県） <span className="text-primary/70">必須</span>
              </label>
              <select
                id="birth-place"
                value={profile.birthPlace}
                onChange={(e) => set("birthPlace", e.target.value)}
                className={`${inputClass} appearance-none bg-[length:1rem] pr-10`}
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%23F4D03F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 1rem center",
                }}
              >
                <option value="" disabled>
                  都道府県を選択してください
                </option>
                {PREFECTURES.map((pref) => (
                  <option key={pref} value={pref}>
                    {pref}
                  </option>
                ))}
              </select>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                出生地は西洋占星術のハウス計算などに使用されます。
              </p>
            </div>
          )}

          {/* Step 3: Blood type & sibling order */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  血液型 <span className="text-primary/70">必須</span>
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_TYPES.map((bt) => (
                    <button
                      key={bt.value}
                      type="button"
                      onClick={() => set("bloodType", bt.value)}
                      className={`${chipBase} ${
                        profile.bloodType === bt.value ? chipSelected : chipIdle
                      }`}
                    >
                      {bt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  兄弟構成 <span className="text-primary/70">必須</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SIBLING_ORDERS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => set("siblingOrder", s.label)}
                      className={`${chipBase} ${
                        profile.siblingOrder === s.label ? chipSelected : chipIdle
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 space-y-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                disabled={analyzing}
                className="w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-40"
              >
                戻る
              </button>
            )}
            <button
              type="button"
              onClick={handlePrimary}
              disabled={!stepValid || analyzing}
              className={`w-full rounded-xl px-4 py-4 text-base font-bold transition-all duration-300 ${
                isLast
                  ? "bg-gold-gradient text-primary-foreground shadow-gold hover:brightness-110 active:scale-[0.99]"
                  : "bg-gold-gradient text-primary-foreground shadow-gold hover:brightness-110"
              } disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none`}
            >
              {analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block size-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                  解析中…
                </span>
              ) : isLast ? (
                "15の占術で自分を解析する"
              ) : (
                "次へ"
              )}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          入力された情報は、占術解析のためにのみ使用されます
        </p>
      </div>
    </div>
  );
}
