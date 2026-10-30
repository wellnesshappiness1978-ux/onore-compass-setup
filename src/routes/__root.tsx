import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import PlanProvider from "@/components/PlanProvider";
import { Toaster } from "@/components/ui/sonner";
import LegalFooter from "@/components/LegalFooter";
import { Button } from "@/components/ui/button";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { storedLanguage } from "@/lib/support-copy";
import type { Language } from "@/lib/translations";
import { useFontSize } from '@/hooks/use-font-size';

const pageStateCopy: Record<Language, { missing: string; missingBody: string; failed: string; failedBody: string; retry: string; home: string }> = {
  ja: { missing: "ページが見つかりません", missingBody: "ページが移動したか、リンクが正しくありません。", failed: "ページを表示できませんでした", failedBody: "再読み込みするか、ホームに戻ってお試しください。", retry: "再試行", home: "ホームに戻る" },
  en: { missing: "Page not found", missingBody: "The page may have moved, or the link may be incorrect.", failed: "This page could not be displayed", failedBody: "Reload the page or return home and try again.", retry: "Try again", home: "Return home" },
  "zh-CN": { missing: "找不到页面", missingBody: "页面可能已移动，或链接不正确。", failed: "无法显示页面", failedBody: "请重新加载，或返回首页后重试。", retry: "重试", home: "返回首页" },
  "zh-TW": { missing: "找不到頁面", missingBody: "頁面可能已移動，或連結不正確。", failed: "無法顯示頁面", failedBody: "請重新載入，或返回首頁後再試。", retry: "重試", home: "返回首頁" },
  ko: { missing: "페이지를 찾을 수 없습니다", missingBody: "페이지가 이동했거나 링크가 올바르지 않습니다.", failed: "페이지를 표시할 수 없습니다", failedBody: "새로고침하거나 홈으로 돌아가 다시 시도해 주세요.", retry: "다시 시도", home: "홈으로 돌아가기" },
  es: { missing: "Página no encontrada", missingBody: "Es posible que la página se haya movido o que el enlace sea incorrecto.", failed: "No se pudo mostrar la página", failedBody: "Recarga la página o vuelve al inicio e inténtalo de nuevo.", retry: "Reintentar", home: "Volver al inicio" },
  fr: { missing: "Page introuvable", missingBody: "La page a peut-être été déplacée ou le lien est incorrect.", failed: "Impossible d’afficher la page", failedBody: "Rechargez la page ou revenez à l’accueil, puis réessayez.", retry: "Réessayer", home: "Retour à l’accueil" },
};

function usePageStateCopy() {
  const [language, setLanguage] = useState<Language>("ja");
  useEffect(() => setLanguage(storedLanguage()), []);
  return pageStateCopy[language];
}

function NotFoundComponent() {
  const t = usePageStateCopy();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t.missing}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.missingBody}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.home}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  const t = usePageStateCopy();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {t.failed}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.failedBody}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.retry}
          </Button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t.home}
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" },
      { title: "アゴルメンの羅針盤 | 15の占術で自分を知る" },
      {
        name: "description",
        content:
          "生年月日・血液型・兄弟構成から、15の占術であなたの本質を解析します。",
      },
      { name: "author", content: "Agolmen's Compass" },
      { property: "og:title", content: "アゴルメンの羅針盤 | 15の占術で自分を知る" },
      {
        property: "og:description",
        content: "生まれた瞬間の情報から、15の占術であなたの本質を解析します。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0B132B" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "アゴルメン" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
         href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Karla:wght@400;500;600&family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@400;600;700;900&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/agolmen-icon.png", type: "image/png" },
      { rel: "manifest", href: "/manifest.json" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useFontSize();

  return (
    <QueryClientProvider client={queryClient}>
      <PlanProvider>
        <div className="app-content"><Outlet /></div>
        <Toaster position="top-center" />
        <LegalFooter />
      </PlanProvider>
    </QueryClientProvider>
  );
}
