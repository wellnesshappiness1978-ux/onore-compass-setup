import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ChefHat, Loader2, RefreshCw, Sparkles, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { generateTodayFortune } from "@/lib/ai/today-fortune.functions";
import { avoidFromHistory, cacheKey, pushHistory, readHistory, todayFortuneSchema, type TodayFortune, type TodayFortuneRequest } from "@/lib/today-fortune";
import type { Language } from "@/lib/translations";
import type { Plan } from '@/lib/design-modes';
import { luckyFoodLimit } from '@/lib/plans';
import { todayAccessCopy } from '@/lib/today-access-copy';

type Base = Omit<TodayFortuneRequest, "avoid">;
const pendingFortunes = new Map<string, Promise<TodayFortune>>();
export type FortuneState = { data: TodayFortune | null; loading: boolean; error: string | null; retry: () => void };

/** One AI reading per subject/day/language/goal, cached on the device; recent picks are sent as avoid lists. */
export function useTodayFortune(req: Base | null): FortuneState {
  const run = useServerFn(generateTodayFortune);
  const [state, setState] = useState<{ data: TodayFortune | null; loading: boolean; error: string | null; sig?: string }>({ data: null, loading: false, error: null });
  const [nonce, setNonce] = useState(0);
  const sig = req ? JSON.stringify(req) : "";
  useEffect(() => {
    if (!req) { setState({ data: null, loading: false, error: null }); return; }
    const key = cacheKey(req);
    try {
      const cached = todayFortuneSchema.safeParse(JSON.parse(localStorage.getItem(key) ?? "null"));
      if (cached.success && nonce === 0) { setState({ data: cached.data, loading: false, error: null, sig }); return; }
    } catch { /* ignore */ }
    let active = true;
    setState({ data: null, loading: true, error: null, sig });
    let request = pendingFortunes.get(key);
    if (!request) {
      request = run({ data: { ...req, avoid: avoidFromHistory(readHistory(), req.subject.key, req.day) } }).then(data => {
        try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* full */ }
        pushHistory(req.subject.key, req.day, data);
        return data;
      });
      pendingFortunes.set(key, request);
      void request.then(() => pendingFortunes.delete(key), () => pendingFortunes.delete(key));
    }
    request
      .then(data => {
        if (!active) return;
        setState({ data, loading: false, error: null, sig });
      })
      .catch((e: unknown) => { if (active) setState({ data: null, loading: false, error: e instanceof Error ? e.message : String(e), sig }); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, nonce]);
  return { ...(state.sig === sig ? state : { data: null, loading: Boolean(req), error: null }), retry: () => setNonce(n => n + 1) };
}

const t = (language: Language) => todayAccessCopy[language];

function Status({ state, language }: { state: FortuneState; language: Language }) {
  const c = t(language);
  if (state.loading) return <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />{c.loading}</p>;
  if (state.error) return <div className="space-y-2 text-sm"><p className="text-destructive">{state.error}</p><Button size="sm" variant="outline" onClick={state.retry}><RefreshCw className="size-3.5" />{c.retry}</Button></div>;
  return null;
}

export function TodayInsight({ state, language }: { state: FortuneState; language: Language }) {
  const c = t(language), f = state.data;
  if (!f) return <Status state={state} language={language} />;
  return <div className="space-y-3 text-sm leading-7">
    <p className="flex items-start gap-2 font-serif text-base text-primary"><Sparkles className="mt-1 size-4 shrink-0" />{f.headline}</p>
    <p className="whitespace-pre-line">{f.insight}</p>
    <p className="whitespace-pre-line border-l-2 border-primary/50 pl-3">{f.dynamics}</p>
    <div><h4 className="font-serif text-primary">{c.actions}</h4><ul className="mt-1 list-disc space-y-1 pl-5">{f.actions.map(a => <li key={a}>{a}</li>)}</ul></div>
    <p className="rounded-md border border-primary/25 bg-card/50 p-3"><strong className="text-primary">{c.caution}</strong>：{f.caution}</p>
  </div>;
}

export function TodayLuckyTrio({ state, language, fallback, plan, onUpgrade }: { state: FortuneState; language: Language; fallback: React.ReactNode; plan: Plan; onUpgrade: () => void }) {
  const c = t(language), f = state.data;
  if (!f) return <div className="space-y-3"><Status state={state} language={language} />{fallback}</div>;
  return <div className="space-y-4 text-sm leading-6">
    <div className="flex items-start gap-2"><span className="mt-1 size-5 shrink-0 rounded-full border border-primary/40" style={{ background: f.luckyColor.hex }} /><div><strong className="text-primary">{c.color}</strong>：{f.luckyColor.name}（{f.luckyColor.hex}）<p className="text-xs opacity-90">{f.luckyColor.reason}</p></div></div>
    <div><strong className="text-primary">{c.word}</strong>：「{f.luckyWord.word}」<p className="text-xs opacity-90">{f.luckyWord.message}</p></div>
    <div>
      <p className="flex items-center gap-1.5 font-serif text-primary"><ChefHat className="size-4" />{c.allFoods}</p>
      <p className="mt-2 text-xs leading-6">{c.rules}</p>
      <Accordion type="multiple" className="mt-2 rounded-md border border-primary/25 bg-background/90 px-3 text-foreground">
        {f.foods.map((food, i) => i >= luckyFoodLimit[plan] ? <div key={i} className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/20 py-3"><span className="flex items-center gap-2"><LockKeyhole className="size-4 text-primary" />{i + 1}. {c.food} · {i < 3 ? 'Standard+' : 'VIP+'}</span><Button size="sm" variant="outline" onClick={onUpgrade}>{c.plans}</Button></div> : <AccordionItem key={food.name + i} value={String(i)}>
          <AccordionTrigger className="text-left">{i + 1}. {food.name}<span className="ml-2 text-xs font-normal text-muted-foreground">{food.servings}</span></AccordionTrigger>
          <AccordionContent className="space-y-3 text-sm leading-7">
            <p><strong className="text-primary">{c.why}</strong>：{food.why}</p>
            <section><h5 className="font-serif text-primary">{c.ingredients}（{food.servings}）</h5><ul>{food.ingredients.map((x, j) => <li key={j} className="flex justify-between gap-3 border-b border-primary/10 py-0.5"><span>{x.item}</span><span className="shrink-0">{x.amount}</span></li>)}</ul></section>
            <section><h5 className="font-serif text-primary">{c.seasonings}</h5><ul>{food.seasonings.map((x, j) => <li key={j} className="flex justify-between gap-3 border-b border-primary/10 py-0.5"><span>{x.item}</span><span className="shrink-0">{x.amount}</span></li>)}</ul></section>
            <section><h5 className="font-serif text-primary">{c.steps}</h5><ol className="list-decimal space-y-2 pl-5">{food.steps.map((s, j) => <li key={j}>{s.text}{s.tip && <p className="text-xs text-primary">✦ {c.tip}：{s.tip}</p>}</li>)}</ol></section>
          </AccordionContent>
        </AccordionItem>)}
      </Accordion>
    </div>
  </div>;
}
