import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://salmanfares.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const STATIC_ENTRIES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/apps", changefreq: "weekly", priority: "0.9" },
  { path: "/websites", changefreq: "weekly", priority: "0.9" },
  { path: "/games", changefreq: "weekly", priority: "0.9" },
  { path: "/ai", changefreq: "weekly", priority: "0.9" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/guides/android-on-pc", changefreq: "monthly", priority: "0.8" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
  { path: "/privacy", changefreq: "yearly", priority: "0.4" },
  { path: "/terms", changefreq: "yearly", priority: "0.4" },
];

async function fetchItemEntries(): Promise<SitemapEntry[]> {
  try {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return [];
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data } = await supabase
      .from("items")
      .select("id, slug, categories, updated_at, created_at")
      .limit(2000);
    return (data ?? []).map((row: { id: string; slug: string | null; categories: string[] | null; updated_at?: string; created_at?: string }) => {
      const cat = (row.categories ?? [])[0] ?? "apps";
      const path = row.slug ? `/${cat}/${row.slug}` : `/item/${row.id}`;
      const stamp = row.updated_at ?? row.created_at;
      return {
        path,
        lastmod: stamp ? stamp.slice(0, 10) : undefined,
        changefreq: "daily" as const,
        priority: "0.8",
      };
    });
  } catch {
    return [];
  }
}

function normalizePath(path: string): string {
  if (path === "/") return "";
  return path.replace(/\/$/, "");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const dynamicEntries = await fetchItemEntries();
        const entries = [...STATIC_ENTRIES, ...dynamicEntries];

        const urls = entries.map((e) => {
          const normalizedPath = normalizePath(e.path);
          return [
            `  <url>`,
            `    <loc>${BASE_URL}${normalizedPath}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n");
        });

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
