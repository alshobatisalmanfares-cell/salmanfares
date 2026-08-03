import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Home, AppWindow, Globe, Gamepad2, Info, Mail, Shield, FileText, Languages, Settings as SettingsIcon, Heart, Sparkles, Bot, Download } from "lucide-react";
import { toast } from "sonner";
import { usePwaInstall } from "@/lib/pwa-install";
import { supabase } from "@/integrations/supabase/client";
import avatarUrl from "@/assets/avatar.jpg";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SocialLinks } from "@/components/SocialLinks";
import { useI18n, LANGS, type Lang } from "@/lib/i18n";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { AiChat } from "@/components/AiChat";

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { canInstall, install } = usePwaInstall();

  async function handleInstall() {
    setOpen(false);
    const res = await install();
    if (res === "unavailable") {
      toast("أضف الموقع إلى الشاشة الرئيسية من خيارات المتصفح (مشاركة ← إضافة إلى الشاشة الرئيسية).");
    }
  }

  async function refreshRole(userId: string | undefined) {
    if (!userId) { setIsAdmin(false); return; }
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    setIsAdmin((data ?? []).some((r) => r.role === "admin"));
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
      refreshRole(session?.user?.id);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(!!data.session);
      refreshRole(data.session?.user?.id);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setOpen(false);
  }

  const mainNav = [
    { to: "/", label: t("nav.home"), Icon: Home },
    { to: "/apps", label: t("nav.apps"), Icon: AppWindow },
    { to: "/websites", label: t("nav.websites"), Icon: Globe },
    { to: "/games", label: t("nav.games"), Icon: Gamepad2 },
    { to: "/ai", label: t("nav.ai"), Icon: Sparkles },
    { to: "/favorites", label: t("favorites.title"), Icon: Heart },
  ] as const;
  const legalNav = [
    { to: "/about", label: t("nav.about"), Icon: Info },
    { to: "/contact", label: t("nav.contact"), Icon: Mail },
    { to: "/privacy", label: t("nav.privacy"), Icon: Shield },
    { to: "/terms", label: t("nav.terms"), Icon: FileText },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        {/* Hamburger trigger — visually top-left in RTL via flex order on the controls cluster */}
        <div className="flex items-center gap-2 order-last">
          <AiChat open={chatOpen} onOpenChange={setChatOpen} />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label={t("menu.open")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border/60 bg-card/40 text-foreground transition-colors hover:bg-muted/60"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[340px] overflow-y-auto" data-menu>
              <SheetHeader>
                <SheetTitle className="text-lg font-extrabold">{t("menu.title")}</SheetTitle>
              </SheetHeader>

              <div className="mt-4">
                <div className="text-[11px] font-bold uppercase text-muted-foreground">{t("menu.main")}</div>
                <nav className="mt-2 flex flex-col gap-1">
                  {mainNav.map(({ to, label, Icon }) => (
                    <SheetClose asChild key={to}>
                      <Link
                        to={to}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/60"
                        activeProps={{ className: "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold bg-primary/10 text-foreground" }}
                      >
                        <Icon className="h-4 w-4 text-primary" />
                        {label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setTimeout(() => setChatOpen(true), 220);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-primary/20"
                >
                  <Bot className="h-4 w-4 text-primary" />
                  المساعد الرقمي
                </button>
                <button
                  type="button"
                  onClick={handleInstall}
                  className="flex w-full items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-3 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-muted/60"
                >
                  <Download className="h-4 w-4 text-primary" />
                  تثبيت التطبيق
                  {canInstall && (
                    <span className="ms-auto rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-500">
                      جاهز
                    </span>
                  )}
                </button>
              </div>

              <div className="mt-6 border-t border-border/50 pt-4">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-muted-foreground">
                  <SettingsIcon className="h-3.5 w-3.5" />
                  {t("menu.settings")}
                </div>
                <div className="mt-3 space-y-3">
                  <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                      <Languages className="h-3.5 w-3.5" />
                      {t("menu.language")}
                    </label>
                    <select
                      value={lang}
                      onChange={(e) => setLang(e.target.value as Lang)}
                      aria-label={t("menu.language")}
                      className="mt-2 h-9 w-full rounded-md border border-border/60 bg-background px-2 text-sm font-bold text-foreground"
                    >
                      {LANGS.map((l) => (
                        <option key={l.code} value={l.code} className="bg-background text-foreground">
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">{t("menu.theme")}</span>
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-border/50 pt-4">
                <div className="text-[11px] font-bold uppercase text-muted-foreground">{t("menu.legal")}</div>
                <nav className="mt-2 flex flex-col gap-1">
                  {legalNav.map(({ to, label, Icon }) => (
                    <SheetClose asChild key={to}>
                      <Link
                        to={to}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/60"
                      >
                        <Icon className="h-4 w-4 text-primary" />
                        {label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </div>

              <div className="mt-6 border-t border-border/50 pt-4">
                {signedIn && isAdmin ? (
                  <SheetClose asChild>
                    <Link
                      to="/admin"
                      className="block w-full rounded-lg bg-primary px-3 py-2 text-center text-sm font-bold text-primary-foreground hover:opacity-90"
                    >
                      {t("nav.admin")}
                    </Link>
                  </SheetClose>
                ) : signedIn ? (
                  <button
                    onClick={handleLogout}
                    className="block w-full rounded-lg border border-border/70 bg-card/40 px-3 py-2 text-center text-sm font-bold text-foreground hover:bg-muted/60"
                  >
                    {t("nav.logout")}
                  </button>
                ) : (
                  <SheetClose asChild>
                    <Link
                      to="/login"
                      className="block w-full rounded-lg bg-primary px-3 py-2 text-center text-sm font-bold text-primary-foreground hover:opacity-90"
                    >
                      {t("nav.login")}
                    </Link>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Link to="/" className="flex items-center gap-2">
          <img
            src={avatarUrl}
            alt={t("site.name")}
            width={40}
            height={40}
            fetchPriority="high"
            decoding="async"
            className="h-10 w-10 rounded-full object-cover ring-1 ring-border/70"
          />
          <span className="text-xl font-extrabold text-foreground md:text-2xl">{t("site.name")}</span>
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 border-t border-border/60 bg-background/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8">
        <SocialLinks />
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <Link to="/about" className="hover:text-foreground">{t("footer.about")}</Link>
          <Link to="/contact" className="hover:text-foreground">{t("footer.contact")}</Link>
        </div>
        <div className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t("site.name")}
        </div>
      </div>
    </footer>
  );
}
