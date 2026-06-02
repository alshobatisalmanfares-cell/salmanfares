import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { CategorySection } from "@/components/CategorySection";
import { SearchBar, filterItems } from "@/components/SearchBar";
import { fetchItems } from "@/lib/items";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "سلمان فارس | تطبيقات ومواقع وألعاب" },
      { name: "description", content: "اكتشف أفضل التطبيقات والمواقع والألعاب المختارة بعناية." },
    ],
  }),
  component: Index,
});

function AdBanner468x60() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // avoid double-inject
    if (container.dataset.injected === "1") return;
    container.dataset.injected = "1";

    const win = window as any;
    win.atOptions = win.atOptions || {};
    win.atOptions["f129d8e7ff6f6dbdaa2980da9e456520"] = {
      key: "f129d8e7ff6f6dbdaa2980da9e456520",
      format: "iframe",
      height: 60,
      width: 468,
      params: {},
    };

    const s = document.createElement("script");
    s.src = "https://www.highperformanceformat.com/f129d8e7ff6f6dbdaa2980da9e456520/invoke.js";
    s.async = true;
    container.appendChild(s);

    return () => {
      s.remove();
      delete win.atOptions?.["f129d8e7ff6f6dbdaa2980da9e456520"];
    };
  }, []);

  return (
    <div className="flex justify-center">
      <div ref={containerRef} className="w-full max-w-[468px]" />
    </div>
  );
}

function Index() {
  const { t } = useI18n();
  const latest = useQuery({ queryKey: ["items", "latest"], queryFn: () => fetchItems() });
  const [q, setQ] = useState("");

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 py-12 md:py-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/40 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
          {t("home.badge")}
        </span>
        <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold leading-tight md:text-5xl">
          {t("home.title.1")} <span className="text-gradient-primary">{t("home.title.2")}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
          {t("home.subtitle")}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link
            to="/apps"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            {t("home.browse.apps")}
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link
            to="/websites"
            className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-card/40 px-5 py-2.5 text-sm font-bold text-foreground hover:bg-muted/50"
          >
            {t("home.browse.websites")}
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link
            to="/games"
            className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-card/40 px-5 py-2.5 text-sm font-bold text-foreground hover:bg-muted/50"
          >
            {t("home.browse.games")}
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8">
          <SearchBar value={q} onChange={setQ} placeholder={t("home.search")} />
        </div>
      </section>

      {q.trim() ? (
        <CategorySection
          title={`${t("home.results")}: ${q}`}
          items={filterItems(latest.data ?? [], q)}
          emptyText={t("home.noresults")}
        />
      ) : (
        <CategorySection title={t("home.latest")} items={(latest.data ?? []).slice(0, 9)} />
      )}

      {/* 468x60 Banner Ad */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <AdBanner468x60 />
      </section>
    </div>
  );
}
