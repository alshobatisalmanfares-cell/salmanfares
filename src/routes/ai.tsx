import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "أدوات الذكاء الاصطناعي | سلمان فارس" },
      { name: "description", content: "قائمة مختارة من أفضل أدوات الذكاء الاصطناعي: توليد النصوص، الصور، الفيديو، والمساعدين الأذكياء لتعزيز إنتاجيتك اليومية." },
      { property: "og:title", content: "أدوات الذكاء الاصطناعي | سلمان فارس" },
      { property: "og:description", content: "أفضل أدوات AI للكتابة والتصميم والإنتاجية، مختارة ومحدثة على موقع سلمان فارس." },
      { property: "og:url", content: "https://salmanfares.lovable.app/ai" },
    ],
    links: [{ rel: "canonical", href: "https://salmanfares.lovable.app/ai" }],
  }),
  component: () => <Outlet />,
});