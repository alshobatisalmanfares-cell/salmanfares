import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CategorySection } from "@/components/CategorySection";
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
  return <CategorySection title="أفضل التطبيقات" items={data ?? []} />;
}
