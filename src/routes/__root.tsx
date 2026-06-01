import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "google-site-verification", content: "La90iHMhtvnYwBk1mnhonFebPOlu3J5Vb4YlO2CrGQQ" },
      { title: "موقع سلمان للتقنية" },
      { name: "description", content: "​موقع سلمان للتقنية - منصتك الشاملة لاكتشاف أفضل التطبيقات، الألعاب، والمواقع التقنية المميزة والمحدثة باستمرار." },
      { name: "author", content: "Salman Faris" },
      { property: "og:title", content: "موقع سلمان للتقنية" },
      { property: "og:description", content: "​موقع سلمان للتقنية - منصتك الشاملة لاكتشاف أفضل التطبيقات، الألعاب، والمواقع التقنية المميزة والمحدثة باستمرار." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "موقع سلمان للتقنية" },
      { name: "twitter:description", content: "​موقع سلمان للتقنية - منصتك الشاملة لاكتشاف أفضل التطبيقات، الألعاب، والمواقع التقنية المميزة والمحدثة باستمرار." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/bU3DOz3UDyU9X5DCn1DZLGCLn4D3/social-images/social-1778618125921-1000085693.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/bU3DOz3UDyU9X5DCn1DZLGCLn4D3/social-images/social-1778618125921-1000085693.webp" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    scripts: [
      {
        src: "https://pl29600461.effectivecpmnetwork.com/13/50/0e/13500e94d3d1ea20d6ecda27b724a225.js",
      },
      {
        src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4295829309559637",
        async: true,
        crossOrigin: "anonymous",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
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

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
        <Toaster richColors position="top-center" />
      </I18nProvider>
    </QueryClientProvider>
  );
}
