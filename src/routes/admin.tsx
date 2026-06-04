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
import { toast } from "sonner";
import { LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { socials, type SocialKey } from "@/components/SocialLinks";

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
  const [uploadingGallery, setUploadingGallery] = useState(false);

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
      if (!admin) navigate({ to: "/" });
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
      gallery: it.gallery ?? [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("الرجاء اختيار صورة");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("الحجم يجب أن يكون أقل من 5MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("item-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("item-images").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
      toast.success("تم رفع الصورة");
    } catch (err: any) {
      toast.error(err?.message ?? "فشل الرفع");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingGallery(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name}: الحجم يجب أن يكون أقل من 5MB`);
          continue;
        }
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `gallery/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("item-images").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (error) { toast.error(error.message); continue; }
        const { data } = supabase.storage.from("item-images").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      if (urls.length) {
        setForm((f) => ({ ...f, gallery: [...f.gallery, ...urls] }));
        toast.success(`تم رفع ${urls.length} صورة`);
      }
    } finally {
      setUploadingGallery(false);
      e.target.value = "";
    }
  }

  function removeGalleryImage(url: string) {
    setForm((f) => ({ ...f, gallery: f.gallery.filter((u) => u !== url) }));
  }

  if (!authChecked) return <div className="p-12 text-center text-sm text-muted-foreground">...</div>;
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <p className="text-sm text-muted-foreground">حسابك ليس مسؤولاً.</p>
        <Button onClick={logout} variant="outline" className="mt-4">تسجيل الخروج</Button>
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

      <form onSubmit={save} className="mt-6 grid gap-4 rounded-2xl border border-border/70 bg-card/50 p-5 md:grid-cols-2">
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
          <Textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
          <Input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="جديد، مميز..." />
        </div>
        <div>
          <Label>المشاهدات (اختياري)</Label>
          <Input value={form.views} onChange={(e) => setForm({ ...form, views: e.target.value })} placeholder="120K" />
        </div>
        <div>
          <Label>التقييم 0-5 (اختياري)</Label>
          <Input
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
            placeholder="4.5"
          />
        </div>
        <div className="md:col-span-2">
          <Label>الصورة المصغّرة (اختياري)</Label>
          <div className="mt-1 flex items-center gap-3">
            <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            {form.image_url && (
              <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, image_url: "" })}>
                إزالة
              </Button>
            )}
          </div>
          {uploading && <p className="mt-1 text-xs text-muted-foreground">جارٍ الرفع...</p>}
          {form.image_url && (
            <img src={form.image_url} alt="" className="mt-2 h-24 w-40 rounded-lg border border-border/60 object-cover" />
          )}
        </div>
        <div className="md:col-span-2">
          <Label>صور توضيحية (متعددة - اختياري)</Label>
          <p className="mt-1 text-xs text-muted-foreground">يمكنك رفع عدة صور لعرضها كمعرض للعنصر.</p>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryUpload}
            disabled={uploadingGallery}
            className="mt-2"
          />
          {uploadingGallery && <p className="mt-1 text-xs text-muted-foreground">جارٍ الرفع...</p>}
          {form.gallery.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {form.gallery.map((url) => (
                <div key={url} className="relative">
                  <img src={url} alt="" className="h-20 w-full rounded-lg border border-border/60 object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(url)}
                    className="absolute -top-2 -end-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
                    aria-label="حذف"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <Label>متابعة إجبارية قبل التنزيل/الزيارة (اختياري)</Label>
          <p className="mt-1 text-xs text-muted-foreground">اختر القنوات التي يجب على المستخدم متابعتها لفتح الزر.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {socials.map((s) => {
              const active = form.required_follows.includes(s.key);
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      required_follows: active
                        ? f.required_follows.filter((k) => k !== s.key)
                        : [...f.required_follows, s.key],
                    }))
                  }
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/70 bg-card/40 text-foreground hover:bg-muted/50"
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
          {form.id && (
            <Button type="button" variant="outline" onClick={() => setForm(empty)}>إلغاء</Button>
          )}
        </div>
      </form>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-bold text-muted-foreground">العناصر ({items?.length ?? 0})</h2>
        <div className="space-y-2">
          {(items ?? []).map((it) => (
            <div key={it.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/30 text-2xl">
                {it.image_url ? (
                  <img src={it.image_url} alt={it.title} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <span>{it.emoji}</span>
                )}
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
    </div>
  );
}
