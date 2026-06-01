import { ItemCard } from "./ItemCard";
import type { Item } from "@/lib/items";
import type { ReactNode } from "react";

export function CategorySection({
  title,
  subtitle,
  items,
  emptyText,
  midSlot,
  midSlotAfter = 3,
}: {
  title: string;
  subtitle?: string;
  items: Item[];
  emptyText?: string;
  midSlot?: ReactNode;
  midSlotAfter?: number;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex flex-col items-start gap-2">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          <span className="text-gradient-primary">{title}</span>
        </h2>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      {items.length === 0 ? (
        <p className="rounded-xl border border-border/60 bg-card/40 p-8 text-center text-sm text-muted-foreground">
          {emptyText ?? "لا توجد عناصر بعد."}
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, idx) => {
            const showAd =
              !!midSlot && idx === Math.min(midSlotAfter - 1, items.length - 1);
            return (
              <Fragment key={it.id}>
                <ItemCard item={it} />
                {showAd && (
                  <div className="sm:col-span-2 lg:col-span-3 py-2">
                    {midSlot}
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      )}
    </section>
  );
}