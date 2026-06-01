import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CategorySection } from "@/components/CategorySection";
import { NativeBannerAd } from "@/components/NativeBannerAd";
import { SearchBar, filterItems } from "@/components/SearchBar";
import { fetchItems } from "@/lib/items";

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "أفضل الألعاب | سلمان فارس" },
      { name: "description", content: "أفضل الألعاب المختارة." },
    ],
  }),
  component: GamesPage,
});

function GamesPage() {
  const { data } = useQuery({ queryKey: ["items", "games"], queryFn: () => fetchItems("games") });
  const [q, setQ] = useState("");
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <SearchBar value={q} onChange={setQ} placeholder="ابحث عن لعبة..." />
      </div>
      <CategorySection title="أفضل الألعاب" items={filterItems(data ?? [], q)} midSlot={<NativeBannerAd />} />
    </div>
  );
}