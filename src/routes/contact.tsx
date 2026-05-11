import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail } from "lucide-react";
import { SocialLinks } from "@/components/SocialLinks";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "تواصل معنا | سلمان فارس" }] }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = `${t("contact.name")}: ${name}%0A${t("contact.email")}: ${email}%0A%0A${message}`;
    window.location.href = `mailto:salman77fares@gmail.com?subject=${name}&body=${body}`;
    toast.success("...");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold md:text-4xl">{t("contact.title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">{t("contact.subtitle")}</p>
      </div>
      <div className="mt-8 grid gap-4">
        <a href="mailto:salman77fares@gmail.com" className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/50 p-4 hover:border-primary/50">
          <Mail className="h-5 w-5 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground">{t("contact.email")}</div>
            <div className="font-semibold">salman77fares@gmail.com</div>
          </div>
        </a>
      </div>
      <form onSubmit={submit} className="mt-6 grid gap-4 rounded-2xl border border-border/70 bg-card/50 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div><Label>{t("contact.name")}</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>{t("contact.email")}</Label><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        </div>
        <div><Label>{t("contact.message")}</Label><Textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
        <div><Button type="submit">{t("contact.send")}</Button></div>
      </form>
      <div className="mt-10 text-center">
        <h2 className="text-lg font-bold">{t("contact.followAlt")}</h2>
        <div className="mt-4"><SocialLinks /></div>
      </div>
    </div>
  );
}
