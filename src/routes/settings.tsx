import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Trash2, Plus, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, LANGS } from "@/lib/i18n";
import { useAppSettings, type ChatModel, type FontSize } from "@/lib/app-settings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "الإعدادات | موقع سلمان فارس" },
      { name: "description", content: "إعدادات تطبيق موقع سلمان فارس: المظهر، نموذج المساعد، الذاكرة، الحساب والبيانات." },
      { property: "og:title", content: "الإعدادات | موقع سلمان فارس" },
      { property: "og:description", content: "تحكم في المظهر والذاكرة وبيانات حسابك في موقع سلمان فارس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

type Memory = { id: string; content: string };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-extrabold text-primary">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="font-bold">{label}</span>
      {children}
    </div>
  );
}
function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-all ${on ? "start-[22px]" : "start-0.5"}`} />
    </button>
  );
}

const selectCls = "rounded-lg border border-border bg-background px-2 py-1.5 text-sm";

function SettingsPage() {
  const navigate = useNavigate();
  const { lang, setLang } = useI18n();
  const [settings, update] = useAppSettings();
  const [dark, setDark] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [newMem, setNewMem] = useState("");

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
      setUserId(data.session?.user.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    supabase.from("user_memories").select("id,content").order("created_at", { ascending: false })
      .then(({ data }) => setMemories(data ?? []));
  }, [userId]);

  function toggleDark(v: boolean) {
    setDark(v);
    document.documentElement.classList.toggle("dark", v);
    localStorage.setItem("theme", v ? "dark" : "light");
  }

  async function addMemory() {
    const content = newMem.trim();
    if (!content || !userId) return;
    const { data, error } = await supabase.from("user_memories").insert({ user_id: userId, content }).select("id,content").single();
    if (error) return toast.error("تعذّر حفظ الذاكرة");
    setMemories((m) => [data, ...m]);
    setNewMem("");
  }
  async function deleteMemory(id: string) {
    const { error } = await supabase.from("user_memories").delete().eq("id", id);
    if (error) return toast.error("تعذّر الحذف");
    setMemories((m) => m.filter((x) => x.id !== id));
  }
  async function deleteAllChats() {
    if (!userId || !confirm("هل تريد حذف جميع المحادثات نهائياً؟")) return;
    const { error } = await supabase.from("ai_chat_sessions").delete().eq("user_id", userId);
    if (error) toast.error("تعذّر حذف المحادثات");
    else toast.success("تم حذف جميع المحادثات");
  }
  async function deleteAccount() {
    if (!userId || !confirm("سيتم حذف بياناتك (المحادثات والذاكرة) وتسجيل خروجك. متابعة؟")) return;
    await supabase.from("ai_chat_sessions").delete().eq("user_id", userId);
    await supabase.from("user_memories").delete().eq("user_id", userId);
    await supabase.auth.signOut();
    toast.success("تم حذف بياناتك وتسجيل الخروج. لحذف الحساب نهائياً تواصل معنا.");
    navigate({ to: "/contact" });
  }

  return (
    <div dir="rtl" className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <div className="flex items-center gap-3">
        <Link to="/chat" aria-label="رجوع" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-muted">
          <ArrowRight className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-extrabold">الإعدادات</h1>
      </div>

      <Section title="عام">
        <Row label="الوضع الليلي"><Toggle label="الوضع الليلي" on={dark} onChange={toggleDark} /></Row>
        <Row label="نموذج المساعد">
          <select className={selectCls} value={settings.model} onChange={(e) => update({ model: e.target.value as ChatModel })}>
            <option value="google/gemini-3-flash-preview">Gemini 3 Flash</option>
            <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
            <option value="google/gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
          </select>
        </Row>
        <Row label="اللغة">
          <select className={selectCls} value={lang} onChange={(e) => setLang(e.target.value as typeof lang)}>
            {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </Row>
        <Row label="حجم الخط">
          <select className={selectCls} value={settings.fontSize} onChange={(e) => update({ fontSize: e.target.value as FontSize })}>
            <option value="sm">صغير</option>
            <option value="md">متوسط</option>
            <option value="lg">كبير</option>
          </select>
        </Row>
      </Section>

      <Section title="الذاكرة">
        <Row label="تفعيل الذاكرة"><Toggle label="تفعيل الذاكرة" on={settings.memoryEnabled} onChange={(v) => update({ memoryEnabled: v })} /></Row>
        {userId ? (
          <>
            <div className="flex gap-2">
              <input value={newMem} onChange={(e) => setNewMem(e.target.value)} maxLength={500}
                placeholder="مثال: أفضّل ألعاب الأندرويد الخفيفة" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <button onClick={addMemory} aria-label="إضافة" className="rounded-lg bg-primary px-3 text-primary-foreground"><Plus className="h-4 w-4" /></button>
            </div>
            {memories.length === 0 && <p className="text-xs text-muted-foreground">لا توجد ذكريات محفوظة.</p>}
            <ul className="space-y-2">
              {memories.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                  <span>{m.content}</span>
                  <button onClick={() => deleteMemory(m.id)} aria-label="حذف" className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          </>
        ) : <p className="text-xs text-muted-foreground">سجّل الدخول لإدارة الذاكرة.</p>}
      </Section>

      <Section title="الحساب والبيانات">
        <Row label="البريد الإلكتروني"><span className="truncate text-muted-foreground" dir="ltr">{email ?? "غير مسجّل"}</span></Row>
        {userId ? (
          <button onClick={deleteAllChats} className="w-full rounded-xl border border-destructive/40 py-2 text-sm font-bold text-destructive hover:bg-destructive/10">حذف جميع المحادثات</button>
        ) : <Link to="/login" className="block w-full rounded-xl bg-primary py-2 text-center text-sm font-bold text-primary-foreground">تسجيل الدخول</Link>}
      </Section>

      <Section title="عن التطبيق والمشاريع">
        {[["زاد الدعاة", "https://zad-alduat.lovable.app"], ["كنز ستور", "https://kanzstore.lovable.app"], ["متجر سلمان فارس", "https://salmanfares.lovable.app/"]].map(([n, u]) => (
          <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-sm font-bold hover:text-primary">
            {n}<ExternalLink className="h-4 w-4" />
          </a>
        ))}
        <Row label="إصدار التطبيق"><span className="text-muted-foreground">1.0</span></Row>
        <Row label="المطوّر"><span className="text-muted-foreground">المهندس سلمان فارس</span></Row>
        <div className="flex gap-4 text-sm">
          <Link to="/privacy" className="text-primary underline">سياسة الخصوصية</Link>
          <Link to="/terms" className="text-primary underline">الشروط والأحكام</Link>
        </div>
        {userId && <button onClick={deleteAccount} className="w-full rounded-xl bg-destructive py-2 text-sm font-bold text-destructive-foreground hover:bg-destructive/90">حذف الحساب</button>}
      </Section>
    </div>
  );
}
