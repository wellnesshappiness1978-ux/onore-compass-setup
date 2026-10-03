import { FlaskConical } from "lucide-react";
import { Button } from "./ui/button";
import { usePlan } from "./PlanProvider";
import { planOrder } from "@/lib/plans";
import { planLabels } from "@/lib/preview-plan";

export default function PreviewPlanBar() {
  const { enabled, override, selectPlan } = usePlan();
  if (!enabled) return null;
  return <aside className="preview-plan-bar" aria-label="開発テスト用プラン切替バー">
    <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-3 py-2">
      <span className="flex items-center gap-1.5 text-xs text-primary"><FlaskConical className="size-4" aria-hidden="true" />開発テスト</span>
      <div role="group" aria-label="テストプラン" className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {planOrder.map(plan => <Button key={plan} size="sm" variant={override === plan ? "default" : "ghost"} aria-pressed={override === plan} onClick={() => selectPlan(plan)} className="min-h-9 shrink-0 px-2 text-xs">{planLabels[plan]}</Button>)}
      </div>
    </div>
  </aside>;
}