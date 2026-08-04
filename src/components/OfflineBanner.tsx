import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/lib/online-status";

export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 top-[68px] z-[70] flex justify-center px-4"
    >
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-4 py-1.5 text-xs font-bold text-amber-600 shadow-sm backdrop-blur dark:text-amber-400">
        <WifiOff className="h-3.5 w-3.5" />
        أنت تعمل بدون إنترنت — يمكنك تصفح المحتوى المحفوظ
      </div>
    </div>
  );
}
