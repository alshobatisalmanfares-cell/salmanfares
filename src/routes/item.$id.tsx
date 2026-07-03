import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchItem, itemPath } from "@/lib/items";
import { ItemDetails, buildItemHead } from "@/components/ItemDetails";

export const Route = createFileRoute("/item/$id")({
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["item", params.id],
      queryFn: () => fetchItem(params.id),
    }),
  head: ({ params, loaderData }) =>
    buildItemHead((loaderData as any) ?? null, `https://salmanfares.lovable.app/item/${params.id}`),
  component: ItemByIdPage,
});

function ItemByIdPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: item, isLoading } = useQuery({
    queryKey: ["item", id],
    queryFn: () => fetchItem(id),
  });

  // Prefer clean slug URL when available
  useEffect(() => {
    if (item?.slug) {
      const p = itemPath(item);
      navigate({ to: p.to as any, params: p.params as any, replace: true });
    }
  }, [item, navigate]);

  return <ItemDetails item={item} loading={isLoading} />;
}
