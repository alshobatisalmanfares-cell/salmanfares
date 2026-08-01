import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CategorySection } from "@/components/CategorySection";
import { SearchBar, filterItems } from "@/components/SearchBar";
import { fetchItems } from "@/lib/items";

export const Route = createFileRoute("/websites/")({
  head: () => ({
    meta: [
      { title: "أفضل المواقع التقنية المفيدة | سلمان فارس" },
      {
        name: "description",
        content:
          "قائمة بأفضل المواقع التقنية والخدمية المفيدة على سلمان فارس، مع شرح لكل موقع وأهم استخداماته وروابط الدخول المباشرة.",
      },
      { property: "og:title", content: "أفضل المواقع التقنية المفيدة | سلمان فارس" },
      {
        property: "og:description",
        content: "قسم المواقع في سلمان فارس: مواقع مختارة تسهّل عملك اليومي على الويب.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://salmanfares.lovable.app/websites" },
    ],
    links: [{ rel: "canonical", href: "https://salmanfares.lovable.app/websites" }],
  }),
  component: WebsitesIndexPage,
});

function WebsitesIndexPage() {
  const { data } = useQuery({ queryKey: ["items", "websites"], queryFn: () => fetchItems("websites") });
  const [q, setQ] = useState("");
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