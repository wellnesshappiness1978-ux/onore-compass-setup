import { NautilusIcon } from './NautilusIcon';
import type { DesignMode, Plan } from "@/lib/design-modes";
import type { AppearanceFamily } from "@/lib/appearance-families";
import { appearanceForPlan } from "@/lib/appearance-families";
import { AppearanceMotif } from "./AppearanceMotif";

/** One miniature screen, fed by the same theme tokens as the actual dashboard. */
export function ThemeSample({ mode, tier, name, large = false, family = appearanceForPlan(tier) }: { mode: DesignMode; tier: Plan; name: string; large?: boolean; family?: AppearanceFamily }) {
  return <div data-design={mode} data-tier={tier} data-appearance={family} className={`theme-sample theme-sample--${mode} ${large ? "theme-sample--large" : ""}`} aria-label={name}>
    <div className="theme-sample-sky" aria-hidden="true" />
    <AppearanceMotif background />
    <div className="theme-sample-top"><span className="theme-sample-symbol">✦</span><span>AGOLMEN'S COMPASS</span><span className="theme-sample-symbol">✦</span></div>
    <div className="theme-sample-content">
      <div className="theme-sample-heading"><NautilusIcon className={large ? 'size-8' : 'size-4'} family={family} /><span>{name}</span></div>
      <div className="theme-sample-body">
        <div className="theme-sample-dial relative"><AppearanceMotif /><NautilusIcon className={large ? 'size-16' : 'size-8'} family={family} /></div>
        <div className="theme-sample-lines" aria-hidden="true"><span /><span /><span /></div>
      </div>
      <div className="theme-sample-actions" aria-hidden="true"><span className="theme-sample-cta">✦</span><span /><span /></div>
    </div>
  </div>;
}
