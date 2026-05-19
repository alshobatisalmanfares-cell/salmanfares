import { useEffect, useState } from "react";
import { ExternalLink, Eye, Lock, Star, StarHalf } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { Item } from "@/lib/items";
import { supabase } from "@/integrations/supabase/client";
import { socials, type SocialKey } from "./SocialLinks";
import { useI18n } from "@/lib/i18n";
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

export function ItemCard({ item }: { item: Item }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [followOpen, setFollowOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [clickedKeys, setClickedKeys] = useState<SocialKey[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const requiredKeys = (item.required_follows ?? []) as SocialKey[];
  const requiresFollow = requiredKeys.length > 0;
  const followStorageKey = `follow:${item.id}`;
  const [followed, setFollowed] = useState(false);
  useEffect(() => {
    setFollowed(localStorage.getItem(followStorageKey) === "1");
  }, [followStorageKey]);

  const allClicked = requiredKeys.every((k) => clickedKeys.includes(k));

  function handleClick(e: React.MouseEvent) {
    if (!signedIn) {
      e.preventDefault();
      setLoginOpen(true);
      return;
    }
    if (requiresFollow && !followed) {
      e.preventDefault();
      setFollowOpen(true);
    }
  }

  function confirmFollowed() {
    if (!allClicked) return;
    localStorage.setItem(followStorageKey, "1");
    setFollowed(true);
    setFollowOpen(false);
    window.open(item.url, "_blank", "noopener,noreferrer");
  }

  const isLong = item.description.length > 140;

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
      <p
        className={`mt-1.5 text-sm leading-relaxed text-muted-foreground ${
          expanded ? "" : "line-clamp-3"
        }`}
      >
        {item.description}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 self-start text-xs font-semibold text-primary hover:underline"
        >
          {expanded ? t("card.less") : t("card.more")}
        </button>
      )}
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
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {!signedIn || (requiresFollow && !followed) ? <Lock className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}
          {item.cta}
        </a>
      </div>

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("lock.login.title")}</DialogTitle>
            <DialogDescription>{t("lock.login.desc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => navigate({ to: "/login" })}>{t("lock.login.cta")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={followOpen} onOpenChange={setFollowOpen}>
        <DialogContent>
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
