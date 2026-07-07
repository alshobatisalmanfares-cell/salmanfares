import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CategorySection } from "@/components/CategorySection";
import { SearchBar, filterItems } from "@/components/SearchBar";
import { fetchItems } from "@/lib/items";

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "أفضل الألعاب | سلمان فارس" },
      { name: "description", content: "تصفح مجموعة مختارة من أفضل الألعاب للهاتف والكمبيوتر: أكشن، مغامرة، رياضة، وألعاب متعددة اللاعبين على موقع سلمان فارس." },
      { property: "og:title", content: "أفضل الألعاب | سلمان فارس" },
      { property: "og:description", content: "قائمة مختارة لأفضل ألعاب الأندرويد والآيفون والكمبيوتر بمراجعات مختصرة." },
      { property: "og:url", content: "https://salmanfares.lovable.app/games" },
    ],
    links: [{ rel: "canonical", href: "https://salmanfares.lovable.app/games" }],
  }),
  component: GamesPage,
});

function GamesPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data } = useQuery({ queryKey: ["items", "games"], queryFn: () => fetchItems("games") });
  const [q, setQ] = useState("");
  if (pathname !== "/games") return <Outlet />;
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