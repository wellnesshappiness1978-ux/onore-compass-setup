import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cloudTables, CLOUD_SYNC_EVENT, syncedSettingKeys } from '@/lib/account-sync';

/** One channel per signed-in mount; only authoritative reads are refreshed, never AI mutations. */
export function useAccountSync(userId: string | null, onProfile: () => Promise<void>) {
  const callback = useRef(onProfile); callback.current = onProfile;
  useEffect(() => {
    if (!userId) return;
    let active = true, refreshing = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const snapshot = new Map(syncedSettingKeys.map(k => [k, localStorage.getItem(k)]));
    const changed = new Set<string>();
    const readSettings = async () => {
      const { data, error } = await supabase.from('account_settings').select('key,value').eq('user_id', userId);
      if (error || !active) return;
      for (const row of data ?? []) {
        const key = syncedSettingKeys.find(k => k === row.key);
        if (!key || changed.has(key)) continue;
        const oldValue = localStorage.getItem(key);
        if (oldValue === row.value) continue;
        if (row.value === null) localStorage.removeItem(key); else localStorage.setItem(key, row.value);
        snapshot.set(key, row.value);
        window.dispatchEvent(new StorageEvent('storage', { key, oldValue, newValue: row.value, storageArea: localStorage }));
      }
      window.dispatchEvent(new Event('onore-notify-change'));
      window.dispatchEvent(new Event('onore-relations-preferences-change'));
    };
    const refresh = async () => {
      if (!active || refreshing) return;
      refreshing = true;
      try { await Promise.all([callback.current(), readSettings()]); }
      finally { refreshing = false; }
      if (active) window.dispatchEvent(new Event(CLOUD_SYNC_EVENT));
    };
    const schedule = () => { clearTimeout(timer); timer = setTimeout(() => void refresh(), 150); };
    let channel = supabase.channel(`account-${userId}-${crypto.randomUUID()}`);
    for (const table of cloudTables) channel = channel.on('postgres_changes', { event: '*', schema: 'public', table, filter: `user_id=eq.${userId}` }, () => {
      if (table === 'account_settings' || table === 'profiles') schedule();
      else window.dispatchEvent(new CustomEvent(CLOUD_SYNC_EVENT, { detail: table }));
    });
    channel.subscribe(status => { if (status === 'SUBSCRIBED') schedule(); });
    const focus = () => { if (document.visibilityState === 'visible') schedule(); };
    window.addEventListener('focus', focus); document.addEventListener('visibilitychange', focus);
    // Detect legacy setting writers without replacing browser storage APIs. Unchanged values never produce requests.
    let saving = false;
    const poll = setInterval(async () => {
      if (!active || saving) return;
      const rows = syncedSettingKeys.flatMap(key => {
        const value = localStorage.getItem(key);
        if (snapshot.get(key) === value) return [];
        changed.add(key); return [{ user_id: userId, key, value, updated_at: new Date().toISOString() }];
      });
      if (!rows.length) return;
      saving = true;
      try {
        const { error } = await supabase.from('account_settings').upsert(rows);
        if (!error && active) for (const row of rows) { snapshot.set(row.key, row.value); changed.delete(row.key); }
      } finally { saving = false; }
    }, 1000);
    void readSettings();
    return () => { active = false; clearTimeout(timer); clearInterval(poll); window.removeEventListener('focus', focus); document.removeEventListener('visibilitychange', focus); void supabase.removeChannel(channel); };
  }, [userId]);
}