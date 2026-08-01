import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CategorySection } from "@/components/CategorySection";
import { SearchBar, filterItems } from "@/components/SearchBar";
import { fetchItems } from "@/lib/items";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/apps")({
  head: () => ({
    meta: [
      { title: "أفضل التطبيقات | سلمان فارس" },
      { name: "description", content: "تصفح مجموعة مختارة من أفضل التطبيقات للأندرويد والآيفون: أدوات إنتاجية، تصميم، تواصل اجتماعي، وترفيه، محدثة باستمرار على موقع سلمان فارس." },
      { property: "og:title", content: "أفضل التطبيقات | سلمان فارس" },
      { property: "og:description", content: "قائمة مختارة لأفضل تطبيقات الهاتف — إنتاجية وتصميم وترفيه — بمراجعات موجزة." },
      { property: "og:url", content: "https://salmanfares.lovable.app/apps" },
    ],
    links: [{ rel: "canonical", href: "https://salmanfares.lovable.app/apps" }],
  }),
  component: AppsPage,
});

function AppsPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useI18n();
  const { data } = useQuery({ queryKey: ["items", "apps"], queryFn: () => fetchItems("apps") });
  const [q, setQ] = useState("");
  if (pathname !== "/apps") return <Outlet />;
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <h1 className="mb-4 text-2xl font-extrabold text-foreground md:text-3xl">أفضل التطبيقات</h1>
        <SearchBar value={q} onChange={setQ} placeholder={t("search.app")} />
      </div>
      <CategorySection title={t("section.apps")} items={filterItems(data ?? [], q)} emptyText={t("section.empty")} />
    </div>
  );
}
