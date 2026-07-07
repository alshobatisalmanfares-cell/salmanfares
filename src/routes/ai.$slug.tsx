import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchItemBySlug } from "@/lib/items";
import { ItemDetails, buildItemHead } from "@/components/ItemDetails";

export const Route = createFileRoute("/ai/$slug")({
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["item-by-slug", params.slug],
      queryFn: () => fetchItemBySlug(params.slug),
    }),
  head: ({ params, loaderData }) =>
    buildItemHead((loaderData as any) ?? null, `https://salmanfares.lovable.app/ai/${params.slug}`),
  component: DetailPage,
});

function DetailPage() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["item-by-slug", slug],
    queryFn: () => fetchItemBySlug(slug),
  });
  return <ItemDetails item={data} loading={isLoading} />;
}
