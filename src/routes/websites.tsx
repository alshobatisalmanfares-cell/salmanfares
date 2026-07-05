import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CategorySection } from "@/components/CategorySection";
import { SearchBar, filterItems } from "@/components/SearchBar";
import { fetchItems } from "@/lib/items";

export const Route = createFileRoute("/websites")({
  head: () => ({
    meta: [
      { title: "أفضل المواقع | سلمان فارس" },
      { name: "description", content: "تصفح أفضل المواقع التقنية المفيدة: أدوات ويب، تعلم، تصميم، إنتاجية، وموارد مختارة بعناية ومحدثة باستمرار." },
      { property: "og:title", content: "أفضل المواقع | سلمان فارس" },
      { property: "og:description", content: "قائمة مختارة لأفضل المواقع التقنية والأدوات المفيدة على الإنترنت." },
      { property: "og:url", content: "https://salmanfares.lovable.app/websites" },
    ],
    links: [{ rel: "canonical", href: "https://salmanfares.lovable.app/websites" }],
  }),
  component: WebsitesPage,
});

function WebsitesPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data } = useQuery({ queryKey: ["items", "websites"], queryFn: () => fetchItems("websites") });
  const [q, setQ] = useState("");
  if (pathname !== "/websites") return <Outlet />;
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <h1 className="mb-4 text-2xl font-extrabold text-foreground md:text-3xl">أفضل المواقع</h1>
        <SearchBar value={q} onChange={setQ} placeholder="ابحث عن موقع..." />
      </div>
      <CategorySection title="أفضل المواقع" items={filterItems(data ?? [], q)} />
    </div>
  );
}
