import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import DebugPlanSwitcher from './DebugPlanSwitcher';

/** Source files that could mount a second plan switcher (tests excluded). */
const sources: string[] = [];
(function walk(dir: string) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (/\.tsx?$/.test(entry.name) && !entry.name.includes('.test.')) sources.push(path);
  }
})('src');

const pressedPlan = (html: string) => {
  const index = html.indexOf('aria-pressed="true"');
  return index < 0 ? '' : html.slice(index, index + 200);
};

describe('pinned test plan switcher', () => {
  it('offers every plan and marks only the account plan as active', () => {
    const html = renderToStaticMarkup(<DebugPlanSwitcher plan="vip" language="ja" onChanged={() => undefined} />);
    for (const label of ['無料会員', 'スタンダード会員', 'VIP会員', 'ファミリー会員', 'ファミリープレミアム会員']) {
      expect(html).toContain(label);
    }
    expect(html.match(/aria-pressed="true"/g)?.length).toBe(1);
    expect(pressedPlan(html)).toContain('VIP会員');
  });

  it('keeps the read-only duplicate bar out of the app', () => {
    expect(existsSync('src/components/PreviewPlanBar.tsx')).toBe(false);
    expect(sources.filter((file) => readFileSync(file, 'utf8').includes('PreviewPlanBar'))).toEqual([]);
  });

  it('mounts the switcher once, only for server-approved accounts', () => {
    const dashboard = readFileSync('src/components/Dashboard.tsx', 'utf8');
    expect(dashboard).toContain('signedIn && debugAllowed && <DebugPlanSwitcher');
    expect(sources.filter((file) => readFileSync(file, 'utf8').includes('<DebugPlanSwitcher'))).toEqual(['src/components/Dashboard.tsx']);
  });
});
