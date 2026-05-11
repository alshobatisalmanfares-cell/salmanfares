import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import avatarUrl from "@/assets/avatar.jpg";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SocialLinks } from "@/components/SocialLinks";
import { useI18n } from "@/lib/i18n";

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  const nav = [
    { to: "/", label: t("nav.home") },
    { to: "/apps", label: t("nav.apps") },
    { to: "/websites", label: t("nav.websites") },
    { to: "/games", label: t("nav.games") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={avatarUrl}
            alt="سلمان فارس"
            className="h-10 w-10 rounded-full object-cover ring-1 ring-border/70"
          />
          <span className="text-xl font-extrabold text-foreground md:text-2xl">سلمان فارس</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-1.5 text-sm font-semibold text-foreground bg-muted/50" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            aria-label="language"
            className="inline-flex h-9 items-center justify-center rounded-md border border-border/70 bg-card/40 px-2.5 text-xs font-bold text-foreground hover:bg-muted/50"
          >
            {lang === "ar" ? "English" : "عربي"}
          </button>
          <ThemeToggle />
          <Link
            to={signedIn ? "/admin" : "/login"}
            className="rounded-md border border-border/70 bg-card/40 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/50"
          >
            {signedIn ? t("nav.admin") : t("nav.login")}
          </Link>
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className="whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            activeProps={{ className: "whitespace-nowrap rounded-md px-3 py-1 text-xs font-semibold text-foreground bg-muted/50" }}
          >
            {n.label}
          </Link>
        ))}
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
          © {new Date().getFullYear()} سلمان فارس
        </div>
      </div>
    </footer>
  );
}
