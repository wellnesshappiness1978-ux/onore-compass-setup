import { useEffect, useMemo, useRef, useState } from "react";
import { CLOUD_SYNC_EVENT } from '@/lib/account-sync';
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowUpRight, Bookmark, BookmarkCheck, Crown, Radio, Trash2 } from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { AgolmenLoading } from "@/components/AgolmenSpiral";
import { Button } from "@/components/ui/button";
import { consultationTranslations } from "@/lib/consultation-translations";
import { consultationGoal } from "@/lib/consultation-request";
import type { Plan } from "@/lib/design-modes";
import { nextPlan, planOrder } from "@/lib/plans";
import { normalizePlan } from '@/lib/plan-identity';
import { useDailyUsage, msUntilMidnight } from "@/hooks/use-daily-usage";
import { teamCopy } from "@/lib/team-copy";
import type { Language } from "@/lib/translations";
import type { UserProfile } from "./Onboarding";
import compassAvatar from "@/assets/onore-ai-compass.png";
import ConsultationVoice from "./ConsultationVoice";
import { MANUAL_PARTNER_ID, MANUAL_CONSULT_EVENT } from "@/lib/consultation-targets";
import { listTeamMembers } from "@/lib/team-members.functions";
import { readPreviewMembers } from "@/lib/consultation-targets";
import { ownerAsMember, useFocus } from "./FocusProvider";
import { SELF_MEMBER_ID } from "@/lib/group-insight";
import { groupDisplayName, memberDisplayName } from "@/lib/focus";
import { consultationUxCopy } from "@/lib/consultation-ux-copy";
import { useServerFn } from "@tanstack/react-start";
import type { TeamMember } from "@/lib/team-analysis";
import { supabase } from "@/integrations/supabase/client";
import {
  listConsultationBookmarks,
  saveConsultationBookmark,
  deleteConsultationBookmark,
} from "@/lib/consultation-bookmarks.functions";
import { consultationCard } from "@/lib/consultation-card";
import ShareCardButton from "./ShareCardButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  groupSubject?: import("@/lib/focus").TeamGroup;
  profile: UserProfile;
  language: Language;
  plan: Plan;
  actualPlan: Plan;
  signedIn: boolean;
  previewMode?: boolean;
  onVip: () => void;
};

const untilMidnight = msUntilMidnight;
const hms = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [s / 3600, (s % 3600) / 60, s % 60]
    .map((v) => String(Math.floor(v)).padStart(2, "0"))
    .join(":");
};

