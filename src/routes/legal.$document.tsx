import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { legalContent, legalContentByLanguage, type LegalKey } from "@/lib/legal-content";
import { LegalText } from "@/components/LegalFooter";
import { storedLanguage, supportCopy } from "@/lib/support-copy";
import { useEffect, useState } from "react";
import type { Language } from "@/lib/translations";

export const Route = createFileRoute("/legal/$document")({
  loader: ({ params }) => { if (!Object.prototype.hasOwnProperty.call(legalContent, params.document)) throw notFound(); return params.document as LegalKey; },
  head: ({ loaderData }) => {
    const entry = loaderData ? legalContent[loaderData] : null;
    const title = `${entry?.title ?? "案内が見つかりません"} | アゴルメンの羅針盤`;
    const description = entry?.description ?? "アゴルメンの羅針盤の案内ページ。";
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
  },
  component: LegalPage,
});
function LegalPage() { const kind = Route.useLoaderData(); const [language, setLanguage] = useState<Language>("ja"); useEffect(() => setLanguage(storedLanguage()), []); const content = legalContentByLanguage[language]; return <main className="mx-auto min-h-[65dvh] max-w-3xl px-5 py-16"><Link to="/" className="text-sm text-primary underline">{supportCopy[language].back}</Link><h1 className="mb-8 mt-6 font-serif text-2xl text-primary">{content[kind].title}</h1><LegalText kind={kind} language={language} /></main>; }