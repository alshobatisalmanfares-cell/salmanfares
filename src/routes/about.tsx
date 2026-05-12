import { createFileRoute } from "@tanstack/react-router";
import { SocialLinks } from "@/components/SocialLinks";
import avatarUrl from "@/assets/avatar.jpg";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "من نحن | سلمان فارس" }] }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <div className="flex flex-col items-center text-center">
        <img src={avatarUrl} alt="Salman Faris" className="h-24 w-24 rounded-full object-cover ring-2 ring-primary/40" />
        <h1 className="mt-5 text-3xl font-extrabold md:text-4xl">{t("about.title")}</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">{t("about.intro")}</p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-card/50 p-5">
          <h2 className="text-lg font-bold">{t("about.mission.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("about.mission.body")}</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/50 p-5">
          <h2 className="text-lg font-bold">{t("about.vision.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("about.vision.body")}</p>
        </div>
      </div>
      <div className="mt-10 text-center">
        <h2 className="text-lg font-bold">{t("about.follow")}</h2>
        <div className="mt-4"><SocialLinks /></div>
      </div>
    </div>
  );
}
