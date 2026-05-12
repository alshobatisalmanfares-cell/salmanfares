import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CategorySection } from "@/components/CategorySection";
import { SearchBar, filterItems } from "@/components/SearchBar";
import { fetchItems } from "@/lib/items";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/websites")({
  head: () => ({ meta: [{ title: "websites | سلمان فارس" }] }),
  component: Page,
});

function Page() {
  const { t } = useI18n();
  const { data } = useQuery({ queryKey: ["items", "websites"], queryFn: () => fetchItems("websites") });
  const [q, setQ] = useState("");
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <SearchBar value={q} onChange={setQ} placeholder={t("home.search")} />
      </div>
      <CategorySection title={t("cat.websites.title")} subtitle={t("cat.websites.sub")} items={filterItems(data ?? [], q)} />
    </div>
  );
}
