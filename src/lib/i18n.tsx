import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "ar" | "en";

type Dict = Record<string, { ar: string; en: string }>;

const dict: Dict = {
  "nav.home": { ar: "الرئيسية", en: "Home" },
  "nav.apps": { ar: "التطبيقات", en: "Apps" },
  "nav.websites": { ar: "المواقع", en: "Websites" },
  "nav.games": { ar: "الألعاب", en: "Games" },
  "nav.about": { ar: "من نحن", en: "About" },
  "nav.contact": { ar: "تواصل", en: "Contact" },
  "nav.admin": { ar: "لوحة التحكم", en: "Admin" },
  "nav.login": { ar: "دخول", en: "Login" },
  "home.badge": { ar: "موقع سلمان فارس", en: "Salman Faris Hub" },
  "home.title.1": { ar: "اكتشف", en: "Discover" },
  "home.title.2": { ar: "أفضل التطبيقات والمواقع والألعاب", en: "the best apps, websites & games" },
  "home.subtitle": { ar: "مكتبة مختارة من الأدوات الرقمية المفيدة، تُحدَّث باستمرار.", en: "A curated library of useful digital tools, updated regularly." },
  "home.browse.apps": { ar: "تصفح التطبيقات", en: "Browse Apps" },
  "home.browse.websites": { ar: "تصفح المواقع", en: "Browse Websites" },
  "home.browse.games": { ar: "تصفح الألعاب", en: "Browse Games" },
  "home.search": { ar: "ابحث عن تطبيق أو موقع أو لعبة...", en: "Search apps, websites, games..." },
  "home.latest": { ar: "أحدث الإضافات", en: "Latest Additions" },
  "home.results": { ar: "نتائج البحث", en: "Search results" },
  "home.noresults": { ar: "لا توجد نتائج مطابقة.", en: "No matching results." },
  "lock.login.title": { ar: "تسجيل الدخول مطلوب", en: "Login required" },
  "lock.login.desc": { ar: "يجب تسجيل الدخول لاستخدام هذا الزر.", en: "You must log in to use this button." },
  "lock.login.cta": { ar: "تسجيل الدخول", en: "Log in" },
  "lock.follow.title": { ar: "متابعة مطلوبة", en: "Follow required" },
  "lock.follow.desc": { ar: "تابعنا على القنوات التالية لفتح الزر:", en: "Follow us on the channels below to unlock:" },
  "lock.follow.confirm": { ar: "لقد تابعت — افتح الزر", en: "I followed — unlock" },
  "footer.about": { ar: "من نحن", en: "About" },
  "footer.contact": { ar: "تواصل معنا", en: "Contact us" },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };
const I18nCtx = createContext<Ctx>({ lang: "ar", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const saved = (localStorage.getItem("lang") as Lang | null) ?? "ar";
    setLangState(saved);
    document.documentElement.lang = saved;
    document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("lang", l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  }

  function t(k: string) {
    return dict[k]?.[lang] ?? k;
  }

  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  return useContext(I18nCtx);
}