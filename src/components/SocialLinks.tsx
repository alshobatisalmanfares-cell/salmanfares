import { Facebook, Instagram, Youtube, Music2, type LucideIcon } from "lucide-react";

export type SocialKey = "youtube" | "tiktok" | "instagram" | "facebook";

export const socials: { key: SocialKey; label: string; href: string; Icon: LucideIcon }[] = [
  { key: "youtube", label: "يوتيوب", href: "https://youtube.com/@salman7fares", Icon: Youtube },
  { key: "tiktok", label: "تيك توك", href: "https://www.tiktok.com/@salman7fares", Icon: Music2 },
  { key: "instagram", label: "إنستقرام", href: "https://www.instagram.com/salman7fares", Icon: Instagram },
  { key: "facebook", label: "فيسبوك", href: "https://www.facebook.com/profile.php?id=61589610831953", Icon: Facebook },
];

export function SocialLinks({ size = "md" }: { size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {socials.map(({ key, label, href, Icon }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className={`inline-flex ${cls} items-center justify-center rounded-full border border-border/70 bg-card/40 text-foreground transition-colors hover:bg-primary hover:text-primary-foreground`}
        >
          <Icon className={icon} />
        </a>
      ))}
    </div>
  );
}
