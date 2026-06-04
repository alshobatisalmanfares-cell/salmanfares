import { supabase } from "@/integrations/supabase/client";

export type ItemCategory = "apps" | "websites" | "games";

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
  if (category) q = q.eq("category", category);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Item[];
}

export async function fetchItem(id: string): Promise<Item | null> {
  const { data, error } = await supabase.from("items").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Item) ?? null;
}