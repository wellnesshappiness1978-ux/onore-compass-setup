import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { setMyDebugPlan } from "@/lib/membership.functions";
import { planOrder } from "@/lib/plans";
import type { Plan } from "@/lib/design-modes";
import type { Language } from "@/lib/translations";
import { localizedPlanLabels } from "@/lib/preview-plan";

const copy: Record<Language, { label: string; title: string; note: string; group: string; saving: string; error: string }> = {
  ja: { label: "開発用プラン切替", title: "開発用プラン切替", note: "管理者専用。選択したプランはこのアカウントに24時間だけ適用されます。課金は発生しません。", group: "テストプラン", saving: "切り替えています…", error: "切り替えできませんでした。もう一度お試しください。" },
  en: { label: "Development plan switcher", title: "Development plan switcher", note: "Administrators only. The selected plan applies to this account for 24 hours without billing.", group: "Test plans", saving: "Switching…", error: "Could not switch plans. Please try again." },
  "zh-CN": { label: "开发方案切换", title: "开发方案切换", note: "仅限管理员。所选方案在此账号生效24小时，不会产生费用。", group: "测试方案", saving: "正在切换…", error: "无法切换方案，请重试。" },
  "zh-TW": { label: "開發方案切換", title: "開發方案切換", note: "僅限管理員。所選方案在此帳號生效24小時，不會產生費用。", group: "測試方案", saving: "正在切換…", error: "無法切換方案，請重試。" },
  ko: { label: "개발 플랜 전환", title: "개발 플랜 전환", note: "관리자 전용입니다. 선택한 플랜은 이 계정에 24시간 적용되며 결제되지 않습니다.", group: "테스트 플랜", saving: "전환 중…", error: "플랜을 전환하지 못했습니다. 다시 시도해 주세요." },
  es: { label: "Selector de planes de desarrollo", title: "Selector de planes de desarrollo", note: "Solo para administradores. El plan elegido se aplica durante 24 horas sin cargos.", group: "Planes de prueba", saving: "Cambiando…", error: "No se pudo cambiar el plan. Inténtalo de nuevo." },
  fr: { label: "Sélecteur d’offre de développement", title: "Sélecteur d’offre de développement", note: "Réservé aux administrateurs. L’offre choisie s’applique 24 heures sans facturation.", group: "Offres de test", saving: "Changement en cours…", error: "Impossible de changer d’offre. Réessayez." },
};

export default function DebugPlanSwitcher({ plan, language, onChanged }: { plan: Plan; language: Language; onChanged: (plan: Plan) => void }) {
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

  const t = copy[language];
  return <section className="border-y border-primary/25 py-6" aria-label={t.label}>
    <h3 className="font-serif text-xl text-primary">{t.title}</h3>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.note}</p>
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label={t.group}>
      {planOrder.map((option) => <Button key={option} type="button" size="sm" variant={plan === option ? "default" : "outline"} aria-pressed={plan === option} disabled={saving} onClick={() => void select(option)} className="min-h-11 whitespace-normal px-2 text-sm">{localizedPlanLabels[language][option]}</Button>)}
    </div>
    {saving && <p role="status" className="mt-3 text-sm text-muted-foreground">{t.saving}</p>}
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{t.error}</p>}
  </section>;
}