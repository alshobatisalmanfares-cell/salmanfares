import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "شروط الاستخدام | سلمان فارس" },
      { name: "description", content: "شروط استخدام موقع سلمان فارس." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { t } = useI18n();
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:py-16 leading-relaxed">
      <h1 className="text-3xl font-extrabold md:text-4xl">{t("terms.title")}</h1>
      <p className="mt-4 text-sm text-muted-foreground md:text-base">{t("terms.intro")}</p>
      <div className="mt-8 space-y-6 text-sm md:text-base">
        <section>
          <h2 className="text-lg font-bold">{t("terms.use.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("terms.use.body")}</p>
        </section>
        <section>
          <h2 className="text-lg font-bold">{t("terms.ip.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("terms.ip.body")}</p>
        </section>
        <section>
          <h2 className="text-lg font-bold">{t("terms.liability.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("terms.liability.body")}</p>
        </section>
        <section>
          <h2 className="text-lg font-bold">{t("terms.changes.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("terms.changes.body")}</p>
        </section>
      </div>
    </article>
  );
}