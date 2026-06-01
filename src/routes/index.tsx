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

      {/* Native Banner Ad */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex justify-center">
          <div className="w-full max-w-[728px]">
            <script
              async
              data-cfasync="false"
              src="https://pl29600563.effectivecpmnetwork.com/1fd3de437d60db326297432f6ed0be74/invoke.js"
            />
            <div id="container-1fd3de437d60db326297432f6ed0be74" />
          </div>
        </div>
      </section>
    </div>
  );
}
