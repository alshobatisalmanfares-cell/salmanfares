import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageCircle } from "lucide-react";
import { SocialLinks } from "@/components/SocialLinks";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا | سلمان فارس" },
      { name: "description", content: "تواصل مع فريق سلمان فارس عبر النموذج أو حسابات التواصل الاجتماعي." },
      { property: "og:title", content: "تواصل معنا | سلمان فارس" },
      { property: "og:description", content: "تواصل مع فريق سلمان فارس عبر النموذج أو حسابات التواصل الاجتماعي." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = `الاسم: ${name}%0Aالبريد: ${email}%0A%0A${message}`;
    window.location.href = `mailto:contact@salmanfares.com?subject=رسالة من ${name}&body=${body}`;
    toast.success("جاري فتح بريدك الإلكتروني...");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold md:text-4xl">تواصل معنا</h1>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          يسعدنا تواصلك معنا لأي اقتراح أو استفسار أو تعاون.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <a
          href="mailto:contact@salmanfares.com"
          className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/50 p-4 hover:border-primary/50"
        >
          <Mail className="h-5 w-5 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground">البريد الإلكتروني</div>
            <div className="font-semibold">contact@salmanfares.com</div>
          </div>
        </a>
        <a
          href="https://t.me/salmanfares"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/50 p-4 hover:border-primary/50"
        >
          <MessageCircle className="h-5 w-5 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground">تيليجرام</div>
            <div className="font-semibold">@salmanfares</div>
          </div>
        </a>
      </div>

      <form onSubmit={submit} className="mt-6 grid gap-4 rounded-2xl border border-border/70 bg-card/50 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>الاسم</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>البريد الإلكتروني</Label>
            <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>الرسالة</Label>
          <Textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <div>
          <Button type="submit">إرسال</Button>
        </div>
      </form>

      <div className="mt-10 text-center">
        <h2 className="text-lg font-bold">أو تابعنا على</h2>
        <div className="mt-4">
          <SocialLinks />
        </div>
      </div>
    </div>
  );
}