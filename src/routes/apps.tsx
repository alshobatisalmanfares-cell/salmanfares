import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CategorySection } from "@/components/CategorySection";
import { SearchBar, filterItems } from "@/components/SearchBar";
import { fetchItems } from "@/lib/items";

export const Route = createFileRoute("/apps")({
  head: () => ({
    meta: [
      { title: "أفضل التطبيقات | سلمان فارس" },
      { name: "description", content: "أفضل التطبيقات التقنية المختارة." },
    ],
  }),
  component: AppsPage,
});

function AppsPage() {
  const { data } = useQuery({ queryKey: ["items", "apps"], queryFn: () => fetchItems("apps") });
  const [q, setQ] = useState("");
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <SearchBar value={q} onChange={setQ} placeholder="ابحث عن تطبيق..." />
      </div>
      <CategorySection title="أفضل التطبيقات" items={filterItems(data ?? [], q)} />
    </div>
  );
}
