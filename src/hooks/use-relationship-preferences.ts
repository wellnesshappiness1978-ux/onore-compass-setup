import { useEffect, useState } from 'react';
import { defaultRelationshipGoal, RELATION_GOAL_KEY, RELATION_PREF_EVENT, RELATION_PREF_KEY, validRelationshipGoal, type RelationshipGoal } from '@/lib/reminder-preferences';
export function useRelationshipPreferences() {
 const [picked, setPicked] = useState('');
 const [goal, setGoal] = useState<RelationshipGoal>(defaultRelationshipGoal);
 useEffect(() => {
  const sync = () => { try { setPicked(localStorage.getItem(RELATION_PREF_KEY) ?? ''); const raw = JSON.parse(localStorage.getItem(RELATION_GOAL_KEY) ?? 'null'); setGoal(prev => (prev.goal === raw?.goal && prev.goalPreset === raw?.goalPreset ? prev : validRelationshipGoal(raw))); } catch { /* retain state */ } };
  const storage = (e: StorageEvent) => { if (!e.key || e.key === RELATION_PREF_KEY || e.key === RELATION_GOAL_KEY) sync(); };
  sync(); window.addEventListener(RELATION_PREF_EVENT, sync); window.addEventListener('storage', storage);
  return () => { window.removeEventListener(RELATION_PREF_EVENT, sync); window.removeEventListener('storage', storage); };
 }, []);
 const savePerson = (value: string) => { setPicked(value); try { localStorage.setItem(RELATION_PREF_KEY, value); window.dispatchEvent(new Event(RELATION_PREF_EVENT)); } catch { /* storage unavailable */ } };
 const saveGoal = (value: RelationshipGoal) => { setGoal(value); try { localStorage.setItem(RELATION_GOAL_KEY, JSON.stringify(value)); window.dispatchEvent(new Event(RELATION_PREF_EVENT)); } catch { /* storage unavailable */ } };
 return { picked, goal, savePerson, saveGoal };
}
