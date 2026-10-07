import { createFileRoute, Link } from "@tanstack/react-router";
import SupportForm from "@/components/SupportForm";
import { useEffect, useState } from "react";
import { storedLanguage, supportCopy } from "@/lib/support-copy";
import type { Language } from "@/lib/translations";
export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "お問い合わせ | アゴルメンの羅針盤" }, { name: "description", content: "アゴルメンの羅針盤の不具合、アカウント、個人情報に関するお問い合わせ受付。" }, { property: "og:title", content: "お問い合わせ | アゴルメンの羅針盤" }, { property: "og:description", content: "お問い合わせの送信と本人専用の受付履歴。" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: SupportPage,
});
function SupportPage() { const [language, setLanguage] = useState<Language>("ja"); useEffect(() => setLanguage(storedLanguage()), []); const t = supportCopy[language]; return <main className="mx-auto min-h-[65dvh] max-w-2xl px-5 py-16"><Link to="/" className="text-sm text-primary underline">{t.back}</Link><h1 className="mb-6 mt-6 font-serif text-2xl text-primary">{t.title}</h1><SupportForm language={language} /></main>; }