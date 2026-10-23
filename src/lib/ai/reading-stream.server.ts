/** Raw HTTP boundary for private, progressive structured readings. No shared HTTP cache. */
export async function handleReadingStream(request: Request) {
  let input: unknown;
  try { input = await request.json(); } catch { return new Response('Invalid reading', { status: 400 }); }
  const kind = typeof input === 'object' && input !== null && 'kind' in input ? input.kind : null;
  if (kind !== 'full' && kind !== 'quick' && kind !== 'today') return new Response('Invalid reading', { status: 400 });
  let run: (onPartial: (value: unknown) => void) => Promise<unknown>;
  try {
    if (kind === 'today') {
      const module = await import('./today-fortune.server');
      const data = module.parseReadingInput(input);
      run = onPartial => module.runReading(data, onPartial, request.signal);
    } else if (kind === 'quick') {
      const module = await import('./quick-essence.server');
      const data = module.parseReadingInput(input);
      run = onPartial => module.runReading(data, onPartial, request.signal);
    } else {
      const module = await import('./home-reading.server');
      const data = module.parseReadingInput(input);
      run = onPartial => module.runReading(data, onPartial, request.signal);
    }
  } catch { return new Response('Invalid profile', { status: 400 }); }
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: object) => controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
      try {
        send({ type: 'start' });
        const result = await run(value => send({ type: 'partial', value }));
        send({ type: 'complete', value: result });
      } catch (error) {
        if (request.signal.aborted) return;
        console.error('Reading generation failed', error instanceof Error ? error.name : 'UnknownError');
        send({ type: 'error', message: error instanceof Error && error.message === 'AI is unavailable' ? 'AI is unavailable' : 'Reading could not be generated. Please try again later.' });
      } finally { controller.close(); }
    },
  });
  return new Response(body, { headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'private, no-store, no-transform' } });
}