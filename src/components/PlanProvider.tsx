import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Plan } from "@/lib/design-modes";
import { isTestPreview, parsePlan, planQuery } from "@/lib/preview-plan";

type PlanState = { enabled: boolean; override: Plan | null; selectPlan: (plan: Plan) => void };
const Context = createContext<PlanState>({ enabled: false, override: null, selectPlan: () => undefined });
export const usePlan = () => useContext(Context);

export default function PlanProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [override, setOverride] = useState<Plan | null>(null);
  useEffect(() => {
    const test = isTestPreview(window.location.hostname);
    setEnabled(test);
    if (!test) return;
    document.documentElement.dataset.testPreview = "true";
    const restore = () => {
      let stored: string | null = null;
      try { stored = localStorage.getItem("devPlanOverride"); } catch { /* Storage may be disabled. */ }
      const next = parsePlan(new URLSearchParams(window.location.search).get("plan")) ?? parsePlan(stored) ?? "free";
      setOverride(next);
      try { localStorage.setItem("devPlanOverride", next); } catch { /* URL remains usable. */ }
    };
    const storage = (event: StorageEvent) => {
      if (event.key !== "devPlanOverride") return;
      const next = parsePlan(event.newValue);
      if (!next) return;
      const url = new URL(window.location.href); url.searchParams.set("plan", planQuery[next]);
      window.history.replaceState(window.history.state, "", url);
      setOverride(next);
    };
    restore();
    window.addEventListener("popstate", restore);
    window.addEventListener("storage", storage);
    return () => { delete document.documentElement.dataset.testPreview; window.removeEventListener("popstate", restore); window.removeEventListener("storage", storage); };
  }, []);
  const selectPlan = (next: Plan) => {
    if (!enabled) return;
    setOverride(next);
    try { localStorage.setItem("devPlanOverride", next); } catch { /* URL fallback. */ }
    const url = new URL(window.location.href); url.searchParams.set("plan", planQuery[next]);
    window.history.replaceState(window.history.state, "", url);
  };
  return <Context.Provider value={{ enabled, override, selectPlan }}>{children}</Context.Provider>;
}