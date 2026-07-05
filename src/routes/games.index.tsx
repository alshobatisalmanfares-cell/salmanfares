import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CategorySection } from "@/components/CategorySection";
import { SearchBar, filterItems } from "@/components/SearchBar";
import { fetchItems } from "@/lib/items";

export const Route = createFileRoute("/games/")({
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