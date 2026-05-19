import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CategorySection } from "@/components/CategorySection";
import { SearchBar, filterItems } from "@/components/SearchBar";
import { fetchItems } from "@/lib/items";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/apps")({
  head: () => ({ meta: [{ title: "apps | سلمان فارس" }] }),
  component: Page,
});

function Page() {
  const { t } = useI18n();
  const { data } = useQuery({ queryKey: ["items", "apps"], queryFn: () => fetchItems("apps") });
  const [q, setQ] = useState("");
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <SearchBar value={q} onChange={setQ} placeholder={t("home.search")} />
      </div>
      <CategorySection title={t("cat.apps.title")} subtitle={t("cat.apps.sub")} items={filterItems(data ?? [], q)} />
    </div>
  );
}
