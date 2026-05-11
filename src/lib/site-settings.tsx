import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  id: string;
  hero_title_ar: string;
  hero_title_en: string;
  hero_highlight_ar: string;
  hero_highlight_en: string;
  hero_subtitle_ar: string;
  hero_subtitle_en: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  bg_color_1: string;
  bg_color_2: string;
  base_font_size: number;
  heading_scale: number;
};

const defaults: SiteSettings = {
  id: "main",
  hero_title_ar: "اكتشف",
  hero_title_en: "Discover",
  hero_highlight_ar: "أفضل التطبيقات والمواقع والألعاب",
  hero_highlight_en: "the best apps, websites & games",
  hero_subtitle_ar: "مكتبة مختارة من الأدوات الرقمية المفيدة، تُحدَّث باستمرار.",
  hero_subtitle_en: "A curated library of useful digital tools, updated regularly.",
  primary_color: "#7DD8FF",
  secondary_color: "#B891FF",
  accent_color: "#9FB7FF",
  bg_color_1: "#7DD8FF",
  bg_color_2: "#B891FF",
  base_font_size: 16,
  heading_scale: 1.0,
};

const Ctx = createContext<{ settings: SiteSettings; refresh: () => Promise<void> }>({
  settings: defaults,
  refresh: async () => {},
});

export function applySettingsToDom(s: SiteSettings) {
  const root = document.documentElement;
  root.style.setProperty("--bg-anim-1", s.bg_color_1);
  root.style.setProperty("--bg-anim-2", s.bg_color_2);
  root.style.setProperty("--site-primary", s.primary_color);
  root.style.setProperty("--site-secondary", s.secondary_color);
  root.style.setProperty("--site-accent", s.accent_color);
  root.style.setProperty("--site-heading-scale", String(s.heading_scale));
  document.body.style.fontSize = `${s.base_font_size}px`;
}

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaults);

  async function refresh() {
    const { data } = await supabase.from("site_settings").select("*").eq("id", "main").maybeSingle();
    if (data) {
      const merged = { ...defaults, ...(data as any) } as SiteSettings;
      setSettings(merged);
      applySettingsToDom(merged);
    } else {
      applySettingsToDom(defaults);
    }
  }

  useEffect(() => {
    refresh();
    const ch = supabase
      .channel("site_settings_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () => refresh())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  return <Ctx.Provider value={{ settings, refresh }}>{children}</Ctx.Provider>;
}

export function useSiteSettings() {
  return useContext(Ctx);
}
