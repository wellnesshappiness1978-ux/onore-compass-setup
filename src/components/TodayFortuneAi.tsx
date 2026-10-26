import ChunkedText from "@/components/ChunkedText";
import { useEffect, useState } from "react";
import { ChefHat, Loader2, RefreshCw, Sparkles, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { avoidFromHistory, cacheKey, pushHistory, readHistory, todayFortuneSchema, type TodayFortune, type TodayFortuneRequest } from "@/lib/today-fortune";
import type { Language } from "@/lib/translations";
import type { Plan } from '@/lib/design-modes';
import { luckyFoodLimit } from '@/lib/plans';
import { todayAccessCopy } from '@/lib/today-access-copy';
import { servingsLabel } from '@/lib/reading-presentation';
import { recipeImage } from '@/lib/recipe-images';
import { COURSE_ORDER, courseLabels } from '@/lib/lucky-recipes';
import { consumeReadingStream, readingCacheEpoch } from '@/lib/reading-cache';
import DailyLuckyColor from './DailyLuckyColor';
import RecipeStep, { cleanRecipeSteps } from './RecipeStep';
import { recipeLabels } from '@/lib/recipe-presentation';
import { todayBenefitCopy } from '@/lib/today-benefits';

type Base = Omit<TodayFortuneRequest, "avoid">;
const pendingFortunes = new Map<string, Promise<TodayFortune>>();
export type FortuneState = { data: TodayFortune | null; partial?: Partial<TodayFortune>; loading: boolean; error: string | null; retry: () => void };
const resolvedFortunes = new Map<string, { epoch: number; data: TodayFortune }>();
const fortuneListeners = new Map<string, Set<(value: Partial<TodayFortune>) => void>>();

/** One AI reading per subject/day/language/goal, cached on the device; recent picks are sent as avoid lists. */
export function useTodayFortune(req: Base | null): FortuneState {
  const [partial, setPartial] = useState<{ sig: string; value: Partial<TodayFortune> }>({ sig: '', value: {} });
  const [state, setState] = useState<{ data: TodayFortune | null; loading: boolean; error: string | null; sig?: string }>({ data: null, loading: false, error: null });
  const [nonce, setNonce] = useState(0);
  const sig = req ? JSON.stringify(req) : "";
  useEffect(() => {
    if (!req) { setState({ data: null, loading: false, error: null }); return; }
    const key = cacheKey(req);
    try {
      const cached = todayFortuneSchema.safeParse(JSON.parse(localStorage.getItem(key) ?? "null"));
      if (cached.success && nonce === 0) { resolvedFortunes.set(key, { epoch: readingCacheEpoch(), data: cached.data }); setState({ data: cached.data, loading: false, error: null, sig }); return; }
    } catch { /* ignore */ }
    let active = true;
    const listener = (value: Partial<TodayFortune>) => { if (active) setPartial({ sig, value }); };
    const listeners = fortuneListeners.get(key) ?? new Set<(value: Partial<TodayFortune>) => void>();
    listeners.add(listener); fortuneListeners.set(key, listeners);
    setState({ data: null, loading: true, error: null, sig });
    let request = pendingFortunes.get(key);
    if (!request) {
      const epoch = readingCacheEpoch();
      request = fetch('/api/readings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...req, kind: 'today', avoid: avoidFromHistory(readHistory(), req.subject.key, req.day) }) })
        .then(response => consumeReadingStream(response, value => { for (const notify of listeners) notify(value as Partial<TodayFortune>); }))
        .then(value => todayFortuneSchema.parse(value)).then(data => {
        if (epoch === readingCacheEpoch()) {
          resolvedFortunes.set(key, { epoch, data });
          try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* full */ }
          pushHistory(req.subject.key, req.day, data);
        }
        return data;
      });
      pendingFortunes.set(key, request);
      void request.then(() => { pendingFortunes.delete(key); fortuneListeners.delete(key); }, () => { pendingFortunes.delete(key); fortuneListeners.delete(key); });
    }
    request
      .then(data => {
        if (!active) return;
        setState({ data, loading: false, error: null, sig });
      })
      .catch((e: unknown) => { if (active) setState({ data: null, loading: false, error: e instanceof Error ? e.message : String(e), sig }); });
    return () => { active = false; listeners.delete(listener); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, nonce]);
  // Already-resolved readings render instantly on remount (tab or subject switches) without a loading frame.
  const memo = req && nonce === 0 ? resolvedFortunes.get(cacheKey(req)) : undefined;
  const instant = memo && memo.epoch === readingCacheEpoch() ? memo.data : undefined;
  return { ...(state.sig === sig ? state : instant ? { data: instant, loading: false, error: null } : { data: null, loading: Boolean(req), error: null }), partial: partial.sig === sig ? partial.value : {}, retry: () => setNonce(n => n + 1) };
}

const t = (language: Language) => todayAccessCopy[language];

function Status({ state, language }: { state: FortuneState; language: Language }) {
  const c = t(language);
  if (state.loading) return <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />{c.loading}</p>;
  if (state.error) return <div className="space-y-2 text-sm"><p className="text-destructive">{state.error}</p><Button size="sm" variant="outline" onClick={state.retry}><RefreshCw className="size-3.5" />{c.retry}</Button></div>;
  return null;
}

export function TodayInsight({ state, language }: { state: FortuneState; language: Language }) {
  const c = t(language), f = state.data ?? state.partial;
  if (!f?.headline) return <Status state={state} language={language} />;
  return <div className="space-y-3 text-sm leading-7">
    <p className="flex items-start gap-2 font-serif text-base text-primary"><Sparkles className="mt-1 size-4 shrink-0" />{f.headline}</p>
    <ChunkedText text={f.insight} />
    <ChunkedText className="border-l-2 border-primary/50 pl-3" text={f.dynamics} />
    {f.actions?.length ? <div><h4 className="font-serif text-primary">{c.actions}</h4><ul className="mt-1 list-disc space-y-1 pl-5">{f.actions.map(a => <li key={a}>{a}</li>)}</ul></div> : null}
    {f.caution && <p className="rounded-md border border-primary/25 bg-card/50 p-3"><strong className="text-primary">{c.caution}</strong>：{f.caution}</p>}
    {(state.loading || state.error) && <Status state={state} language={language} />}
  </div>;
}

export function TodayLuckyTrio({ state, language, fallback, plan, onUpgrade }: { state: FortuneState; language: Language; fallback: React.ReactNode; plan: Plan; onUpgrade: () => void }) {
  const c = t(language), f = state.data;
  if (!f) return <div className="space-y-3"><Status state={state} language={language} />{fallback}</div>;
  return <div className="lucky-readable min-w-0 space-y-4 text-base leading-7 [overflow-wrap:anywhere]">
    <DailyLuckyColor language={language} hex={f.luckyColor.hex} name={f.luckyColor.name} reason={f.luckyColor.reason} usage={f.luckyColor.usage} />
    <div className="rounded-md border border-primary/25 bg-card p-4 shadow-champagne"><strong className="text-primary">{c.word}</strong>：「{f.luckyWord.word}」<p className="mt-2 text-sm text-foreground">{f.luckyWord.message}</p></div>
    <div>
      <p className="flex items-center gap-1.5 font-serif text-primary"><ChefHat className="size-4" />{c.allFoods}</p>
      <p className="mt-2 text-xs leading-6">{c.rules}</p>
      <Accordion type="multiple" className="mt-2 min-w-0 rounded-md border border-primary/25 bg-card px-3 text-foreground">
        {f.foods.map((food, i) => i >= luckyFoodLimit[plan] ? <div key={i} className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/20 py-3"><span className="flex items-center gap-2"><LockKeyhole className="size-4 text-primary" />{courseLabels[language][COURSE_ORDER[i]!]} · {i < 3 ? 'Standard+' : 'VIP+'}</span><Button size="sm" variant="outline" onClick={onUpgrade}>{c.plans}</Button></div> : <AccordionItem key={food.name + i} value={String(i)}>
          <AccordionTrigger className="min-w-0 gap-2 text-left">{recipeImage(food.recipeId) && <img src={recipeImage(food.recipeId)} alt="" loading="lazy" width={384} height={512} className="h-20 w-16 shrink-0 rounded object-cover" />}<span className="min-w-0 flex-1 break-words"><span className="block text-xs text-primary">{courseLabels[language][COURSE_ORDER[i]!]}</span>{food.name}<span className="mt-1 block text-sm font-normal text-muted-foreground">{servingsLabel[language]}</span></span></AccordionTrigger>
          <AccordionContent className="min-w-0 space-y-3 text-[15px] leading-7 [overflow-wrap:anywhere]">
            {recipeImage(food.recipeId) && <img src={recipeImage(food.recipeId)} alt={food.name} loading="lazy" width={1024} height={640} className="w-full rounded-md border border-primary/25 object-cover shadow-champagne" />}
            <section className="rounded-md border border-primary/30 bg-primary/5 p-3"><h5 className="font-serif text-sm text-primary">{recipeLabels[language].why}</h5><ChunkedText className="mt-1 text-sm" text={food.why} /></section>
            <section className="recipe-ingredients"><h5 className="text-center font-serif text-primary">{c.ingredients}（{servingsLabel[language]}）</h5><ul>{food.ingredients.map((x, j) => <li key={j} className="grid min-w-0 grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-3 border-b border-primary/10 py-2"><span>{x.item}</span><span className="text-right">{x.amount}</span></li>)}</ul></section>
            <section className="recipe-ingredients"><h5 className="text-center font-serif text-primary">{c.seasonings}</h5><ul>{food.seasonings.map((x, j) => <li key={j} className="grid min-w-0 grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-3 border-b border-primary/10 py-2"><span>{x.item}</span><span className="text-right">{x.amount}</span></li>)}</ul></section>
            <section><h5 className="font-serif text-primary">{c.steps}</h5><ol className="list-decimal space-y-2 pl-5">{cleanRecipeSteps(food.steps.map(s => s.text)).map((s, j) => <li key={j}><RecipeStep text={s} /></li>)}</ol></section>
            {food.steps.some(s => s.tip.trim()) && <section className="rounded-md border border-primary/35 bg-card p-3 shadow-champagne"><h5 className="flex items-center gap-1.5 font-serif text-primary"><Sparkles className="size-4" />{recipeLabels[language].luck}</h5><p className="mt-2 text-sm leading-7">{food.steps.find(s => s.tip.trim())?.tip}</p></section>}
            <p className="border-t border-primary/15 pt-2 text-xs leading-5 text-muted-foreground">{servingsLabel[language]} · {todayBenefitCopy[language].recipeNote}</p>
          </AccordionContent>
        </AccordionItem>)}
      </Accordion>
    </div>
  </div>;
}
