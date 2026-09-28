import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowUpRight, Crown, Radio } from "lucide-react";

import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { consultationTranslations } from "@/lib/consultation-translations";
import type { Language } from "@/lib/translations";
import type { UserProfile } from "./Onboarding";
import compassAvatar from "@/assets/onore-ai-compass.png";

type Props = { profile: UserProfile; language: Language; onVip: () => void };

export default function ConsultationPanel({ profile, language, onVip }: Props) {
  const t = consultationTranslations[language];
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [remaining, setRemaining] = useState(2);
  const [notice, setNotice] = useState<string | null>(null);
  const initialMessages = useMemo<UIMessage[]>(() => [{ id: "welcome", role: "assistant", parts: [{ type: "text", text: t.greeting }] }], [t.greeting]);
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/consultation", body: { profile, language } }), [profile, language]);
  const { messages, sendMessage, status, stop, error, clearError } = useChat({
    id: "onore-single-session",
    messages: initialMessages,
    transport,
    onError: () => setNotice(t.error),
    onFinish: () => textareaRef.current?.focus(),
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const submit = (text: string) => {
    const prompt = text.trim();
    if (!prompt) {
      setNotice(t.empty);
      textareaRef.current?.focus();
      return;
    }
    if (remaining <= 0) {
      setNotice(t.limit);
      return;
    }
    setNotice(null);
    clearError();
    setRemaining(value => Math.max(0, value - 1));
    void sendMessage({ text: prompt });
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  return (
    <section className="mx-auto max-w-4xl pb-8" aria-label={t.title}>
      <div className="text-center">
        <img src={compassAvatar} alt="" width={816} height={816} className="mx-auto size-20 drop-shadow-[0_0_22px_var(--primary)]" />
        <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-primary/70">SELF AI CHAMBER</p>
        <h2 className="mt-2 font-serif text-2xl text-gradient-gold sm:text-3xl">{t.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t.subtitle}</p>
        <div className="mx-auto mt-4 flex w-fit max-w-full items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-2 text-[10px] text-primary shadow-champagne sm:text-xs">
          <span className="relative flex size-2 shrink-0"><span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" /><span className="relative inline-flex size-2 rounded-full bg-primary" /></span>
          <span className="font-semibold">{t.active}</span><span className="text-muted-foreground">· {t.engine}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex items-center gap-3"><Radio className="size-5 shrink-0 text-primary" /><div><p className="text-sm font-semibold text-foreground">{t.remaining(remaining)}</p><p className="mt-0.5 text-[10px] text-muted-foreground">SESSION PREVIEW</p></div></div>
        <Button variant="outline" onClick={onVip} className="min-h-10 whitespace-normal border-primary/30 bg-background/40 px-3 text-xs text-primary hover:bg-primary/10 hover:text-primary"><Crown className="size-4" />{t.vip}</Button>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs font-medium text-primary/80">{t.quickLabel}</p>
        <div className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
          {t.quick.map(prompt => <Button key={prompt} type="button" variant="outline" disabled={busy || remaining <= 0} onClick={() => submit(prompt)} className="h-auto min-w-60 snap-start justify-between whitespace-normal rounded-lg border-primary/20 bg-card/55 px-4 py-3 text-left text-xs leading-5 text-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary"><span>{prompt}</span><ArrowUpRight className="size-4 shrink-0 text-primary" /></Button>)}
        </div>
      </div>

      <div className="card-lux mt-5 flex h-[min(58vh,610px)] min-h-[430px] flex-col overflow-hidden rounded-lg">
        <Conversation className="min-h-0">
          <ConversationContent className="gap-5 px-4 py-6 sm:px-6">
            {messages.map(message => <Message key={message.id} from={message.role}>
              {message.role === "assistant" ? <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/75"><img src={compassAvatar} alt="" width={816} height={816} loading="lazy" className="size-8 drop-shadow-[0_0_8px_var(--primary)]" />AI ONORE</div> : null}
              <MessageContent className={message.role === "user" ? "border border-primary/25 bg-primary text-primary-foreground shadow-champagne" : "max-w-2xl leading-7"}>
                {message.parts.map((part, index) => part.type === "text" ? <MessageResponse key={`${message.id}-${index}`}>{part.text}</MessageResponse> : null)}
              </MessageContent>
            </Message>)}
            {status === "submitted" ? <Message from="assistant"><div className="flex items-center gap-3"><img src={compassAvatar} alt="" width={816} height={816} loading="lazy" className="size-8 drop-shadow-[0_0_8px_var(--primary)]" /><Shimmer className="text-sm">{t.thinking}</Shimmer></div></Message> : null}
            {error || notice ? <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">{notice ?? error?.message}</p> : null}
          </ConversationContent>
          <ConversationScrollButton className="border-primary/30 bg-card text-primary hover:bg-primary/10" />
        </Conversation>

        <div className="border-t border-primary/15 bg-background/70 p-3 backdrop-blur-xl sm:p-4">
          <PromptInput onSubmit={({ text }) => submit(text)} className="rounded-lg border-primary/30 bg-card/80 shadow-champagne">
            <PromptInputTextarea ref={textareaRef} placeholder={t.placeholder} disabled={remaining <= 0} className="min-h-20 text-sm text-foreground placeholder:text-muted-foreground" />
            <PromptInputFooter className="justify-between px-3 pb-2">
              <span className="text-[10px] text-muted-foreground">{t.disclaimer}</span>
              <PromptInputSubmit status={status} onStop={stop} disabled={!busy && remaining <= 0} aria-label={t.send} className="size-9 rounded-full bg-champagne-gradient text-primary-foreground shadow-champagne hover:brightness-110" />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
      <p className="mt-3 text-center text-[10px] leading-5 text-muted-foreground">{t.disclaimer}</p>
    </section>
  );
}