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