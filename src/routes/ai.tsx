import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CategorySection } from "@/components/CategorySection";
import { SearchBar, filterItems } from "@/components/SearchBar";
import { fetchItems } from "@/lib/items";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "أدوات الذكاء الاصطناعي | سلمان فارس" },
      { name: "description", content: "أفضل أدوات الذكاء الاصطناعي المختارة." },
    ],
  }),
  component: AiPage,
});

function AiPage() {
  const { data } = useQuery({ queryKey: ["items", "ai"], queryFn: () => fetchItems("ai") });
  const [q, setQ] = useState("");
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <SearchBar value={q} onChange={setQ} placeholder="ابحث في أدوات الذكاء الاصطناعي..." />
      </div>
      <CategorySection title="أدوات الذكاء الاصطناعي" items={filterItems(data ?? [], q)} />
    </div>
  );
}