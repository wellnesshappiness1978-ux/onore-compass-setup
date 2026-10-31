import { z } from 'zod';
export const helpRequestSchema = z.object({
 threadId: z.string().uuid(),
 language: z.enum(['ja','en','zh-CN','zh-TW','ko','es','fr']),
 messages: z.array(z.unknown()).min(1).max(100),
});
export function helpUserMessage(input: unknown) {
 return z.object({ id: z.string().min(1).max(200), role: z.literal('user'), parts: z.array(z.object({ type: z.literal('text'), text: z.string().trim().min(1).max(4000) })).min(1).max(1) }).parse(input);
}