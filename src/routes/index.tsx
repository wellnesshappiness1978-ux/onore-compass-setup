import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import Onboarding, { type UserProfile } from "@/components/Onboarding";
import Dashboard from "@/components/Dashboard";

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

function Index() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  return profile ? (
    <Dashboard profile={profile} onEdit={() => setProfile(null)} />
  ) : (
    <Onboarding onComplete={setProfile} />
  );
}
