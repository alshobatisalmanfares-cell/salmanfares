export type Item = {
  id: string;
  title: string;
  description: string;
  category: "apps" | "websites" | "earn" | "trending";
  url: string;
  cta: string;
  badge?: string;
  views?: string;
  emoji: string;
};

export const items: Item[] = [
  {
    id: "capcut",
    title: "CapCut Pro",
    description: "تطبيق احترافي لتعديل الفيديوهات بإمكانيات لا محدودة وفلاتر ذكية.",
    category: "apps",
    url: "https://www.capcut.com",
    cta: "تحميل التطبيق",
    badge: "جديد",
    views: "120K",
    emoji: "🎬",
  },
  {
    id: "chatgpt",
    title: "ChatGPT",
    description: "مساعد ذكاء اصطناعي يساعدك في الكتابة والبرمجة والتعلم بسرعة.",
    category: "apps",
    url: "https://chat.openai.com",
    cta: "زيارة الموقع",
    badge: "مميز",
    views: "980K",
    emoji: "🤖",
  },
  {
    id: "canva",
    title: "Canva",
    description: "أداة تصميم احترافية مجانية لإنشاء البوستات والشعارات بسهولة.",
    category: "apps",
    url: "https://www.canva.com",
    cta: "ابدأ التصميم",
    views: "540K",
    emoji: "🎨",
  },
  {
    id: "notion",
    title: "Notion",
    description: "منصة لتنظيم الملاحظات والمهام والمشاريع في مكان واحد.",
    category: "apps",
    url: "https://www.notion.so",
    cta: "تحميل التطبيق",
    views: "230K",
    emoji: "📒",
  },

  {
    id: "github",
    title: "GitHub",
    description: "أكبر منصة لاستضافة المشاريع البرمجية والتعاون مع المطورين.",
    category: "websites",
    url: "https://github.com",
    cta: "زيارة الموقع",
    badge: "تقني",
    views: "1.2M",
    emoji: "💻",
  },
  {
    id: "udemy",
    title: "Udemy",
    description: "منصة تعليمية ضخمة بدورات في البرمجة والتسويق والتصميم.",
    category: "websites",
    url: "https://www.udemy.com",
    cta: "تصفح الدورات",
    views: "640K",
    emoji: "🎓",
  },
  {
    id: "figma",
    title: "Figma",
    description: "أداة تصميم واجهات احترافية تعمل مباشرة من المتصفح.",
    category: "websites",
    url: "https://www.figma.com",
    cta: "زيارة الموقع",
    views: "410K",
    emoji: "🖌️",
  },
  {
    id: "vercel",
    title: "Vercel",
    description: "منصة استضافة سريعة ومجانية لمشاريع المواقع والتطبيقات.",
    category: "websites",
    url: "https://vercel.com",
    cta: "ابدأ مجانًا",
    views: "180K",
    emoji: "🚀",
  },

  {
    id: "youtube-monet",
    title: "الربح من يوتيوب",
    description: "تعلم كيف تنشئ قناة ناجحة وتربح من الإعلانات والرعايات.",
    category: "earn",
    url: "https://www.youtube.com/creators/",
    cta: "ابدأ الآن",
    badge: "الأكثر طلبًا",
    views: "870K",
    emoji: "▶️",
  },
  {
    id: "affiliate",
    title: "التسويق بالعمولة",
    description: "اربح عمولات من بيع منتجات الشركات الكبرى دون رأس مال.",
    category: "earn",
    url: "https://affiliate-program.amazon.com",
    cta: "اعرف المزيد",
    views: "320K",
    emoji: "💰",
  },
  {
    id: "freelance",
    title: "العمل الحر",
    description: "قدّم خدماتك على منصات العمل الحر واكسب بالدولار من المنزل.",
    category: "earn",
    url: "https://www.upwork.com",
    cta: "زيارة الموقع",
    views: "450K",
    emoji: "🧑‍💻",
  },
  {
    id: "crypto",
    title: "الربح من العملات الرقمية",
    description: "دليلك للبدء في عالم الكريبتو والاستثمار بأمان.",
    category: "earn",
    url: "https://www.binance.com",
    cta: "ابدأ الآن",
    views: "260K",
    emoji: "🪙",
  },
];

export const trending = [...items].sort((a, b) => parseViews(b.views) - parseViews(a.views)).slice(0, 6);

function parseViews(v?: string) {
  if (!v) return 0;
  const n = parseFloat(v);
  if (v.includes("M")) return n * 1_000_000;
  if (v.includes("K")) return n * 1_000;
  return n;
}