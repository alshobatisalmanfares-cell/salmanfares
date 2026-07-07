import { supabase } from "@/integrations/supabase/client";

export type ItemCategory = "apps" | "websites" | "games" | "ai";

export const ALL_CATEGORIES: ItemCategory[] = ["apps", "websites", "games", "ai"];

export type Item = {
  id: string;
  slug: string | null;
  featured: boolean;
  title: string;
  description: string;
  categories: ItemCategory[];
  url: string;
  cta: string;
  badge: string | null;
  views: string | null;
  emoji: string;
  image_url: string | null;
  rating: number | null;
  required_follows: string[];
  gallery: string[];
  sort_order: number;
  created_at: string;
  developer?: string | null;
  license?: string | null;
  language?: string | null;
  os?: string | null;
  file_type?: string | null;
  file_size?: string | null;
  update_date?: string | null;
};

export async function fetchItems(category?: ItemCategory): Promise<Item[]> {
  let q = supabase.from("items").select("*").order("sort_order", { ascending: false }).order("created_at", { ascending: false });
  if (category) q = q.contains("categories", [category]);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as Item[];
}

export async function fetchFeaturedItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("featured", true)
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Item[];
}

export async function fetchItem(id: string): Promise<Item | null> {
  const { data, error } = await supabase.from("items").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as unknown as Item) ?? null;
}

export async function fetchItemBySlug(slug: string): Promise<Item | null> {
  const { data, error } = await supabase.from("items").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return (data as unknown as Item) ?? null;
}

export function itemPath(item: Pick<Item, "slug" | "id" | "categories">): { to: string; params: Record<string, string> } {
  const cat = (item.categories ?? [])[0] ?? "apps";
  if (item.slug) {
    return { to: `/${cat}/$slug`, params: { slug: item.slug } };
  }
  return { to: "/item/$id", params: { id: item.id } };
}