export default function ConsultationPanel({
  profile,
  groupSubject,
  language,
  plan: inputPlan,
  actualPlan: inputActualPlan,
  signedIn,
  previewMode = false,
  onVip,
  focusTargetId = null,
  goal = "",
}: Props & { focusTargetId?: string | null; goal?: string }) {
  const plan = normalizePlan(inputPlan);
  const actualPlan = normalizePlan(inputActualPlan);
  const listMembers = useServerFn(listTeamMembers);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [targetId, setTargetId] = useState("owner");
  // A partner typed into the compatibility form; device-only, never saved to the roster.
  const [manualPartner, setManualPartner] = useState<TeamMember | null>(null);
  const manualActive = useRef(false);
  useEffect(() => {
    const onManual = (event: Event) => {
      const detail = (event as CustomEvent<TeamMember>).detail;
      if (!detail?.birthDate) return;
      manualActive.current = true;
      setManualPartner({ ...detail, id: MANUAL_PARTNER_ID });
      setTargetId(MANUAL_PARTNER_ID);
    };
    window.addEventListener(MANUAL_CONSULT_EVENT, onManual);
    return () => window.removeEventListener(MANUAL_CONSULT_EVENT, onManual);
  }, []);
  useEffect(() => { manualActive.current = targetId === MANUAL_PARTNER_ID; }, [targetId]);
  const focusCtx = useFocus();
  const [rosterTick, setRosterTick] = useState(0);
  useEffect(() => {
    const onReload = () => setRosterTick((v) => v + 1);
    window.addEventListener("onore-focus-reload", onReload);
    return () => window.removeEventListener("onore-focus-reload", onReload);
  }, []);
  const groups = useMemo(() => groupSubject ? [groupSubject] : focusCtx?.groups ?? [], [groupSubject, focusCtx?.groups]);
  useEffect(() => {
    let active = true;
    if (signedIn && plan === actualPlan)
      listMembers()
        .then((rows) => {
          if (active) setMembers(rows);
        })
        .catch(() => {
          if (active) setMembers([]);
        });
    else setMembers(readPreviewMembers());
    return () => {
      active = false;
    };
  }, [signedIn, plan, actualPlan, listMembers, rosterTick]);
  useEffect(() => {
    if (targetId === "owner" || targetId === MANUAL_PARTNER_ID) return;
    if (targetId.startsWith("group:")) {
      if (!groups.some((g) => g.id === targetId.slice(6))) setTargetId("owner");
    } else if (!members.some((m) => m.id === targetId)) setTargetId("owner");
  }, [members, groups, targetId]);
  useEffect(() => {
    if (manualActive.current) return;
    if (groupSubject) { setTargetId(`group:${groupSubject.id}`); return; }
    if (focusCtx?.group) setTargetId(`group:${focusCtx.group.group.id}`);
    else if (focusTargetId && members.some((m) => m.id === focusTargetId)) setTargetId(focusTargetId);
    else if (focusCtx?.focus.targetKind === "self") setTargetId("owner");
  }, [groupSubject, focusTargetId, members, focusCtx?.group?.group.id, focusCtx?.focus.targetKind]);
  const target = targetId === MANUAL_PARTNER_ID && manualPartner ? manualPartner : members.find((m) => m.id === targetId);
  const selGroupIndex = targetId.startsWith("group:") ? groups.findIndex((g) => g.id === targetId.slice(6)) : -1;
  const selGroup = selGroupIndex >= 0 ? groups[selGroupIndex] ?? null : null;
  const selGroupMembers = useMemo(
    () => (selGroup ? [...(selGroup.memberIds.includes(SELF_MEMBER_ID) && profile.birthDate ? [ownerAsMember(profile)] : []), ...(focusCtx?.members ?? members).filter((m) => selGroup.memberIds.includes(m.id))] : []),
    [selGroup, focusCtx?.members, members, profile],
  );
  const targetProfile = useMemo(
    () =>
      target
        ? {
            ...profile,
            nameKanji: target.name,
            nameKana: target.nameKana ?? "",
            nameRomaji: "",
            birthDate: target.birthDate,
            birthTime: target.birthTime ?? "",
            birthTimeUnknown: target.birthTimeUnknown ?? true,
            birthPlace: target.birthPlace ?? "",
            birthCity: target.birthCity ?? "",
            bloodType: target.bloodType,
            siblingOrder: target.siblingOrder ?? "",
            father: target.father ?? null,
            mother: target.mother ?? null,
            gender: target.gender ?? "undisclosed",
          }
        : profile,
    [target, profile],
  );
  const targetLabel = target ? memberDisplayName(target) : (selGroup ? groupDisplayName(selGroup, selGroupIndex, language) : consultationTranslations[language].ownerLabel);
  const effectiveGoal = consultationGoal(goal);
  const t = consultationTranslations[language];
  const planNames = teamCopy[language].planNames;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const ux = consultationUxCopy[language];
  const usagePlan = signedIn ? actualPlan : plan;
  const usage = useDailyUsage("consultation", usagePlan, signedIn);
  const { limit, unlimited, remaining } = usage;
  const sendRemaining = remaining;
  const [countdown, setCountdown] = useState(untilMidnight());
  useEffect(() => {
    const id = window.setInterval(() => setCountdown(untilMidnight()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const limitPlan = signedIn ? actualPlan : usagePlan;
  const upgradeTo =
    planOrder.indexOf(limitPlan) < planOrder.indexOf("vip") ? "vip" : nextPlan(limitPlan);
  const [limitOpen, setLimitOpen] = useState(false);
  useEffect(() => {
    if (sendRemaining > 0) { setLimitOpen(false); setNotice(null); }
  }, [usagePlan, actualPlan, sendRemaining]);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [favorites, setFavorites] = useState<Awaited<ReturnType<typeof listConsultationBookmarks>>>(
    [],
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const listFavorites = useServerFn(listConsultationBookmarks);
  const saveFavorite = useServerFn(saveConsultationBookmark);
  const deleteFavorite = useServerFn(deleteConsultationBookmark);
  useEffect(() => {
    let active = true;
    setFavorites([]);
    const refresh = () => { if (signedIn)
      void listFavorites()
        .then((rows) => {
          if (active) setFavorites(rows);
        })
        .catch(() => {
          if (active) setNotice(t.bookmarkError);
        }); };
    refresh();
    window.addEventListener(CLOUD_SYNC_EVENT,refresh);
    return () => {
      active = false;
      window.removeEventListener(CLOUD_SYNC_EVENT,refresh);
    };
  }, [signedIn, listFavorites, t.bookmarkError]);
  const [notice, setNotice] = useState<string | null>(null);
  const initialMessages = useMemo<UIMessage[]>(
    () => [{ id: "welcome", role: "assistant", parts: [{ type: "text", text: t.greeting }] }],
    [t.greeting],
  );
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/consultation",
        headers: async () => {
          const { data } = await supabase.auth.getSession();
          return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
        },
        body: () => ({
          profile: targetProfile,
          ownerProfile: target ? profile : undefined,
          targetLabel,
          goal: effectiveGoal,
          language,
          day: new Date().toLocaleDateString("en-CA"),
          group: selGroup ? { name: targetLabel.slice(0, 60), members: selGroupMembers.filter((m) => /^\d{4}-\d{2}-\d{2}$/.test(m.birthDate)).slice(0, 101).map((m) => ({ name: memberDisplayName(m).slice(0, 40), nameRomaji: m.id === SELF_MEMBER_ID ? profile.nameRomaji : '', father: m.father ?? null, mother: m.mother ?? null, birthDate: m.birthDate, birthTime: m.birthTimeUnknown === false ? (m.birthTime ?? "").slice(0, 5) : "", birthTimeUnknown: m.birthTimeUnknown ?? true, birthPlace: (m.birthPlace ?? "").slice(0, 80), birthCity: (m.birthCity ?? "").slice(0, 80), bloodType: m.bloodType ?? "", gender: m.gender ?? "undisclosed", siblingOrder: (m.siblingOrder ?? "").slice(0, 80), relationship: (m.relationship ?? "").slice(0, 60), relationshipType: (m.relationshipType ?? "").slice(0, 30) })) } : undefined,
        }),
      }),
    [targetProfile, profile, targetLabel, language, target, effectiveGoal, selGroup, selGroupMembers],
  );
  const { messages, sendMessage, status, stop, error, clearError, setMessages } = useChat({
    id: `onore-consult-${targetId}-${language}`,
    messages: initialMessages,
    transport,
    onError: (failure) => {
      let message = failure.message;
      try {
        const detail = JSON.parse(message);
        message = detail.message ?? message;
        if (detail.code === "daily_limit") setLimitOpen(true);
      } catch {
        /* Already human-readable. */
      }
      setNotice(message || t.error);
      void usage.refresh();
    },
    onFinish: () => {
      void usage.refresh();
      textareaRef.current?.focus({ preventScroll: true });
    },
  });
  useEffect(() => {
    setMessages(initialMessages);
    clearError();
  }, [targetId, language, setMessages, clearError, initialMessages]);
  const busy = status === "submitted" || status === "streaming";

  const submit = async (text: string) => {
    const prompt = text.trim();
    if (busy) return;
    if (!prompt) {
      setNotice(t.empty);
      textareaRef.current?.focus({ preventScroll: true });
      return;
    }
    const current = await usage.refresh();
    if (!current) { setNotice(t.error); return; }
    if (current.remaining <= 0) {
      setNotice(t.limit);
      setLimitOpen(true);
      return;
    }
    setNotice(null);
    clearError();
    if (!signedIn && !(await usage.consume())) {
      setNotice(t.limit);
      setLimitOpen(true);
      return;
    }
    await sendMessage({ text: prompt });
    requestAnimationFrame(() => textareaRef.current?.focus({ preventScroll: true }));
  };

  const toggleFavorite = async (messageId: string, content: string) => {
    if (!signedIn) {
      setNotice(t.bookmarkSignIn);
      return;
    }
    if (savingId) return;
    setSavingId(messageId);
    try {
      if (favorites.some((f) => f.message_id === messageId)) {
        await deleteFavorite({ data: { messageId } });
        setFavorites((rows) => rows.filter((row) => row.message_id !== messageId));
      } else {
        await saveFavorite({ data: { messageId, content, language } });
        setFavorites(await listFavorites());
      }
    } catch {
      setNotice(t.bookmarkError);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="mx-auto max-w-4xl pb-8" aria-label={t.title}>
      <div className="text-center">
        <img
          src={compassAvatar}
          alt=""
          width={816}
          height={816}
          className="mx-auto size-20 drop-shadow-[0_0_22px_var(--primary)]"
        />
        <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-primary/70">
          {language === "ja" ? "アゴルメン相談室" : "AGOLMEN AI CHAMBER"}
        </p>
        <h2 className="mt-2 font-serif text-2xl text-gradient-gold sm:text-3xl">{t.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t.subtitle}</p>
        <div className="mx-auto mt-4 flex w-fit max-w-full items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-2 text-[10px] text-primary shadow-champagne sm:text-xs">
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <span className="font-semibold">{t.active}</span>
          <span className="text-muted-foreground">· {t.engine}</span>
        </div>
      </div>

      <div className="mt-6 border-y border-primary/20 py-4">
        <label htmlFor="consult-target" className="mb-2 block font-serif text-sm text-primary">
          {t.targetLabel}
        </label>
        <select
          id="consult-target"
          className="w-full rounded-md border border-primary/30 bg-card px-3 py-3 text-foreground"
          value={targetId}
          onChange={(e) => {
            stop();
            setTargetId(e.target.value);
            setNotice(null);
          }}
        >
          <option value="owner">{consultationTranslations[language].ownerLabel}</option>
          {manualPartner && <option value={MANUAL_PARTNER_ID}>{memberDisplayName(manualPartner)} · {manualPartner.birthDate}</option>}
          {members.length > 0 && (
            <optgroup label={language === "ja" ? "登録ファミリー" : "Registered family"}>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {memberDisplayName(m)} · {m.role || m.birthDate}
                </option>
              ))}
            </optgroup>
          )}
          {groups.length > 0 && (
            <optgroup label={language === "ja" ? "登録グループ" : "Registered groups"}>
              {groups.map((g, i) => (
                <option key={g.id} value={`group:${g.id}`}>
                  {groupDisplayName(g, i, language)} · {g.memberIds.length}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        {selGroup && (
          <p className="mt-2 text-xs text-muted-foreground">
            {selGroupMembers.length
              ? selGroupMembers.map((m) => m.nickname || m.name).join(language === "ja" ? "・" : ", ")
              : language === "ja"
                ? "このグループにはまだメンバーがいません。"
                : "This group has no members yet."}
          </p>
        )}
        {target && (
          <p className="mt-2 text-xs text-muted-foreground">
            {target.birthDate}
            {target.birthTimeUnknown === false && target.birthTime ? ` · ${target.birthTime}` : ""}
            {target.birthPlace
              ? ` · ${target.birthPlace}${target.birthCity ? ` ${target.birthCity}` : ""}`
              : ""}
          </p>
        )}
      </div>
      <div className="mt-4 flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-primary/20 pb-4">
        <div
          role="status"
          className="flex min-w-0 items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary"
        >
          <Radio className="size-4 shrink-0" />
          <span>{unlimited ? t.unlimitedBadge : t.badge(remaining)}</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => setFavoritesOpen(true)}>
          <Bookmark className="size-4" />
          {t.bookmarked} · {favorites.length}
        </Button>
        {!unlimited && (
          <p className="w-full text-xs text-muted-foreground">
            {planNames[usagePlan]} · {remaining}/{limit}<br />{ux.reset(hms(countdown))}
          </p>
        )}
        {previewMode && signedIn && <p className="w-full text-xs leading-5 text-muted-foreground">{ux.preview}</p>}
        {!unlimited && remaining <= 0 && (
          <Button variant="champagne" onClick={() => setLimitOpen(true)}>
            <Crown className="size-4" />
            {t.modalTitle}
          </Button>
        )}
      </div>

      <div className="card-lux mt-5 flex h-[min(76dvh,850px)] min-h-[530px] min-w-0 flex-col overflow-hidden rounded-lg">
        <Conversation className="min-h-0">
          <ConversationContent className="gap-5 px-4 py-6 sm:px-6">
            {messages.map((message) => (
              <Message key={message.id} from={message.role}>
                {message.role === "assistant" ? (
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/75">
                    <img
                      src={compassAvatar}
                      alt=""
                      width={816}
                      height={816}
                      loading="lazy"
                      className="size-8 drop-shadow-[0_0_8px_var(--primary)]"
                    />
                    {language === "ja" ? "アゴルメン AI" : "AGOLMEN AI"}
                  </div>
                ) : null}
                <MessageContent
                  className={
                    message.role === "user"
                      ? "border border-primary/25 bg-primary text-primary-foreground shadow-champagne"
                      : "max-w-2xl leading-7"
                  }
                >
                  {message.parts.map((part, index) =>
                    part.type === "text" ? (
                      <MessageResponse key={`${message.id}-${index}`}>{part.text}</MessageResponse>
                    ) : null,
                  )}
                </MessageContent>
                {message.role === "assistant" && message.id !== "welcome" && status === "ready" && (
                  <MessageActions className="ml-auto justify-end">
                    <MessageAction
                      tooltip={
                        favorites.some((f) => f.message_id === message.id)
                          ? t.bookmarked
                          : t.bookmark
                      }
                      disabled={savingId !== null}
                      onClick={() =>
                        void toggleFavorite(
                          message.id,
                          message.parts
                            .filter((part) => part.type === "text")
                            .map((part) => part.text)
                            .join("\n"),
                        )
                      }
                      aria-pressed={favorites.some((f) => f.message_id === message.id)}
                    >
                      {favorites.some((f) => f.message_id === message.id) ? (
                        <BookmarkCheck className="size-4 text-primary" />
                      ) : (
                        <Bookmark className="size-4" />
                      )}
                    </MessageAction>
                    <ShareCardButton
                      iconOnly
                      autoOpen={false}
                      className="size-9 shrink-0 text-primary"
                      label={t.shareCard}
                      language={language}
                      data={consultationCard(
                        message.parts
                          .filter((part) => part.type === "text")
                          .map((part) => part.text)
                          .join("\n"),
                        targetProfile,
                        language,
                        plan,
                      )}
                    />
                  </MessageActions>
                )}
                {message.role === "assistant" &&
                  message.id !== "welcome" &&
                  planOrder.indexOf(plan) >= planOrder.indexOf("vip") &&
                  status === "ready" && (
                    <ConsultationVoice
                      key={`${message.id}-${language}`}
                      text={message.parts
                        .filter((part) => part.type === "text")
                        .map((part) => part.text)
                        .join(" ")}
                      language={language}
                    />
                  )}
              </Message>
            ))}
            {status === "submitted" ? (
              <Message from="assistant">
                <AgolmenLoading compact label={t.thinking} />
              </Message>
            ) : null}
            {error || notice ? (
              <p
                role="alert"
                className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground"
              >
                {notice ?? error?.message}
              </p>
            ) : null}
          </ConversationContent>
          <ConversationScrollButton className="border-primary/30 bg-card text-primary hover:bg-primary/10" />
        </Conversation>

        <div className="min-w-0 border-t border-primary/15 bg-background/70 p-3 backdrop-blur-xl sm:p-4">
          <div
            aria-label={t.quickLabel}
            className="mb-3 flex snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]"
          >
            {t.quickTopics.map((prompt, index) => (
              <Button
                key={prompt}
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  void submit(index === 1 && target ? `${prompt} · ${target.name}` : prompt)
                }
                className="h-auto min-h-11 w-60 shrink-0 snap-start justify-between whitespace-normal border-primary/30 px-3 py-2 text-left text-xs leading-5"
              >
                <span>{prompt}</span>
                <ArrowUpRight className="size-4 shrink-0" />
              </Button>
            ))}
          </div>
          <PromptInput
            onSubmit={({ text }) => submit(text)}
            className="rounded-lg border-primary/30 bg-card/80 shadow-champagne"
          >
            <PromptInputTextarea
              ref={textareaRef}
              placeholder={t.placeholder}
              disabled={sendRemaining <= 0}
              className="min-h-20 text-sm text-foreground placeholder:text-muted-foreground"
            />
            <PromptInputFooter className="items-end justify-between gap-3 px-3 pb-2">
              <span className="min-w-0 text-[10px] leading-4 text-muted-foreground">
                {t.disclaimer}
              </span>
              <PromptInputSubmit
                status={status}
                onStop={stop}
                disabled={!busy && sendRemaining <= 0}
                aria-label={t.send}
                className="size-9 shrink-0 rounded-full bg-champagne-gradient text-primary-foreground shadow-champagne hover:brightness-110"
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
      <p className="mt-3 text-center text-[10px] leading-5 text-muted-foreground">{t.disclaimer}</p>
      <Dialog open={limitOpen} onOpenChange={setLimitOpen}>
        <DialogContent className="max-w-md border-primary/40">
          <DialogHeader>
            <Crown className="mb-2 size-8 text-primary" />
            <DialogTitle className="font-serif leading-7">{t.modalTitle}</DialogTitle>
            <DialogDescription className="leading-6">
              {planOrder.indexOf(limitPlan) < planOrder.indexOf("vip") ? t.modalBody : t.limit}
            </DialogDescription>
          </DialogHeader>
          <p className="text-center text-sm leading-6 text-primary">{ux.reset(hms(countdown))}</p>
          {upgradeTo && (
            <Button
              variant="champagne"
              onClick={() => {
                setLimitOpen(false);
                onVip();
              }}
            >
              <Crown className="size-4" />
              {planOrder.indexOf(limitPlan) < planOrder.indexOf("vip")
                ? t.modalCta
                : planNames[upgradeTo]}
            </Button>
          )}
          <Button variant="outline" onClick={() => setLimitOpen(false)}>
            {t.modalClose}
          </Button>
          <p className="text-xs leading-5 text-muted-foreground">{t.modalNote}</p>
        </DialogContent>
      </Dialog>
      <Dialog open={favoritesOpen} onOpenChange={setFavoritesOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t.bookmarked} · {favorites.length}
            </DialogTitle>
            <DialogDescription>{signedIn ? t.disclaimer : t.bookmarkSignIn}</DialogDescription>
          </DialogHeader>
          {favorites.map((favorite) => (
            <div key={favorite.message_id} className="min-w-0 border-b border-primary/20 pb-4">
              <MessageResponse className="text-sm leading-7">{favorite.content}</MessageResponse>
              <div className="mt-2 flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  title={t.bookmarked}
                  aria-label={t.bookmarked}
                  disabled={savingId !== null}
                  onClick={() => void toggleFavorite(favorite.message_id, favorite.content)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </DialogContent>
      </Dialog>
    </section>
  );
}
