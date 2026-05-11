import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { CategorySection } from "@/components/CategorySection";
import { SearchBar, filterItems } from "@/components/SearchBar";
import { fetchItems } from "@/lib/items";
import { useI18n } from "@/lib/i18n";
import { useSiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "سلمان فارس | تطبيقات ومواقع وألعاب" },
      { name: "description", content: "اكتشف أفضل التطبيقات والمواقع والألعاب المختارة بعناية." },
    ],
  }),
  component: Index,
});

function Index() {
  const { t, lang } = useI18n();
  const { settings } = useSiteSettings();
  const latest = useQuery({ queryKey: ["items", "latest"], queryFn: () => fetchItems() });
  const [q, setQ] = useState("");

  const isAr = lang === "ar" || lang === "ur";
  const heroTitle = isAr ? settings.hero_title_ar : settings.hero_title_en;
  const heroHighlight = isAr ? settings.hero_highlight_ar : settings.hero_highlight_en;
  const heroSubtitle = isAr ? settings.hero_subtitle_ar : settings.hero_subtitle_en;

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 py-12 md:py-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/40 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
          {t("home.badge")}
        </span>
        <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold leading-tight md:text-5xl" style={{ fontSize: `calc(2.25rem * var(--site-heading-scale, 1))` }}>
          {heroTitle} <span className="text-gradient-primary">{heroHighlight}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base">{heroSubtitle}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link to="/apps" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90">
            {t("home.browse.apps")}
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link to="/websites" className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-card/40 px-5 py-2.5 text-sm font-bold text-foreground hover:bg-muted/50">
            {t("home.browse.websites")}
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link to="/games" className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-card/40 px-5 py-2.5 text-sm font-bold text-foreground hover:bg-muted/50">
            {t("home.browse.games")}
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8">
          <SearchBar value={q} onChange={setQ} placeholder={t("home.search")} />
        </div>
      </section>

      {q.trim() ? (
        <CategorySection title={`${t("home.results")}: ${q}`} items={filterItems(latest.data ?? [], q)} emptyText={t("home.noresults")} />
      ) : (
        <CategorySection title={t("home.latest")} items={(latest.data ?? []).slice(0, 9)} />
      )}
    </div>
  );
}
