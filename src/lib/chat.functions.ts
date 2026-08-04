import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(30),
});

const SYSTEM_PROMPT = `أنت "المساعد الرقمي الرسمي لموقع سلمان للتقنية" (سلمان فارس).

قاعدة اللغة (الأهم):
- اكتشف تلقائياً لغة رسالة المستخدم (عربية، إنجليزية، إسبانية، فرنسية، تركية، أردية، هولندية، برتغالية، أو أي لغة أخرى).
- أجب دائماً بنفس لغة المستخدم حرفياً، وبنفس اللهجة/الأسلوب قدر الإمكان، حتى لو كانت التعليمات هنا بالعربية.
- إذا غيّر المستخدم لغته أثناء المحادثة، غيّر لغة ردك فوراً.
- عرّف بنفسك عند أول رد بأنك "المساعد الرقمي الرسمي لموقع سلمان للتقنية" (مترجَماً إلى لغة المستخدم، مثل: "the official digital assistant for Salman Tech / سلمان للتقنية").
- أسماء العناصر وروابطها تبقى كما هي دون ترجمة.

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
- الردود نصية فقط، مختصرة ومهنية وودودة، وبلغة المستخدم نفسها.
- استخدم دائماً الاسم الرسمي "سلمان فارس".
- إن لم تعرف الإجابة، اعترف بذلك واقترح صفحة التواصل (/contact).`;

const SITE_URL = "https://salmanfares.lovable.app";

type CatalogRow = {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  categories: string[] | null;
};

function itemUrl(row: CatalogRow) {
  const cat = row.categories?.[0] ?? "apps";
  return row.slug ? `${SITE_URL}/${cat}/${row.slug}` : `${SITE_URL}/item/${row.id}`;
}

async function buildCatalogPrompt(): Promise<string> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return "";
  const client = createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client
    .from("items")
    .select("id,slug,title,description,categories")
    .order("sort_order", { ascending: false })
    .limit(200);
  if (error || !data) return "";

  const rows = data as CatalogRow[];
  const lines = rows.map((row) => {
    const cats = (row.categories ?? []).join("، ") || "apps";
    const desc = (row.description ?? "").replace(/\s+/g, " ").slice(0, 140);
    return `- ${row.title} | التصنيفات: ${cats} | الرابط: ${itemUrl(row)} | الوصف: ${desc}`;
  });

  return `

قائمة العناصر المنشورة على الموقع (استخدمها حرفياً ولا تخترع روابط):
${lines.join("\n")}

قواعد الترشيح والروابط:
- عند السؤال عن أي تطبيق أو لعبة أو أداة أو موقع، أرفق دائماً رابطاً ماركداون مباشراً بالشكل [اسم العنصر](الرابط) من القائمة أعلاه فقط.
- بعد ذكر العنصر المطلوب، اقترح من 1 إلى 3 عناصر مشابهة من نفس التصنيف مع روابطها الماركداون وسطر وصف قصير لكل عنصر.
- اعرض الترشيحات كقائمة مرقمة، واجعل اسم العنصر داخل الرابط بخط عريض عند التأكيد (**[الاسم](الرابط)**).
- إذا لم يتوفر عنصر مناسب في القائمة، قل ذلك بوضوح واقترح تصفح القسم المناسب بدل اختراع رابط.`;
}

export const chatWithAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const catalog = await buildCatalogPrompt();

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + catalog },
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