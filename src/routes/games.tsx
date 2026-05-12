import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CategorySection } from "@/components/CategorySection";
import { SearchBar, filterItems } from "@/components/SearchBar";
import { fetchItems } from "@/lib/items";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/games")({
  head: () => ({ meta: [{ title: "games | سلمان فارس" }] }),
  component: Page,
});

function Page() {
  const { t } = useI18n();
  const { data } = useQuery({ queryKey: ["items", "games"], queryFn: () => fetchItems("games") });
  const [q, setQ] = useState("");
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <SearchBar value={q} onChange={setQ} placeholder={t("home.search")} />
      </div>
      <CategorySection title={t("cat.games.title")} subtitle={t("cat.games.sub")} items={filterItems(data ?? [], q)} />
    </div>
  );
}
