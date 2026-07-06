import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Calendar, Download, Eye, FileType2, Globe, HardDrive, Heart, Home as HomeIcon, Languages, Loader2, Lock, MonitorCog, ShieldCheck, Star, StarHalf, User } from "lucide-react";
import type { Item } from "@/lib/items";
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
import { AdSlot } from "@/components/AdSlot";

export function isSafeUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

export function buildItemHead(item: Item | null, url: string) {
  const title = item?.title ? `${item.title} | سلمان فارس` : "تفاصيل | سلمان فارس";
  const rawDesc = (item?.description ?? "").replace(/\s+/g, " ").trim();
  const description = rawDesc
    ? rawDesc.slice(0, 155) + (rawDesc.length > 155 ? "…" : "")
    : "تفاصيل العنصر على موقع سلمان فارس — الوصف، المواصفات، والمعرض.";
  const image = item?.image_url || undefined;
  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: item?.title ?? title },
    { property: "og:description", content: description },
    { property: "og:type", content: "article" },
    { property: "og:url", content: url },
  ];
  if (image) {
    meta.push({ property: "og:image", content: image });
    meta.push({ name: "twitter:image", content: image });
  }
  const scripts = item
    ? [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: item.title,
          description,
          url,
          image,
          applicationCategory: (item.categories ?? []).includes("games") ? "GameApplication" : "WebApplication",
          operatingSystem: item.os ?? undefined,
          ...(item.rating != null ? { aggregateRating: { "@type": "AggregateRating", ratingValue: item.rating, ratingCount: 1, bestRating: 5 } } : {}),
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      }]
    : undefined;
  return { meta, links: [{ rel: "canonical", href: url }], ...(scripts ? { scripts } : {}) };
}

function StarRating({ value }: { value: number }) {
  const v = Math.max(0, Math.min(5, value));
  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = v - i;
        if (fill >= 1) return <Star key={i} className="h-4 w-4 fill-primary text-primary" />;
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

function SpecsSection({ item }: { item: Item }) {
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

function renderBoldSegments(text: string) {
  const parts: Array<string | JSX.Element> = [];
  const boldPattern = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = boldPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index).replace(/\*\*/g, ""));
    }
    parts.push(
      <strong key={`${match.index}-${match[1]}`} className="text-lg font-bold text-white">
        {match[1].replace(/\*\*/g, "")}
      </strong>,
    );
    lastIndex = boldPattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex).replace(/\*\*/g, ""));
  }

  return parts;
}

function DescriptionMarkdown({ children }: { children: string }) {
  const paragraphs = children
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return null;

  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="my-3 whitespace-pre-line text-sm leading-relaxed text-foreground">
          {renderBoldSegments(paragraph)}
        </p>
      ))}
    </>
  );
}

export function ItemDetails({ item, loading }: { item: Item | null | undefined; loading?: boolean }) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const isRtl = lang === "ar" || lang === "ur";
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const { isFav, toggle: toggleFav, loading: favLoading } = useFavorite(item?.id ?? "");

  const [followOpen, setFollowOpen] = useState(false);
  const [clickedKeys, setClickedKeys] = useState<SocialKey[]>([]);
  const requiredKeys = ((item?.required_follows ?? []) as SocialKey[]);
  const requiresFollow = requiredKeys.length > 0;
  const followStorageKey = `follow:${item?.id ?? ""}`;
  const [followed, setFollowed] = useState(false);
  useEffect(() => {
    if (!item) return;
    setFollowed(localStorage.getItem(followStorageKey) === "1");
  }, [followStorageKey, item]);
  const allClicked = requiredKeys.every((k) => clickedKeys.includes(k));

  function confirmFollowed() {
    if (!allClicked || !item) return;
    localStorage.setItem(followStorageKey, "1");
    setFollowed(true);
    setFollowOpen(false);
    if (isSafeUrl(item.url)) window.open(item.url, "_blank", "noopener,noreferrer");
  }

  async function handleFav() {
    if (!item) return;
    const res = await toggleFav();
    if (res.needLogin) toast.error(t("favorites.loginRequired"));
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-3 px-4 py-24 text-center text-sm text-muted-foreground">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span>{t("loading.wait")}</span>
      </div>
    );
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
      <div className={`mb-6 flex items-center justify-between gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? window.history.back() : navigate({ to: "/" }))}
          aria-label={t("details.back")}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/40 text-foreground transition-colors hover:bg-muted/60"
        >
          <BackIcon className="h-4 w-4" />
        </button>
        <Link
          to="/"
          aria-label={t("nav.home")}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/40 text-foreground transition-colors hover:bg-muted/60"
        >
          <HomeIcon className="h-4 w-4" />
        </Link>
      </div>

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
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">{item.title}</h1>
              <button
                type="button"
                onClick={handleFav}
                disabled={favLoading}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isFav ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-card/40 text-foreground hover:bg-muted/60"
                }`}
              >
                <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
                {isFav ? t("favorites.remove") : t("favorites.add")}
              </button>
            </div>

            {((item.categories ?? []).length > 0 || item.badge) && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {item.badge && (
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
                    {item.badge}
                  </span>
                )}
                {(item.categories ?? []).map((c) => {
                  const label = c === "ai" ? "أدوات الذكاء الاصطناعي"
                    : c === "apps" ? "تطبيقات"
                    : c === "websites" ? "مواقع"
                    : c === "games" ? "ألعاب" : c;
                  return (
                    <span key={c} className="rounded-full border border-primary/40 bg-gradient-to-r from-primary/15 to-primary/5 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
                      {label}
                    </span>
                  );
                })}
              </div>
            )}

            {(item.rating != null || item.views) && (
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                {item.rating != null && (
                  <div className="inline-flex items-center gap-1.5">
                    <span className="text-sm font-bold text-foreground">{item.rating.toFixed(1)}</span>
                    <StarRating value={item.rating} />
                  </div>
                )}
                {item.views && (
                  <div className="inline-flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> {item.views}
                  </div>
                )}
              </div>
            )}
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
                <div className="mt-2 text-right" dir="auto">
                  <DescriptionMarkdown>{part1}</DescriptionMarkdown>
                </div>
                {hasGallery && (
                  <div className="my-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {item.gallery.map((src, i) => (
                      <img key={i} src={src} alt={`${item.title} ${i + 1}`} loading="lazy" className="aspect-square w-full rounded-xl border border-border/60 object-cover" />
                    ))}
                  </div>
                )}
                <AdSlot variant="inline" className="my-6" />
                {part2 && (
                  <div className="text-right" dir="auto">
                    <DescriptionMarkdown>{part2}</DescriptionMarkdown>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        <SpecsSection item={item} />

        <div className="mt-6 border-t border-border/50 pt-5">
          <button
            type="button"
            onClick={(e) => {
              if (requiresFollow && !followed) {
                e.preventDefault();
                setFollowOpen(true);
                return;
              }
              if (isSafeUrl(item.url)) window.open(item.url, "_blank", "noopener,noreferrer");
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-extrabold text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
          >
            {requiresFollow && !followed ? <Lock className="h-5 w-5" /> : <Download className="h-5 w-5" />}
            {item.cta || t("details.cta")}
          </button>
        </div>
      </div>

      <AdSlot variant="banner" className="mt-8" />

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
                    done ? "border-primary bg-primary text-primary-foreground" : "border-border/70 bg-card/40 hover:bg-primary hover:text-primary-foreground"
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
