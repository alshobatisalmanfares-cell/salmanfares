import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "ar" | "en" | "es" | "nl" | "tr" | "ur" | "pt" | "fr" | "de";

export const LANGS: { code: Lang; label: string; dir: "rtl" | "ltr" }[] = [
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "en", label: "English", dir: "ltr" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "nl", label: "Nederlands", dir: "ltr" },
  { code: "tr", label: "Türkçe", dir: "ltr" },
  { code: "ur", label: "اردو", dir: "rtl" },
  { code: "pt", label: "Português", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "de", label: "Deutsch", dir: "ltr" },
];

type Tr = Partial<Record<Lang, string>> & { ar: string; en: string };
const dict: Record<string, Tr> = {
  "site.name": { ar: "سلمان فارس", en: "Salman Faris", es: "Salman Faris", nl: "Salman Faris", tr: "Salman Faris", ur: "سلمان فارس", pt: "Salman Faris", fr: "Salman Faris", de: "Salman Faris" },
  "nav.home": { ar: "الرئيسية", en: "Home", es: "Inicio", nl: "Home", tr: "Ana sayfa", ur: "ہوم", pt: "Início", fr: "Accueil", de: "Startseite" },
  "nav.apps": { ar: "التطبيقات", en: "Apps", es: "Aplicaciones", nl: "Apps", tr: "Uygulamalar", ur: "ایپس", pt: "Apps", fr: "Applications", de: "Apps" },
  "nav.websites": { ar: "المواقع", en: "Websites", es: "Sitios web", nl: "Websites", tr: "Web siteleri", ur: "ویب سائٹس", pt: "Sites", fr: "Sites web", de: "Webseiten" },
  "nav.games": { ar: "الألعاب", en: "Games", es: "Juegos", nl: "Games", tr: "Oyunlar", ur: "گیمز", pt: "Jogos", fr: "Jeux", de: "Spiele" },
  "nav.ai": { ar: "أدوات الذكاء الاصطناعي", en: "AI Tools", es: "Herramientas IA", nl: "AI-tools", tr: "Yapay Zeka", ur: "اے آئی ٹولز", pt: "Ferramentas IA", fr: "Outils IA", de: "KI-Tools" },
  "nav.about": { ar: "من نحن", en: "About", es: "Acerca", nl: "Over ons", tr: "Hakkımızda", ur: "تعارف", pt: "Sobre", fr: "À propos", de: "Über uns" },
  "nav.contact": { ar: "تواصل", en: "Contact", es: "Contacto", nl: "Contact", tr: "İletişim", ur: "رابطہ", pt: "Contato", fr: "Contact", de: "Kontakt" },
  "nav.admin": { ar: "لوحة التحكم", en: "Admin", es: "Panel", nl: "Beheer", tr: "Yönetim", ur: "ایڈمن", pt: "Painel", fr: "Admin", de: "Verwaltung" },
  "nav.login": { ar: "دخول", en: "Login", es: "Entrar", nl: "Inloggen", tr: "Giriş", ur: "لاگ ان", pt: "Entrar", fr: "Connexion", de: "Anmelden" },
  "nav.logout": { ar: "تسجيل الخروج", en: "Logout", es: "Salir", nl: "Uitloggen", tr: "Çıkış", ur: "لاگ آؤٹ", pt: "Sair", fr: "Déconnexion", de: "Abmelden" },

  "home.badge": { ar: "موقع سلمان فارس", en: "Salman Faris Hub", es: "Hub Salman Faris", nl: "Salman Faris Hub", tr: "Salman Faris Merkezi", ur: "سلمان فارس ہب", pt: "Hub Salman Faris", fr: "Plateforme Salman Faris", de: "Salman Faris Hub" },
  "home.title.1": { ar: "اكتشف", en: "Discover", es: "Descubre", nl: "Ontdek", tr: "Keşfet", ur: "دریافت کریں", pt: "Descubra", fr: "Découvrez", de: "Entdecke" },
  "home.title.2": { ar: "أفضل التطبيقات والمواقع والألعاب", en: "the best apps, websites & games", es: "las mejores apps, sitios y juegos", nl: "de beste apps, sites & games", tr: "en iyi uygulamalar, siteler ve oyunlar", ur: "بہترین ایپس، ویب سائٹس اور گیمز", pt: "os melhores apps, sites e jogos", fr: "les meilleures apps, sites et jeux", de: "die besten Apps, Webseiten & Spiele" },
  "home.subtitle": { ar: "مكتبة مختارة من الأدوات الرقمية المفيدة، تُحدَّث باستمرار.", en: "A curated library of useful digital tools, updated regularly.", es: "Biblioteca seleccionada de herramientas digitales útiles.", nl: "Een zorgvuldig samengestelde bibliotheek van handige digitale tools.", tr: "Sürekli güncellenen seçkin dijital araçlar kütüphanesi.", ur: "مفید ڈیجیٹل ٹولز کی منتخب لائبریری۔", pt: "Biblioteca selecionada de ferramentas digitais úteis.", fr: "Une bibliothèque d'outils numériques utiles, mise à jour régulièrement.", de: "Eine kuratierte Bibliothek nützlicher digitaler Tools." },
  "home.hero.lead": { ar: "تصفح واكتشف أحدث", en: "Browse and Discover the Latest" },
  "home.hero.keywords": { ar: "التطبيقات، الألعاب، المواقع، وأدوات الذكاء الاصطناعي", en: "Apps, Games, Websites, and AI Tools" },
  "home.hero.subtitle": { ar: "منصتك الموثوقة للوصول إلى أقوى البرمجيات والحلول الرقمية المنتقاة بدقة والمحدثة يومياً بضغطة زر.", en: "Your trusted platform to access the most powerful, carefully selected, and daily updated software and digital solutions at the click of a button." },

  "loading.wait": { ar: "يرجى الانتظار...", en: "Please wait...", es: "Por favor espera...", nl: "Even geduld...", tr: "Lütfen bekleyin...", ur: "براہ کرم انتظار کریں...", pt: "Aguarde...", fr: "Veuillez patienter...", de: "Bitte warten..." },

  "auth.google": { ar: "المتابعة باستخدام Google", en: "Continue with Google", es: "Continuar con Google", nl: "Doorgaan met Google", tr: "Google ile devam et", ur: "گوگل کے ساتھ جاری رکھیں", pt: "Continuar com Google", fr: "Continuer avec Google", de: "Mit Google fortfahren" },
  "auth.or": { ar: "أو", en: "or", es: "o", nl: "of", tr: "veya", ur: "یا", pt: "ou", fr: "ou", de: "oder" },

  "pwa.install": { ar: "تثبيت التطبيق", en: "Install App", es: "Instalar app", nl: "App installeren", tr: "Uygulamayı yükle", ur: "ایپ انسٹال کریں", pt: "Instalar app", fr: "Installer l'app", de: "App installieren" },
  "pwa.dismiss": { ar: "لاحقاً", en: "Later" },
  "home.browse.apps": { ar: "تصفح التطبيقات", en: "Browse Apps", es: "Ver apps", nl: "Apps bekijken", tr: "Uygulamalara göz at", ur: "ایپس دیکھیں", pt: "Ver apps", fr: "Voir les apps", de: "Apps ansehen" },
  "home.browse.websites": { ar: "تصفح المواقع", en: "Browse Websites", es: "Ver sitios", nl: "Sites bekijken", tr: "Sitelere göz at", ur: "ویب سائٹس دیکھیں", pt: "Ver sites", fr: "Voir les sites", de: "Webseiten ansehen" },
  "home.browse.games": { ar: "تصفح الألعاب", en: "Browse Games", es: "Ver juegos", nl: "Games bekijken", tr: "Oyunlara göz at", ur: "گیمز دیکھیں", pt: "Ver jogos", fr: "Voir les jeux", de: "Spiele ansehen" },
  "home.search": { ar: "ابحث عن تطبيق أو موقع أو لعبة...", en: "Search apps, websites, games...", es: "Buscar apps, sitios, juegos...", nl: "Zoek apps, sites, games...", tr: "Uygulama, site, oyun ara...", ur: "ایپس، سائٹس، گیمز تلاش کریں...", pt: "Buscar apps, sites, jogos...", fr: "Rechercher apps, sites, jeux...", de: "Apps, Sites, Spiele suchen..." },
  "home.latest": { ar: "أحدث الإضافات", en: "Latest Additions", es: "Últimas adiciones", nl: "Nieuwste toevoegingen", tr: "Son eklenenler", ur: "تازہ ترین اضافے", pt: "Adições recentes", fr: "Derniers ajouts", de: "Neueste Einträge" },
  "home.results": { ar: "نتائج البحث", en: "Search results", es: "Resultados", nl: "Zoekresultaten", tr: "Arama sonuçları", ur: "تلاش کے نتائج", pt: "Resultados", fr: "Résultats", de: "Suchergebnisse" },
  "home.noresults": { ar: "لا توجد نتائج مطابقة.", en: "No matching results.", es: "Sin resultados.", nl: "Geen resultaten.", tr: "Sonuç bulunamadı.", ur: "کوئی نتیجہ نہیں۔", pt: "Sem resultados.", fr: "Aucun résultat.", de: "Keine Ergebnisse." },

  "section.apps": { ar: "أفضل التطبيقات", en: "Top Apps", es: "Mejores apps", nl: "Top apps", tr: "En iyi uygulamalar", ur: "بہترین ایپس", pt: "Melhores apps", fr: "Meilleures apps", de: "Top Apps" },
  "section.websites": { ar: "أفضل المواقع", en: "Top Websites", es: "Mejores sitios", nl: "Top sites", tr: "En iyi siteler", ur: "بہترین سائٹس", pt: "Melhores sites", fr: "Meilleurs sites", de: "Top Webseiten" },
  "section.games": { ar: "أفضل الألعاب", en: "Top Games", es: "Mejores juegos", nl: "Top games", tr: "En iyi oyunlar", ur: "بہترین گیمز", pt: "Melhores jogos", fr: "Meilleurs jeux", de: "Top Spiele" },
  "section.empty": { ar: "لا توجد عناصر بعد.", en: "No items yet.", es: "Aún no hay elementos.", nl: "Nog geen items.", tr: "Henüz öğe yok.", ur: "ابھی کچھ نہیں۔", pt: "Sem itens ainda.", fr: "Aucun élément.", de: "Noch keine Einträge." },
  "search.app": { ar: "ابحث عن تطبيق...", en: "Search apps...", es: "Buscar apps...", nl: "Zoek apps...", tr: "Uygulama ara...", ur: "ایپس تلاش کریں...", pt: "Buscar apps...", fr: "Rechercher apps...", de: "Apps suchen..." },
  "search.website": { ar: "ابحث عن موقع...", en: "Search websites...", es: "Buscar sitios...", nl: "Zoek sites...", tr: "Site ara...", ur: "سائٹس تلاش کریں...", pt: "Buscar sites...", fr: "Rechercher sites...", de: "Webseiten suchen..." },
  "search.game": { ar: "ابحث عن لعبة...", en: "Search games...", es: "Buscar juegos...", nl: "Zoek games...", tr: "Oyun ara...", ur: "گیمز تلاش کریں...", pt: "Buscar jogos...", fr: "Rechercher jeux...", de: "Spiele suchen..." },
  "search.clear": { ar: "مسح", en: "Clear", es: "Borrar", nl: "Wissen", tr: "Temizle", ur: "صاف کریں", pt: "Limpar", fr: "Effacer", de: "Löschen" },

  "card.more": { ar: "عرض المزيد", en: "Show more", es: "Ver más", nl: "Meer tonen", tr: "Daha fazla", ur: "مزید دیکھیں", pt: "Ver mais", fr: "Voir plus", de: "Mehr anzeigen" },
  "card.less": { ar: "عرض أقل", en: "Show less", es: "Ver menos", nl: "Minder tonen", tr: "Daha az", ur: "کم دیکھیں", pt: "Ver menos", fr: "Voir moins", de: "Weniger anzeigen" },

  "lock.login.title": { ar: "تسجيل الدخول مطلوب", en: "Login required", es: "Inicio de sesión requerido", nl: "Inloggen vereist", tr: "Giriş gerekli", ur: "لاگ ان ضروری ہے", pt: "Login necessário", fr: "Connexion requise", de: "Anmeldung erforderlich" },
  "lock.login.desc": { ar: "يجب تسجيل الدخول لاستخدام هذا الزر.", en: "You must log in to use this button.", es: "Debes iniciar sesión para usar este botón.", nl: "Log in om deze knop te gebruiken.", tr: "Bu düğmeyi kullanmak için giriş yapın.", ur: "اس بٹن کے استعمال کے لیے لاگ ان کریں۔", pt: "Faça login para usar este botão.", fr: "Connectez-vous pour utiliser ce bouton.", de: "Bitte anmelden, um fortzufahren." },
  "lock.login.cta": { ar: "تسجيل الدخول", en: "Log in", es: "Iniciar sesión", nl: "Inloggen", tr: "Giriş yap", ur: "لاگ ان کریں", pt: "Entrar", fr: "Se connecter", de: "Anmelden" },
  "lock.follow.title": { ar: "متابعة مطلوبة", en: "Follow required", es: "Seguimiento requerido", nl: "Volgen vereist", tr: "Takip gerekli", ur: "فالو کرنا ضروری", pt: "Seguir necessário", fr: "Abonnement requis", de: "Folgen erforderlich" },
  "lock.follow.desc": { ar: "اضغط كل قناة لزيارتها ومتابعتها، ثم اضغط فتح:", en: "Tap each channel to visit & follow, then unlock:", es: "Toca cada canal para visitarlo y seguirlo, luego desbloquea:", nl: "Tik op elk kanaal om te bezoeken en te volgen, daarna ontgrendelen:", tr: "Her kanalı ziyaret edip takip et, sonra aç:", ur: "ہر چینل پر جا کر فالو کریں، پھر کھولیں:", pt: "Toque em cada canal para visitar e seguir, depois desbloqueie:", fr: "Visitez et suivez chaque canal, puis débloquez :", de: "Besuche und folge jedem Kanal, dann entsperren:" },
  "lock.follow.confirm": { ar: "لقد تابعت — افتح الزر", en: "I followed — unlock", es: "Ya seguí — desbloquear", nl: "Gevolgd — ontgrendelen", tr: "Takip ettim — aç", ur: "میں نے فالو کر لیا — کھولیں", pt: "Já segui — desbloquear", fr: "C'est fait — débloquer", de: "Ich folge — entsperren" },
  "lock.follow.pending": { ar: "اضغط على كل القنوات أولاً", en: "Tap all channels first", es: "Toca todos los canales primero", nl: "Tik eerst op alle kanalen", tr: "Önce tüm kanallara dokun", ur: "پہلے تمام چینلز پر کلک کریں", pt: "Toque em todos os canais primeiro", fr: "Cliquez d'abord sur tous les canaux", de: "Zuerst alle Kanäle antippen" },

  "footer.about": { ar: "من نحن", en: "About", es: "Acerca", nl: "Over ons", tr: "Hakkımızda", ur: "تعارف", pt: "Sobre", fr: "À propos", de: "Über uns" },
  "footer.contact": { ar: "تواصل معنا", en: "Contact us", es: "Contacto", nl: "Contact", tr: "İletişim", ur: "ہم سے رابطہ", pt: "Contato", fr: "Contact", de: "Kontakt" },
  "footer.sitemap": { ar: "خريطة الموقع", en: "Sitemap", es: "Mapa del sitio", nl: "Sitemap", tr: "Site haritası", ur: "سائٹ کا نقشہ", pt: "Mapa do site", fr: "Plan du site", de: "Sitemap" },

  "about.title": { ar: "من نحن", en: "About us", es: "Acerca de nosotros", nl: "Over ons", tr: "Hakkımızda", ur: "ہمارے بارے میں", pt: "Sobre nós", fr: "À propos", de: "Über uns" },
  "about.intro": { ar: "منصة سلمان فارس هي بوابتكم المتكاملة للوصول إلى نخبة التطبيقات والأدوات الرقمية الحديثة.", en: "Salman Faris is your gateway to a curated selection of modern digital tools and apps.", es: "Salman Faris es tu portal a una selección de apps y herramientas digitales modernas.", nl: "Salman Faris is je gateway naar moderne digitale tools en apps.", tr: "Salman Faris, modern dijital araçlara açılan kapınızdır.", ur: "سلمان فارس جدید ڈیجیٹل ٹولز تک آپ کا گیٹ وے ہے۔", pt: "Salman Faris é seu portal para apps e ferramentas digitais modernas.", fr: "Salman Faris est votre passerelle vers une sélection d'outils numériques modernes.", de: "Salman Faris ist Ihr Tor zu modernen digitalen Tools." },
  "about.mission.title": { ar: "رسالتنا", en: "Our mission", es: "Nuestra misión", nl: "Onze missie", tr: "Misyonumuz", ur: "ہمارا مشن", pt: "Nossa missão", fr: "Notre mission", de: "Unsere Mission" },
  "about.mission.body": { ar: "توفير بيئة تقنية موثوقة لاكتشاف وتجربة أفضل البرمجيات والمواقع بضغطة زر.", en: "Provide a trusted environment to discover and try the best software in one click.", es: "Brindar un entorno confiable para descubrir y probar el mejor software en un clic.", nl: "Een betrouwbare omgeving bieden om de beste software in één klik te ontdekken.", tr: "En iyi yazılımları tek tıkla keşfetmek için güvenilir bir ortam sağlamak.", ur: "ایک کلک میں بہترین سافٹ ویئر دریافت کرنے کے لیے قابل اعتماد ماحول۔", pt: "Oferecer um ambiente confiável para descobrir os melhores softwares em um clique.", fr: "Offrir un environnement fiable pour découvrir les meilleurs logiciels en un clic.", de: "Eine vertrauenswürdige Umgebung, um die beste Software per Klick zu entdecken." },
  "about.vision.title": { ar: "رؤيتنا", en: "Our vision", es: "Nuestra visión", nl: "Onze visie", tr: "Vizyonumuz", ur: "ہمارا وژن", pt: "Nossa visão", fr: "Notre vision", de: "Unsere Vision" },
  "about.vision.body": { ar: "أن نكون الوجهة الأولى للحلول التقنية والبرمجية في العالم العربي.", en: "To be the first destination for tech solutions in the Arab world and beyond.", es: "Ser el primer destino para soluciones tecnológicas en el mundo árabe.", nl: "De eerste bestemming zijn voor tech-oplossingen in de Arabische wereld.", tr: "Arap dünyasında teknoloji çözümleri için ilk adres olmak.", ur: "عرب دنیا میں ٹیکنالوجی حل کا پہلا مقام بننا۔", pt: "Ser o primeiro destino para soluções tecnológicas no mundo árabe.", fr: "Être la première destination pour les solutions tech dans le monde arabe.", de: "Die erste Anlaufstelle für Tech-Lösungen in der arabischen Welt zu sein." },
  "about.follow": { ar: "تابعنا على", en: "Follow us on", es: "Síguenos en", nl: "Volg ons op", tr: "Bizi takip et", ur: "ہمیں فالو کریں", pt: "Siga-nos em", fr: "Suivez-nous sur", de: "Folge uns auf" },

  "contact.title": { ar: "تواصل معنا", en: "Contact us", es: "Contacto", nl: "Neem contact op", tr: "Bize ulaşın", ur: "ہم سے رابطہ", pt: "Fale conosco", fr: "Contactez-nous", de: "Kontaktiere uns" },
  "contact.subtitle": { ar: "يسعدنا تواصلك معنا لأي اقتراح أو استفسار أو تعاون.", en: "We'd love to hear from you for any suggestion, question, or collaboration.", es: "Nos encantaría saber de ti.", nl: "We horen graag van je.", tr: "Sizden haber almak isteriz.", ur: "ہم آپ سے سننا پسند کریں گے۔", pt: "Adoraríamos ouvir você.", fr: "Nous serions ravis de vous entendre.", de: "Wir freuen uns auf Ihre Nachricht." },
  "contact.email": { ar: "البريد الإلكتروني", en: "Email", es: "Correo", nl: "E-mail", tr: "E-posta", ur: "ای میل", pt: "E-mail", fr: "E-mail", de: "E-Mail" },
  "contact.name": { ar: "الاسم", en: "Name", es: "Nombre", nl: "Naam", tr: "İsim", ur: "نام", pt: "Nome", fr: "Nom", de: "Name" },
  "contact.message": { ar: "الرسالة", en: "Message", es: "Mensaje", nl: "Bericht", tr: "Mesaj", ur: "پیغام", pt: "Mensagem", fr: "Message", de: "Nachricht" },
  "contact.send": { ar: "إرسال", en: "Send", es: "Enviar", nl: "Verzenden", tr: "Gönder", ur: "بھیجیں", pt: "Enviar", fr: "Envoyer", de: "Senden" },
  "contact.opening": { ar: "جاري فتح بريدك الإلكتروني...", en: "Opening your email client...", es: "Abriendo tu cliente de correo...", nl: "E-mailprogramma openen...", tr: "E-posta açılıyor...", ur: "ای میل کھل رہا ہے...", pt: "Abrindo seu e-mail...", fr: "Ouverture de votre messagerie...", de: "E-Mail-Programm wird geöffnet..." },
  "contact.followAlt": { ar: "أو تابعنا على", en: "Or follow us on", es: "O síguenos en", nl: "Of volg ons op", tr: "Veya bizi takip et", ur: "یا ہمیں فالو کریں", pt: "Ou siga-nos em", fr: "Ou suivez-nous sur", de: "Oder folge uns auf" },

  "auth.signin": { ar: "تسجيل الدخول", en: "Sign in", es: "Iniciar sesión", nl: "Inloggen", tr: "Giriş yap", ur: "لاگ ان", pt: "Entrar", fr: "Se connecter", de: "Anmelden" },
  "auth.signup": { ar: "إنشاء حساب", en: "Create account", es: "Crear cuenta", nl: "Account maken", tr: "Hesap oluştur", ur: "اکاؤنٹ بنائیں", pt: "Criar conta", fr: "Créer un compte", de: "Konto erstellen" },
  "auth.password": { ar: "كلمة المرور", en: "Password", es: "Contraseña", nl: "Wachtwoord", tr: "Şifre", ur: "پاس ورڈ", pt: "Senha", fr: "Mot de passe", de: "Passwort" },
  "auth.toSignup": { ar: "ليس لديك حساب؟ إنشاء حساب جديد", en: "No account? Create one", es: "¿Sin cuenta? Crea una", nl: "Geen account? Maak er een", tr: "Hesabın yok mu? Oluştur", ur: "اکاؤنٹ نہیں؟ بنائیں", pt: "Sem conta? Crie uma", fr: "Pas de compte ? Créez-en un", de: "Kein Konto? Erstellen" },
  "auth.toSignin": { ar: "لديك حساب؟ تسجيل الدخول", en: "Have an account? Sign in", es: "¿Tienes cuenta? Inicia sesión", nl: "Al een account? Log in", tr: "Hesabın var mı? Giriş yap", ur: "اکاؤنٹ ہے؟ لاگ ان کریں", pt: "Tem conta? Entre", fr: "Déjà un compte ? Connectez-vous", de: "Konto vorhanden? Anmelden" },
  "auth.success.signin": { ar: "تم تسجيل الدخول", en: "Signed in", es: "Sesión iniciada", nl: "Ingelogd", tr: "Giriş yapıldı", ur: "لاگ ان ہو گئے", pt: "Entrou", fr: "Connecté", de: "Angemeldet" },
  "auth.success.signup": { ar: "تم إنشاء الحساب", en: "Account created", es: "Cuenta creada", nl: "Account aangemaakt", tr: "Hesap oluşturuldu", ur: "اکاؤنٹ بن گیا", pt: "Conta criada", fr: "Compte créé", de: "Konto erstellt" },
  "auth.error": { ar: "حدث خطأ", en: "An error occurred", es: "Ocurrió un error", nl: "Er is iets misgegaan", tr: "Bir hata oluştu", ur: "خرابی ہوئی", pt: "Ocorreu um erro", fr: "Une erreur s'est produite", de: "Ein Fehler ist aufgetreten" },
  "auth.togglePwd": { ar: "إظهار/إخفاء كلمة المرور", en: "Show/hide password", es: "Mostrar/ocultar contraseña", nl: "Wachtwoord tonen/verbergen", tr: "Şifreyi göster/gizle", ur: "پاس ورڈ دکھائیں/چھپائیں", pt: "Mostrar/ocultar senha", fr: "Afficher/masquer le mot de passe", de: "Passwort anzeigen/ausblenden" },

  "menu.open": { ar: "فتح القائمة", en: "Open menu" },
  "menu.close": { ar: "إغلاق", en: "Close" },
  "menu.title": { ar: "القائمة", en: "Menu" },
  "menu.main": { ar: "التنقل", en: "Navigation" },
  "menu.settings": { ar: "الإعدادات", en: "Settings" },
  "menu.legal": { ar: "قانوني", en: "Legal" },
  "menu.language": { ar: "اللغة", en: "Language" },
  "menu.theme": { ar: "المظهر", en: "Theme" },
  "nav.privacy": { ar: "سياسة الخصوصية", en: "Privacy Policy" },
  "nav.terms": { ar: "شروط الاستخدام", en: "Terms of Use" },

  "details.cta": { ar: "تحميل / فتح", en: "Open / Download" },
  "details.close": { ar: "إغلاق", en: "Close" },
  "details.gallery": { ar: "صور", en: "Gallery" },
  "details.rating": { ar: "التقييم", en: "Rating" },
  "details.back": { ar: "العودة إلى الرئيسية", en: "Back to Home", es: "Volver al inicio", nl: "Terug naar Home", tr: "Ana sayfaya dön", ur: "ہوم پر واپس", pt: "Voltar ao início", fr: "Retour à l'accueil", de: "Zurück zur Startseite" },
  "details.notFound": { ar: "العنصر غير موجود.", en: "Item not found.", es: "Elemento no encontrado.", nl: "Item niet gevonden.", tr: "Öğe bulunamadı.", ur: "آئٹم نہیں ملا۔", pt: "Item não encontrado.", fr: "Élément introuvable.", de: "Element nicht gefunden." },
  "details.description": { ar: "الوصف", en: "Description", es: "Descripción", nl: "Beschrijving", tr: "Açıklama", ur: "تفصیل", pt: "Descrição", fr: "Description", de: "Beschreibung" },

  "privacy.title": { ar: "سياسة الخصوصية", en: "Privacy Policy" },
  "privacy.intro": { ar: "نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام المعلومات عند استخدامك للموقع.", en: "We respect your privacy and protect your personal data. This policy explains how we collect and use information on the site." },
  "privacy.collect.title": { ar: "البيانات التي نجمعها", en: "Information we collect" },
  "privacy.collect.body": { ar: "قد نجمع بيانات تقنية أساسية مثل نوع المتصفح ولغة الجهاز لتحسين تجربتك. عند إنشاء حساب نخزن البريد الإلكتروني فقط.", en: "We may collect basic technical data such as browser type and device language to improve your experience. When you sign up we store your email only." },
  "privacy.use.title": { ar: "كيف نستخدم البيانات", en: "How we use data" },
  "privacy.use.body": { ar: "تُستخدم البيانات لتشغيل الموقع وتحسينه فقط، ولا تُباع لأي طرف ثالث.", en: "Data is used only to run and improve the site. We never sell it to third parties." },
  "privacy.ads.title": { ar: "الإعلانات والكوكيز", en: "Ads & cookies" },
  "privacy.ads.body": { ar: "يستخدم الموقع شبكات إعلانية قد تستعمل ملفات تعريف ارتباط لعرض إعلانات مناسبة. يمكنك تعطيلها من إعدادات متصفحك.", en: "The site uses ad networks that may set cookies to show relevant ads. You can disable cookies in your browser settings." },
  "privacy.contact.title": { ar: "تواصل معنا", en: "Contact us" },
  "privacy.contact.body": { ar: "لأي استفسار يخص الخصوصية راسلنا عبر صفحة تواصل معنا.", en: "For any privacy questions, reach us through the Contact page." },

  "terms.title": { ar: "شروط الاستخدام", en: "Terms of Use" },
  "terms.intro": { ar: "باستخدامك للموقع فإنك توافق على الشروط التالية. يرجى قراءتها بعناية.", en: "By using this site you agree to the following terms. Please read them carefully." },
  "terms.use.title": { ar: "الاستخدام المسموح", en: "Acceptable use" },
  "terms.use.body": { ar: "يجب استخدام الموقع للأغراض الشخصية والقانونية فقط، ويُمنع أي محاولة لاختراق النظام أو إساءة استخدامه.", en: "Use the site only for personal and lawful purposes. Hacking or abuse is prohibited." },
  "terms.ip.title": { ar: "الملكية الفكرية", en: "Intellectual property" },
  "terms.ip.body": { ar: "جميع شعارات وأسماء التطبيقات المعروضة ملك لأصحابها، ولا ندّعي ملكيتها.", en: "All logos and app names shown belong to their owners. We claim no ownership of them." },
  "terms.liability.title": { ar: "إخلاء المسؤولية", en: "Disclaimer" },
  "terms.liability.body": { ar: "نوفر الروابط والمعلومات كما هي دون أي ضمان. الموقع غير مسؤول عن أي ضرر ناتج عن استخدام محتوى طرف ثالث.", en: "Links and content are provided as-is without warranty. We are not liable for any damage caused by third-party content." },
  "terms.changes.title": { ar: "تعديل الشروط", en: "Changes to terms" },
  "terms.changes.body": { ar: "قد نُحدّث هذه الشروط من حين لآخر. استمرارك في استخدام الموقع يُعد قبولاً للتحديثات.", en: "We may update these terms occasionally. Continued use of the site constitutes acceptance of the updates." },

  "favorites.title": { ar: "المفضلة", en: "Favorites", es: "Favoritos", nl: "Favorieten", tr: "Favoriler", ur: "پسندیدہ", pt: "Favoritos", fr: "Favoris", de: "Favoriten" },
  "favorites.add": { ar: "إضافة إلى المفضلة", en: "Add to favorites" },
  "favorites.remove": { ar: "إزالة من المفضلة", en: "Remove from favorites" },
  "favorites.empty": { ar: "لا توجد عناصر في المفضلة بعد.", en: "No favorites yet." },
  "favorites.loginRequired": { ar: "يجب تسجيل الدخول لاستخدام المفضلة.", en: "You must log in to use favorites." },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };
const I18nCtx = createContext<Ctx>({ lang: "ar", setLang: () => {}, t: (k) => k });

function applyLang(l: Lang) {
  const meta = LANGS.find((x) => x.code === l) ?? LANGS[0];
  document.documentElement.lang = meta.code;
  document.documentElement.dir = meta.dir;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const saved = (localStorage.getItem("lang") as Lang | null) ?? "ar";
    const valid = LANGS.find((x) => x.code === saved) ? saved : "ar";
    setLangState(valid);
    applyLang(valid);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("lang", l);
    applyLang(l);
  }

  function t(k: string) {
    const entry = dict[k];
    if (!entry) return k;
    return entry[lang] ?? entry.en ?? entry.ar;
  }

  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  return useContext(I18nCtx);
}