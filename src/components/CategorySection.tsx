import { ItemCard } from "./ItemCard";
import type { Item } from "@/lib/items";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function CategorySection({
  title,
  subtitle,
  items,
  emptyText,
  loading,
}: {
  title: string;
  subtitle?: string;
  items: Item[];
  emptyText?: string;
  loading?: boolean;
}) {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex flex-col items-start gap-2">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          <span className="text-gradient-primary">{title}</span>
        </h2>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border/60 bg-card/40 p-10 text-center text-sm text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>{t("loading.wait")}</span>
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-border/60 bg-card/40 p-8 text-center text-sm text-muted-foreground">
          {emptyText ?? "لا توجد عناصر بعد."}
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <ItemCard key={it.id} item={it} />
          ))}
        </div>
      )}
    </section>
  );
}