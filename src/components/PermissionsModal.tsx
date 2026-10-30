import { useEffect, useState } from "react";
import { Mic, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { applyFontSize, readSettings } from "@/lib/app-settings";

const KEY = "hasRequestedPermissions";
export const DENIED_MSG = "تم رفض صلاحية الميكروفون. يرجى تفعيلها من إعدادات الجهاز أو المتصفح ثم المحاولة مجدداً.";

/** Asks for the microphone; shows the Arabic "re-enable in settings" toast on NotAllowedError. */
export async function requestMic(): Promise<MediaStream | null> {
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
    return await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e: any) {
    if (e?.name === "NotAllowedError" || e?.name === "SecurityError") toast.error(DENIED_MSG);
    else toast.error("الميكروفون غير متاح على هذا الجهاز");
    return null;
  }
}

export function PermissionsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    applyFontSize(readSettings().fontSize);
    if (localStorage.getItem(KEY) !== "true") setOpen(true);
  }, []);

  function done() {
    localStorage.setItem(KEY, "true");
    setOpen(false);
  }

  async function accept() {
    const stream = await requestMic();
    stream?.getTracks().forEach((t) => t.stop());
    // File access on the web is granted per pick; just confirm the picker API exists.
    if (typeof File === "undefined" || typeof FileReader === "undefined") toast.error("الوصول للملفات غير مدعوم");
    else if (stream) toast.success("تم منح الصلاحيات بنجاح");
    done();
  }

  if (!open) return null;
  return (
    <div dir="rtl" className="fixed inset-0 z-[100] flex items-end justify-center bg-background/70 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <div className="mb-3 flex justify-center gap-3 text-primary">
          <Mic className="h-7 w-7" />
          <FolderOpen className="h-7 w-7" />
        </div>
        <h2 className="mb-2 text-center text-lg font-extrabold">الصلاحيات المطلوبة</h2>
        <p className="mb-5 text-center text-sm leading-6 text-muted-foreground">
          يحتاج تطبيق موقع سلمان فارس إلى صلاحيات الميكروفون والوصول للملفات لتسهيل التسجيل الصوتي وإرفاق المستندات والصور.
        </p>
        <div className="flex gap-2">
          <button onClick={accept} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90">
            السماح
          </button>
          <button onClick={done} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted">
            لاحقاً
          </button>
        </div>
      </div>
    </div>
  );
}
