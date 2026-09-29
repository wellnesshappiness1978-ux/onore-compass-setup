import { useState } from "react";
import { Check, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inputClass, PREFECTURES, type UserProfile } from "./Onboarding";
import { prefecturesRomanized, type Language } from "@/lib/translations";
import { profileTranslations } from "@/lib/profile-translations";
import { profileStorageCopy } from "@/lib/profile-storage-copy";

const ROMAJI = /^[A-Za-z][A-Za-z\s'-]*$/;

export function computeGokaku(p: UserProfile) {
  const src = (p.nameKanji || p.nameRomaji || "").replace(/\s+/g, " ").trim();
  const [sur = "", given = ""] = src.split(" ");
  const w = (s: string) => [...s].reduce((a, c) => a + ((c.codePointAt(0) ?? 0) % 17) + 1, 0);
  const s = w(sur), g = w(given);
  const first = sur ? ((sur.codePointAt(0) ?? 0) % 17) + 1 : 0;
  const lastG = given ? (([...given].at(-1)?.codePointAt(0) ?? 0) % 17) + 1 : 0;
  const total = s + g;
  return [s, first + (given ? ((given.codePointAt(0) ?? 0) % 17) + 1 : 0), g, Math.max(1, total - first - lastG + 2), total];
}

export default function ProfileEditor({
  profile, language, onSave,
}: { profile: UserProfile; language: Language; onSave: (p: UserProfile) => Promise<void> }) {
  const t = profileTranslations[language];
  const storage = profileStorageCopy[language];
  const [draft, setDraft] = useState<UserProfile>(profile);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof UserProfile>(k: K, v: UserProfile[K]) => {
    setSaved(false);
    setDraft((d) => ({ ...d, [k]: v }));
  };
  const label = "mb-1.5 block text-xs font-semibold text-primary";

  const save = async () => {
    if (!draft.birthDate) return setError(t.dateError);
    if (draft.nameRomaji.trim() && !ROMAJI.test(draft.nameRomaji.trim())) return setError(t.romajiError);
    setError(null);
    setSaving(true);
    try {
      await onSave({ ...draft, nameKanji: draft.nameKanji.trim().slice(0, 40), nameKana: draft.nameKana.trim().slice(0, 60), nameRomaji: draft.nameRomaji.trim().toUpperCase().slice(0, 60), birthCity: draft.birthCity.trim().slice(0, 80) });
      setSaved(true);
    } catch { setError(storage.saveError); }
    finally { setSaving(false); }
  };

  return (
    <details className="card-lux group mb-6 rounded-2xl p-5 text-left">
      <summary className="flex cursor-pointer list-none items-center gap-3">
        <UserRound className="size-5 text-primary" strokeWidth={1.4} />
        <span className="font-serif text-base text-gradient-gold">{t.cardTitle}</span>
        <span className="ml-auto truncate text-xs text-muted-foreground">{profile.nameKanji || profile.nameRomaji}</span>
      </summary>
      <p className="mt-3 text-xs text-muted-foreground">{t.cardHint}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div><label className={label} htmlFor="pe-kanji">{t.nameKanji}</label>
          <input id="pe-kanji" className={inputClass} maxLength={40} placeholder="仁井田 大慈" value={draft.nameKanji} onChange={(e) => set("nameKanji", e.target.value)} /></div>
        <div><label className={label} htmlFor="pe-kana">{t.nameKana}</label>
          <input id="pe-kana" className={inputClass} maxLength={60} placeholder="にいだ だいじ" value={draft.nameKana} onChange={(e) => set("nameKana", e.target.value)} /></div>
        <div className="sm:col-span-2"><label className={label} htmlFor="pe-romaji">{t.nameRomaji}</label>
          <input id="pe-romaji" className={`${inputClass} uppercase`} maxLength={60} placeholder="NIIDA DAIJI" value={draft.nameRomaji} onChange={(e) => set("nameRomaji", e.target.value)} />
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
        <div><label className={label} htmlFor="pe-pref">{t.prefecture}</label>
          <select id="pe-pref" className={inputClass} value={draft.birthPlace} onChange={(e) => set("birthPlace", e.target.value)}>
            <option value="">—</option>
            {PREFECTURES.map((p, i) => <option key={p} value={p}>{["en", "es", "fr"].includes(language) ? prefecturesRomanized[i] : p}</option>)}
          </select></div>
        <div><label className={label} htmlFor="pe-city">{t.city}</label>
          <input id="pe-city" className={inputClass} maxLength={80} placeholder="横浜市 保土ケ谷区 和田町" value={draft.birthCity} onChange={(e) => set("birthCity", e.target.value)} /></div>
      </div>
      {error && <p role="alert" className="mt-3 text-xs text-destructive">{error}</p>}
      {saved && <p role="status" className="mt-3 flex items-center gap-1 text-xs text-primary"><Check className="size-3.5" />{t.saved}</p>}
       <Button type="button" variant="champagne" onClick={save} disabled={saving} className="mt-4 h-12 w-full rounded-lg font-bold">{saving ? storage.saving : t.save}</Button>
    </details>
  );
}

export function NameAnalysisPreview({ profile, language }: { profile: UserProfile; language: Language }) {
  const t = profileTranslations[language];
  const values = computeGokaku(profile);
  const hasName = Boolean(profile.nameKanji || profile.nameRomaji);
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
            <p className="font-serif text-lg text-primary">{hasName ? values[i] : "—"}</p>
          </div>
        ))}
      </div>
      {hasName && (profile.nameKana || profile.nameRomaji) && (
        <p className="mt-3 text-xs text-muted-foreground">{t.kotodama}: {[profile.nameKana, profile.nameRomaji].filter(Boolean).join(" / ")}</p>
      )}
      <p className="mt-2 text-[11px] text-muted-foreground">{t.gokakuNote}</p>
    </section>
  );
}
