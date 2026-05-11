import { createFileRoute } from "@tanstack/react-router";
import { SocialLinks } from "@/components/SocialLinks";
import avatarUrl from "@/assets/avatar.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "من نحن | سلمان فارس" },
      { name: "description", content: "تعرّف على موقع سلمان فارس ورسالتنا في تقديم أفضل التطبيقات والمواقع التقنية." },
      { property: "og:title", content: "من نحن | سلمان فارس" },
      { property: "og:description", content: "تعرّف على موقع سلمان فارس ورسالتنا في تقديم أفضل التطبيقات والمواقع التقنية." },
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
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          موقع <span className="font-bold text-foreground">سلمان فارس</span> منصّة عربية متخصصة في
          استعراض وتقييم أفضل التطبيقات والمواقع التقنية، وطرق الاستفادة منها في حياتك اليومية وعملك.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-card/50 p-5">
          <h2 className="text-lg font-bold">رسالتنا</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            تقديم محتوى تقني عربي موثوق وسهل الفهم، يساعدك في اكتشاف أفضل الأدوات الرقمية واختيار ما يناسبك منها.
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/50 p-5">
          <h2 className="text-lg font-bold">رؤيتنا</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            أن نكون المرجع العربي الأول لاستكشاف التطبيقات والمواقع التقنية الجديدة والمفيدة.
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