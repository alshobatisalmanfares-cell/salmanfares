import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AiChat } from "@/components/AiChat";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "المساعد الذكي | موقع سلمان فارس" },
      { name: "description", content: "تحدث مع المساعد الرقمي الرسمي لموقع سلمان فارس بأي لغة، واحصل على ترشيحات التطبيقات والألعاب والأدوات." },
      { property: "og:title", content: "المساعد الذكي | موقع سلمان فارس" },
      { property: "og:description", content: "المساعد الرقمي الرسمي لموقع سلمان فارس من تطوير المهندس سلمان فارس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const navigate = useNavigate();
  return <AiChat open hideTrigger onOpenChange={(v) => !v && navigate({ to: "/" })} />;
}
