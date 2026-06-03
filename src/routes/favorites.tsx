import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchFavoriteItems } from "@/lib/favorites";
import { ItemCard } from "@/components/ItemCard";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "المفضلة | سلمان فارس" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { t } = useI18n();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserId(s?.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["favorites", userId],
    queryFn: () => fetchFavoriteItems(userId as string),
    enabled: !!userId,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-extrabold text-foreground">{t("favorites.title")}</h1>
      {userId === null ? (
        <div className="rounded-xl border border-border/60 bg-card/40 p-6 text-center">
          <p className="text-sm text-muted-foreground">{t("favorites.loginRequired")}</p>
          <Link to="/login" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            {t("nav.login")}
          </Link>
        </div>
      ) : isLoading || userId === undefined ? (
        <p className="text-sm text-muted-foreground">...</p>
      ) : (data?.length ?? 0) === 0 ? (
        <p className="text-sm text-muted-foreground">{t("favorites.empty")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data!.map((it) => <ItemCard key={it.id} item={it} />)}
        </div>
      )}
    </div>
  );
}