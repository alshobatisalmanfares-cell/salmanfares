import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "ar" | "en" | "es" | "nl" | "tr" | "ur" | "pt";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "nl", label: "Nederlands" },
  { code: "tr", label: "Türkçe" },
  { code: "ur", label: "اردو" },
  { code: "pt", label: "Português" },
];

type Entry = Partial<Record<Lang, string>>;
type Dict = Record<string, Entry>;

const dict: Dict = {
  // nav
  "nav.home": { ar: "الرئيسية", en: "Home", es: "Inicio", nl: "Home", tr: "Ana sayfa", ur: "ہوم", pt: "Início" },
  "nav.apps": { ar: "التطبيقات", en: "Apps", es: "Apps", nl: "Apps", tr: "Uygulamalar", ur: "ایپس", pt: "Apps" },
  "nav.websites": { ar: "المواقع", en: "Websites", es: "Sitios", nl: "Websites", tr: "Siteler", ur: "ویب سائٹس", pt: "Sites" },
  "nav.games": { ar: "الألعاب", en: "Games", es: "Juegos", nl: "Spellen", tr: "Oyunlar", ur: "گیمز", pt: "Jogos" },
  "nav.about": { ar: "من نحن", en: "About", es: "Sobre", nl: "Over ons", tr: "Hakkında", ur: "ہمارے بارے میں", pt: "Sobre" },
  "nav.contact": { ar: "تواصل", en: "Contact", es: "Contacto", nl: "Contact", tr: "İletişim", ur: "رابطہ", pt: "Contato" },
  "nav.admin": { ar: "لوحة التحكم", en: "Admin", es: "Admin", nl: "Beheer", tr: "Yönetim", ur: "ایڈمن", pt: "Admin" },
  "nav.login": { ar: "دخول", en: "Login", es: "Entrar", nl: "Inloggen", tr: "Giriş", ur: "لاگ ان", pt: "Entrar" },
  "nav.loggedin": { ar: "تم الدخول", en: "Signed in", es: "Conectado", nl: "Ingelogd", tr: "Giriş yapıldı", ur: "لاگ ان", pt: "Conectado" },

  // home
  "home.badge": { ar: "موقع سلمان فارس", en: "Salman Faris Hub", es: "Salman Faris", nl: "Salman Faris", tr: "Salman Faris", ur: "سلمان فارس", pt: "Salman Faris" },
  "home.subtitle": { ar: "مكتبة مختارة من الأدوات الرقمية المفيدة، تُحدَّث باستمرار.", en: "A curated library of useful digital tools, updated regularly.", es: "Biblioteca curada de herramientas digitales útiles.", nl: "Een gecureerde bibliotheek van nuttige digitale tools.", tr: "Faydalı dijital araçlardan oluşan seçkin bir kütüphane.", ur: "مفید ڈیجیٹل ٹولز کی منتخب لائبریری۔", pt: "Biblioteca curada de ferramentas digitais úteis." },
  "home.browse.apps": { ar: "تصفح التطبيقات", en: "Browse Apps", es: "Ver apps", nl: "Bekijk apps", tr: "Uygulamalara göz at", ur: "ایپس دیکھیں", pt: "Ver apps" },
  "home.browse.websites": { ar: "تصفح المواقع", en: "Browse Websites", es: "Ver sitios", nl: "Bekijk sites", tr: "Sitelere göz at", ur: "ویب سائٹس دیکھیں", pt: "Ver sites" },
  "home.browse.games": { ar: "تصفح الألعاب", en: "Browse Games", es: "Ver juegos", nl: "Bekijk spellen", tr: "Oyunlara göz at", ur: "گیمز دیکھیں", pt: "Ver jogos" },
  "home.search": { ar: "ابحث عن تطبيق أو موقع أو لعبة...", en: "Search apps, websites, games...", es: "Buscar apps, sitios, juegos...", nl: "Zoek apps, sites, spellen...", tr: "Uygulama, site, oyun ara...", ur: "ایپ، سائٹ یا گیم تلاش کریں...", pt: "Buscar apps, sites, jogos..." },
  "home.latest": { ar: "أحدث الإضافات", en: "Latest Additions", es: "Últimas adiciones", nl: "Nieuwste toevoegingen", tr: "En son eklenenler", ur: "تازہ ترین اضافے", pt: "Últimas adições" },
  "home.results": { ar: "نتائج البحث", en: "Search results", es: "Resultados", nl: "Resultaten", tr: "Sonuçlar", ur: "نتائج", pt: "Resultados" },
  "home.noresults": { ar: "لا توجد نتائج مطابقة.", en: "No matching results.", es: "Sin resultados.", nl: "Geen resultaten.", tr: "Eşleşen sonuç yok.", ur: "کوئی نتیجہ نہیں۔", pt: "Sem resultados." },

  // categories
  "cat.apps.title": { ar: "التطبيقات", en: "Apps", es: "Apps", nl: "Apps", tr: "Uygulamalar", ur: "ایپس", pt: "Apps" },
  "cat.apps.sub": { ar: "أفضل التطبيقات لزيادة إنتاجيتك.", en: "Top apps to boost your productivity.", es: "Mejores apps para tu productividad.", nl: "Top apps voor je productiviteit.", tr: "Verimliliğinizi artıracak en iyi uygulamalar.", ur: "بہترین پروڈکٹیویٹی ایپس۔", pt: "Melhores apps de produtividade." },
  "cat.websites.title": { ar: "المواقع", en: "Websites", es: "Sitios", nl: "Websites", tr: "Siteler", ur: "ویب سائٹس", pt: "Sites" },
  "cat.websites.sub": { ar: "مواقع مختارة لتسهيل عملك.", en: "Curated websites to simplify your work.", es: "Sitios para facilitar tu trabajo.", nl: "Sites om je werk makkelijker te maken.", tr: "İşinizi kolaylaştıracak siteler.", ur: "آپ کے کام کو آسان بنانے والی سائٹس۔", pt: "Sites para facilitar seu trabalho." },
  "cat.games.title": { ar: "الألعاب", en: "Games", es: "Juegos", nl: "Spellen", tr: "Oyunlar", ur: "گیمز", pt: "Jogos" },
  "cat.games.sub": { ar: "ألعاب مميزة لقضاء وقت ممتع.", en: "Great games for a fun time.", es: "Juegos para divertirte.", nl: "Geweldige spellen voor plezier.", tr: "Eğlenceli oyunlar.", ur: "تفریح کے لیے بہترین گیمز۔", pt: "Ótimos jogos para se divertir." },

  // locks
  "lock.login.title": { ar: "تسجيل الدخول مطلوب", en: "Login required", es: "Inicio requerido", nl: "Inloggen vereist", tr: "Giriş gerekli", ur: "لاگ ان ضروری ہے", pt: "Login necessário" },
  "lock.login.desc": { ar: "يجب تسجيل الدخول لاستخدام هذا الزر.", en: "You must log in to use this button.", es: "Debes iniciar sesión.", nl: "Je moet inloggen.", tr: "Bu düğmeyi kullanmak için giriş yapın.", ur: "اس بٹن کے لیے لاگ ان کریں۔", pt: "Faça login para usar este botão." },
  "lock.login.cta": { ar: "تسجيل الدخول", en: "Log in", es: "Entrar", nl: "Inloggen", tr: "Giriş yap", ur: "لاگ ان", pt: "Entrar" },
  "lock.follow.title": { ar: "متابعة مطلوبة", en: "Follow required", es: "Seguir requerido", nl: "Volgen vereist", tr: "Takip gerekli", ur: "فالو ضروری ہے", pt: "Seguir necessário" },
  "lock.follow.desc": { ar: "اضغط على كل قناة لمتابعتها أولاً، ثم تأكيد الفتح.", en: "Click each channel to follow first, then confirm to unlock.", es: "Haz clic en cada canal para seguir y luego confirma.", nl: "Klik op elk kanaal om te volgen en bevestig dan.", tr: "Önce her kanalı takip edin, sonra onaylayın.", ur: "ہر چینل پر کلک کر کے فالو کریں، پھر تصدیق کریں۔", pt: "Clique em cada canal para seguir, depois confirme." },
  "lock.follow.confirm": { ar: "تأكيد المتابعة وفتح الزر", en: "Confirm and unlock", es: "Confirmar y abrir", nl: "Bevestigen en openen", tr: "Onayla ve aç", ur: "تصدیق کر کے کھولیں", pt: "Confirmar e abrir" },
  "lock.follow.pending": { ar: "تابع جميع القنوات أولاً", en: "Follow all channels first", es: "Sigue todos los canales primero", nl: "Volg eerst alle kanalen", tr: "Önce tüm kanalları takip edin", ur: "پہلے تمام چینلز فالو کریں", pt: "Siga todos os canais primeiro" },

  // common
  "common.more": { ar: "عرض المزيد", en: "Show more", es: "Ver más", nl: "Meer", tr: "Daha fazla", ur: "مزید دیکھیں", pt: "Mostrar mais" },
  "common.less": { ar: "عرض أقل", en: "Show less", es: "Ver menos", nl: "Minder", tr: "Daha az", ur: "کم دیکھیں", pt: "Mostrar menos" },

  // footer
  "footer.about": { ar: "من نحن", en: "About", es: "Sobre", nl: "Over ons", tr: "Hakkında", ur: "ہمارے بارے میں", pt: "Sobre" },
  "footer.contact": { ar: "تواصل معنا", en: "Contact us", es: "Contáctanos", nl: "Contact", tr: "Bize ulaşın", ur: "ہم سے رابطہ", pt: "Contato" },

  // about
  "about.title": { ar: "من نحن", en: "About us", es: "Sobre nosotros", nl: "Over ons", tr: "Hakkımızda", ur: "ہمارے بارے میں", pt: "Sobre nós" },
  "about.intro": {
    ar: "منصة سلمان فارس هي بوابتكم المتكاملة للوصول إلى نخبة التطبيقات والأدوات الرقمية الحديثة. نحن نتخصص في رصد ومراجعة أحدث المنصات والمواقع التقنية، مع توفير روابط مباشرة وآمنة للاستخدام والتحميل.",
    en: "Salman Faris is your complete gateway to the best modern apps and digital tools. We curate and review the latest tech platforms with direct, safe links.",
    es: "Salman Faris es tu portal completo a las mejores apps y herramientas digitales modernas.",
    nl: "Salman Faris is uw complete portaal voor de beste moderne apps en digitale tools.",
    tr: "Salman Faris, en iyi modern uygulamalara ve dijital araçlara açılan kapınızdır.",
    ur: "سلمان فارس بہترین جدید ایپس اور ڈیجیٹل ٹولز کا مکمل گیٹ وے ہے۔",
    pt: "Salman Faris é seu portal completo para os melhores apps e ferramentas digitais modernas.",
  },
  "about.mission.title": { ar: "رسالتنا", en: "Our mission", es: "Nuestra misión", nl: "Onze missie", tr: "Misyonumuz", ur: "ہمارا مشن", pt: "Nossa missão" },
  "about.mission.body": {
    ar: "توفير بيئة تقنية موثوقة تمكن المستخدم من اكتشاف وتجربة أفضل البرمجيات والمواقع بضغطة زر.",
    en: "To provide a trusted tech environment that lets users discover the best software and websites in one click.",
    es: "Proveer un entorno tecnológico confiable para descubrir el mejor software con un clic.",
    nl: "Een vertrouwde techomgeving bieden om de beste software met één klik te ontdekken.",
    tr: "En iyi yazılımları tek tıkla keşfetmenizi sağlayan güvenilir bir ortam sunmak.",
    ur: "ایک کلک میں بہترین سافٹ ویئر دریافت کرنے کے لیے قابلِ اعتماد ماحول فراہم کرنا۔",
    pt: "Oferecer um ambiente confiável para descobrir os melhores softwares com um clique.",
  },
  "about.vision.title": { ar: "رؤيتنا", en: "Our vision", es: "Nuestra visión", nl: "Onze visie", tr: "Vizyonumuz", ur: "ہمارا وژن", pt: "Nossa visão" },
  "about.vision.body": {
    ar: "أن نكون الوجهة الأولى والمصدر الأساسي في رحلة البحث عن الحلول التقنية والبرمجية.",
    en: "To be the first destination for finding tech and software solutions.",
    es: "Ser el primer destino para encontrar soluciones tecnológicas.",
    nl: "De eerste bestemming zijn voor tech- en softwareoplossingen.",
    tr: "Teknoloji çözümleri için ilk durak olmak.",
    ur: "ٹیکنالوجی حل تلاش کرنے کے لیے پہلی منزل بننا۔",
    pt: "Ser o primeiro destino para encontrar soluções tecnológicas.",
  },
  "about.follow": { ar: "تابعنا على", en: "Follow us on", es: "Síguenos en", nl: "Volg ons op", tr: "Bizi takip edin", ur: "ہمیں فالو کریں", pt: "Siga-nos em" },

  // contact
  "contact.title": { ar: "تواصل معنا", en: "Contact us", es: "Contáctanos", nl: "Neem contact op", tr: "Bize ulaşın", ur: "ہم سے رابطہ", pt: "Contato" },
  "contact.subtitle": { ar: "يسعدنا تواصلك معنا لأي اقتراح أو استفسار أو تعاون.", en: "We're happy to hear from you for any suggestion or inquiry.", es: "Nos encanta saber de ti.", nl: "We horen graag van je.", tr: "Sizden haber almak isteriz.", ur: "ہمیں آپ سے سن کر خوشی ہوگی۔", pt: "Adoraríamos ouvir você." },
  "contact.email": { ar: "البريد الإلكتروني", en: "Email", es: "Correo", nl: "E-mail", tr: "E-posta", ur: "ای میل", pt: "E-mail" },
  "contact.name": { ar: "الاسم", en: "Name", es: "Nombre", nl: "Naam", tr: "Ad", ur: "نام", pt: "Nome" },
  "contact.message": { ar: "الرسالة", en: "Message", es: "Mensaje", nl: "Bericht", tr: "Mesaj", ur: "پیغام", pt: "Mensagem" },
  "contact.send": { ar: "إرسال", en: "Send", es: "Enviar", nl: "Versturen", tr: "Gönder", ur: "بھیجیں", pt: "Enviar" },
  "contact.followAlt": { ar: "أو تابعنا على", en: "Or follow us on", es: "O síguenos en", nl: "Of volg ons op", tr: "Veya bizi takip edin", ur: "یا ہمیں فالو کریں", pt: "Ou siga-nos em" },

  // login
  "login.signin": { ar: "تسجيل الدخول", en: "Sign in", es: "Iniciar sesión", nl: "Inloggen", tr: "Giriş yap", ur: "لاگ ان کریں", pt: "Entrar" },
  "login.signup": { ar: "إنشاء حساب", en: "Sign up", es: "Crear cuenta", nl: "Registreren", tr: "Kayıt ol", ur: "اکاؤنٹ بنائیں", pt: "Criar conta" },
  "login.email": { ar: "البريد الإلكتروني", en: "Email", es: "Correo", nl: "E-mail", tr: "E-posta", ur: "ای میل", pt: "E-mail" },
  "login.password": { ar: "كلمة المرور", en: "Password", es: "Contraseña", nl: "Wachtwoord", tr: "Şifre", ur: "پاس ورڈ", pt: "Senha" },
  "login.toSignup": { ar: "ليس لديك حساب؟ إنشاء حساب جديد", en: "No account? Sign up", es: "¿Sin cuenta? Crear", nl: "Geen account? Registreren", tr: "Hesabın yok mu? Kayıt ol", ur: "اکاؤنٹ نہیں؟ بنائیں", pt: "Sem conta? Cadastre-se" },
  "login.toSignin": { ar: "لديك حساب؟ تسجيل الدخول", en: "Have an account? Sign in", es: "¿Tienes cuenta? Entra", nl: "Al een account? Inloggen", tr: "Hesabın var mı? Giriş yap", ur: "اکاؤنٹ ہے؟ لاگ ان کریں", pt: "Tem conta? Entrar" },
  "login.success": { ar: "تم تسجيل الدخول", en: "Signed in", es: "Conectado", nl: "Ingelogd", tr: "Giriş yapıldı", ur: "لاگ ان ہوگیا", pt: "Conectado" },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };
const I18nCtx = createContext<Ctx>({ lang: "ar", setLang: () => {}, t: (k) => k });

const RTL: Lang[] = ["ar", "ur"];

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const saved = (localStorage.getItem("lang") as Lang | null) ?? "ar";
    setLangState(saved);
    document.documentElement.lang = saved;
    document.documentElement.dir = RTL.includes(saved) ? "rtl" : "ltr";
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("lang", l);
    document.documentElement.lang = l;
    document.documentElement.dir = RTL.includes(l) ? "rtl" : "ltr";
  }

  function t(k: string) {
    const e = dict[k];
    if (!e) return k;
    return e[lang] ?? e.en ?? e.ar ?? k;
  }

  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  return useContext(I18nCtx);
}
