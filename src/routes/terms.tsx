import { createFileRoute, Link } from "@tanstack/react-router";
import { legalContent, legalContentByLanguage } from "@/lib/legal-content";
import { LegalText } from "@/components/LegalFooter";
import { storedLanguage, supportCopy } from "@/lib/support-copy";
import { useEffect, useState } from "react";
import type { Language } from "@/lib/translations";

const entry = legalContent.terms;
const title = `${entry.title} | アゴルメンの羅針盤`;
export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title }, { name: "description", content: entry.description }, { property: "og:title", content: title }, { property: "og:description", content: entry.description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: TermsPage,
});
function TermsPage() { const [language, setLanguage] = useState<Language>("ja"); useEffect(() => setLanguage(storedLanguage()), []); const content = legalContentByLanguage[language]; return <main className="mx-auto min-h-[65dvh] max-w-3xl px-5 py-16"><Link to="/" className="text-sm text-primary underline">{supportCopy[language].back}</Link><h1 className="mb-8 mt-6 font-serif text-2xl text-primary">{content.terms.title}</h1><LegalText kind="terms" language={language} /></main>; }
