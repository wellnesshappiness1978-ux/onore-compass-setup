// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Plan } from '@/lib/design-modes';
import { useDailyUsage } from './use-daily-usage';

const db = vi.hoisted(() => ({ used: 0, cap: 1 as number | null, fail: false }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: {
  auth: { getUser: async () => ({ data: { user: { id: 'owner' } } }) },
  from: () => {
    const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: { used: db.used }, error: db.fail ? { message: 'offline' } : null }) };
    return query;
  },
  rpc: async (name: string) => {
    if (name === 'consultation_usage_status') return { data: { plan: db.cap === 3 ? 'standard' : db.cap === 10 ? 'vip' : db.cap === 30 ? 'family' : db.cap === null ? 'family_premium' : 'free', limit: db.cap, counts: { [new Date().toLocaleDateString('en-CA')]: db.used } }, error: db.fail ? { message: 'offline' } : null };
    if (name === 'current_feature_daily_usage_limit') return { data: db.cap, error: null };
    if (db.cap !== null && db.used >= db.cap) return { data: null, error: { code: '23514', message: 'limit' } };
    db.used += 1;
    return { data: db.used, error: null };
  },
} }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(() => { act(() => roots.splice(0).forEach(root => root.unmount())); db.fail = false; });

async function mount(plan: Plan) {
  const probe: { current?: ReturnType<typeof useDailyUsage> } = {};
  function Probe() { probe.current = useDailyUsage('consultation', plan, true); return null; }
  const root = createRoot(document.createElement('div'));
  roots.push(root);
  await act(async () => { root.render(<Probe />); });
  return probe;
}
describe('authenticated displayed counts and atomic checks agree', () => {
  it('Premium confirms null as unlimited after repeated successful responses', async () => { db.cap=null; db.used=100; const probe=await mount('b2b-premium'); expect(probe.current?.unlimited).toBe(true); db.used=101; await act(async()=>{await probe.current?.refresh();}); expect(probe.current?.remaining).toBe(Infinity); expect(probe.current?.used).toBe(101); });
  it.each([['free', 1], ['standard', 3], ['vip', 10], ['b2b', 30]] as const)('%s displays final use and then the completed server count', async (plan, cap) => {
    db.cap = cap; db.used = cap - 1;
    const probe = await mount(plan);
    expect(probe.current?.limit).toBe(cap);
    expect(probe.current?.remaining).toBe(1);
    db.used += 1;
    await act(async () => { await probe.current?.refresh(); });
    expect(probe.current?.remaining).toBe(0);
    await expect(probe.current?.consume()).rejects.toThrow('completed server responses');
    expect(db.used).toBe(cap);
  });
  it('displays the server-confirmed plan, not a stale prop', async () => {
    db.cap=10; db.used=4;
    const probe=await mount('free');
    expect(probe.current?.confirmedPlan).toBe('vip');
    expect(probe.current?.remaining).toBe(6);
  });
  it('uses the actual server cap instead of granting a Premium preview', async () => {
    db.cap = 1; db.used = 1;
    const probe = await mount('b2b-premium');
    expect(probe.current?.limit).toBe(1);
    expect(probe.current?.remaining).toBe(0);
  });
  it('failed reads do not reset used counts or grant a new allowance', async () => {
    db.cap = 100; db.used = 99;
    const probe = await mount('b2b-premium');
    db.fail = true;
    await act(async () => { expect(await probe.current?.refresh()).toBeNull(); });
    expect(probe.current?.used).toBe(99);
    expect(probe.current?.ready).toBe(false);
  });
  it('an unresolved paid membership never displays a Free fallback or unlimited allowance', async () => {
    db.fail = true; db.cap = 100; db.used = 99;
    const probe = await mount('b2b-premium');
    expect(probe.current?.ready).toBe(false);
    expect(probe.current?.limit).toBe(0);
    expect(probe.current?.unlimited).toBe(false);
    db.fail = false;
    await act(async () => { await probe.current?.refresh(); });
    expect(probe.current?.ready).toBe(true);
    expect(probe.current?.limit).toBe(100);
    expect(probe.current?.remaining).toBe(1);
  });
});