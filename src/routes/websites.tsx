import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/websites")({
  head: () => ({
    meta: [
      { title: "أفضل المواقع | سلمان فارس" },
      { name: "description", content: "تصفح أفضل المواقع التقنية المفيدة: أدوات ويب، تعلم، تصميم، إنتاجية، وموارد مختارة بعناية ومحدثة باستمرار." },
      { property: "og:title", content: "أفضل المواقع | سلمان فارس" },
      { property: "og:description", content: "قائمة مختارة لأفضل المواقع التقنية والأدوات المفيدة على الإنترنت." },
      { property: "og:url", content: "https://salmanfares.lovable.app/websites" },
    ],
    links: [{ rel: "canonical", href: "https://salmanfares.lovable.app/websites" }],
  }),
  component: () => <Outlet />,
});
