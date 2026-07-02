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
      { name: "description", content: "قائمة مختارة من أفضل أدوات الذكاء الاصطناعي: توليد النصوص، الصور، الفيديو، والمساعدين الأذكياء لتعزيز إنتاجيتك اليومية." },
      { property: "og:title", content: "أدوات الذكاء الاصطناعي | سلمان فارس" },
      { property: "og:description", content: "أفضل أدوات AI للكتابة والتصميم والإنتاجية، مختارة ومحدثة على موقع سلمان فارس." },
      { property: "og:url", content: "https://salmanfares.lovable.app/ai" },
    ],
    links: [{ rel: "canonical", href: "https://salmanfares.lovable.app/ai" }],
  }),
  component: AiPage,
});

function AiPage() {
  const { data } = useQuery({ queryKey: ["items", "ai"], queryFn: () => fetchItems("ai") });
  const [q, setQ] = useState("");
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <h1 className="mb-4 text-2xl font-extrabold text-foreground md:text-3xl">أدوات الذكاء الاصطناعي</h1>
        <SearchBar value={q} onChange={setQ} placeholder="ابحث في أدوات الذكاء الاصطناعي..." />
      </div>
      <CategorySection title="أدوات الذكاء الاصطناعي" items={filterItems(data ?? [], q)} />
    </div>
  );
}