import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { registerServiceWorker } from "@/lib/pwa-sw";

/**
 * Handles PWA setup + Supabase auth state:
 *  - registers the service worker
 *  - captures the beforeinstallprompt event and shows a floating install button
 *  - keeps the Supabase session in sync (needed for the OAuth redirect flow)
 *
 * Purely additive: does not touch existing routes, queries, or providers.
 */
export function PwaBoot() {
  const { t } = useI18n();
  const [deferred, setDeferred] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Register the generated service worker (guarded: production, non-preview only).
    void registerServiceWorker();

    // Keep Supabase session sync alive so OAuth redirects land cleanly.
    const { data: sub } = supabase.auth.onAuthStateChange(() => {});

    const dismissed = localStorage.getItem("pwa:dismissed") === "1";

    const onPrompt = (e: any) => {
      e.preventDefault();
      setDeferred(e);
      if (!dismissed) setVisible(true);
    };
    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      sub.subscription.unsubscribe();
    };
  }, []);

  async function install() {
    if (!deferred) return;
    try {
      deferred.prompt();
      await deferred.userChoice;
    } catch {}
    setDeferred(null);
    setVisible(false);
  }

  function dismiss() {
    localStorage.setItem("pwa:dismissed", "1");
    setVisible(false);
  }

  if (!visible || !deferred) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border/60 bg-card/95 px-4 py-2 shadow-lg backdrop-blur">
        <button
          type="button"
          onClick={install}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"
        >
          <Download className="h-3.5 w-3.5" />
          {t("pwa.install")}
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("pwa.dismiss")}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}