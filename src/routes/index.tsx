import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import Onboarding, { type UserProfile } from "@/components/Onboarding";
import Dashboard from "@/components/Dashboard";
import LanguageSelector from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { readMyProfile, saveMyProfile } from "@/lib/profile-storage.functions";
import { profileStorageCopy } from "@/lib/profile-storage-copy";
import { type Language } from "@/lib/translations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "オノレコンパス | 15の占術で自分を知る" },
      {
        name: "description",
        content:
          "生年月日・出生時間・血液型・兄弟構成から、15の占術であなたの本質を解析するパーソナル占術アプリ。",
      },
      { property: "og:title", content: "オノレコンパス | 15の占術で自分を知る" },
      {
        property: "og:description",
        content: "生まれた瞬間の情報から、15の占術であなたの本質を解析します。",
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
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadSequence = useRef(0);
  const queryClient = useQueryClient();
  const read = useServerFn(readMyProfile);
  const save = useServerFn(saveMyProfile);
  const copy = profileStorageCopy[language];

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
          setProfile(next); setError(null);
        }
      } catch {
        if (active && sequence === loadSequence.current) setError("load");
      } finally { if (active && sequence === loadSequence.current) setLoading(false); }
    };
    void load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        if (event === "SIGNED_OUT") { ++loadSequence.current; setProfile(null); setEditing(false); setUserId(null); setLoading(false); setError(null); }
        else window.setTimeout(() => { if (active) void load(); }, 0);
      }
    });
    return () => { active = false; ++loadSequence.current; subscription.unsubscribe(); };
  }, [read]);

  const saveProfile = async (next: UserProfile) => {
    if (userId) await save({ data: next });
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
    await supabase.auth.signOut();
  };

  return (
    <>
      <LanguageSelector language={language} onChange={setLanguage} />
      <div className="fixed left-4 top-4 z-50 max-w-[calc(100vw-9rem)] sm:left-6">
        <Button variant="outline" className="h-10 max-w-full border-primary/40 bg-background/85 px-3 text-xs text-primary backdrop-blur-md" onClick={userId ? signOut : signIn}>
          {userId ? copy.signOut : copy.signIn}
        </Button>
      </div>
      {error && <div role="alert" className="fixed left-4 right-4 top-20 z-50 mx-auto max-w-sm border border-destructive bg-background p-3 text-sm text-destructive">{error === "load" ? copy.loadError : copy.saveError}</div>}
      {loading ? <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">{copy.loading}</div> : profile && !editing ? (
        <Dashboard
          profile={profile}
          onEdit={() => setEditing(true)}
          onProfileChange={saveProfile}
          language={language}
          onLanguageChange={setLanguage}
          signedIn={Boolean(userId)}
        />
      ) : (
        <Onboarding key={userId ?? "guest"} {...(profile ? { initialProfile: profile } : {})} onComplete={saveProfile} language={language} signedIn={Boolean(userId)} />
      )}
    </>
  );
}
