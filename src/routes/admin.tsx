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
};

const empty: FormState = {
  title: "", description: "", category: "apps", url: "",
  cta: "زيارة الموقع", emoji: "✨", badge: "", views: "",
};

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

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
      if (!admin) toast.error("هذا الحساب ليس مسؤولاً");
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
        cta: form.cta.trim() || "زيارة الموقع",
        emoji: form.emoji || "✨",
        badge: form.badge.trim() || null,
        views: form.views.trim() || null,
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
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
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
              <SelectItem value="apps">تطبيقات</SelectItem>
              <SelectItem value="websites">مواقع</SelectItem>
              <SelectItem value="trending">الأكثر مشاهدة</SelectItem>
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
          <Label>الأيقونة (إيموجي)</Label>
          <Input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
        </div>
        <div>
          <Label>شارة (اختياري)</Label>
          <Input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="جديد، مميز..." />
        </div>
        <div>
          <Label>المشاهدات (اختياري)</Label>
          <Input value={form.views} onChange={(e) => setForm({ ...form, views: e.target.value })} placeholder="120K" />
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
              <span className="text-2xl">{it.emoji}</span>
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
