import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPlanConsultationLimit, dailyUsageLimit, planOrder } from "@/lib/plans";
import { normalizePlan } from '@/lib/plan-identity';
import type { Plan } from "@/lib/design-modes";
import { CLOUD_SYNC_EVENT } from '@/lib/account-sync';

export type UsageFeature = "consultation" | "compatibility";
const localDay = () => new Date().toLocaleDateString("en-CA");
// One device counter per feature/day: switching the displayed plan changes the cap, never resets what was used.
const localKey = (feature: UsageFeature) => `onore-usage:${feature}:${localDay()}`;
const legacyKey = (feature: UsageFeature, plan: Plan) => `onore-usage:${feature}:${plan}:${localDay()}`;
export const dailyLimitFor = (feature: UsageFeature, plan: unknown) => (feature === "consultation" ? getPlanConsultationLimit(plan) : dailyUsageLimit[normalizePlan(plan)]);
export const remainingUses = (limit: number, used: number) => (Number.isFinite(limit) ? Math.max(0, limit - used) : Infinity);
export const isDailyLimitError = (error: { code?: string } | null | undefined) => error?.code === "23514";
export const msUntilMidnight = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1).getTime() - n.getTime();
};

/**
 * One shared daily counter for consultation and compatibility.
 * Signed-in users on their real plan are counted and capped in the database;
 * guests and preview-plan views use a device-local counter. Resets at local midnight.
 */
export function useDailyUsage(feature: UsageFeature, plan: Plan, serverCounted: boolean) {
  const limit = dailyLimitFor(feature, plan);
  const unlimited = !Number.isFinite(limit);
  const [used, setUsed] = useState(0);
  const [day, setDay] = useState(localDay);

  const refresh = useCallback(async () => {
    const today = localDay();
    setDay(today);
    if (serverCounted) {
      try {
        const { data, error } = await supabase
          .from("daily_usage")
          .select("used")
          .eq("feature", feature)
          .eq("usage_day", today)
          .maybeSingle();
        // A failed read must not lock the feature; the server still enforces the cap.
        setUsed(error ? 0 : (data?.used ?? 0));
      } catch {
        setUsed(0);
      }
    } else {
      try {
        const restored = Math.max(Number(localStorage.getItem(localKey(feature))) || 0, ...planOrder.map(p => Number(localStorage.getItem(legacyKey(feature, p))) || 0));
        localStorage.setItem(localKey(feature), String(restored));
        setUsed(restored);
      } catch {
        setUsed(0);
      }
    }
  }, [feature, plan, serverCounted]);

  useEffect(() => {
    void refresh();
    window.addEventListener(CLOUD_SYNC_EVENT,refresh);
    return ()=>window.removeEventListener(CLOUD_SYNC_EVENT,refresh);
  }, [refresh]);
  useEffect(() => {
    const id = window.setInterval(() => {
      if (localDay() !== day) void refresh();
    }, 1000);
    return () => window.clearInterval(id);
  }, [day, refresh]);

  /** Returns true when one use was recorded; false when the daily cap is reached. */
  const consume = useCallback(async () => {
    if (serverCounted) {
      const { data, error } = await supabase.rpc("consume_daily_usage", {
        p_feature: feature,
        p_day: localDay(),
      });
      if (error) {
        await refresh();
        // Only a confirmed daily-limit response blocks; transient/config errors fall back to allowing use.
        return !isDailyLimitError(error);
      }
      setUsed(Number(data) || 0);
      return true;
    }
    let stored = 0;
    try { stored = Number(localStorage.getItem(localKey(feature))) || 0; } catch { /* private browsing */ }
    const current = Math.max(used, stored);
    if (current >= limit) return false;
    const next = current + 1;
    try {
      localStorage.setItem(localKey(feature), String(next));
    } catch {
      /* private browsing */
    }
    setUsed(next);
    return true;
  }, [unlimited, serverCounted, feature, refresh, used, limit, plan]);

  return {
    used,
    limit,
    unlimited,
    remaining: remainingUses(limit, used),
    consume,
    refresh,
  };
}
