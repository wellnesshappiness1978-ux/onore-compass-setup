import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { legalContent, type LegalKey } from "@/lib/legal-content";
import { LegalText } from "@/components/LegalFooter";

export const Route = createFileRoute("/legal/$document")({
  loader: ({ params }) => { if (!(params.document in legalContent)) throw notFound(); return params.document as LegalKey; },
  head: ({ loaderData }) => {
    const entry = loaderData ? legalContent[loaderData] : null;
    const title = `${entry?.title ?? "案内が見つかりません"} | オノレコンパス`;
    const description = entry?.description ?? "オノレコンパスの案内ページ。";
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
  },
  component: LegalPage,
});
function LegalPage() { const kind = Route.useLoaderData(); return <main className="mx-auto min-h-[65dvh] max-w-3xl px-5 py-16"><Link to="/" className="text-sm text-primary underline">オノレコンパスに戻る</Link><h1 className="mb-8 mt-6 font-serif text-2xl text-primary">{legalContent[kind].title}</h1><LegalText kind={kind} /></main>; }