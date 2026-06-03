import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Item } from "./items";

export async function fetchFavoriteItems(userId: string): Promise<Item[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select("item_id, items:items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: any) => r.items).filter(Boolean) as Item[];
}

export function useFavorite(itemId: string) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setUserId(data.session?.user?.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setUserId(s?.user?.id ?? null);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setIsFav(false);
      return;
    }
    let cancelled = false;
    supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("item_id", itemId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setIsFav(!!data);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, itemId]);

  const toggle = useCallback(async () => {
    if (!userId) return { needLogin: true } as const;
    setLoading(true);
    try {
      if (isFav) {
        await supabase.from("favorites").delete().eq("user_id", userId).eq("item_id", itemId);
        setIsFav(false);
      } else {
        await supabase.from("favorites").insert({ user_id: userId, item_id: itemId });
        setIsFav(true);
      }
      return { needLogin: false } as const;
    } finally {
      setLoading(false);
    }
  }, [userId, itemId, isFav]);

  return { isFav, toggle, loading, signedIn: !!userId };
}