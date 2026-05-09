import { supabase } from "@/integrations/supabase/client";

export type ItemCategory = "apps" | "websites" | "trending";

export type Item = {
  id: string;
  title: string;
  description: string;
  category: ItemCategory;
  url: string;
  cta: string;
  badge: string | null;
  views: string | null;
  emoji: string;
  image_url: string | null;
  sort_order: number;
  created_at: string;
};

export async function fetchItems(category?: ItemCategory): Promise<Item[]> {
  let q = supabase.from("items").select("*").order("sort_order", { ascending: false }).order("created_at", { ascending: false });
  if (category) q = q.eq("category", category);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Item[];
}

export async function fetchTrending(limit = 6): Promise<Item[]> {
  const { data, error } = await supabase.from("items").select("*").order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  const all = (data ?? []) as Item[];
  return [...all].sort((a, b) => parseViews(b.views) - parseViews(a.views)).slice(0, limit);
}

function parseViews(v: string | null) {
  if (!v) return 0;
  const n = parseFloat(v);
  if (v.includes("M")) return n * 1_000_000;
  if (v.includes("K")) return n * 1_000;
  return n || 0;
}