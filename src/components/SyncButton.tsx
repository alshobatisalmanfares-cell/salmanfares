import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useOnlineStatus } from "@/lib/online-status";
import { updateServiceWorker } from "@/lib/pwa-sw";

/** Manual "refresh data" control: revalidates every cached query + the service worker. */
export function useDataSync() {
  const queryClient = useQueryClient();
  const online = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);

  async function sync() {
    if (!online) {
      toast("أنت تعمل بدون إنترنت حالياً. سيتم تحديث البيانات فور الاتصال.");
      return;
    }
    setSyncing(true);
    try {
      await Promise.all([
        queryClient.refetchQueries({ type: "all" }),
        updateServiceWorker(),
      ]);
      toast.success("تم تحديث البيانات والمحتوى بنجاح!");
    } catch {
      toast.error("تعذر تحديث البيانات، حاول مرة أخرى.");
    } finally {
      setSyncing(false);
    }
  }

  return { sync, syncing, online };
}

export function SyncIconButton() {
  const { sync, syncing } = useDataSync();
  return (
    <button
      type="button"
      onClick={sync}
      disabled={syncing}
      aria-label="تحديث البيانات"
      title="تحديث البيانات"
      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border/60 bg-card/40 text-foreground transition-colors hover:bg-muted/60 disabled:opacity-60"
    >
      <RefreshCw className={`h-5 w-5 ${syncing ? "animate-spin" : ""}`} />
    </button>
  );
}
