import { useState } from "react";
import { SacredDisclosure } from "./ui/sacred-disclosure";
import { Check, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import BirthplaceFields from "./BirthplaceFields";
import SiblingSelect from "./SiblingSelect";
import { siblingLabels } from "@/lib/sibling-order";
import { inputClass, type UserProfile } from "./Onboarding";
import { type Language } from "@/lib/translations";
import { profileTranslations } from "@/lib/profile-translations";
import { profileStorageCopy } from "@/lib/profile-storage-copy";
import { getFiveElements } from "@/lib/ai/five-elements";
import { finalizePersonalName, formatPersonalName } from "@/lib/name-format";
import { profileUiCopy } from "@/lib/profile-ui-copy";

const ROMAJI = /^[A-Za-z][A-Za-z\s'-]*$/;

export function computeGokaku(p: UserProfile) {
  const name = getFiveElements(p).name;
  return name ? [name.sky, name.person, name.earth, name.outer, name.total] : null;
}

export default function ProfileEditor({
  profile, language, onSave,
}: { profile: UserProfile; language: Language; onSave: (p: UserProfile) => Promise<void> }) {
  const t = profileTranslations[language];
  const storage = profileStorageCopy[language];
  const ui = profileUiCopy[language];
  const [draft, setDraft] = useState<UserProfile>(profile);
  const [error, setError] = useState<"required" | "kana" | "romaji" | "save" | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof UserProfile>(k: K, v: UserProfile[K]) => {
    setSaved(false);
    setDraft((d) => ({ ...d, [k]: v }));
  };
  const label = "mb-1.5 block text-xs font-semibold text-primary";

  const save = async () => {
    if (!draft.nameKanji.trim() || !draft.nameKana.trim() || !draft.nameRomaji.trim() || !draft.birthDate) return setError("required");
    if (!/^[\u3041-\u309F\u30FC\s]+$/.test(draft.nameKana.trim())) return setError("kana");
    if (!ROMAJI.test(draft.nameRomaji.trim())) return setError("romaji");
    setError(null);
    setSaving(true);
    try {
      await onSave({ ...draft, nameKanji: finalizePersonalName(draft.nameKanji).slice(0, 40), nameKana: finalizePersonalName(draft.nameKana).slice(0, 60), nameRomaji: finalizePersonalName(draft.nameRomaji, true).slice(0, 60), birthCity: draft.birthCity.trim().slice(0, 80) });
      setSaved(true);
    } catch { setError("save"); }
    finally { setSaving(false); }
  };

  return (
    <SacredDisclosure className="mb-6 text-left" title={<span className="flex min-w-0 flex-1 items-center gap-3">
        <UserRound className="size-5 text-primary" strokeWidth={1.4} />
        <span className="font-serif text-base text-gradient-gold">{t.cardTitle}</span>
        <span className="ml-auto truncate text-xs text-muted-foreground">{profile.nameKanji || profile.nameRomaji}</span>
      </span>}>
      <p className="mt-3 text-xs text-muted-foreground">{t.cardHint}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div><label className={label} htmlFor="pe-kanji">{t.nameKanji}</label>
          <input id="pe-kanji" className={inputClass} maxLength={40} placeholder={ui.placeholders.nameKanji} value={draft.nameKanji} onChange={(e) => set("nameKanji", formatPersonalName(e.target.value))} /></div>
        <div><label className={label} htmlFor="pe-kana">{t.nameKana}</label>
          <input id="pe-kana" className={inputClass} maxLength={60} placeholder={ui.placeholders.nameKana} value={draft.nameKana} onChange={(e) => set("nameKana", formatPersonalName(e.target.value))} /></div>
        <div className="sm:col-span-2"><label className={label} htmlFor="pe-romaji">{t.nameRomaji}</label>
          <input id="pe-romaji" className={`${inputClass} uppercase`} maxLength={60} placeholder={ui.placeholders.nameRomaji} value={draft.nameRomaji} onChange={(e) => set("nameRomaji", formatPersonalName(e.target.value, true))} />
          <p className="mt-1 text-[11px] text-muted-foreground">{t.romajiHint}</p></div>
        <div><label className={label} htmlFor="pe-gender">{storage.gender}</label>
          <select id="pe-gender" className={inputClass} value={draft.gender} onChange={(e) => set("gender", e.target.value as UserProfile["gender"])}><option value="undisclosed">{storage.undisclosed}</option><option value="female">{storage.female}</option><option value="male">{storage.male}</option><option value="other">{storage.other}</option></select></div>
        <div><label className={label} htmlFor="pe-date">{t.birthDate}</label>
          <input id="pe-date" type="date" max="2026-12-31" className={inputClass} value={draft.birthDate} onChange={(e) => set("birthDate", e.target.value)} /></div>
        <div><label className={label} htmlFor="pe-time">{t.birthTime}</label>
          <input id="pe-time" type="time" disabled={draft.birthTimeUnknown} className={inputClass} value={draft.birthTime} onChange={(e) => set("birthTime", e.target.value)} />
          <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={draft.birthTimeUnknown} onChange={(e) => { set("birthTimeUnknown", e.target.checked); if (e.target.checked) set("birthTime", ""); }} className="accent-[var(--primary)]" />
            {t.timeUnknown}</label></div>
        <BirthplaceFields language={language} birthPlace={draft.birthPlace} birthCity={draft.birthCity} onChange={(birthPlace, birthCity) => { setSaved(false); setDraft(p => ({ ...p, birthPlace, birthCity })); }} className={inputClass} />
        <div><label className={label} htmlFor="pe-sibling">{siblingLabels[language].title}</label>
          <SiblingSelect id="pe-sibling" language={language} value={draft.siblingOrder} onChange={(v) => set("siblingOrder", v)} className={inputClass} /></div>
      </div>
      {error && <p role="alert" className="mt-3 text-xs text-destructive">{error === "required" ? ui.requiredFieldsError : error === "kana" ? ui.kanaError : error === "romaji" ? t.romajiError : storage.saveError}</p>}
      {saved && <p role="status" className="mt-3 flex items-center gap-1 text-xs text-primary"><Check className="size-3.5" />{t.saved}</p>}
       <Button type="button" variant="champagne" onClick={save} disabled={saving} className="mt-4 h-12 w-full rounded-lg font-bold">{saving ? storage.saving : t.save}</Button>
    </SacredDisclosure>
  );
}

export function NameAnalysisPreview({ profile, language }: { profile: UserProfile; language: Language }) {
  const t = profileTranslations[language];
  const values = computeGokaku(profile);
  const hasName = values !== null;
  return (
    <section className="card-lux mb-6 rounded-2xl p-5 text-left">
      <p className="text-xs font-semibold text-primary">{t.lensesTitle}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {t.lenses.map((l, i) => (
          <span key={l} className={`rounded-full border px-3 py-1 text-xs ${i === 0 ? "border-primary/70 bg-primary/15 text-primary" : "border-primary/20 text-foreground"}`}>{l}</span>
        ))}
      </div>
      <h3 className="mt-5 font-serif text-base text-gradient-gold">{t.gokakuTitle}</h3>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {t.gokaku.map((g, i) => (
          <div key={g} className="rounded-lg border border-primary/20 bg-background/40 p-2 text-center">
            <p className="text-[10px] text-muted-foreground">{g}</p>
            <p className="font-serif text-lg text-primary">{hasName ? values?.[i] : "—"}</p>
          </div>
        ))}
      </div>
      {hasName && (profile.nameKana || profile.nameRomaji) && (
        <p className="mt-3 text-xs text-muted-foreground">{t.kotodama}: {[profile.nameKana, profile.nameRomaji].filter(Boolean).join(" / ")}</p>
      )}
      <p className="mt-2 text-[11px] text-muted-foreground">{hasName ? t.gokakuNote : t.nameSplitNote}</p>
    </section>
  );
}
