import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/readings')({
  server: { handlers: { POST: async ({ request }) => {
    const { handleReadingStream } = await import('@/lib/ai/reading-stream.server');
    return handleReadingStream(request);
  } } },
});