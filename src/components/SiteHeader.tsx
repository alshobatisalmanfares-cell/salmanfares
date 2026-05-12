import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import avatarUrl from "@/assets/avatar.jpg";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SocialLinks } from "@/components/SocialLinks";
import { useI18n, LANGS, type Lang } from "@/lib/i18n";
import { Globe, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();
  const [signedIn, setSignedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function check(session: any) {
      setSignedIn(!!session);
      if (session) {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
        setIsAdmin((data ?? []).some((r) => r.role === "admin"));
      } else {
        setIsAdmin(false);
      }
      setAuthReady(true);
    }
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => check(session));
    supabase.auth.getSession().then(({ data }) => check(data.session));
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
          <img src={avatarUrl} alt="سلمان فارس" className="h-10 w-10 rounded-full object-cover ring-1 ring-border/70" />
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
          {isAdmin && (
            <Link to="/admin" className="rounded-md px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-muted/50">
              {t("nav.admin")}
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border/70 bg-card/40 px-2.5 text-xs font-bold text-foreground hover:bg-muted/50">
              <Globe className="h-4 w-4" />
              {LANGS.find((l) => l.code === lang)?.label}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANGS.map((l) => (
                <DropdownMenuItem key={l.code} onClick={() => setLang(l.code as Lang)}>
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
          {signedIn && isAdmin ? (
            <Link to="/admin" className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-primary/20">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              {t("nav.admin")}
            </Link>
          ) : signedIn ? (
            <button
              onClick={() => supabase.auth.signOut()}
              className="rounded-md border border-border/70 bg-card/40 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/50"
            >
              {t("nav.logout")}
            </button>
          ) : (
            <Link to="/login" className="rounded-md border border-border/70 bg-card/40 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/50">
              {t("nav.login")}
            </Link>
          )}
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
        {isAdmin && (
          <Link to="/admin" className="whitespace-nowrap rounded-md px-3 py-1 text-xs font-semibold text-foreground bg-muted/50">
            {t("nav.admin")}
          </Link>
        )}
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
        <div className="text-center text-xs text-muted-foreground">© {new Date().getFullYear()} سلمان فارس</div>
      </div>
    </footer>
  );
}
