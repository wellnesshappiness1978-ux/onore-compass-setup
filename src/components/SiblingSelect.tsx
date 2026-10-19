import { useState } from "react";
import { Input } from "@/components/ui/input";
import { SIBLING_VALUES, siblingLabels } from "@/lib/sibling-order";
import type { Language } from "@/lib/translations";

const LEGACY = ["first", "middle", "last", "only"];

/** Sibling-order dropdown with an "other" free-text field; stores stable values. */
export default function SiblingSelect({ value, onChange, language, id, className = "", maxLength = 20 }: { value: string; onChange: (v: string) => void; language: Language; id?: string; className?: string; maxLength?: number }) {
  const l = siblingLabels[language];
  const known = (SIBLING_VALUES as readonly string[]).includes(value);
  const legacy = LEGACY.indexOf(value);
  const [other, setOther] = useState(!known && legacy < 0 && value !== "");
  const sel = known || legacy >= 0 ? value : other ? "__other" : "";
  return <div className="grid gap-2">
    <select id={id} aria-label={l.title} value={sel} onChange={e => { const v = e.target.value; if (v === "__other") { setOther(true); onChange(""); } else { setOther(false); onChange(v); } }} className={className || "min-h-10 rounded-md border border-input bg-background px-3 text-sm"}>
      <option value="">{l.title}</option>
      {SIBLING_VALUES.map((v, i) => <option key={v} value={v}>{l.options[i]}</option>)}
      {legacy >= 0 && <option value={value}>{l.legacy[legacy]}</option>}
      <option value="__other">{l.other}</option>
    </select>
    {sel === "__other" && <Input aria-label={l.otherHint} placeholder={l.otherHint} value={value} maxLength={maxLength} onChange={e => onChange(e.target.value)} />}
  </div>;
}
