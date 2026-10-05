import { createFileRoute, Link } from "@tanstack/react-router";
import SupportForm from "@/components/SupportForm";
export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "お問い合わせ | アゴルメンの羅針盤" }, { name: "description", content: "アゴルメンの羅針盤の不具合、アカウント、個人情報に関するお問い合わせ受付。" }, { property: "og:title", content: "お問い合わせ | アゴルメンの羅針盤" }, { property: "og:description", content: "お問い合わせの送信と本人専用の受付履歴。" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: SupportPage,
});
function SupportPage() { return <main className="mx-auto min-h-[65dvh] max-w-2xl px-5 py-16"><Link to="/" className="text-sm text-primary underline">アゴルメンの羅針盤に戻る</Link><h1 className="mb-6 mt-6 font-serif text-2xl text-primary">カスタマーサポート・お問い合わせ</h1><SupportForm /></main>; }