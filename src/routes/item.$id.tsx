import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Calendar, Download, ExternalLink, Eye, FileType2, Globe, HardDrive, Heart, Languages, Lock, MonitorCog, ShieldCheck, Star, StarHalf, User } from "lucide-react";
import { fetchItem } from "@/lib/items";
import { useI18n } from "@/lib/i18n";
import { useFavorite } from "@/lib/favorites";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { socials, type SocialKey } from "@/components/SocialLinks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/item/$id")({
  head: () => ({ meta: [{ title: "تفاصيل | سلمان فارس" }] }),
  component: ItemDetailsPage,
});

function StarRating({ value }: { value: number }) {
  const v = Math.max(0, Math.min(5, value));
  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = v - i;
        if (fill >= 1)
          return <Star key={i} className="h-4 w-4 fill-primary text-primary" />;
        if (fill >= 0.25 && fill < 1)
          return (
            <span key={i} className="relative inline-flex">
              <Star className="h-4 w-4 text-muted-foreground/40" />
              <StarHalf className="absolute inset-0 h-4 w-4 fill-primary text-primary" />
            </span>
          );
        return <Star key={i} className="h-4 w-4 text-muted-foreground/40" />;
      })}
    </div>
  );
}

function isSafeUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function SpecRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
      <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase text-muted-foreground">{label}</div>
        <div className="text-sm font-medium text-foreground break-words">{value}</div>
      </div>
    </div>
  );
}

function SpecsSection({ item }: { item: any }) {
  const cats: string[] = item.categories ?? [];
  const hasBasic = item.developer || item.license || cats.length > 0 || item.language;
  const hasSystem = !!item.os;
  const hasDownload = item.file_type || item.file_size || item.update_date;
  if (!hasBasic && !hasSystem && !hasDownload) return null;
  return (
    <div className="mt-6 border-t border-border/50 pt-5 space-y-5">
      {hasBasic && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">معلومات أساسية</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <SpecRow icon={User} label="المطور" value={item.developer} />
            <SpecRow icon={ShieldCheck} label="الترخيص" value={item.license} />
            <SpecRow icon={Globe} label="القسم" value={cats.join(", ") || null} />
            <SpecRow icon={Languages} label="اللغة" value={item.language} />
          </div>
        </div>
      )}
      {hasSystem && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">متطلبات النظام</h3>
          <div className="grid grid-cols-1 gap-2">
            <SpecRow icon={MonitorCog} label="نظام التشغيل" value={item.os} />
          </div>
        </div>
      )}
      {hasDownload && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">معلومات عن التنزيل</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <SpecRow icon={FileType2} label="نوع الملف" value={item.file_type} />
            <SpecRow icon={HardDrive} label="حجم الملف" value={item.file_size} />
            <SpecRow icon={Calendar} label="تاريخ التحديث" value={item.update_date} />
          </div>
        </div>
      )}
    </div>
  );
}

