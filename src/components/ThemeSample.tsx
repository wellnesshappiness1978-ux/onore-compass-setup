import { NautilusIcon } from './NautilusIcon';
import type { DesignMode, Plan } from "@/lib/design-modes";
import type { AppearanceFamily } from "@/lib/appearance-families";
import { appearanceForPlan } from "@/lib/appearance-families";
import { decorationTier } from "@/lib/appearance-customization";
import { AppearanceMotif } from "./AppearanceMotif";

/** One miniature screen, fed by the same theme tokens as the actual dashboard. */
export function ThemeSample({ mode, tier, name, large = false, compact = false, family = appearanceForPlan(tier), background = family, icons = family }: { mode: DesignMode; tier: Plan; name: string; large?: boolean; compact?: boolean; family?: AppearanceFamily; background?: AppearanceFamily; icons?: AppearanceFamily }) {
  return <div data-design={mode} data-tier={tier} data-appearance={family} data-background={background} data-icons={icons} data-decoration-tier={decorationTier(family)} data-background-tier={decorationTier(background)} className={`theme-sample theme-sample--${mode} ${large ? "theme-sample--large" : ""} ${compact ? "theme-sample--compact" : ""}`} aria-label={name}>
    <div className="theme-sample-sky" aria-hidden="true" />
    <AppearanceMotif background />
    <div className="theme-sample-top"><span className="theme-sample-symbol">✦</span><span>AGOLMEN'S COMPASS</span><span className="theme-sample-symbol">✦</span></div>
    <div className="theme-sample-content">
      <div className="theme-sample-heading"><NautilusIcon className={large ? 'size-8' : 'size-4'} family={icons} /><span>{name}</span></div>
      <div className="theme-sample-body">
        <div className="theme-sample-dial relative"><AppearanceMotif /><NautilusIcon className={large ? 'size-16' : 'size-8'} family={icons} /></div>
        <div className="theme-sample-lines" aria-hidden="true"><span /><span /><span /></div>
      </div>
      <div className="theme-sample-actions" aria-hidden="true"><span className="theme-sample-cta">✦</span><span /><span /></div>
    </div>
  </div>;
}
