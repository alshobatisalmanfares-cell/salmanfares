import { createFileRoute } from "@tanstack/react-router";
import { SocialLinks } from "@/components/SocialLinks";
import avatarUrl from "@/assets/avatar.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "من نحن | سلمان فارس" },
      { name: "description", content: "منصة سلمان فارس - بوابتكم المتكاملة لنخبة التطبيقات والأدوات الرقمية الحديثة." },
      { property: "og:title", content: "من نحن | سلمان فارس" },
      { property: "og:description", content: "منصة سلمان فارس - بوابتكم المتكاملة لنخبة التطبيقات والأدوات الرقمية الحديثة." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <div className="flex flex-col items-center text-center">
        <img
          src={avatarUrl}
          alt="سلمان فارس"
          className="h-24 w-24 rounded-full object-cover ring-2 ring-primary/40"
        />
        <h1 className="mt-5 text-3xl font-extrabold md:text-4xl">من نحن</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          منصة <span className="font-bold text-foreground">سلمان فارس</span> هي بوابتكم المتكاملة للوصول إلى نخبة التطبيقات والأدوات الرقمية الحديثة. نحن نتخصص في رصد ومراجعة أحدث المنصات والمواقع التقنية، مع توفير روابط مباشرة وآمنة للاستخدام والتحميل. هدفنا هو تبسيط التجربة الرقمية من خلال انتقاء الأدوات التي تصنع فارقاً حقيقياً في الإنتاجية والكفاءة.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-card/50 p-5">
          <h2 className="text-lg font-bold">رسالتنا</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            توفير بيئة تقنية موثوقة تمكن المستخدم من اكتشاف وتجربة أفضل البرمجيات والمواقع بضغطة زر. نلتزم بتقديم محتوى تقني عملي، يركز على الفائدة المباشرة وكيفية الحصول على الأدوات الرقمية بأسهل وأسرع الطرق الممكنة.
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/50 p-5">
          <h2 className="text-lg font-bold">رؤيتنا</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            أن نكون الوجهة الأولى والمصدر الأساسي في رحلة البحث عن الحلول التقنية والبرمجية، لنصبح المرجع الأسرع والأكثر شمولاً لكل ما يخص عالم التطبيقات والمواقع المبتكرة.
          </p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <h2 className="text-lg font-bold">تابعنا على</h2>
        <div className="mt-4">
          <SocialLinks />
        </div>
      </div>
    </div>
  );
}
