import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CategorySection } from "@/components/CategorySection";
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
  return <CategorySection title="أفضل المواقع" items={data ?? []} />;
}
