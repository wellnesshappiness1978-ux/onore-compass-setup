import type { QueryClient } from '@tanstack/react-query';
import { readingCacheEpoch, writeReadingCache } from './reading-cache';
import { todayFortuneSchema, normalizeFortune } from './today-fortune';
import type { Language } from './translations';

/** Restore completed private results only; this path never generates AI or consumes quota. */
export function restoreSessionReadings(client: QueryClient, rows: { local_key: string; result: unknown }[], epoch: number) {
  if (epoch !== readingCacheEpoch()) return;
  for (const row of rows) {
    const key = row.local_key;
    if (key.startsWith('onore-reading:v1:')) {
      writeReadingCache(key, row.result);
      client.setQueryDefaults([key], { staleTime: Infinity, gcTime: Infinity });
      client.setQueryData([key], row.result);
    } else if (key.startsWith('onore-today-ai:v9:')) {
      const parsed = todayFortuneSchema.safeParse(row.result);
      const language = key.split(':')[4];
      if (parsed.success && language && ['ja','en','zh-CN','zh-TW','ko','es','fr'].includes(language)) {
        try { localStorage.setItem(key, JSON.stringify(normalizeFortune(parsed.data, language as Language))); } catch { /* memory remains available in the active tab */ }
      }
    }
  }
}