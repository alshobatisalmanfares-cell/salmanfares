import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { CategorySection } from "@/components/CategorySection";
import { SearchBar, filterItems } from "@/components/SearchBar";
import { fetchItems, fetchTrending } from "@/lib/items";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "سلمان فارس | تطبيقات ومواقع تقنية" },
      { name: "description", content: "اكتشف أفضل التطبيقات والمواقع التقنية المختارة بعناية." },
    ],
  }),
  component: Index,
});

function Index() {
  const latest = useQuery({ queryKey: ["items", "latest"], queryFn: () => fetchItems() });
  const trending = useQuery({ queryKey: ["items", "trending"], queryFn: () => fetchTrending(6) });
  const [q, setQ] = useState("");

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 py-12 md:py-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/40 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
          موقع سلمان فارس
        </span>
        <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold leading-tight md:text-5xl">
          اكتشف <span className="text-gradient-primary">أفضل التطبيقات والمواقع</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
          مكتبة مختارة من الأدوات الرقمية المفيدة، تُحدَّث باستمرار.
        </p>
        <div className="mt-6">
          <Link
            to="/apps"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            تصفح التطبيقات
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8">
          <SearchBar value={q} onChange={setQ} placeholder="ابحث عن تطبيق أو موقع..." />
        </div>
      </section>

      {q.trim() ? (
        <CategorySection
          title={`نتائج البحث: ${q}`}
          items={filterItems(latest.data ?? [], q)}
          emptyText="لا توجد نتائج مطابقة."
        />
      ) : (
        <>
          <CategorySection title="أحدث الإضافات" items={(latest.data ?? []).slice(0, 6)} />
          <CategorySection title="الأكثر مشاهدة" items={trending.data ?? []} />
        </>
      )}
    </div>
  );
}
