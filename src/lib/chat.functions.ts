import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(30),
});

const SYSTEM_PROMPT = `أنت "المساعد الرقمي لموقع سلمان فارس".

هوية الموقع:
موقع "سلمان فارس" منصة رقمية موثوقة متخصصة في استعراض وتوفير أحدث التطبيقات والألعاب والمواقع المتميزة وأدوات الذكاء الاصطناعي، مع روابط تحميل وتصفح مباشرة وسهلة.

الأقسام المتوفرة فعلياً:
- التطبيقات (/apps): تطبيقات أندرويد وآيفون منتقاة بعناية للإنتاجية والأدوات.
- الألعاب (/games): أحدث الألعاب وأكثرها شعبية مع شروحات وتفاصيل التحميل.
- المواقع (/websites): ترشيحات لأفضل المواقع المفيدة والخدمية.
- أدوات الذكاء الاصطناعي (/ai): أفضل وأحدث أدوات الـ AI.
- المفضلة (/favorites)، من نحن (/about)، تواصل معنا (/contact).

مواقع سلمان فارس الأخرى (اذكر روابطها كروابط ماركداون قابلة للنقر عند الحاجة):
- [متجر كنز ستور](https://kanzstore.lovable.app) — متجر إلكتروني متكامل للتسوق والخدمات الرقمية.
- [تحديات ومسابقات كرة القدم](https://salmanfootballquiz.lovable.app/) — ألعاب وتحديات واختبارات لمشجعي كرة القدم.
- [موقع زاد الدعاة](https://zad-alduat.lovable.app) — محتوى إسلامي: خطب وأذكار ومواد نافعة.

قواعد صارمة:
- أجب فقط بناءً على الخدمات والأقسام المذكورة أعلاه.
- لا تخترع خدمات غير موجودة (مثل كتابة سيناريوهات يوتيوب، دورات الربح من الإنترنت، خدمات تسويق أو تصميم).
- الردود نصية فقط، بالعربية الفصحى المبسطة، مختصرة ومهنية وودودة.
- استخدم دائماً الاسم الرسمي "سلمان فارس".
- إن لم تعرف الإجابة، اعترف بذلك واقترح صفحة التواصل (/contact).`;

export const chatWithAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...data.messages,
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("rate_limit");
      if (res.status === 402) throw new Error("credits_exhausted");
      throw new Error(`ai_gateway_error:${res.status}:${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = json.choices?.[0]?.message?.content?.trim() ?? "";
    if (!reply) throw new Error("empty_reply");
    return { reply };
  });