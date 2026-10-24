// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { expect, it } from 'vitest';
import { useRelationshipPreferences } from './use-relationship-preferences';
import type { RelationshipGoal } from '@/lib/reminder-preferences';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Probe = { picked: string; goal: RelationshipGoal; save: (value: RelationshipGoal) => void };

function mountProbe(): { probe: Probe; root: Root } {
  const probe: Probe = { picked: '', goal: { goal: '', goalPreset: '' }, save: () => {} };
  function HookProbe() {
    const { picked, goal, saveGoal } = useRelationshipPreferences();
    probe.picked = picked;
    probe.goal = goal;
    probe.save = saveGoal;
    return null;
  }
  const container = document.createElement('div');
  document.body.appendChild(container);
  let root: Root | undefined;
  act(() => {
    root = createRoot(container);
    root.render(<HookProbe />);
  });
  return { probe, root: root! };
}

it('keeps the trailing space of a goal being typed', () => {
  const { probe } = mountProbe();
  act(() => probe.save({ goalPreset: '', goal: 'talk more with my son ' }));
  expect(probe.goal.goal).toBe('talk more with my son ');
  act(() => probe.save({ goalPreset: '', goal: 'a b ' }));
  expect(probe.goal.goal).toBe('a b ');
});

it('still syncs a second hook instance when the saved goal changes', () => {
  const first = mountProbe();
  const second = mountProbe();
  act(() => first.probe.save({ goalPreset: '', goal: '息子と話す時間を増やす' }));
  expect(second.probe.goal.goal).toBe('息子と話す時間を増やす');
  act(() => first.probe.save({ goalPreset: 'health', goal: '一緒に休む' }));
  expect(second.probe.goal.goal).toBe('一緒に休む');
  expect(second.probe.goal.goalPreset).toBe('health');
});
