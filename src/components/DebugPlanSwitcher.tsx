import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { setMyDebugPlan } from "@/lib/membership.functions";
import { planOrder } from "@/lib/plans";
import type { Plan } from "@/lib/design-modes";

const labels: Record<Plan, string> = {
  free: "無料", standard: "有料", vip: "VIP", b2b: "ビジネス", "b2b-premium": "ビジネスプレミアム",
};

export default function DebugPlanSwitcher({ plan, onChanged }: { plan: Plan; onChanged: (plan: Plan) => void }) {
  const change = useServerFn(setMyDebugPlan);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const select = async (next: Plan) => {
    if (saving || next === plan) return;
    setSaving(true);
    setError(false);
    try {
      const saved = await change({ data: { plan: next } });
      onChanged(saved);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  return <section className="border-y border-primary/25 py-6" aria-label="開発用プラン切替">
    <h3 className="font-serif text-xl text-primary">開発用プラン切替</h3>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">管理者専用。選択したプランはこのアカウントに24時間だけ適用されます。課金は発生しません。</p>
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="テストプラン">
      {planOrder.map((option) => <Button key={option} type="button" size="sm" variant={plan === option ? "default" : "outline"} aria-pressed={plan === option} disabled={saving} onClick={() => void select(option)} className="min-h-11 whitespace-normal px-2 text-sm">{labels[option]}</Button>)}
    </div>
    {saving && <p role="status" className="mt-3 text-sm text-muted-foreground">切り替えています…</p>}
    {error && <p role="alert" className="mt-3 text-sm text-destructive">切り替えできませんでした。もう一度お試しください。</p>}
  </section>;
}