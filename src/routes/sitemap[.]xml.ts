import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

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

const VALID_CATEGORIES = new Set(["apps", "websites", "games", "ai"]);

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeItemPath(row: { id: string; slug: string | null; categories: string[] | null }) {
  const category = (row.categories ?? []).find((cat) => VALID_CATEGORIES.has(cat)) ?? "apps";
  return row.slug ? `/${category}/${row.slug}` : `/item/${row.id}`;
}

async function fetchItemEntries(): Promise<SitemapEntry[]> {
  try {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return [];
    const supabase = createClient<Database>(url, key, {
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    const { data, error } = await supabase
      .from("items")
      .select("id, slug, categories, updated_at, created_at")
      .order("updated_at", { ascending: false })
      .limit(2000);
    if (error) throw error;
    return (data ?? []).map((row) => {
      return {
        path: normalizeItemPath(row),
        lastmod: (row.updated_at ?? row.created_at)?.slice(0, 10),
        changefreq: "daily" as const,
        priority: "0.7",
      };
    });
  } catch (error) {
    console.error("Unable to generate dynamic sitemap entries", error);
    return [];
  }
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const dynamicEntries = await fetchItemEntries();
        const entries = [...STATIC_ENTRIES, ...dynamicEntries];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${escapeXml(`${BASE_URL}${e.path}`)}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=300",
          },
        });
      },
    },
  },
});
