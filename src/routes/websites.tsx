import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CategorySection } from "@/components/CategorySection";
import { SearchBar, filterItems } from "@/components/SearchBar";
import { fetchItems } from "@/lib/items";

export const Route = createFileRoute("/websites")({
  head: () => ({
    meta: [
      { title: "أفضل المواقع | سلمان فارس" },
      { name: "description", content: "أفضل المواقع التقنية المختارة." },
    ],
  }),
  component: WebsitesPage,
});

function WebsitesPage() {
  const { data } = useQuery({ queryKey: ["items", "websites"], queryFn: () => fetchItems("websites") });
  const [q, setQ] = useState("");
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <SearchBar value={q} onChange={setQ} placeholder="ابحث عن موقع..." />
      </div>
      <CategorySection title="أفضل المواقع" items={filterItems(data ?? [], q)} />
    </div>
  );
}
