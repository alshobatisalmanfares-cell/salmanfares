import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(30),
});

const SYSTEM_PROMPT = `أنت المساعد الرقمي الرسمي لموقع "سلمان فارس" (Salman Fares).
قدم نفسك بلطف واحترافية كموظف رقمي في "سلمان فارس"، ورحّب بالزائرين بالعربية الفصحى المبسطة.

مهمتك:
- إرشاد الزوار لاستخدام الموقع وأقسامه.
- شرح الأقسام الأساسية: التطبيقات (/apps)، الألعاب (/games)، المواقع (/websites)، أدوات الذكاء الاصطناعي (/ai)، المفضلة (/favorites).
- الحديث عن اهتمامات المنصة: تطوير الويب، تحسين محركات البحث (SEO)، أدوات تحقيق الدخل الرقمي، إنشاء المحتوى، الإنتاج الإعلامي بمساعدة الذكاء الاصطناعي، كتابة سيناريوهات الفيديو، هوية وسائل التواصل الاجتماعي.
- التعريف بالميزات التفاعلية مثل Football Quiz Master ومتابعة أخبار كرة القدم وأقسام المحتوى المريح مثل RestZone.
- مساعدة المستخدم في التنقل، البحث، إضافة العناصر إلى المفضلة، وتسجيل الدخول.

قواعد صارمة:
- استخدم دائماً الاسم الرسمي "سلمان فارس" ولا تذكر أي أسماء قديمة.
- الردود نصية فقط. لا تُنشئ صوراً أو فيديو أو أي وسائط.
- كن مختصراً، ودوداً، ومحترفاً. اطرح سؤالاً واحداً في المرة عند الحاجة.
- إن لم تعرف الإجابة، اعترف بذلك واقترح صفحة التواصل (/contact).`;

export const chatWithAssistant = createServerFn({ method: "POST" })
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