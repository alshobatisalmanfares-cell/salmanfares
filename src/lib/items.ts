import { supabase } from "@/integrations/supabase/client";
import catalog from "./native-catalog.json";
import { NATIVE_APP } from "./native-runtime";
import { readOffline, writeOffline } from "./offline-data";

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
  if (NATIVE_APP) return (await nativeItems()).filter(item => !category || item.categories.includes(category));
  const cacheKey = `items:${category ?? "all"}`;
  if (typeof navigator !== "undefined" && !navigator.onLine) return readOffline(cacheKey, []);
  let q = supabase.from("items").select("*").order("sort_order", { ascending: false }).order("created_at", { ascending: false });
  if (category) q = q.contains("categories", [category]);
  const { data, error } = await q;
  if (error) {
    const cached = await readOffline<Item[] | null>(cacheKey, null);
    if (cached) return cached;
    throw error;
  }
  const items = (data ?? []) as unknown as Item[];
  await writeOffline(cacheKey, items);
  return items;
}

export async function fetchFeaturedItems(): Promise<Item[]> {
  if (NATIVE_APP) return (await nativeItems()).filter(item => item.featured);
  if (typeof navigator !== "undefined" && !navigator.onLine) return readOffline("items:featured", []);
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("featured", true)
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    const cached = await readOffline<Item[] | null>("items:featured", null);
    if (cached) return cached;
    throw error;
  }
  const items = (data ?? []) as unknown as Item[];
  await writeOffline("items:featured", items);
  return items;
}

export async function fetchItem(id: string): Promise<Item | null> {
  if (NATIVE_APP) return (await nativeItems()).find(item => item.id === id) ?? null;
  if (typeof navigator !== "undefined" && !navigator.onLine) return readOffline(`item:${id}`, null);
  const { data, error } = await supabase.from("items").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  const item = (data as unknown as Item) ?? null;
  await writeOffline(`item:${id}`, item);
  return item;
}

export async function fetchItemBySlug(slug: string): Promise<Item | null> {
  if (NATIVE_APP) return (await nativeItems()).find(item => item.slug === slug) ?? null;
  if (typeof navigator !== "undefined" && !navigator.onLine) return readOffline(`slug:${slug}`, null);
  const { data, error } = await supabase.from("items").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  const item = (data as unknown as Item) ?? null;
  await writeOffline(`slug:${slug}`, item);
  return item;
}

async function nativeItems(): Promise<Item[]> {
  return readOffline("native:catalog", catalog as unknown as Item[]);
}

/** Explicit native refresh keeps navigation independent of the network. */
export async function refreshNativeItems() {
  if (!NATIVE_APP) return;
  const { data, error } = await supabase.from("items").select("*").order("sort_order", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as unknown as Item[];
  const old = await nativeItems();
  async function cacheImage(url: string | null, oldUrl?: string | null) {
    if (!url || !url.startsWith("https://")) return url;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Image unavailable");
      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) throw new Error("Not an image");
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Image unavailable"));
        reader.onerror = () => reject(new Error("Image unavailable"));
        reader.readAsDataURL(blob);
      });
    } catch { return oldUrl ?? null; }
  }
  for (const item of rows) {
    const previous = old.find(row => row.id === item.id);
    item.image_url = await cacheImage(item.image_url, previous?.image_url);
    const gallery: string[] = [];
    for (const [index, url] of (item.gallery ?? []).entries()) {
      const image = await cacheImage(url, previous?.gallery?.[index]);
      if (image) gallery.push(image);
    }
    item.gallery = gallery;
  }
  await writeOffline("native:catalog", rows);
}

export function itemPath(item: Pick<Item, "slug" | "id" | "categories">): { to: string; params: Record<string, string> } {
  const cat = (item.categories ?? [])[0] ?? "apps";
  if (item.slug) {
    return { to: `/${cat}/$slug`, params: { slug: item.slug } };
  }
  return { to: "/item/$id", params: { id: item.id } };
}