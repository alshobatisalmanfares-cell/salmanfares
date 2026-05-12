import { Facebook, Instagram, Youtube, Music2 } from "lucide-react";

export const socials = [
  { label: "يوتيوب", href: "https://youtube.com/@salman7fares", Icon: Youtube },
  { label: "تيك توك", href: "https://www.tiktok.com/@salman7fares", Icon: Music2 },
  { label: "إنستقرام", href: "https://www.instagram.com/salman7fares", Icon: Instagram },
  { label: "فيسبوك", href: "https://www.facebook.com/profile.php?id=61589610831953", Icon: Facebook },
];

export function SocialLinks({ size = "md" }: { size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {socials.map(({ label, href, Icon }) => (
        <a
          key={label}
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