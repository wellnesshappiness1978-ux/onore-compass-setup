import { useEffect, useMemo, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { supabase } from '@/integrations/supabase/client';
import { helpCopy } from '@/lib/help-copy';
import type { Language } from '@/lib/translations';
import { Conversation, ConversationContent, ConversationScrollButton } from './ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from './ai-elements/message';
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from './ai-elements/prompt-input';
import { Tool, ToolContent } from './ai-elements/tool';
import { CollapsibleTrigger } from './ui/collapsible';
import { Shimmer } from './ai-elements/shimmer';
import { Button } from './ui/button';
export default function HelpChat({threadId,language,initialMessages,onComplete}:{threadId:string;language:Language;initialMessages:UIMessage[];onComplete:()=>void}){
 const t=helpCopy[language];const input=useRef<HTMLTextAreaElement>(null);
 const transport=useMemo(()=>new DefaultChatTransport({api:'/api/support-chat',body:{threadId,language},headers:async()=>{const {data}=await supabase.auth.getSession();return data.session?{Authorization:`Bearer ${data.session.access_token}`}:{ };}}),[threadId,language]);
 const {messages,sendMessage,status,error,stop}=useChat({id:threadId,messages:initialMessages,transport,onFinish:onComplete});
 const busy=status==='submitted'||status==='streaming';
 useEffect(()=>{if(!busy)input.current?.focus({preventScroll:true});},[busy,threadId]);
 const escalate=()=>window.dispatchEvent(new Event('agolmen-support-escalate'));
 return <div className="flex min-w-0 flex-col gap-3"><Conversation className="h-[min(55dvh,520px)] min-h-56 flex-none rounded-md border border-border"><ConversationContent className="gap-5 p-4">{messages.map(message=><Message key={message.id} from={message.role}><MessageContent className="group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground">{message.parts.map((part,i)=>{
 if(part.type==='text')return <MessageResponse key={i}>{part.text}</MessageResponse>;
 if(part.type==='reasoning')return <details key={i} className="text-xs text-muted-foreground"><summary>{t.reasoning}</summary><MessageResponse>{part.text}</MessageResponse></details>;
 if(part.type==='tool-administrator')return <Tool key={i} defaultOpen={false}><CollapsibleTrigger asChild><Button variant="ghost" className="h-auto min-h-11 w-full whitespace-normal text-left text-primary">{part.state==='output-error'?t.error:t.escalationNotice}</Button></CollapsibleTrigger><ToolContent><p className="mb-2 text-sm text-muted-foreground">{'errorText' in part?String(part.errorText):t.escalationNotice}</p><Button variant="outline" onClick={escalate}>{t.escalate}</Button></ToolContent></Tool>;
 return null;
 })}</MessageContent></Message>)}{busy&&<Shimmer className="text-sm">{t.thinking}</Shimmer>}</ConversationContent><ConversationScrollButton/></Conversation>{error&&<div role="alert" className="text-sm text-destructive"><p>{error.message}</p><Button variant="outline" className="mt-2" onClick={escalate}>{t.escalate}</Button></div>}<PromptInput onSubmit={async({text})=>{if(!text.trim()||busy)return;const sending=sendMessage({text});input.current?.focus({preventScroll:true});await sending;}}><PromptInputTextarea ref={input} aria-label={t.placeholder} placeholder={t.placeholder} maxLength={4000} disabled={busy}/><PromptInputFooter className="justify-end"><PromptInputSubmit status={status} onStop={()=>void stop()} aria-label={busy?t.stop:t.send} title={busy?t.stop:t.send} className="size-9 shrink-0"/></PromptInputFooter></PromptInput></div>;
}