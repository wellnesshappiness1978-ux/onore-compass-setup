import { useState } from "react";
import { ArrowRight, CalendarDays, Clock3, Compass, Droplets, MapPin, Network, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prefecturesRomanized, translations, type Language } from "@/lib/translations";
import { profileTranslations } from "@/lib/profile-translations";
import { profileStorageCopy } from "@/lib/profile-storage-copy";
import { AgolmenLoading, AgolmenLogo } from "./AgolmenSpiral";
import { finalizePersonalName, formatPersonalName } from "@/lib/name-format";

export type UserProfile = {
  nameKanji: string;
  nameKana: string;
  nameRomaji: string;
  gender: "female" | "male" | "other" | "undisclosed";
  birthCity: string;
  birthDate: string;
  birthTime: string;
  birthTimeUnknown: boolean;
  birthPlace: string;
  bloodType: string;
  siblingOrder: string;
};

export const PREFECTURES = [
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

export const inputClass =
  "field-luminous w-full rounded-lg border border-primary/15 bg-background/45 px-4 py-3 text-base text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground focus:border-primary/70 disabled:cursor-not-allowed disabled:opacity-40";

const chipBase =
  "h-12 rounded-lg border px-2 text-sm font-medium transition-all duration-300";

const chipSelected = "border-primary/80 bg-primary/15 text-primary shadow-champagne";
const chipIdle = "border-primary/15 bg-background/40 text-foreground hover:border-primary/45 hover:bg-primary/5";

type Props = { onComplete: (profile: UserProfile) => Promise<void>; language: Language; signedIn: boolean; initialProfile?: UserProfile };

const introCopy: Record<Language, { eyebrow: string; title: string; body: string; inputs: string; layers: string; portrait: string; note: string; cta: string }> = {
  ja: { eyebrow: "入力前の30秒プレビュー", title: "なぜ、ひとつの占いだけで見ないのか？", body: "同じ誕生日でも、名前・生まれた時間・場所・家族の中での立場が重なると、見えてくる輪郭は変わります。アゴルメンは一つの答えに決めつけず、複数の視点が重なる部分と食い違う部分をAIで読み解きます。", inputs: "姓名・生年月日・出生時刻／場所", layers: "名前・数字・星・暦・動物・方位の6つの視点", portrait: "あなたの本質・強み・迷いやすい構造", note: "15以上の占術知見を背景に、入力値から実際に算出できる6つの視点を統合する参考体験です。未入力情報は推測しません。", cta: "プロフィール入力へ進む" },
  en: { eyebrow: "30-second preview", title: "Why look through more than one lens?", body: "A birth date gains different contours when combined with a name, birth time, place and family context. Agolmen compares where several perspectives reinforce or challenge one another instead of forcing a single answer.", inputs: "Name · date · time · place", layers: "Name · numbers · sky · pillars · animal · directions", portrait: "Your nature · strengths · recurring friction", note: "A reflective experience informed by 15+ traditions. Only implemented calculations from supplied data are used; missing details are never guessed.", cta: "Enter my profile" },
  "zh-CN": { eyebrow: "填写前30秒预览", title: "为什么不只看一种占术？", body: "即使生日相同，姓名、出生时间与地点、家庭排行相互叠加后，呈现的轮廓也会不同。阿戈尔曼用AI解读多种视角的重合与差异，而不是武断地给出唯一答案。", inputs: "姓名・生日・时间／地点", layers: "姓名・数字・天体・四柱・动物・方位", portrait: "本质・优势・反复卡住的结构", note: "这是以15种以上占术知识为背景的参考体验，只使用已实现且可由输入计算的项目，不猜测缺失信息。", cta: "开始填写资料" },
  "zh-TW": { eyebrow: "填寫前30秒預覽", title: "為什麼不只看一種占術？", body: "即使生日相同，姓名、出生時間與地點、家庭排行互相疊加後，呈現的輪廓也會不同。阿戈爾曼用AI解讀多種視角的重合與差異，而不是武斷地給出唯一答案。", inputs: "姓名・生日・時間／地點", layers: "姓名・數字・天體・四柱・動物・方位", portrait: "本質・優勢・反覆卡住的結構", note: "這是以15種以上占術知識為背景的參考體驗，只使用已實作且可由輸入計算的項目，不猜測缺失資訊。", cta: "開始填寫資料" },
  ko: { eyebrow: "입력 전 30초 미리보기", title: "왜 한 가지 점술만 보지 않을까요?", body: "같은 생일도 이름, 태어난 시간과 장소, 가족 안의 위치가 겹치면 다른 윤곽이 드러납니다. 아골멘은 하나의 답으로 단정하지 않고 여러 관점이 겹치거나 어긋나는 지점을 AI로 읽습니다.", inputs: "이름・생일・시간／장소", layers: "이름・숫자・천체・사주・동물・방위", portrait: "본질・강점・반복되는 막힘", note: "15가지 이상의 점술 지식을 배경으로 한 참고 체험입니다. 입력값으로 계산 가능한 구현 항목만 사용하며 누락 정보는 추측하지 않습니다.", cta: "프로필 입력하기" },
  es: { eyebrow: "Vista previa de 30 segundos", title: "¿Por qué mirar con más de una lente?", body: "Una fecha adquiere otros matices al combinarse con el nombre, la hora, el lugar y el contexto familiar. Agolmen compara coincidencias y contrastes entre perspectivas sin imponer una sola respuesta.", inputs: "Nombre · fecha · hora · lugar", layers: "Nombre · números · cielo · pilares · animal · direcciones", portrait: "Esencia · fortalezas · fricciones recurrentes", note: "Experiencia reflexiva inspirada en más de 15 tradiciones. Solo usa cálculos implementados con los datos aportados; nunca inventa lo que falta.", cta: "Introducir mi perfil" },
  fr: { eyebrow: "Aperçu en 30 secondes", title: "Pourquoi croiser plusieurs regards ?", body: "Une date prend d’autres contours avec le nom, l’heure, le lieu et le contexte familial. Agolmen compare les convergences et les écarts entre plusieurs perspectives sans imposer une réponse unique.", inputs: "Nom · date · heure · lieu", layers: "Nom · nombres · ciel · piliers · animal · directions", portrait: "Nature · forces · tensions récurrentes", note: "Expérience réflexive inspirée de plus de 15 traditions. Seuls les calculs disponibles à partir des données saisies sont utilisés ; rien n’est inventé.", cta: "Saisir mon profil" },
};

export default function Onboarding({ onComplete, language, signedIn, initialProfile }: Props) {
  const t = translations[language];
  const pt = profileTranslations[language];
  const storage = profileStorageCopy[language];
  const [introVisible, setIntroVisible] = useState(!initialProfile);
  const [step, setStep] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(initialProfile ?? {
    nameKanji: "",
    nameKana: "",
    nameRomaji: "",
    gender: "undisclosed",
    birthCity: "",
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
    /^[A-Za-z][A-Za-z\s'-]*$/.test(profile.nameRomaji.trim()) && profile.birthDate !== "" && (profile.birthTimeUnknown || profile.birthTime !== ""),
    profile.birthPlace !== "",
    profile.bloodType !== "" && profile.siblingOrder !== "",
  ][step];

  const isLast = step === t.steps.length - 1;

  const handlePrimary = async () => {
    if (!stepValid) return;
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    setAnalyzing(true);
    setSaveError(false);
    try {
      await onComplete({
        ...profile,
        nameKanji: finalizePersonalName(profile.nameKanji),
        nameKana: finalizePersonalName(profile.nameKana),
        nameRomaji: finalizePersonalName(profile.nameRomaji, true),
      });
    } catch {
      setSaveError(true);
    } finally {
      setAnalyzing(false);
    }
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
          <div className="mx-auto mb-4 flex size-20 items-center justify-center text-primary shadow-champagne">
            <AgolmenLogo className="size-20 object-contain" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/90">
            Agolmen's Compass
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-gradient-gold sm:text-4xl">{t.brand}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        {/* Card */}
        {introVisible ? <div className="card-lux rounded-lg p-6 sm:p-8">
          <p className="text-xs text-primary">{introCopy[language].eyebrow}</p>
          <h2 className="mt-2 font-serif text-2xl leading-snug text-gradient-gold">{introCopy[language].title}</h2>
          <p className="mt-4 text-sm leading-7 text-foreground">{introCopy[language].body}</p>
          <div className="mt-6 grid gap-3" aria-label={introCopy[language].title}>
            {[introCopy[language].inputs, introCopy[language].layers, introCopy[language].portrait].map((line, index) => <div key={line} className="flex items-center gap-3 border-l-2 border-primary/50 bg-primary/5 px-4 py-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/40 text-xs text-primary">{index + 1}</span><p className="text-sm leading-6 text-foreground">{line}</p>{index < 2 && <ArrowRight className="ml-auto size-4 shrink-0 text-primary" aria-hidden="true" />}</div>)}
          </div>
          <p className="mt-5 text-xs leading-6 text-muted-foreground">{introCopy[language].note}</p>
          <Button type="button" variant="champagne" onClick={() => setIntroVisible(false)} className="mt-6 h-14 w-full whitespace-normal px-4 text-sm font-bold sm:text-base">{introCopy[language].cta}<ArrowRight className="size-4" aria-hidden="true" /></Button>
        </div> : <div className="card-lux rounded-lg p-6 sm:p-8">
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
              <div className="space-y-4">
                <div>
                  <label htmlFor="name-kanji" className="mb-2 block font-serif text-sm font-semibold text-primary">{pt.nameKanji} <span className="text-xs font-normal text-primary/70">{pt.optional}</span></label>
                  <input id="name-kanji" maxLength={40} placeholder="例：山田 太郎（※姓と名の間にスペース）" value={profile.nameKanji} onChange={(e) => set("nameKanji", formatPersonalName(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="name-kana" className="mb-2 block font-serif text-sm font-semibold text-primary">{pt.nameKana} <span className="text-xs font-normal text-primary/70">{pt.optional}</span></label>
                  <input id="name-kana" maxLength={60} placeholder="例：やまだ たろう（※姓と名の間にスペース）" value={profile.nameKana} onChange={(e) => set("nameKana", formatPersonalName(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="name-romaji" className="mb-2 block font-serif text-sm font-semibold text-primary">{pt.nameRomaji} <span className="text-xs font-normal text-primary/70">{t.required}</span></label>
                  <input id="name-romaji" maxLength={60} placeholder="例：YAMADA TARO（※姓と名の間にスペース）" value={profile.nameRomaji} onChange={(e) => set("nameRomaji", formatPersonalName(e.target.value, true))} className={inputClass} />
                  <p className="mt-1 text-xs text-muted-foreground">{pt.romajiHint}</p>
                </div>
              </div>
              <div>
                <label htmlFor="gender" className="mb-2 block font-serif text-sm font-semibold text-primary">{storage.gender}</label>
                <select id="gender" value={profile.gender} onChange={(e) => set("gender", e.target.value as UserProfile["gender"])} className={inputClass}>
                  <option value="undisclosed">{storage.undisclosed}</option><option value="female">{storage.female}</option><option value="male">{storage.male}</option><option value="other">{storage.other}</option>
                </select>
              </div>
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
              <label htmlFor="birth-city" className="mb-2 mt-5 block font-serif text-sm font-semibold text-primary">{pt.city} <span className="text-xs font-normal text-primary/70">{pt.optional}</span></label>
              <input id="birth-city" maxLength={80} placeholder="横浜市 保土ケ谷区 和田町" value={profile.birthCity} onChange={(e) => set("birthCity", e.target.value)} className={inputClass} />
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
             {!signedIn && <p className="text-xs text-muted-foreground">{storage.signInRequired}</p>}
             {saveError && <p role="alert" className="text-xs text-destructive">{storage.saveError}</p>}
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
              {analyzing ? (signedIn ? storage.saving : t.analyzing) : isLast ? (
                 <><Sparkles className="size-4" aria-hidden="true" />{t.analyze}</>
              ) : (
                 t.next
              )}
            </Button>
          </div>
        </div>}

        <p className="mt-6 text-center text-xs text-muted-foreground">
           {t.privacy}
        </p>
      </div>
      {analyzing && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/95 backdrop-blur-lg"><AgolmenLoading compact label={signedIn ? storage.saving : t.analyzing} /></div>}
    </div>
  );
}
