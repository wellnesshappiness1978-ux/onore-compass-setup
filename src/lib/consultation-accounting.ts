/** A completed, nonempty answer only; partial, refused and cancelled streams cost no use. */
export function consultationSucceeded(event: {
  isAborted: boolean;
  isCancelled?: boolean;
  outcome: { status: string };
  finishReason?: string;
  responseMessage: { parts: Array<{ type: string; text?: string }> };
}) {
  return !event.isAborted && !event.isCancelled && event.outcome.status === 'completed'
    && event.finishReason === 'stop'
    && event.responseMessage.parts.some(part => part.type === 'text' && Boolean(part.text?.trim()));
}

/** One terminal settlement even if abort and stream completion race. */
export function consultationSettlement(settle: (success: boolean) => Promise<unknown>) {
  let terminal: Promise<unknown> | undefined;
  return (success: boolean) => terminal ??= settle(success);
}