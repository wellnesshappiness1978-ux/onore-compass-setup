import * as React from "react";

import { cn } from "@/lib/utils";
import { isImeInput } from "@/lib/ime-input";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, onKeyDown, onCompositionStart, onCompositionEnd, ...props }, ref) => {
    const composing = React.useRef(false);
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
        onCompositionStart={event => { composing.current = true; onCompositionStart?.(event); }}
        onCompositionEnd={event => { composing.current = false; onCompositionEnd?.(event); }}
        onKeyDown={event => { if (!isImeInput(event.nativeEvent, composing.current)) onKeyDown?.(event); }}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
