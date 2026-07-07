import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "تسجيل الدخول | سلمان فارس" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function onGoogle() {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err?.message ?? t("auth.error"));
      setGoogleLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast.success(t("auth.success.signup"));
      } else {
        // Clear any stale session before signing in with new credentials
        await supabase.auth.signOut();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t("auth.success.signin"));
      }
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err?.message ?? t("auth.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <div className="w-full rounded-2xl border border-border/70 bg-card/60 p-6">
        <h1 className="text-xl font-bold">{mode === "signin" ? t("auth.signin") : t("auth.signup")}</h1>
        <button
          type="button"
          onClick={onGoogle}
          disabled={googleLoading}
          className="mt-5 flex w-full items-center justify-center gap-3 rounded-lg border border-border/70 bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60 disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.5 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.8 0 19.5-8.7 19.5-19.5 0-1.3-.1-2.3-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.1l6.6 4.8C14.7 15.1 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.5 29 4.5 24 4.5 16.4 4.5 9.9 8.7 6.3 14.1z"/>
            <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.9 12.9-5l-6-4.9c-2 1.4-4.4 2.4-6.9 2.4-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C10 39.5 16.4 43.5 24 43.5z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.4 4.4-4.4 5.8l6 4.9c-.4.4 6.6-4.8 6.6-14.7 0-1.3-.1-2.3-.4-3.5z"/>
          </svg>
          {googleLoading ? t("loading.wait") : t("auth.google")}
        </button>
        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-border/70" />
          <span className="text-[11px] font-semibold uppercase text-muted-foreground">{t("auth.or")}</span>
          <span className="h-px flex-1 bg-border/70" />
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Label htmlFor="email">{t("contact.email")}</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">{t("auth.password")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pe-10"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                aria-label={t("auth.togglePwd")}
                className="absolute inset-y-0 end-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "..." : mode === "signin" ? t("nav.login") : t("auth.signup")}
          </Button>
        </form>
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          {mode === "signin" ? t("auth.toSignup") : t("auth.toSignin")}
        </button>
      </div>
    </div>
  );
}
