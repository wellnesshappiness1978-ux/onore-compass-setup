import { Compass, Sparkles } from "lucide-react";
import type { DesignMode, Plan } from "@/lib/design-modes";

/** One miniature screen, fed by the same theme tokens as the actual dashboard. */
export function ThemeSample({ mode, tier, name, large = false }: { mode: DesignMode; tier: Plan; name: string; large?: boolean }) {
  return <div data-design={mode} data-tier={tier} className={`theme-sample theme-sample--${mode} ${large ? "theme-sample--large" : ""}`} aria-label={name}>
    <div className="theme-sample-sky" aria-hidden="true" />
    <div className="theme-sample-top"><span className="theme-sample-symbol">✦</span><span>AGOLMEN'S COMPASS</span><span className="theme-sample-symbol">✦</span></div>
    <div className="theme-sample-content">
      <div className="theme-sample-heading"><Sparkles size={large ? 20 : 12} aria-hidden="true" /><span>{name}</span></div>
      <div className="theme-sample-body">
        <div className="theme-sample-dial"><Compass size={large ? 52 : 30} strokeWidth={1.2} aria-hidden="true" /></div>
        <div className="theme-sample-lines" aria-hidden="true"><span /><span /><span /></div>
      </div>
      <div className="theme-sample-actions" aria-hidden="true"><span className="theme-sample-cta">✦</span><span /><span /></div>
    </div>
  </div>;
}
