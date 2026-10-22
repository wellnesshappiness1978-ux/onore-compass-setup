import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SIBLING_COUNTS, SIBLING_ORDERS, SIBLING_VALUES, buildSiblingComposition, changeSiblingCount, parseSiblingComposition, siblingLabels } from "@/lib/sibling-order";
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
    const chip = (key: "up" | "down", side: string, label: string) => {
      const count = c[key].filter(v => v === side).length;
      const next = changeSiblingCount(c, side, 1);
      return <div key={key + side} className="flex items-center gap-1">
        <Button type="button" variant={count ? "default" : "outline"} size="sm" aria-label={`${label} +`} disabled={next[key].length === c[key].length} onClick={() => onChange(buildSiblingComposition(next))} className="min-w-20"><span>{label}</span><span className="min-w-3 tabular-nums">{count}</span><Plus className="size-3" /></Button>
        <Button type="button" variant="ghost" size="icon" aria-label={`${label} −`} disabled={!count} onClick={() => onChange(buildSiblingComposition(changeSiblingCount(c, side, -1)))} className="size-9"><Minus className="size-3" /></Button>
      </div>;
    };
    return <div className="grid gap-2">
      <select id={id} aria-label={l.count} value={c.count} onChange={(e) => emit({ count: e.target.value, up: [], down: [], ...(e.target.value === "ひとりっ子" ? { order: "一人っ子" } : c.order === "一人っ子" ? { order: "" } : {}) })} className={className || selectClass}>
        <option value="">{l.count}</option>
        {SIBLING_COUNTS.filter(v => v !== "4人以上" || c.count === v).map((v, i) => <option key={v} value={v}>{l.counts[(SIBLING_COUNTS as readonly string[]).indexOf(v)]}</option>)}
      </select>
      {!only && <select aria-label={l.order} value={c.order === "一人っ子" ? "" : c.order} onChange={(e) => emit({ order: e.target.value })} className={className || selectClass}>
        <option value="">{l.order}</option>
        {SIBLING_ORDERS.filter((o) => o !== "一人っ子").map((v) => <option key={v} value={v}>{l.orders[(SIBLING_ORDERS as readonly string[]).indexOf(v)]}</option>)}
      </select>}
      {!only && <div className="flex flex-wrap items-center gap-1.5"><span className="text-xs text-muted-foreground">{l.up}</span>{chip("up", "兄", l.sides[0] ?? "")}{chip("up", "姉", l.sides[1] ?? "")}</div>}
      {!only && <div className="flex flex-wrap items-center gap-1.5"><span className="text-xs text-muted-foreground">{l.down}</span>{chip("down", "弟", l.sides[2] ?? "")}{chip("down", "妹", l.sides[3] ?? "")}</div>}
      <Button type="button" variant="link" size="sm" onClick={() => setMode("simple")} className="justify-self-start text-xs text-primary underline underline-offset-2">{l.simple}</Button>
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
    <Button type="button" variant="link" size="sm" onClick={() => { setOther(false); setMode("detail"); if (!comp) onChange(""); }} className="justify-self-start text-xs text-primary underline underline-offset-2">{l.detail}</Button>
  </div>;
}
