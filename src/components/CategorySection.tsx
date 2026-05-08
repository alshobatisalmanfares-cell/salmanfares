import { ItemCard } from "./ItemCard";
import type { Item } from "@/data/items";

export function CategorySection({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: Item[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex flex-col items-start gap-2">
        <h2 className="text-3xl font-extrabold text-foreground md:text-4xl">
          <span className="text-gradient-primary">{title}</span>
        </h2>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <ItemCard key={it.id} item={it} />
        ))}
      </div>
    </section>
  );
}