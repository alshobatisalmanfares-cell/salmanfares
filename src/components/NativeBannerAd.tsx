import { useEffect, useRef, useState } from "react";

const CONTAINER_ID = "container-1fd3de437d60db326297432f6ed0be74";
const SCRIPT_SRC =
  "https://pl29600563.effectivecpmnetwork.com/1fd3de437d60db326297432f6ed0be74/invoke.js";

/**
 * Native banner ad slot. Rendered client-side only to avoid SSR hydration
 * mismatches (the ad script injects DOM after mount).
 */
export function NativeBannerAd({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const host = ref.current;
    if (!host) return;
    if (host.dataset.injected === "1") return;
    host.dataset.injected = "1";

    const s = document.createElement("script");
    s.async = true;
    s.setAttribute("data-cfasync", "false");
    s.src = SCRIPT_SRC;
    host.appendChild(s);

    return () => {
      s.remove();
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/30 p-4 ${className}`}
      suppressHydrationWarning
    >
      <div id={CONTAINER_ID} className="w-full" />
    </div>
  );
}