import { createFileRoute, Link } from "@tanstack/react-router";
import { Home, AppWindow, Globe, Gamepad2, Sparkles, Info, Mail, Shield, FileText, Map } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/sitemap")({
  head: () => ({
    meta: [
      { title: "خريطة الموقع | سلمان فارس" },
      { name: "description", content: "خريطة موقع سلمان فارس: تصفح الأقسام والصفحات الرئيسية بسهولة." },
      { property: "og:title", content: "خريطة الموقع | سلمان فارس" },
      { property: "og:description", content: "خريطة موقع سلمان فارس: تصفح الأقسام والصفحات الرئيسية بسهولة." },
      { property: "og:url", content: "https://salmanfares.lovable.app/sitemap" },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "canonical", href: "https://salmanfares.lovable.app/sitemap" },
    ],
  }),
  component: SitemapPage,
});

const sections = [
  {
    title: "الصفحات الرئيسية",
    links: [
      { to: "/", label: "الرئيسية", Icon: Home },
      { to: "/apps", label: "التطبيقات", Icon: AppWindow },
      { to: "/games", label: "الألعاب", Icon: Gamepad2 },
      { to: "/websites", label: "المواقع", Icon: Globe },
      { to: "/ai", label: "أدوات الذكاء الاصطناعي", Icon: Sparkles },
    ],
  },
  {
    title: "معلومات وتواصل",
    links: [
      { to: "/about", label: "من نحن", Icon: Info },
      { to: "/contact", label: "تواصل معنا", Icon: Mail },
    ],
  },
  {
    title: "السياسات والقانونية",
    links: [
      { to: "/privacy", label: "سياسة الخصوصية", Icon: Shield },
      { to: "/terms", label: "شروط الاستخدام", Icon: FileText },
    ],
  },
];

function SitemapPage() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Map className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-3xl font-extrabold md:text-4xl">خريطة الموقع</h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          تصفح أقسام وصفحات موقع {t("site.name")} الرئيسية بسرعة.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-border/70 bg-card/40 p-5"
          >
            <h2 className="text-base font-bold text-foreground">{section.title}</h2>
            <ul className="mt-4 space-y-2">
              {section.links.map(({ to, label, Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="group flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          <Home className="h-4 w-4" />
          العودة إلى الرئيسية
        </Link>
      </div>
    </div>
  );
}
