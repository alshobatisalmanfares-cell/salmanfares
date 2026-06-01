import { useEffect, useRef } from "react";

export function NativeBannerAd() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (container.dataset.injected === "1") return;
    container.dataset.injected = "1";

    const target = document.createElement("div");
    target.id = "container-1fd3de437d60db326297432f6ed0be74";
    container.appendChild(target);

    const s = document.createElement("script");
    s.async = true;
    s.setAttribute("data-cfasync", "false");
    s.src =
      "https://pl29600563.effectivecpmnetwork.com/1fd3de437d60db326297432f6ed0be74/invoke.js";
    container.appendChild(s);

    return () => {
      s.remove();
      target.remove();
    };
  }, []);

  return (
    <div className="flex justify-center">
      <div ref={containerRef} className="w-full max-w-[728px]" />
    </div>
  );
}