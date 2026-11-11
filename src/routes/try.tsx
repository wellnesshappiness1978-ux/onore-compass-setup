import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Check, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { billingPlans } from '@/lib/billing-plans';
import { getPlanConsultationLimit, PLAN_COMPATIBILITY_LIMITS } from '@/lib/plan-usage';
import type { Plan } from '@/lib/design-modes';

const title = 'プランお試し体験 | アゴルメンの羅針盤';
const description = '無料・スタンダード・VIP・ファミリーの各プランで見える画面と機能の違いを、サンプルで体験できます。';

export const Route = createFileRoute('/try')({
  head: () => ({ meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: TryItOut,
});

type TrialPlan = Extract<Plan, 'free' | 'standard' | 'vip' | 'b2b'>;
export const TRIAL_PLANS: { id: TrialPlan; name: string; catch: string; features: string[]; sample: { heading: string; body: string }[] }[] = [
  { id: 'free', name: '無料', catch: 'まずは自分の核を知る', features: ['あなたの特性（多層診断の概要）', 'バースカラー1色', '今日の運勢の基本カード', '開運フード1品'], sample: [{ heading: '今日のひとこと', body: '強みは落ち着いた判断力。午前中に大切な連絡を済ませると流れに乗れます。' }] },
  { id: 'standard', name: 'スタンダード', catch: '毎日の指針を細やかに', features: ['無料の全機能', 'バースカラー7色と曼陀羅アート', '開運フード3品と星音のBGM', '詳しい今日の運勢カード'], sample: [{ heading: '今日のひとこと', body: '強みは落ち着いた判断力。午前中に大切な連絡を済ませると流れに乗れます。' }, { heading: '今日の開運アクション', body: '机の上を一か所だけ整え、使う色はラッキーカラーの若草色を一点取り入れます。' }] },
  { id: 'vip', name: 'VIP', catch: '深い相性と宇宙のアート', features: ['スタンダードの全機能', '相性の詳細レポート', 'コズミック・ジェネシス（誕生の星空アート）', '夜のリセット鑑定'], sample: [{ heading: '今日のひとこと', body: '強みは落ち着いた判断力。午前中に大切な連絡を済ませると流れに乗れます。' }, { heading: '相性の詳細', body: '相手は行動の速さが強み。あなたが方向を決め、相手が動く役割分担で関係が安定します。' }, { heading: '夜のリセット', body: '今日うまくいったことを一つ書き出し、明日の最初の一歩を決めてから休みます。' }] },
  { id: 'b2b', name: 'ファミリー', catch: '大切な人と一緒に読む', features: ['VIPの全機能', 'ファミリー名簿とグループ診断', '相性マップと共同の方位・日取り', 'グループの運気アップフラワー'], sample: [{ heading: 'グループの強み', body: '互いの違いを補い合える組み合わせです。週に一度、それぞれの希望を一言ずつ共有すると調和が深まります。' }, { heading: '共同の吉日', body: '今月は第2週の週末が、家族で新しいことを始めるのに向いた日取りです。' }] },
];

function TryItOut() {
  const [active, setActive] = useState<TrialPlan>('free');
  const plan = TRIAL_PLANS.find(p => p.id === active)!;
  const price = billingPlans.find(p => p.plan === active);
  const consult = getPlanConsultationLimit(active);
  return <main className="min-h-screen bg-background px-4 py-10 text-foreground">
    <div className="mx-auto max-w-3xl">
      <Link to="/" className="text-sm text-primary">← 公式サイトへ戻る</Link>
      <p className="mt-6 text-xs tracking-[0.3em] text-primary">TRY IT OUT</p>
      <h1 className="mt-2 font-serif text-3xl text-primary sm:text-4xl">プランお試し体験</h1>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">各プランで見える画面をサンプルで体験できます。ここに表示される内容は架空の例で、実際の機能や会員資格は変わりません。</p>
      <div role="tablist" aria-label="プラン" className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TRIAL_PLANS.map(p => <Button key={p.id} role="tab" aria-selected={p.id === active} variant={p.id === active ? 'default' : 'outline'} className={`min-h-11 font-bold ${p.id === active ? 'bg-primary text-primary-foreground opacity-100 hover:bg-primary' : ''}`} onClick={() => setActive(p.id)}>{p.name}</Button>)}
      </div>
      <section role="tabpanel" aria-label={plan.name} className="mt-6 rounded-xl border border-primary/30 bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-2xl text-primary">{plan.name}</h2>
          <p className="text-sm text-muted-foreground">{price ? `月額 ¥${price.monthly.amount.toLocaleString()}／年額 ¥${price.yearly.amount.toLocaleString()}` : '¥0'}</p>
        </div>
        <p className="mt-1 text-sm text-foreground/80">{plan.catch}</p>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">{plan.features.map(f => <li key={f} className="flex gap-2 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />{f}</li>)}</ul>
        <p className="mt-4 text-sm">AI相談：1日{Number.isFinite(consult) ? `${consult}回` : '無制限'}／相性診断：1日{PLAN_COMPATIBILITY_LIMITS[active]}回</p>
        <h3 className="mt-6 flex items-center gap-2 font-serif text-lg text-primary"><Sparkles className="size-4" aria-hidden="true" />サンプル画面</h3>
        <div className="mt-3 space-y-3">{plan.sample.map(s => <article key={s.heading} className="rounded-lg border border-primary/25 bg-primary/5 p-4"><p className="text-xs text-primary">{s.heading}<span className="ml-2 text-muted-foreground">（サンプル）</span></p><p className="mt-2 text-sm leading-7">{s.body}</p></article>)}</div>
        {active !== 'b2b' && <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Lock className="size-3.5" aria-hidden="true" />上位プランではさらに多くのカードが開きます。</p>}
      </section>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild className="min-h-12 flex-1"><Link to="/app">無料でアプリを始める</Link></Button>
        <Button asChild variant="outline" className="min-h-12 flex-1"><Link to="/purchase">プランの詳細と購入</Link></Button>
      </div>
    </div>
  </main>;
}
