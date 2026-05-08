import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CategorySection } from "@/components/CategorySection";
import { fetchTrending } from "@/lib/items";

export const Route = createFileRoute("/trending")({
  head: () => ({
    meta: [
      { title: "الأكثر مشاهدة | سلمان فارس" },
      { name: "description", content: "المحتوى الأكثر مشاهدة على المنصة." },
    ],
  }),
  component: TrendingPage,
});

function TrendingPage() {
  const { data } = useQuery({ queryKey: ["items", "trending-page"], queryFn: () => fetchTrending(24) });
  return <CategorySection title="الأكثر مشاهدة" items={data ?? []} />;
}
