import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ExternalLink, Eye, Heart, Lock, Star, StarHalf } from "lucide-react";
import type { Item } from "@/lib/items";
import { socials, type SocialKey } from "./SocialLinks";
import { useI18n } from "@/lib/i18n";
import { useFavorite } from "@/lib/favorites";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

function isSafeUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

export function ItemCard({ item }: { item: Item }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [followOpen, setFollowOpen] = useState(false);
  const [clickedKeys, setClickedKeys] = useState<SocialKey[]>([]);
  const { isFav, toggle: toggleFav, loading: favLoading } = useFavorite(item.id);

  async function handleFavClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const res = await toggleFav();
    if (res.needLogin) toast.error(t("favorites.loginRequired"));
  }

  const requiredKeys = (item.required_follows ?? []) as SocialKey[];
  const requiresFollow = requiredKeys.length > 0;
  const followStorageKey = `follow:${item.id}`;
  const [followed, setFollowed] = useState(false);
  useEffect(() => {
    setFollowed(localStorage.getItem(followStorageKey) === "1");
  }, [followStorageKey]);

  const allClicked = requiredKeys.every((k) => clickedKeys.includes(k));

  function handleCtaClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (requiresFollow && !followed) {
      setFollowOpen(true);
      return;
    }
    openDetails();
  }

  function confirmFollowed() {
    if (!allClicked) return;
    localStorage.setItem(followStorageKey, "1");
    setFollowed(true);
    setFollowOpen(false);
    openDetails();
  }

  function openDetails() {
    navigate({ to: "/item/$id", params: { id: item.id } });
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("a,button,[role=dialog]")) return;
        openDetails();
      }}
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
        <a
          href={isSafeUrl(item.url) ? item.url : "#"}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleCtaClick}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {requiresFollow && !followed ? <Lock className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}
          {item.cta}
        </a>
      </div>

      <Dialog open={followOpen} onOpenChange={setFollowOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>{t("lock.follow.title")}</DialogTitle>
            <DialogDescription>{t("lock.follow.desc")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap justify-center gap-3 py-2">
            {requiredKeys.map((k) => {
              const s = socials.find((x) => x.key === k);
              if (!s) return null;
              const Icon = s.Icon;
              const done = clickedKeys.includes(k);
              return (
                <a
                  key={k}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setClickedKeys((prev) => (prev.includes(k) ? prev : [...prev, k]))}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/70 bg-card/40 hover:bg-primary hover:text-primary-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {s.label}
                  {done && <span aria-hidden>✓</span>}
                </a>
              );
            })}
          </div>
          <DialogFooter>
            <Button onClick={confirmFollowed} disabled={!allClicked}>
              {allClicked ? t("lock.follow.confirm") : t("lock.follow.pending")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
