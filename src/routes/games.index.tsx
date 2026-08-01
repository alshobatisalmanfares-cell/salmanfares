import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CategorySection } from "@/components/CategorySection";
import { SearchBar, filterItems } from "@/components/SearchBar";
import { fetchItems } from "@/lib/items";

export const Route = createFileRoute("/games/")({
  head: () => ({
    meta: [
      { title: "دليل أفضل الألعاب للجوال | سلمان فارس" },
      {
        name: "description",
        content:
          "دليل ألعاب الجوال والكمبيوتر على سلمان فارس: ألعاب مختارة مع نبذة عن أسلوب اللعب وحجم الملف ومتطلبات التشغيل وروابط تحميل محدثة.",
      },
      { property: "og:title", content: "دليل أفضل الألعاب للجوال | سلمان فارس" },
      {
        property: "og:description",
        content: "قسم الألعاب في سلمان فارس: أفضل الألعاب المختارة مع تفاصيل التشغيل وروابط التحميل.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://salmanfares.lovable.app/games" },
    ],
    links: [{ rel: "canonical", href: "https://salmanfares.lovable.app/games" }],
  }),
  component: GamesIndexPage,
});

function GamesIndexPage() {
  const { data } = useQuery({ queryKey: ["items", "games"], queryFn: () => fetchItems("games") });
  const [q, setQ] = useState("");
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <h1 className="mb-4 text-2xl font-extrabold text-foreground md:text-3xl">أفضل الألعاب</h1>
        <SearchBar value={q} onChange={setQ} placeholder="ابحث عن لعبة..." />
      </div>
      <CategorySection title="أفضل الألعاب" items={filterItems(data ?? [], q)} />
    </div>
  );
}