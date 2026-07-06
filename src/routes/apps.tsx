import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/apps")({
  head: () => ({
    meta: [
      { title: "أفضل التطبيقات | سلمان فارس" },
      { name: "description", content: "تصفح مجموعة مختارة من أفضل التطبيقات للأندرويد والآيفون: أدوات إنتاجية، تصميم، تواصل اجتماعي، وترفيه، محدثة باستمرار على موقع سلمان فارس." },
      { property: "og:title", content: "أفضل التطبيقات | سلمان فارس" },
      { property: "og:description", content: "قائمة مختارة لأفضل تطبيقات الهاتف — إنتاجية وتصميم وترفيه — بمراجعات موجزة." },
      { property: "og:url", content: "https://salmanfares.lovable.app/apps" },
    ],
    links: [{ rel: "canonical", href: "https://salmanfares.lovable.app/apps" }],
  }),
  component: AppsLayout,
});

function AppsLayout() {
  return <Outlet />;
}
