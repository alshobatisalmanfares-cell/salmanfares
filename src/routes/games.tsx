import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "أفضل الألعاب | سلمان فارس" },
      { name: "description", content: "تصفح مجموعة مختارة من أفضل الألعاب للهاتف والكمبيوتر: أكشن، مغامرة، رياضة، وألعاب متعددة اللاعبين على موقع سلمان فارس." },
      { property: "og:title", content: "أفضل الألعاب | سلمان فارس" },
      { property: "og:description", content: "قائمة مختارة لأفضل ألعاب الأندرويد والآيفون والكمبيوتر بمراجعات مختصرة." },
      { property: "og:url", content: "https://salmanfares.lovable.app/games" },
    ],
    links: [{ rel: "canonical", href: "https://salmanfares.lovable.app/games" }],
  }),
  component: () => <Outlet />,
});