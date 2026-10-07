import { FlaskConical } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { usePlan } from "./PlanProvider";
import { planOrder } from "@/lib/plans";
import { localizedPlanLabels } from "@/lib/preview-plan";
import { storedLanguage } from "@/lib/support-copy";
import type { Language } from "@/lib/translations";

const copy: Record<Language, { label: string; note: string; group: string }> = {
  ja: { label: "開発テスト用プラン切替バー", note: "開発テスト · 閲覧のみ", group: "テストプラン" }, en: { label: "Development plan preview", note: "Development preview · view only", group: "Preview plan" },
  "zh-CN": { label: "开发方案预览", note: "开发预览 · 仅供查看", group: "预览方案" }, "zh-TW": { label: "開發方案預覽", note: "開發預覽 · 僅供查看", group: "預覽方案" },
  ko: { label: "개발 플랜 미리보기", note: "개발 미리보기 · 보기 전용", group: "미리보기 플랜" }, es: { label: "Vista de planes de desarrollo", note: "Vista de desarrollo · solo lectura", group: "Plan de prueba" }, fr: { label: "Aperçu des forfaits", note: "Aperçu de développement · lecture seule", group: "Forfait d’aperçu" },
};

export default function PreviewPlanBar() {
  const { enabled, override, selectPlan } = usePlan();
  const [language, setLanguage] = useState<Language>("ja");
  useEffect(() => { setLanguage(storedLanguage()); const update = (event: Event) => setLanguage((event as CustomEvent<Language>).detail); window.addEventListener("onore-language-change", update); return () => window.removeEventListener("onore-language-change", update); }, []);
  if (!enabled) return null;
  const text = copy[language];
  return <aside className="preview-plan-bar" aria-label={text.label}>
    <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-3 py-2">
      <span className="flex items-center gap-1.5 text-xs text-primary"><FlaskConical className="size-4" aria-hidden="true" />{text.note}</span>
      <div role="group" aria-label={text.group} className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {planOrder.map(plan => <Button key={plan} size="sm" variant={override === plan ? "default" : "ghost"} aria-pressed={override === plan} onClick={() => selectPlan(plan)} className="min-h-9 shrink-0 px-2 text-xs">{localizedPlanLabels[language][plan]}</Button>)}
      </div>
    </div>
  </aside>;
}