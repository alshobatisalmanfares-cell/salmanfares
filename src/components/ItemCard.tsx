import { ExternalLink, Eye } from "lucide-react";
import type { Item } from "@/data/items";

export function ItemCard({ item }: { item: Item }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-glow-purple">
      <div className="absolute inset-0 -z-10 bg-gradient-primary opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary text-3xl shadow-glow-purple">
          {item.emoji}
        </div>
        {item.badge && (
          <span className="rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
            {item.badge}
          </span>
        )}
      </div>
      <h3 className="mt-5 text-xl font-bold text-foreground">{item.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      <div className="mt-5 flex items-center justify-between">
        {item.views && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            {item.views} مشاهدة
          </span>
        )}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow-purple transition-transform hover:scale-105"
        >
          {item.cta}
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}