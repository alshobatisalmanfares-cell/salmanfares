// Placeholder ad slot rendered while AdSense review is pending.
// Once AdSense approves the site, replace inner content with the real ad unit.
export function AdSlot({
  label = "مساحة إعلانية",
  variant = "banner",
  className = "",
}: {
  label?: string;
  variant?: "banner" | "inline" | "sidebar";
  className?: string;
}) {
  const height =
    variant === "banner" ? "h-20 md:h-24"
    : variant === "sidebar" ? "h-64"
    : "h-24";
  return (
    <div
      aria-hidden="true"
      className={`mx-auto flex w-full max-w-3xl items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ${height} ${className}`}
    >
      {label}
    </div>
  );
}
