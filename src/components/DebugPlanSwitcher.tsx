import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setMyDebugPlan } from "@/lib/membership.functions";
import { planOrder } from "@/lib/plans";
import type { Plan } from "@/lib/design-modes";
import type { Language } from "@/lib/translations";
import { localizedPlanLabels } from "@/lib/preview-plan";

const copy: Record<Language, { label: string; title: string; note: string; group: string; current: string; saving: string; error: string }> = {
  ja: { label: "[テスト用] プラン切り替え", title: "[テスト用] プラン切り替え", note: "管理者・関係者専用。選択したプランはこのアカウントに24時間だけ適用されます。課金は発生しません。", group: "テストプラン", current: "現在", saving: "切り替えています…", error: "切り替えできませんでした。もう一度お試しください。" },
  en: { label: "Development plan switcher", title: "Development plan switcher", note: "Administrators and whitelisted members only. The selected plan applies to this account for 24 hours without billing.", group: "Test plans", current: "Current", saving: "Switching…", error: "Could not switch plans. Please try again." },
  "zh-CN": { label: "开发方案切换", title: "开发方案切换", note: "仅限管理员和相关人员。所选方案在此账号生效24小时，不会产生费用。", group: "测试方案", current: "当前", saving: "正在切换…", error: "无法切换方案，请重试。" },
  "zh-TW": { label: "開發方案切換", title: "開發方案切換", note: "僅限管理員與相關人員。所選方案在此帳號生效24小時，不會產生費用。", group: "測試方案", current: "目前", saving: "正在切換…", error: "無法切換方案，請重試。" },
  ko: { label: "개발 플랜 전환", title: "개발 플랜 전환", note: "관리자 및 관계자 전용입니다. 선택한 플랜은 이 계정에 24시간 적용되며 결제되지 않습니다.", group: "테스트 플랜", current: "현재", saving: "전환 중…", error: "플랜을 전환하지 못했습니다. 다시 시도해 주세요." },
  es: { label: "Selector de planes de desarrollo", title: "Selector de planes de desarrollo", note: "Solo para administradores y personas autorizadas. El plan elegido se aplica durante 24 horas sin cargos.", group: "Planes de prueba", current: "Actual", saving: "Cambiando…", error: "No se pudo cambiar el plan. Inténtalo de nuevo." },
  fr: { label: "Sélecteur d’offre de développement", title: "Sélecteur d’offre de développement", note: "Réservé aux administrateurs et proches autorisés. L’offre choisie s’applique 24 heures sans facturation.", group: "Offres de test", current: "Actuel", saving: "Changement en cours…", error: "Impossible de changer d’offre. Réessayez." },
};

/**
 * Pinned plan switcher for administrators and whitelisted members.
 * It writes the real account plan through setMyDebugPlan (24 hours, no billing)
 * and stays fixed at the top of the screen so it can be used while scrolling.
 */
export default function DebugPlanSwitcher({ plan, language, onChanged }: { plan: Plan; language: Language; onChanged: (plan: Plan) => void }) {
  const change = useServerFn(setMyDebugPlan);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const barRef = useRef<HTMLElement | null>(null);

  // Everything below the pinned bar offsets by this variable, so it must match the bar's real height.
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const root = document.documentElement;
    const apply = () => root.style.setProperty("--preview-bar-height", `${Math.round(el.getBoundingClientRect().height)}px`);
    apply();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(apply);
    observer?.observe(el);
    window.addEventListener("resize", apply);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", apply);
      root.style.setProperty("--preview-bar-height", "0px");
    };
  }, []);

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
  return (
    <aside ref={barRef} className="debug-plan-bar" aria-label={t.label} title={t.note}>
      <p className="sr-only">{t.note}</p>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2">
        <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-primary">
          <FlaskConical className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{t.title}</span>
        </span>
        <span className="min-w-0 truncate text-[11px] text-muted-foreground">{t.current}: {localizedPlanLabels[language][plan]}</span>
        <div role="group" aria-label={t.group} className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-1">
          {planOrder.map((option) => (
            <Button key={option} type="button" size="sm" variant={plan === option ? "default" : "outline"} aria-pressed={plan === option} disabled={saving} onClick={() => void select(option)} className="min-h-9 shrink-0 px-2 text-xs">
              {localizedPlanLabels[language][option]}
            </Button>
          ))}
        </div>
        {saving && <p role="status" className="w-full text-end text-[11px] text-muted-foreground">{t.saving}</p>}
        {error && <p role="alert" className="w-full text-end text-[11px] text-destructive">{t.error}</p>}
      </div>
    </aside>
  );
}
