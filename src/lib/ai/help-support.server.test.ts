import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
 pending: null as string | null,
 messages: [] as unknown[],
 releases: 0,
 streamOptions: undefined as any,
 finish: undefined as any,
 acquireHook: undefined as (() => void) | undefined,
 throwStream: false,
}));

function query(admin: boolean, table: string) {
 let patch: Record<string, unknown> | undefined;
 let filter: string | undefined;
 let token: string | undefined;
 const q = {
  select: () => q,
  eq: (column: string, value: string) => { if (column === 'pending_at') token = value; return q; },
  update: (value: Record<string, unknown>) => { patch = value; return q; },
  or: (value: string) => { filter = value; return q; },
  single: async () => ({ data: { messages: state.messages }, error: null }),
  maybeSingle: async () => {
   if (table === 'ai_support_provider_blocks') return { data: null, error: null };
   if (patch?.['messages']) {
    if (token !== state.pending) return { data: null, error: null };
    state.messages = patch['messages'] as unknown[];
    return { data: { id: 'thread' }, error: null };
   }
   const cutoff = filter?.split('pending_at.lte.')[1];
   if (state.pending !== null && (!cutoff || Date.parse(state.pending) > Date.parse(cutoff))) return { data: null, error: null };
   state.pending = String(patch?.['pending_at']);
   state.acquireHook?.();
   return { data: { id: 'thread', messages: state.messages }, error: null };
  },
  then: (resolve: (result: { error: null }) => unknown) => {
   if (admin && patch && token === state.pending) {
    if (patch['pending_at'] === null) { state.pending = null; state.releases++; }
    if (patch['messages']) state.messages = patch['messages'] as unknown[];
   }
   return Promise.resolve(resolve({ error: null }));
  },
 };
 return q;
}

vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({
 auth: { getUser: async () => ({ data: { user: { id: 'owner' } }, error: null }) },
 from: (table: string) => query(false, table),
}) }));
vi.mock('@/integrations/supabase/client.server', () => ({ supabaseAdmin: { from: (table: string) => query(true, table) } }));
vi.mock('@ai-sdk/openai', () => ({ createOpenAI: () => ({ responses: () => 'model' }) }));
vi.mock('./run-id.server.ts', () => ({ createLovableAiGatewayRunIdFetch: () => ({}), withLovableAiGatewayRunIdHeader: async (response: Response) => response }));
vi.mock('ai', () => ({
 tool: (value: unknown) => value, stepCountIs: () => 50,
 validateUIMessages: async ({ messages }: { messages: unknown[] }) => messages,
 convertToModelMessages: async (messages: unknown[]) => messages,
 streamText: (options: unknown) => {
  state.streamOptions = options;
  if (state.throwStream) throw new Error('stream setup failed');
  return { toUIMessageStreamResponse: ({ onFinish }: { onFinish: unknown }) => { state.finish = onFinish; return new Response('stream'); } };
 },
}));

import { handleHelpSupport } from './help-support.server';

function request(signal?: AbortSignal) {
 return new Request('http://localhost/api/support-chat', {
  method: 'POST', signal: signal ?? null, headers: { authorization: 'Bearer test-session', 'content-type': 'application/json' },
  body: JSON.stringify({ threadId: '11111111-1111-4111-8111-111111111111', language: 'ja', messages: [{ id: 'user-message', role: 'user', parts: [{ type: 'text', text: 'プランについて' }] }] }),
 });
}

describe('support pending lock lifecycle', () => {
 beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-01T08:46:00Z'));
  vi.stubEnv('SUPABASE_URL', 'https://example.invalid'); vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'test-key'); vi.stubEnv('LOVABLE_API_KEY', 'test-key');
  Object.assign(state, { pending: null, messages: [], releases: 0, streamOptions: undefined, finish: undefined, acquireHook: undefined, throwStream: false });
 });
 afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });
 it('acquires an unlocked conversation', async () => { expect((await handleHelpSupport(request())).status).toBe(200); });
 it('reclaims a lock exactly 60 seconds old', async () => {
  state.pending = new Date(Date.now() - 60_000).toISOString();
  expect((await handleHelpSupport(request())).status).toBe(200);
  expect(state.pending).toBe(new Date().toISOString());
 });
 it('reclaims a lock older than 60 seconds', async () => {
  state.pending = new Date(Date.now() - 60_001).toISOString();
  expect((await handleHelpSupport(request())).status).toBe(200);
 });
 it('keeps a younger lock and returns 409', async () => {
  state.pending = new Date(Date.now() - 59_999).toISOString();
  expect((await handleHelpSupport(request())).status).toBe(409);
  expect(state.streamOptions).toBeUndefined();
 });
 it('releases on abort without waiting for stream onFinish', async () => {
  const controller = new AbortController();
  await handleHelpSupport(request(controller.signal));
  expect(state.streamOptions.abortSignal).toBeDefined();
  controller.abort();
  await vi.waitFor(() => expect(state.pending).toBeNull());
  expect(state.releases).toBe(1);
  await state.finish({ messages: [], isAborted: true });
  expect(state.releases).toBe(1);
 });
 it('releases when abort happens during lock acquisition', async () => {
  const controller = new AbortController(); state.acquireHook = () => controller.abort();
  expect((await handleHelpSupport(request(controller.signal))).status).toBe(499);
  expect(state.pending).toBeNull(); expect(state.streamOptions).toBeUndefined();
 });
 it('cannot release or overwrite a newer reclaimed lock', async () => {
  const controller = new AbortController(); await handleHelpSupport(request(controller.signal));
  state.pending = new Date(Date.now() + 60_000).toISOString();
  const newerLock = state.pending; controller.abort();
  await state.finish({ messages: [{ id: 'obsolete-answer' }], isAborted: false });
  expect(state.pending).toBe(newerLock); expect(state.releases).toBe(0);
  expect(state.messages.some((m: any) => m.id === 'obsolete-answer')).toBe(false);
 });
 it('releases on synchronous stream setup errors', async () => {
  state.throwStream = true;
  await expect(handleHelpSupport(request())).rejects.toThrow('stream setup failed');
  expect(state.pending).toBeNull();
 });
 it('does not start generation after losing ownership before initial save', async () => {
  state.acquireHook = () => { state.pending = new Date(Date.now() + 60_000).toISOString(); };
  expect((await handleHelpSupport(request())).status).toBe(409);
  expect(state.streamOptions).toBeUndefined(); expect(state.messages).toEqual([]);
  expect(state.releases).toBe(0);
 });
 it('persists completed answers and releases once', async () => {
  await handleHelpSupport(request()); const complete = [{ id: 'completed-answer' }];
  await state.finish({ messages: complete, isAborted: false });
  expect(state.messages).toEqual(complete); expect(state.pending).toBeNull(); expect(state.releases).toBe(1);
 });
});