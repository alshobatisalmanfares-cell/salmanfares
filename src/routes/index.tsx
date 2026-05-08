import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, TrendingUp } from "lucide-react";
import { CategorySection } from "@/components/CategorySection";
import { items, trending } from "@/data/items";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "سلمان فارس | تطبيقات ومواقع تقنية والربح من الإنترنت" },
      { name: "description", content: "اكتشف أفضل التطبيقات والمواقع التقنية وطرق الربح من الإنترنت في موقع سلمان فارس." },
    ],
  }),
  component: Index,
});

function Index() {
  const latest = items.slice(0, 6);
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute right-1/2 top-0 h-96 w-96 translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute left-10 top-40 h-72 w-72 rounded-full bg-secondary/30 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-20 text-center md:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-secondary" />
            موقع تقني عربي احترافي
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">
            اكتشف <span className="text-gradient-primary text-glow-purple">أفضل التطبيقات</span>
            <br />
            <span className="text-foreground">والمواقع وطرق</span>{" "}
            <span className="text-gradient-primary text-glow-blue">الربح من الإنترنت</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            مكتبة محدثة من أفضل الأدوات الرقمية ومصادر الربح، مختارة بعناية لتساعدك على تطوير مهاراتك وزيادة دخلك.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/apps"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow-purple transition-transform hover:scale-105"
            >
              تصفح التطبيقات
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link
              to="/earn"
              className="inline-flex items-center gap-2 rounded-xl border border-secondary/50 bg-secondary/10 px-6 py-3 text-sm font-bold text-foreground shadow-glow-blue transition-colors hover:bg-secondary/20"
            >
              ابدأ الربح الآن
              <TrendingUp className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <CategorySection title="أحدث الإضافات" subtitle="آخر التطبيقات والمواقع المضافة إلى المنصة" items={latest} />
      <CategorySection title="الأكثر مشاهدة" subtitle="المحتوى الذي يحظى باهتمام أكبر من المستخدمين" items={trending} />
    </div>
  );
}
