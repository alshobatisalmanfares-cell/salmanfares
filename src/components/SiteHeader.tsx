import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

const nav = [
  { to: "/", label: "الرئيسية" },
  { to: "/apps", label: "أفضل التطبيقات" },
  { to: "/websites", label: "أفضل المواقع" },
  { to: "/earn", label: "الربح من الإنترنت" },
  { to: "/trending", label: "الأكثر مشاهدة" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow-purple">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-extrabold text-gradient-primary">سلمان فارس</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/40"
              activeProps={{ className: "rounded-lg px-3 py-2 text-sm font-semibold text-foreground bg-muted/60" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex gap-1 overflow-x-auto px-4 pb-3 md:hidden">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            activeProps={{ className: "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground bg-muted/60" }}
          >
            {n.label}
          </Link>
        ))}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background/40">
      <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} سلمان فارس — جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}