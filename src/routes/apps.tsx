import { createFileRoute } from "@tanstack/react-router";
import { CategorySection } from "@/components/CategorySection";
import { items } from "@/data/items";

export const Route = createFileRoute("/apps")({
  head: () => ({
    meta: [
      { title: "أفضل التطبيقات | سلمان فارس" },
      { name: "description", content: "قائمة بأفضل التطبيقات التقنية المختارة لمساعدتك في الإنتاجية والإبداع." },
    ],
  }),
  component: () => (
    <CategorySection
      title="أفضل التطبيقات"
      subtitle="مجموعة مختارة من التطبيقات الأكثر فائدة للمستخدم العربي"
      items={items.filter((i) => i.category === "apps")}
    />
  ),
});