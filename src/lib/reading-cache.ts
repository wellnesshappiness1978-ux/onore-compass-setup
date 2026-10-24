import { z } from 'zod';

const PREFIX = 'onore-reading:v1:';
const ACCESS_KEY = 'onore-reading-access:v1';
const memory = new Map<string, unknown>();
function touch(key: string) {
  const times: Record<string, number> = JSON.parse(localStorage.getItem(ACCESS_KEY) ?? '{}');
  const live = Object.keys(localStorage).filter(k => k.startsWith(PREFIX));
  const next = Object.fromEntries(live.map(k => [k, k === key ? Date.now() : times[k] ?? 0]));
  localStorage.setItem(ACCESS_KEY, JSON.stringify(next));
}
let cacheEpoch = 0;
export const readingCacheEpoch = () => cacheEpoch;
export function readingCacheKey(kind: string, day: string, request: unknown, owner = 'guest') {
  // Full structured inputs are retained in the key: no collisions between profiles, parents or goals.
  return PREFIX + JSON.stringify([owner, kind === 'full' ? 'full-oracle-v4' : kind, day, request]);
}
export function readReadingCache<T>(key: string, schema: z.ZodType<T>): T | undefined {
  try {
    const result = schema.safeParse(memory.get(key) ?? JSON.parse(localStorage.getItem(key) ?? 'null'));
    if (!result.success) return undefined;
    memory.set(key, result.data);
    try { touch(key); } catch { /* optional eviction metadata */ }
    return result.data;
  } catch { return undefined; }
}
export function writeReadingCache(key: string, value: unknown) {
  memory.set(key, value);
  if (memory.size > 16) memory.delete(memory.keys().next().value ?? '');
  try {
    // Bound device storage; eviction affects only regenerable readings.
    const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX));
    if (!keys.includes(key) && keys.length >= 16) {
      let times: Record<string, number> = {};
      try { times = JSON.parse(localStorage.getItem(ACCESS_KEY) ?? '{}'); } catch { /* old storage */ }
      const oldest = keys.sort((a, b) => (times[a] ?? 0) - (times[b] ?? 0))[0] ?? '';
      localStorage.removeItem(oldest);
      memory.delete(oldest);
    }
    localStorage.setItem(key, JSON.stringify(value));
    touch(key);
  } catch { /* device storage unavailable */ }
}
export function clearReadingCaches() {
  cacheEpoch += 1;
  memory.clear();
  try { localStorage.removeItem(ACCESS_KEY); } catch { /* storage unavailable */ }
  try { for (const key of Object.keys(localStorage)) if (key.startsWith(PREFIX) || key.startsWith('onore-today-ai:')) localStorage.removeItem(key); } catch { /* storage unavailable */ }
}

/** Handles split NDJSON frames and UTF-8 characters, emitting genuine arriving objects. */
export async function consumeReadingStream(response: Response, onPartial: (value: unknown) => void): Promise<unknown> {
  if (!response.ok || !response.body) throw new Error('Reading unavailable');
  const reader = response.body.getReader(), decoder = new TextDecoder();
  let pending = '', complete: unknown;
  const frame = (line: string) => {
    if (!line.trim()) return;
    const event = JSON.parse(line);
    if (event.type === 'partial') onPartial(event.value);
    if (event.type === 'complete') complete = event.value;
    if (event.type === 'error') throw new Error(event.message);
  };
  while (true) {
    const chunk = await reader.read();
    pending += decoder.decode(chunk.value, { stream: !chunk.done });
    const lines = pending.split('\n'); pending = lines.pop() ?? '';
    for (const line of lines) frame(line);
    if (chunk.done) break;
  }
  frame(pending);
  if (!complete) throw new Error('Incomplete reading');
  return complete;
}