function ItemDetailsPage() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const isRtl = lang === "ar" || lang === "ur";
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", id],
    queryFn: () => fetchItem(id),
  });

  const { isFav, toggle: toggleFav, loading: favLoading } = useFavorite(id);

  const [followOpen, setFollowOpen] = useState(false);
  const [clickedKeys, setClickedKeys] = useState<SocialKey[]>([]);
  const requiredKeys = ((item?.required_follows ?? []) as SocialKey[]);
  const requiresFollow = requiredKeys.length > 0;
  const followStorageKey = `follow:${id}`;
  const [followed, setFollowed] = useState(false);
  useEffect(() => {
    setFollowed(localStorage.getItem(followStorageKey) === "1");
  }, [followStorageKey]);
  const allClicked = requiredKeys.every((k) => clickedKeys.includes(k));

  function confirmFollowed() {
    if (!allClicked || !item) return;
    localStorage.setItem(followStorageKey, "1");
    setFollowed(true);
    setFollowOpen(false);
    if (isSafeUrl(item.url)) window.open(item.url, "_blank", "noopener,noreferrer");
  }

  async function handleFav() {
    const res = await toggleFav();
    if (res.needLogin) toast.error(t("favorites.loginRequired"));
  }

  if (isLoading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-muted-foreground">...</div>;
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg font-bold text-foreground">{t("details.notFound")}</p>
        <Link to="/" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
          <BackIcon className="h-4 w-4" /> {t("details.back")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <button
        onClick={() => navigate({ to: "/" })}
        className="mb-6 inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60"
      >
        <BackIcon className="h-4 w-4" />
        {t("details.back")}
      </button>

      <div className="rounded-2xl border border-border/60 bg-card/60 p-6 card-elevated">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-muted/30 text-5xl">
            {item.image_url ? (
              <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
            ) : (
              <span>{item.emoji}</span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">{item.title}</h1>
              {item.badge && (
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
                  {item.badge}
                </span>
              )}
            </div>
            {(item.categories ?? []).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(item.categories ?? []).map((c) => {
                  const label =
                    c === "ai" ? "أدوات الذكاء الاصطناعي"
                    : c === "apps" ? "تطبيقات"
                    : c === "websites" ? "مواقع"
                    : c === "games" ? "ألعاب"
                    : c;
                  return (
                    <span
                      key={c}
                      className="rounded-full border border-primary/40 bg-gradient-to-r from-primary/15 to-primary/5 px-2.5 py-0.5 text-[11px] font-semibold text-foreground"
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            )}
            {item.rating != null && (
              <div className="mt-2 flex items-center gap-2">
                <StarRating value={item.rating} />
                <span className="text-xs text-muted-foreground">{item.rating.toFixed(1)}</span>
              </div>
            )}
            {item.views && (
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Eye className="h-3.5 w-3.5" /> {item.views}
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={isSafeUrl(item.url) ? item.url : "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (requiresFollow && !followed) {
                    e.preventDefault();
                    setFollowOpen(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {requiresFollow && !followed ? <Lock className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                {item.cta || t("details.cta")}
              </a>
              <button
                type="button"
                onClick={handleFav}
                disabled={favLoading}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                  isFav
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 bg-card/40 text-foreground hover:bg-muted/60"
                }`}
              >
                <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
                {isFav ? t("favorites.remove") : t("favorites.add")}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-border/50 pt-5">
          <h2 className="text-sm font-bold uppercase text-muted-foreground">{t("details.description")}</h2>
          {(() => {
            const desc = item.description ?? "";
            const mid = Math.floor(desc.length / 2);
            const splitAt = desc.indexOf("\n\n", mid);
            const breakAt = splitAt > -1 ? splitAt : (desc.length > 200 ? desc.indexOf(". ", mid) + 1 : -1);
            const part1 = breakAt > 0 ? desc.slice(0, breakAt) : desc;
            const part2 = breakAt > 0 ? desc.slice(breakAt) : "";
            const hasGallery = item.gallery && item.gallery.length > 0;
            return (
              <>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">{part1}</p>
                {hasGallery && (
                  <div className="my-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {item.gallery.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`${item.title} ${i + 1}`}
                        loading="lazy"
                        className="aspect-square w-full rounded-xl border border-border/60 object-cover"
                      />
                    ))}
                  </div>
                )}
                {part2 && (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{part2}</p>
                )}
              </>
            );
          })()}
        </div>

        <SpecsSection item={item} />

        <div className="mt-6 border-t border-border/50 pt-5">
          <a
            href={isSafeUrl(item.url) ? item.url : "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (requiresFollow && !followed) {
                e.preventDefault();
                setFollowOpen(true);
              }
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-extrabold text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
          >
            {requiresFollow && !followed ? <Lock className="h-5 w-5" /> : <Download className="h-5 w-5" />}
            {item.cta || t("details.cta")}
          </a>
        </div>
      </div>

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