import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CategorySection } from "@/components/CategorySection";
import { SearchBar, filterItems } from "@/components/SearchBar";
import { fetchItems } from "@/lib/items";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/apps/")({
  head: () => ({
    meta: [
      { title: "أفضل تطبيقات الأندرويد والآيفون | سلمان فارس" },
      {
        name: "description",
        content:
          "اكتشف مجموعة مختارة من أفضل تطبيقات الأندرويد والآيفون مع شرح المميزات ومتطلبات التشغيل وروابط التحميل المحدثة على موقع سلمان فارس.",
      },
      { property: "og:title", content: "أفضل تطبيقات الأندرويد والآيفون | سلمان فارس" },
      {
        property: "og:description",
        content: "قسم التطبيقات في سلمان فارس: تطبيقات مختارة بعناية مع تفاصيل كاملة وروابط تحميل موثوقة.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://salmanfares.lovable.app/apps" },
    ],
    links: [{ rel: "canonical", href: "https://salmanfares.lovable.app/apps" }],
  }),
  component: AppsIndexPage,
});

function AppsIndexPage() {
  const { t } = useI18n();
  const { data } = useQuery({ queryKey: ["items", "apps"], queryFn: () => fetchItems("apps") });
  const [q, setQ] = useState("");
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