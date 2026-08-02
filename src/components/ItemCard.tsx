import { useNavigate } from "@tanstack/react-router";
import { ExternalLink, Eye, Heart, Lock, Star, StarHalf } from "lucide-react";
import type { Item } from "@/lib/items";
import { itemPath } from "@/lib/items";
import { useI18n } from "@/lib/i18n";
import { useFavorite } from "@/lib/favorites";
import { toast } from "sonner";

function StarRating({ value }: { value: number }) {
  const v = Math.max(0, Math.min(5, value));
  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = v - i;
        if (fill >= 1)
          return <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />;
        if (fill >= 0.25 && fill < 1)
          return (
            <span key={i} className="relative inline-flex">
              <Star className="h-3.5 w-3.5 text-muted-foreground/40" />
              <StarHalf className="absolute inset-0 h-3.5 w-3.5 fill-primary text-primary" />
            </span>
          );
        return <Star key={i} className="h-3.5 w-3.5 text-muted-foreground/40" />;
      })}
    </div>
  );
}

export function ItemCard({ item }: { item: Item }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { isFav, toggle: toggleFav, loading: favLoading } = useFavorite(item.id);

  const detailsPath = itemPath(item);

  function openDetails() {
    if (!item.slug && !item.id) return;
    navigate({ to: detailsPath.to as any, params: detailsPath.params as any });
  }

  async function handleFavClick(e: React.MouseEvent) {
    e.stopPropagation();
    const res = await toggleFav();
    if (res.needLogin) toast.error(t("favorites.loginRequired"));
  }

  const requiresFollow = (item.required_follows ?? []).length > 0;

  function handleCtaClick(e: React.MouseEvent) {
    e.stopPropagation();
    openDetails();
  }

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetails();
        }
      }}
      className="group flex cursor-pointer flex-col rounded-2xl border border-border/60 bg-card/60 p-5 card-elevated hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted/30 text-2xl">
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <span>{item.emoji}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {item.badge && (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
              {item.badge}
            </span>
          )}
          <button
            type="button"
            onClick={handleFavClick}
            disabled={favLoading}
            aria-label={isFav ? t("favorites.remove") : t("favorites.add")}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
              isFav
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 bg-card/40 text-muted-foreground hover:text-primary"
            }`}
          >
            <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
      <h3 className="mt-4 text-lg font-bold text-foreground">{item.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-3">
        {item.description}
      </p>
      {item.rating != null && (
        <div className="mt-2 flex items-center gap-1">
          <StarRating value={item.rating} />
          <span className="ms-1 text-xs text-muted-foreground">{item.rating.toFixed(1)}</span>
        </div>
      )}
      <div className="mt-auto flex items-center justify-between pt-5">
        {item.views ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            {item.views}
          </span>
        ) : <span />}
        <button
          type="button"
          onClick={handleCtaClick}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {requiresFollow ? <Lock className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}
          {item.cta}
        </button>
      </div>
    </article>
  );
}
