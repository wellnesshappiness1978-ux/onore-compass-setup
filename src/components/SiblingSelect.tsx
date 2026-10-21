import { useState } from "react";
import { Input } from "@/components/ui/input";
import { SIBLING_COUNTS, SIBLING_ORDERS, SIBLING_VALUES, buildSiblingComposition, parseSiblingComposition, siblingLabels } from "@/lib/sibling-order";
import type { Language } from "@/lib/translations";

const LEGACY = ["first", "middle", "last", "only"];
const selectClass = "min-h-10 rounded-md border border-input bg-background px-3 text-sm";

/** Sibling-composition picker: count + birth order + older/younger brothers and sisters, stored as one stable Japanese string. Legacy values and free text remain selectable via the simple mode. */
export default function SiblingSelect({ value, onChange, language, id, className = "", maxLength = 80 }: { value: string; onChange: (v: string) => void; language: Language; id?: string; className?: string; maxLength?: number }) {
  const l = siblingLabels[language];
  const comp = parseSiblingComposition(value);
  const known = (SIBLING_VALUES as readonly string[]).includes(value);
  const legacy = LEGACY.indexOf(value);
  const [mode, setMode] = useState<"detail" | "simple">(comp || value === "" ? "detail" : "simple");
  const [other, setOther] = useState(!known && legacy < 0 && !comp && value !== "");
  const sel = known || legacy >= 0 ? value : other ? "__other" : "";

  if (mode === "detail") {
    const c = comp ?? { count: "", order: "", up: [] as string[], down: [] as string[] };
    const only = c.count === "ひとりっ子";
    const emit = (next: Partial<typeof c>) => onChange(buildSiblingComposition({ ...c, ...next }));
    const toggle = (key: "up" | "down", side: string) => { const list = c[key]; emit({ [key]: list.includes(side) ? list.filter((s) => s !== side) : [...list, side] }); };
    const chip = (key: "up" | "down", side: string, label: string) => { const on = c[key].includes(side); return <button key={key + side} type="button" aria-pressed={on} onClick={() => toggle(key, side)} className={`rounded-full border px-3 py-1 text-xs ${on ? "border-primary bg-primary/20 text-primary" : "border-primary/20 text-muted-foreground"}`}>{label}</button>; };
    return <div className="grid gap-2">
      <select id={id} aria-label={l.count} value={c.count} onChange={(e) => emit({ count: e.target.value, ...(e.target.value === "ひとりっ子" ? { up: [], down: [] } : {}) })} className={className || selectClass}>
        <option value="">{l.count}</option>
        {SIBLING_COUNTS.map((v, i) => <option key={v} value={v}>{l.counts[i]}</option>)}
      </select>
      {!only && <select aria-label={l.order} value={c.order === "一人っ子" ? "" : c.order} onChange={(e) => emit({ order: e.target.value })} className={className || selectClass}>
        <option value="">{l.order}</option>
        {SIBLING_ORDERS.filter((o) => o !== "一人っ子").map((v) => <option key={v} value={v}>{l.orders[(SIBLING_ORDERS as readonly string[]).indexOf(v)]}</option>)}
      </select>}
      {!only && <div className="flex flex-wrap items-center gap-1.5"><span className="text-xs text-muted-foreground">{l.up}</span>{chip("up", "兄", l.sides[0]!)}{chip("up", "姉", l.sides[1]!)}</div>}
      {!only && <div className="flex flex-wrap items-center gap-1.5"><span className="text-xs text-muted-foreground">{l.down}</span>{chip("down", "弟", l.sides[2]!)}{chip("down", "妹", l.sides[3]!)}</div>}
      <button type="button" onClick={() => setMode("simple")} className="justify-self-start text-xs text-primary underline underline-offset-2">{l.simple}</button>
    </div>;
  }

  return <div className="grid gap-2">
    <select id={id} aria-label={l.title} value={sel} onChange={(e) => { const v = e.target.value; if (v === "__other") { setOther(true); onChange(""); } else { setOther(false); onChange(v); } }} className={className || selectClass}>
      <option value="">{l.title}</option>
      {SIBLING_VALUES.map((v, i) => <option key={v} value={v}>{l.options[i]}</option>)}
      {legacy >= 0 && <option value={value}>{l.legacy[legacy]}</option>}
      <option value="__other">{l.other}</option>
    </select>
    {sel === "__other" && <Input aria-label={l.otherHint} placeholder={l.otherHint} value={value} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />}
    <button type="button" onClick={() => { setOther(false); setMode("detail"); if (!comp) onChange(""); }} className="justify-self-start text-xs text-primary underline underline-offset-2">{l.detail}</button>
  </div>;
}
