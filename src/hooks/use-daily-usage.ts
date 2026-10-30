import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { planOrder } from "@/lib/plans";
import { getFeatureUsageLimit, remainingUses } from "@/lib/plan-usage";
import type { Plan } from "@/lib/design-modes";
import { CLOUD_SYNC_EVENT } from '@/lib/account-sync';
import { localIso } from '@/lib/day-compass';
import { normalizePlan } from '@/lib/plan-identity';

export type UsageFeature = "consultation" | "compatibility";
export const usageDay = () => localIso(new Date());
const localDay = usageDay;
// One device counter per feature/day: switching the displayed plan changes the cap, never resets what was used.
const localKey = (feature: UsageFeature) => `onore-usage:${feature}:${localDay()}`;
const legacyKey = (feature: UsageFeature, plan: Plan) => `onore-usage:${feature}:${plan}:${localDay()}`;
export const dailyLimitFor = (feature: UsageFeature, plan: unknown) => getFeatureUsageLimit(feature, plan);
export { remainingUses };
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
  const configuredLimit = dailyLimitFor(feature, plan);
  const [serverLimit, setServerLimit] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  // Unknown is not Free and not unlimited. No allowance is shown until the server confirms it.
  const limit = serverCounted ? (serverLimit ?? 0) : configuredLimit;
  const unlimited = !Number.isFinite(limit);
  const [used, setUsed] = useState(0);
  const [day, setDay] = useState(localDay);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmedPlan, setConfirmedPlan] = useState<Plan | null>(null);

  const refresh = useCallback(async () => {
    const today = localDay();
    setDay(today);
    if (serverCounted) {
      setRefreshing(true);
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) { setReady(false); return null; }
        if (feature === 'consultation') {
          const { data, error } = await supabase.rpc('consultation_usage_status');
          if (error || !data || typeof data !== 'object' || Array.isArray(data)
            || (data.limit !== null && typeof data.limit !== 'number') || typeof data.plan !== 'string') {
            setReady(false); return null;
          }
          const counts = data.counts;
          const count = counts && typeof counts === 'object' && !Array.isArray(counts) && typeof counts[today] === 'number' ? counts[today] : 0;
          const cap = data.limit === null ? Infinity : data.limit;
          setUsed(count); setServerLimit(cap); setConfirmedPlan(normalizePlan(data.plan)); setReady(true);
          return { used: count, limit: cap, remaining: remainingUses(cap, count) };
        }
        const [usageResult, capResult] = await Promise.all([
          supabase.from("daily_usage").select("used").eq("user_id", auth.user.id).eq("feature", feature).eq("usage_day", today).maybeSingle(),
          supabase.rpc("current_feature_daily_usage_limit", { p_feature: feature }),
        ]);
        if (usageResult.error || capResult.error || (capResult.data !== null && typeof capResult.data !== "number")) {
          setReady(false);
          return null;
        }
        const count = usageResult.data?.used ?? 0;
        setUsed(count);
        const confirmedLimit = capResult.data === null ? Infinity : capResult.data;
        setServerLimit(confirmedLimit);
        setReady(true);
        return { used: count, limit: confirmedLimit, remaining: remainingUses(confirmedLimit, count) };
      } catch {
        setReady(false);
        return null;
      } finally {
        setRefreshing(false);
      }
    } else {
      try {
        const restored = Math.max(Number(localStorage.getItem(localKey(feature))) || 0, ...planOrder.map(p => Number(localStorage.getItem(legacyKey(feature, p))) || 0));
        localStorage.setItem(localKey(feature), String(restored));
        setUsed(restored);
        setReady(true);
        return { used: restored, limit: configuredLimit, remaining: remainingUses(configuredLimit, restored) };
      } catch {
        setUsed(0);
        setReady(true);
        return { used: 0, limit: configuredLimit, remaining: configuredLimit };
      }
    }
  }, [feature, plan, serverCounted, configuredLimit]);

  useEffect(() => {
    setReady(false);
    setServerLimit(null);
    setConfirmedPlan(null);
    const onRefresh = () => { void refresh(); };
    onRefresh();
    window.addEventListener(CLOUD_SYNC_EVENT, onRefresh);
    window.addEventListener("focus", onRefresh);
    window.addEventListener("storage", onRefresh);
    return () => {
      window.removeEventListener(CLOUD_SYNC_EVENT, onRefresh);
      window.removeEventListener("focus", onRefresh);
      window.removeEventListener("storage", onRefresh);
    };
  }, [refresh]);
  useEffect(() => {
    const id = window.setInterval(() => {
      if (localDay() !== day) void refresh();
    }, 1000);
    return () => window.clearInterval(id);
  }, [day, refresh]);
  useEffect(() => {
    if (!serverCounted) return;
    const id = window.setInterval(() => { void refresh(); }, 15000);
    return () => window.clearInterval(id);
  }, [serverCounted, refresh]);

  /** Returns true when one use was recorded; false when the daily cap is reached. */
  const consume = useCallback(async () => {
    if (serverCounted) {
      if (feature === 'consultation') throw new Error('Consultation usage is recorded by completed server responses.');
      const { data, error } = await supabase.rpc("consume_daily_usage", {
        p_feature: feature,
        p_day: localDay(),
      });
      if (error) {
        await refresh();
        // Failed accounting cannot grant uncounted diagnoses.
        if (!isDailyLimitError(error)) throw new Error(error.message);
        return false;
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
    ready,
    refreshing,
    confirmedPlan,
    limit,
    unlimited,
    remaining: remainingUses(limit, used),
    consume,
    refresh,
  };
}
