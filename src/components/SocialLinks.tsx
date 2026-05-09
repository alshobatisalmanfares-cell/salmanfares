import { Facebook, Instagram, Twitter, Youtube, Send } from "lucide-react";

export const socials = [
  { label: "يوتيوب", href: "https://youtube.com/@salmanfares", Icon: Youtube },
  { label: "تويتر / X", href: "https://x.com/salmanfares", Icon: Twitter },
  { label: "إنستقرام", href: "https://instagram.com/salmanfares", Icon: Instagram },
  { label: "فيسبوك", href: "https://facebook.com/salmanfares", Icon: Facebook },
  { label: "تيليجرام", href: "https://t.me/salmanfares", Icon: Send },
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