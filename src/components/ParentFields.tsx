import { useState } from "react";
import { Button } from "./ui/button";
import BirthplaceFields from "./BirthplaceFields";
import { Users } from "lucide-react";
import { profileUiCopy } from "@/lib/profile-ui-copy";
import type { Language } from "@/lib/translations";

export type ParentBirth = { birthDate: string; birthPlace: string; birthCity: string };
export const emptyParent: ParentBirth = { birthDate: "", birthPlace: "", birthCity: "" };
/** A parent entry counts only when a valid birth date is present. */
export const validParent = (p: ParentBirth | null | undefined): ParentBirth | null =>
  p && /^\d{4}-\d{2}-\d{2}$/.test(p.birthDate) ? { birthDate: p.birthDate, birthPlace: p.birthPlace, birthCity: p.birthCity } : null;

/** Optional father/mother birth date + linked birthplace, refining the birth-color palette. */
export default function ParentFields({ language, father, mother, onChange, className }: {
  language: Language;
  father: ParentBirth | null;
  mother: ParentBirth | null;
  onChange: (father: ParentBirth | null, mother: ParentBirth | null) => void;
  className?: string;
}) {
  const copy = profileUiCopy[language].parents;
  const [open, setOpen] = useState(Boolean(father?.birthDate || mother?.birthDate));
  const field = className || "min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground";
  const section = (label: string, value: ParentBirth | null, setValue: (v: ParentBirth | null) => void) => (
    <fieldset className="grid min-w-0 gap-3 rounded-xl border border-primary/15 bg-background/30 p-3">
      <legend className="px-1 text-xs font-semibold text-primary">{label}</legend>
      <div>
        <label className="mb-1 block text-xs text-muted-foreground" htmlFor={`${label}-birth`}>{copy.birthDate}</label>
        <input id={`${label}-birth`} type="date" max="2026-12-31" className={field} value={value?.birthDate ?? ""}
          onChange={(e) => setValue(e.target.value ? { ...(value ?? emptyParent), birthDate: e.target.value } : null)} />
      </div>
      {value?.birthDate && (
        <BirthplaceFields language={language} birthPlace={value.birthPlace} birthCity={value.birthCity}
          onChange={(birthPlace, birthCity) => setValue({ ...value, birthPlace, birthCity })} className={field} />
      )}
    </fieldset>
  );
  return (
    <div className="sm:col-span-2">
      <Button type="button" variant="link" size="sm" className="justify-self-start" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <Users className="size-3.5" />{copy.toggle}
      </Button>
      {open && (
        <div className="mt-2 grid gap-4">
          <p className="text-xs font-semibold text-primary">{copy.title}</p>
          <p className="text-[11px] leading-5 text-muted-foreground">{copy.hint}</p>
          {section(copy.father, father, (v) => onChange(v, mother))}
          {section(copy.mother, mother, (v) => onChange(father, v))}
        </div>
      )}
    </div>
  );
}
