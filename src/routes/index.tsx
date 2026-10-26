import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import Onboarding, { type UserProfile } from "@/components/Onboarding";
import Dashboard from "@/components/Dashboard";
import { AgolmenLoading } from "@/components/AgolmenSpiral";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { readMyProfile, saveMyProfile } from "@/lib/profile-storage.functions";
import { profileStorageCopy } from "@/lib/profile-storage-copy";
import { clearReadingCaches } from "@/lib/reading-cache";
import { type Language } from "@/lib/translations";
import { useAccountSync } from '@/hooks/use-account-sync';

const pageTitles: Record<Language, string> = { ja: "アゴルメンの羅針盤 | 自分を知る・今日を整える", en: "Agolmen's Compass | Know yourself, shape today", "zh-CN": "阿戈尔曼罗盘｜认识自己，调整今天", "zh-TW": "阿戈爾曼羅盤｜認識自己，調整今天", ko: "아골멘의 나침반 | 나를 알고 오늘을 정돈하다", es: "La brújula de Agolmen | Conócete y orienta tu día", fr: "La boussole d’Agolmen | Se connaître et orienter sa journée" };

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "アゴルメンの羅針盤 | 自分を知る・今日を整える" },
      {
        name: "description",
        content:
          "出生情報からの個別診断、毎日の参考ガイド、天体配置のアートとチーム分析を一つに。アゴルメンの羅針盤で自分を知り、今日を整える。",
      },
      { property: "og:title", content: "アゴルメンの羅針盤 | 自分を知る・今日を整える" },
      {
        property: "og:description",
        content: "個別診断・毎日の参考ガイド・出生天体アート・チーム分析を一つにまとめたアゴルメンの羅針盤。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const LOCAL_KEY = "onore-profile";
const readLocal = (): UserProfile | null => {
  try { const raw = window.localStorage.getItem(LOCAL_KEY); return raw ? (JSON.parse(raw) as UserProfile) : null; } catch { return null; }
};
const writeLocal = (p: UserProfile | null) => {
  try { if (p) window.localStorage.setItem(LOCAL_KEY, JSON.stringify(p)); else window.localStorage.removeItem(LOCAL_KEY); } catch { /* ignore */ }
};

function Index() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [language, setLanguage] = useState<Language>("ja");
  useEffect(() => { const stored = localStorage.getItem("onore-language"); if (stored && ["ja","en","zh-TW","zh-CN","ko","es","fr"].includes(stored)) { setLanguage(stored as Language); document.documentElement.lang = stored; } }, []);
  const initialLanguageRender = useRef(true);
  useEffect(() => {
    if (initialLanguageRender.current) { initialLanguageRender.current = false; return; }
    document.documentElement.lang = language;
    document.title = pageTitles[language];
    localStorage.setItem("onore-language", language);
    window.dispatchEvent(new CustomEvent("onore-language-change", { detail: language }));
  }, [language]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadSequence = useRef(0);
  const loadedUser = useRef<string | null>(null);
  const queryClient = useQueryClient();
  const read = useServerFn(readMyProfile);
  const save = useServerFn(saveMyProfile);
  const copy = profileStorageCopy[language];
  useAccountSync(userId, async () => {
    const owner = loadedUser.current;
    if (!owner) return;
    try {
      const saved = await read();
      if (loadedUser.current !== owner) return;
      writeLocal(saved as UserProfile | null);
      setProfile(current => JSON.stringify(current) === JSON.stringify(saved) ? current : saved as UserProfile | null);
    } catch { /* Retain the last successful profile while offline. */ }
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      const sequence = ++loadSequence.current;
      setLoading(true);
      const { data, error: authError } = await supabase.auth.getUser();
      if (!active || sequence !== loadSequence.current) return;
      if (authError || !data.user) {
        setUserId(null);
        setProfile(readLocal());
        setEditing(false);
        setLoading(false);
        return;
      }
      setUserId(data.user.id);
      setProfile(null);
      setEditing(false);
      try {
        const saved = (await read()) as UserProfile | null;
        if (active && sequence === loadSequence.current) {
          const next = saved ?? readLocal();
          if (saved) writeLocal(saved);
          loadedUser.current = data.user.id;
          setProfile(next); setError(null);
        }
      } catch {
        if (active && sequence === loadSequence.current) setError("load");
      } finally { if (active && sequence === loadSequence.current) setLoading(false); }
    };
    void load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        if (event === "SIGNED_OUT") { loadedUser.current = null; clearReadingCaches(); ++loadSequence.current; setProfile(null); setEditing(false); setUserId(null); setLoading(false); setError(null); }
        // SIGNED_IN is re-emitted when the browser tab regains focus; keep the mounted screens
        // (and every loaded reading) unless the signed-in person actually changed.
        else if (session?.user.id && session.user.id === loadedUser.current) return;
        else window.setTimeout(() => { if (active) void load(); }, 0);
      }
    });
    return () => { active = false; ++loadSequence.current; subscription.unsubscribe(); };
  }, [read]);

  const saveProfile = async (next: UserProfile) => {
    if (userId) {
      const saved = await save({ data: next });
      next = { ...next, father: saved.father, mother: saved.mother };
    }
    writeLocal(next);
    setProfile(next);
    setEditing(false);
  };

  const signIn = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) setError("auth");
  };
  const signOut = async () => {
    ++loadSequence.current;
    await queryClient.cancelQueries();
    queryClient.clear();
    setProfile(null);
    setUserId(null);
    setEditing(false);
    writeLocal(null);
    clearReadingCaches();
    await supabase.auth.signOut();
  };

  return (
    <>
      <div className="account-controls fixed left-4 z-50 max-w-[calc(100vw-9rem)] sm:left-6">
        <Button variant="outline" className="h-10 max-w-full border-primary/40 bg-background/85 px-3 text-xs text-primary backdrop-blur-md" onClick={userId ? signOut : signIn}>
          {userId ? copy.signOut : copy.signIn}
        </Button>
      </div>
      {error && <div role="alert" className="app-alert fixed left-4 right-4 z-50 mx-auto max-w-sm border border-destructive bg-background p-3 text-sm text-destructive">{error === "load" ? copy.loadError : copy.saveError}</div>}
      {loading ? <AgolmenLoading label={copy.loading} /> : profile && !editing ? (
        <Dashboard
          profile={profile}
          onEdit={() => setEditing(true)}
          onProfileChange={saveProfile}
          language={language}
          onLanguageChange={setLanguage}
          signedIn={Boolean(userId)}
        />
      ) : (
        <Onboarding key={userId ?? "guest"} {...(profile ? { initialProfile: profile } : {})} onComplete={saveProfile} language={language} onLanguageChange={setLanguage} signedIn={Boolean(userId)} />
      )}
    </>
  );
}
