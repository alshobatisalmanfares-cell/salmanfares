import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CategorySection } from "@/components/CategorySection";
import { SearchBar, filterItems } from "@/components/SearchBar";
import { fetchItems } from "@/lib/items";

export const Route = createFileRoute("/ai/")({
  component: AiIndexPage,
});

function AiIndexPage() {
  const { data } = useQuery({ queryKey: ["items", "ai"], queryFn: () => fetchItems("ai") });
  const [q, setQ] = useState("");
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <h1 className="mb-4 text-2xl font-extrabold text-foreground md:text-3xl">أدوات الذكاء الاصطناعي</h1>
        <SearchBar value={q} onChange={setQ} placeholder="ابحث في أدوات الذكاء الاصطناعي..." />
      </div>
      <CategorySection title="أدوات الذكاء الاصطناعي" items={filterItems(data ?? [], q)} />
    </div>
  );
}