import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "سياسة الخصوصية | سلمان فارس" },
      { name: "description", content: "سياسة الخصوصية لموقع سلمان فارس: ما البيانات التي نجمعها، كيف تُستخدم، دور شركاء الإعلانات، وطرق التواصل معنا لأي استفسار." },
      { property: "og:title", content: "سياسة الخصوصية | سلمان فارس" },
      { property: "og:description", content: "تعرّف على سياسة الخصوصية وطريقة تعاملنا مع بياناتك على موقع سلمان فارس." },
      { property: "og:url", content: "https://salmanfares.lovable.app/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://salmanfares.lovable.app/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { t } = useI18n();
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:py-16 leading-relaxed">
      <h1 className="text-3xl font-extrabold md:text-4xl">{t("privacy.title")}</h1>
      <p className="mt-4 text-sm text-muted-foreground md:text-base">{t("privacy.intro")}</p>
      <div className="mt-8 space-y-6 text-sm md:text-base">
        <section>
          <h2 className="text-lg font-bold">{t("privacy.collect.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("privacy.collect.body")}</p>
        </section>
        <section>
          <h2 className="text-lg font-bold">{t("privacy.use.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("privacy.use.body")}</p>
        </section>
        <section>
          <h2 className="text-lg font-bold">{t("privacy.ads.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("privacy.ads.body")}</p>
        </section>
        <section>
          <h2 className="text-lg font-bold">{t("privacy.contact.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("privacy.contact.body")}</p>
        </section>
      </div>
    </article>
  );
}