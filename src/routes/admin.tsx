import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Item, ItemCategory } from "@/lib/items";
import { fetchItems } from "@/lib/items";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LogOut, Pencil, Plus, Trash2, X } from "lucide-react";
import { socials, type SocialKey } from "@/components/SocialLinks";
import { useSiteSettings, applySettingsToDom, type SiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة التحكم | سلمان فارس" }] }),
  component: AdminPage,
});

type FormState = {
  id?: string;
  title: string;
  description: string;
  category: ItemCategory;
  url: string;
  cta: string;
  emoji: string;
  badge: string;
  views: string;
  image_url: string;
  rating: string;
  required_follows: SocialKey[];
  gallery: string[];
};

const empty: FormState = {
  title: "", description: "", category: "apps", url: "",
  cta: "تحميل التطبيق", emoji: "✨", badge: "", views: "", image_url: "", rating: "",
  required_follows: [], gallery: [],
};

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/login" }); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
      if (!mounted) return;
      const admin = (data ?? []).some((r) => r.role === "admin");
      setIsAdmin(admin);
      setAuthChecked(true);
    }
    check();
    return () => { mounted = false; };
  }, [navigate]);

  const { data: items } = useQuery({
    queryKey: ["items", "admin-all"],
    queryFn: () => fetchItems(),
    enabled: isAdmin,
  });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        url: form.url.trim(),
        cta: form.cta.trim() || "تحميل التطبيق",
        emoji: form.emoji || "✨",
        badge: form.badge.trim() || null,
        views: form.views.trim() || null,
        image_url: form.image_url.trim() || null,
        rating: form.rating.trim() ? Number(form.rating) : null,
        required_follows: form.required_follows,
        gallery: form.gallery,
      };
      if (form.id) {
        const { error } = await supabase.from("items").update(payload).eq("id", form.id);
        if (error) throw error;
        toast.success("تم التحديث");
      } else {
        const { error } = await supabase.from("items").insert(payload);
        if (error) throw error;
        toast.success("تمت الإضافة");
      }
      setForm(empty);
      qc.invalidateQueries({ queryKey: ["items"] });
    } catch (err: any) {
      toast.error(err?.message ?? "خطأ");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("هل تريد الحذف؟")) return;
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم الحذف");
    qc.invalidateQueries({ queryKey: ["items"] });
  }

  function edit(it: Item) {
    setForm({
      id: it.id, title: it.title, description: it.description,
      category: it.category, url: it.url, cta: it.cta,
      emoji: it.emoji, badge: it.badge ?? "", views: it.views ?? "",
      image_url: it.image_url ?? "",
      rating: it.rating != null ? String(it.rating) : "",
      required_follows: (it.required_follows ?? []) as SocialKey[],
      gallery: (it.gallery ?? []) as string[],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  async function uploadFile(file: File): Promise<string> {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("item-images").upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    return supabase.storage.from("item-images").getPublicUrl(path).data.publicUrl;
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("اختر صورة"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("الحجم > 5MB"); return; }
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setForm((f) => ({ ...f, image_url: url }));
      toast.success("تم الرفع");
    } catch (err: any) { toast.error(err?.message ?? "فشل"); }
    finally { setUploading(false); e.target.value = ""; }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setGalleryUploading(true);
    try {
      const urls: string[] = [];
      for (const f of files) {
        if (!f.type.startsWith("image/")) continue;
        if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} > 5MB`); continue; }
        urls.push(await uploadFile(f));
      }
      setForm((f) => ({ ...f, gallery: [...f.gallery, ...urls] }));
      toast.success(`تم رفع ${urls.length} صورة`);
    } catch (err: any) { toast.error(err?.message ?? "فشل"); }
    finally { setGalleryUploading(false); e.target.value = ""; }
  }

  if (!authChecked) return <div className="p-12 text-center text-sm text-muted-foreground">...</div>;
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <p className="text-sm text-muted-foreground">تم تسجيل الدخول بنجاح.</p>
        <Button onClick={() => navigate({ to: "/" })} className="mt-4">العودة للرئيسية</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <Button onClick={logout} variant="outline" size="sm">
          <LogOut className="ml-1 h-4 w-4" /> خروج
        </Button>
      </div>

      <Tabs defaultValue="items" className="mt-6">
        <TabsList>
          <TabsTrigger value="items">العناصر</TabsTrigger>
          <TabsTrigger value="settings">إعدادات الموقع</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <form onSubmit={save} className="mt-4 grid gap-4 rounded-2xl border border-border/70 bg-card/50 p-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <h2 className="text-sm font-bold">{form.id ? "تعديل عنصر" : "إضافة عنصر جديد"}</h2>
            </div>
            <div>
              <Label>العنوان</Label>
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>القسم</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ItemCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="games">ألعاب</SelectItem>
                  <SelectItem value="apps">تطبيقات</SelectItem>
                  <SelectItem value="websites">مواقع</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>الوصف</Label>
              <Textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>الرابط</Label>
              <Input required type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </div>
            <div>
              <Label>نص الزر</Label>
              <Input value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} />
            </div>
            <div>
              <Label>شارة (اختياري)</Label>
              <Input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
            </div>
            <div>
              <Label>المشاهدات (اختياري)</Label>
              <Input value={form.views} onChange={(e) => setForm({ ...form, views: e.target.value })} placeholder="120K" />
            </div>
            <div>
              <Label>التقييم 0-5 (اختياري)</Label>
              <Input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} placeholder="4.5" />
            </div>
            <div className="md:col-span-2">
              <Label>الصورة المصغّرة</Label>
              <div className="mt-1 flex items-center gap-3">
                <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                {form.image_url && (
                  <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, image_url: "" })}>إزالة</Button>
                )}
              </div>
              {form.image_url && <img src={form.image_url} alt="" className="mt-2 h-24 w-40 rounded-lg border border-border/60 object-cover" />}
            </div>
            <div className="md:col-span-2">
              <Label>صور توضيحية إضافية (معرض)</Label>
              <Input type="file" accept="image/*" multiple onChange={handleGalleryUpload} disabled={galleryUploading} className="mt-1" />
              {galleryUploading && <p className="mt-1 text-xs text-muted-foreground">جارٍ الرفع...</p>}
              {form.gallery.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.gallery.map((g, i) => (
                    <div key={i} className="relative">
                      <img src={g} alt="" className="h-20 w-32 rounded-lg border border-border/60 object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, gallery: f.gallery.filter((_, j) => j !== i) }))}
                        className="absolute -top-2 -end-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <Label>متابعة إجبارية قبل التنزيل/الزيارة</Label>
              <p className="mt-1 text-xs text-muted-foreground">اختر القنوات التي يجب على المستخدم متابعتها لفتح الزر.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {socials.map((s) => {
                  const active = form.required_follows.includes(s.key);
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setForm((f) => ({
                        ...f,
                        required_follows: active ? f.required_follows.filter((k) => k !== s.key) : [...f.required_follows, s.key],
                      }))}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                        active ? "border-primary bg-primary text-primary-foreground" : "border-border/70 bg-card/40 text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <s.Icon className="h-3.5 w-3.5" />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={saving}>
                <Plus className="ml-1 h-4 w-4" />
                {form.id ? "حفظ التعديل" : "إضافة"}
              </Button>
              {form.id && <Button type="button" variant="outline" onClick={() => setForm(empty)}>إلغاء</Button>}
            </div>
          </form>

          <div className="mt-8">
            <h2 className="mb-3 text-sm font-bold text-muted-foreground">العناصر ({items?.length ?? 0})</h2>
            <div className="space-y-2">
              {(items ?? []).map((it) => (
                <div key={it.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/30 text-2xl">
                    {it.image_url ? <img src={it.image_url} alt={it.title} loading="lazy" className="h-full w-full object-cover" /> : <span>{it.emoji}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold">{it.title}</span>
                      <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">{it.category}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{it.description}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => edit(it)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => remove(it.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingsTab() {
  const { settings, refresh } = useSiteSettings();
  const [s, setS] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setS(settings); }, [settings]);

  async function save() {
    setSaving(true);
    try {
      const { error } = await supabase.from("site_settings").update({
        hero_title_ar: s.hero_title_ar,
        hero_title_en: s.hero_title_en,
        hero_highlight_ar: s.hero_highlight_ar,
        hero_highlight_en: s.hero_highlight_en,
        hero_subtitle_ar: s.hero_subtitle_ar,
        hero_subtitle_en: s.hero_subtitle_en,
        primary_color: s.primary_color,
        secondary_color: s.secondary_color,
        accent_color: s.accent_color,
        bg_color_1: s.bg_color_1,
        bg_color_2: s.bg_color_2,
        base_font_size: s.base_font_size,
        heading_scale: s.heading_scale,
        updated_at: new Date().toISOString(),
      }).eq("id", "main");
      if (error) throw error;
      applySettingsToDom(s);
      await refresh();
      toast.success("تم الحفظ");
    } catch (err: any) {
      toast.error(err?.message ?? "خطأ");
    } finally { setSaving(false); }
  }

  function colorField(label: string, key: keyof SiteSettings) {
    return (
      <div>
        <Label>{label}</Label>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="color"
            value={s[key] as string}
            onChange={(e) => setS({ ...s, [key]: e.target.value })}
            className="h-10 w-16 rounded border border-border/70"
          />
          <Input value={s[key] as string} onChange={(e) => setS({ ...s, [key]: e.target.value })} />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-4 rounded-2xl border border-border/70 bg-card/50 p-5">
      <h2 className="text-sm font-bold">إعدادات الموقع (نصوص، ألوان، أحجام)</h2>

      <div className="grid gap-3 md:grid-cols-2">
        <div><Label>عنوان البطل (عربي)</Label><Input value={s.hero_title_ar} onChange={(e) => setS({ ...s, hero_title_ar: e.target.value })} /></div>
        <div><Label>Hero title (English)</Label><Input value={s.hero_title_en} onChange={(e) => setS({ ...s, hero_title_en: e.target.value })} /></div>
        <div><Label>تكملة العنوان (عربي)</Label><Input value={s.hero_highlight_ar} onChange={(e) => setS({ ...s, hero_highlight_ar: e.target.value })} /></div>
        <div><Label>Highlight (English)</Label><Input value={s.hero_highlight_en} onChange={(e) => setS({ ...s, hero_highlight_en: e.target.value })} /></div>
        <div className="md:col-span-2"><Label>الوصف الفرعي (عربي)</Label><Textarea rows={2} value={s.hero_subtitle_ar} onChange={(e) => setS({ ...s, hero_subtitle_ar: e.target.value })} /></div>
        <div className="md:col-span-2"><Label>Subtitle (English)</Label><Textarea rows={2} value={s.hero_subtitle_en} onChange={(e) => setS({ ...s, hero_subtitle_en: e.target.value })} /></div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {colorField("لون أساسي", "primary_color")}
        {colorField("لون ثانوي", "secondary_color")}
        {colorField("لون مميز", "accent_color")}
        {colorField("خلفية متحركة 1", "bg_color_1")}
        {colorField("خلفية متحركة 2", "bg_color_2")}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label>حجم الخط الأساسي ({s.base_font_size}px)</Label>
          <input type="range" min={12} max={22} value={s.base_font_size} onChange={(e) => setS({ ...s, base_font_size: Number(e.target.value) })} className="mt-2 w-full" />
        </div>
        <div>
          <Label>حجم العناوين ({s.heading_scale.toFixed(2)}x)</Label>
          <input type="range" min={0.8} max={1.5} step={0.05} value={s.heading_scale} onChange={(e) => setS({ ...s, heading_scale: Number(e.target.value) })} className="mt-2 w-full" />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={save} disabled={saving}>{saving ? "..." : "حفظ"}</Button>
        <Button variant="outline" onClick={() => applySettingsToDom(s)}>معاينة</Button>
      </div>
    </div>
  );
}
