import { ExternalLink, Eye } from "lucide-react";
import type { Item } from "@/lib/items";

export function ItemCard({ item }: { item: Item }) {
  return (
    <div className="group flex flex-col rounded-xl border border-border/70 bg-card/60 p-5 transition-colors hover:border-primary/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/30 text-2xl">
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <span>{item.emoji}</span>
          )}
        </div>
        {item.badge && (
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
            {item.badge}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-lg font-bold text-foreground">{item.title}</h3>
      <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      <div className="mt-auto flex items-center justify-between pt-5">
        {item.views ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            {item.views}
          </span>
        ) : <span />}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {item.cta}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}