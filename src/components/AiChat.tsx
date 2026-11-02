import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Camera, Image as ImageIcon, FileText, Loader2, Settings } from "lucide-react";
import { useOnlineStatus } from "@/lib/online-status";
import { readSettings } from "@/lib/app-settings";
import { readImage } from "@/lib/chat-media";
import { readOffline, writeOffline } from "@/lib/offline-data";
import { requestMic } from "@/components/PermissionsModal";
import { ArrowRight, Bot, Check, Copy, Gamepad2, History, LogIn, Menu, MessageCircle, Mic, PlusCircle, Smartphone, Trash2, Wrench, Send, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useServerFn } from "@tanstack/react-start";
import { chatWithAssistant } from "@/lib/chat.functions";
import avatarUrl from "@/assets/avatar.jpg";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";

type Msg = { role: "user" | "assistant"; content: string };
type SavedSession = {
  id: string;
  title: string;
  messages: Msg[];
  updated_at: string;
};

const GREETING: Msg = {
  role: "assistant",
  content:
    "أهلاً بك في موقع سلمان فارس. أنا المساعد الرقمي الرسمي هنا لخدمتك. كيف يمكنني مساعدتك اليوم؟ يمكنني إرشادك إلى أقسام التطبيقات، الألعاب، المواقع، وأدوات الذكاء الاصطناعي.",
};

const SUGGESTIONS = [
  { label: "تطبيقات مفيدة", icon: Smartphone, prompt: "اقترح لي أفضل التطبيقات المفيدة على الموقع" },
  { label: "أفضل الألعاب", icon: Gamepad2, prompt: "ما هي أفضل الألعاب المتوفرة على الموقع؟" },
  { label: "أدوات الذكاء الاصطناعي", icon: Bot, prompt: "اعرض لي أفضل أدوات الذكاء الاصطناعي" },
  { label: "استفسار تقني", icon: Wrench, prompt: "عندي استفسار تقني، هل يمكنك مساعدتي؟" },
];

function AssistantBubble({ content, streaming }: { content: string; streaming?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-start gap-2">
      <img src={avatarUrl} alt="سلمان فارس" className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-primary/30" />
      <div className="min-w-0 max-w-[86%] rounded-2xl border border-border/60 bg-card/60 p-4 text-sm leading-relaxed text-foreground backdrop-blur-sm [&_a]:font-bold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_strong]:font-black [&_strong]:text-foreground">
        <MessageResponse>{content}</MessageResponse>
        {!streaming && (
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(content);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="mt-3 inline-flex items-center gap-1 rounded-md border border-border/60 px-2 py-1 text-[10px] font-bold text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "تم النسخ" : "نسخ"}
          </button>
        )}
      </div>
    </div>
  );
}

export function AiChat({
  open: openProp,
  onOpenChange,
  hideTrigger,
}: {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  hideTrigger?: boolean;
} = {}) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (v: boolean) => {
    setOpenState(v);
    onOpenChange?.(v);
  };
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const send = useServerFn(chatWithAssistant);
  const online = useOnlineStatus();
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string; text: string; processing: boolean; image?: { dataUrl: string } } | null>(null);
  const [waveLevels, setWaveLevels] = useState<number[]>([]);
  const voiceRef = useRef<{ stop: () => void } | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<HTMLInputElement>(null);
  const processing = !!attachment?.processing;

  async function onPickFile(file: File | undefined) {
    setMenuOpen(false);
    if (!file) return;
    setAttachment({ name: file.name, text: "", processing: true });
    try {
      if (file.type.startsWith("image/")) {
        const image = await readImage(file);
        setAttachment({ name: file.name, text: `[صورة مرفقة: ${file.name}]`, processing: false, image });
        return;
      }
      const isText = /^text\/|json|xml|csv|javascript/.test(file.type) || /\.(txt|md|csv|json|html?|js|ts)$/i.test(file.name);
      let text = "";
      if (isText) text = (await file.text()).slice(0, 6000);
      else if (file.type === "application/pdf") {
        // Light-weight extraction of readable text runs inside the PDF.
        const raw = new TextDecoder("latin1").decode(await file.arrayBuffer());
        text = (raw.match(/\(([^()]{3,})\)\s*Tj/g) ?? []).map((m) => m.replace(/^\(|\)\s*Tj$/g, "")).join(" ").slice(0, 6000);
      }
      const kb = Math.round(file.size / 1024);
      setAttachment({ name: file.name, processing: false, text: text ? `[مرفق: ${file.name}]\n${text}` : `[أرفق المستخدم ملفاً: ${file.name} (${file.type || "غير معروف"}، ${kb}KB)]` });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذّر قراءة الملف");
      setAttachment(null);
    }
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!open || !userId) return;
    void loadSessions(userId);
  }, [open, userId]);

  const chatStatus = loading || streamingText !== null ? "submitted" : "ready";

  function typewrite(full: string): Promise<void> {
    return new Promise((resolve) => {
      let i = 0;
      setStreamingText("");
      const step = () => {
        i = Math.min(full.length, i + 2);
        setStreamingText(full.slice(0, i));
        if (i < full.length) {
          window.setTimeout(step, 16);
        } else {
          setStreamingText(null);
          resolve();
        }
      };
      window.setTimeout(step, 16);
    });
  }

  const visibleSessions = useMemo(
    () => sessions.slice().sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)),
    [sessions],
  );

  function normalizeMessages(value: Json): Msg[] {
    if (!Array.isArray(value)) return [GREETING];
    const parsed = value.filter((m): m is Msg => {
      if (!m || typeof m !== "object" || Array.isArray(m)) return false;
      const record = m as Record<string, unknown>;
      return (record.role === "user" || record.role === "assistant") && typeof record.content === "string";
    });
    return parsed.length > 0 ? parsed : [GREETING];
  }

  async function loadSessions(uid: string) {
    const cached = await readOffline<SavedSession[]>(`chats:${uid}`, []);
    setSessions(cached);
    if (!navigator.onLine) return;
    setHistoryLoading(true);
    const { data, error } = await supabase
      .from("ai_chat_sessions")
      .select("id,title,messages,updated_at")
      .eq("user_id", uid)
      .order("updated_at", { ascending: false })
      .limit(12);
    setHistoryLoading(false);
    if (error) {
      toast.error("تعذّر تحميل سجل المحادثات");
      return;
    }
    const loaded =
      (data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        messages: normalizeMessages(row.messages),
        updated_at: row.updated_at,
      }));
    setSessions(loaded);
    await writeOffline(`chats:${uid}`, loaded);
  }

  useEffect(() => {
    if (userId && !historyLoading && sessions.length) void writeOffline(`chats:${userId}`, sessions);
  }, [sessions, userId, historyLoading]);

  async function saveSession(nextMessages: Msg[]) {
    if (!userId) return;
    const firstUserMessage = nextMessages.find((m) => m.role === "user")?.content ?? "محادثة جديدة";
    const title = firstUserMessage.trim().slice(0, 48) || "محادثة جديدة";

    if (activeSessionId) {
      const { error } = await supabase
        .from("ai_chat_sessions")
        .update({ messages: nextMessages as unknown as Json, title })
        .eq("id", activeSessionId)
        .eq("user_id", userId);
      if (error) throw error;
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, title, messages: nextMessages, updated_at: new Date().toISOString() }
            : s,
        ),
      );
      return;
    }

    const { data, error } = await supabase
      .from("ai_chat_sessions")
      .insert({ user_id: userId, title, messages: nextMessages as unknown as Json })
      .select("id,title,messages,updated_at")
      .single();
    if (error) throw error;
    const created = {
      id: data.id,
      title: data.title,
      messages: normalizeMessages(data.messages),
      updated_at: data.updated_at,
    };
    setActiveSessionId(created.id);
    setSessions((prev) => [created, ...prev]);
  }

  function startNewConversation() {
    setActiveSessionId(null);
    setMessages([GREETING]);
    setHistoryOpen(false);
  }

  function openSession(session: SavedSession) {
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setHistoryOpen(false);
  }

  async function deleteSession(id: string) {
    if (!userId) return;
    if (!navigator.onLine) {
      toast.error("اتصل بالإنترنت لحذف المحادثة من حسابك");
      return;
    }
    const { error } = await supabase
      .from("ai_chat_sessions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) {
      toast.error("تعذّر حذف المحادثة");
      return;
    }
    setSessions((prev) => prev.filter((s) => s.id !== id));
    await writeOffline(`chats:${userId}`, sessions.filter(s => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
      setMessages([GREETING]);
    }
    toast.success("تم حذف المحادثة");
  }

  async function handleSend(textInput: string) {
    if (!online || (typeof navigator !== "undefined" && !navigator.onLine)) {
      toast.error("لا يوجد اتصال بالإنترنت. يرجى الاتصال بالإنترنت لتلقي إجابات الذكاء الاصطناعي.");
      return;
    }
    if (processing) return;
    const extra = attachment?.text ? `\n\n${attachment.text}` : "";
    const text = (textInput.trim() + extra).trim();
    if (!text || loading) return;
    if (!userId) {
      toast.error("سجّل الدخول لاستخدام المساعد الذكي");
      return;
    }
    const image = attachment?.image;
    setAttachment(null);
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const history = next.filter((m) => m !== GREETING).slice(-20);
      const res = await send({ data: { messages: history, image, model: readSettings().model, useMemory: readSettings().memoryEnabled } });
      setLoading(false);
      await typewrite(res.reply);
      const finalMessages: Msg[] = [...next, { role: "assistant", content: res.reply }];
      setMessages(finalMessages);
      await saveSession(finalMessages);
    } catch (err: any) {
      setStreamingText(null);
      const msg = String(err?.message ?? "");
      if (msg.includes("rate_limit")) toast.error("الخدمة مشغولة الآن، حاول بعد قليل");
      else if (msg.includes("credits")) toast.error("انتهى رصيد المساعد الذكي");
      else if (msg.includes("ai_gateway_error:")) toast.error(msg.split(/ai_gateway_error:\d+:/)[1] || msg);
      else toast.error("تعذّر الاتصال بالمساعد أو حفظ المحادثة");
      setMessages((prev) => prev.slice(0, -1));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  const isEmpty = !messages.some((m) => m.role === "user") && !loading && streamingText === null;

  async function startVoice() {
    if (voiceRef.current) { voiceRef.current.stop(); return; }
    const W = window as any;
    const SR = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SR) {
      toast.error("الإدخال الصوتي غير مدعوم في هذا المتصفح");
      return;
    }
    const stream = await requestMic();
    if (!stream) return;
    // Live waveform via Web Audio AnalyserNode
    const ctx = new (W.AudioContext || W.webkitAudioContext)();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const buf = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0;
    const tick = () => {
      analyser.getByteFrequencyData(buf);
      setWaveLevels(Array.from(buf.slice(0, 20), (v) => Math.max(0.1, v / 255)));
      raf = requestAnimationFrame(tick);
    };
    tick();
    const rec = new SR();
    rec.lang = "ar-SA";
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";
    rec.onresult = (e: any) => {
      // Only accumulate finalized segments once, avoiding duplicated transcripts.
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
      }
    };
    const cleanup = () => {
      cancelAnimationFrame(raf);
      stream.getTracks().forEach((t) => t.stop());
      void ctx.close().catch(() => {});
      setWaveLevels([]);
      setListening(false);
      voiceRef.current = null;
    };
    rec.onend = () => {
      cleanup();
      const t = finalText.trim();
      if (t) void handleSend(t).catch(() => {});
    };
    rec.onerror = (e: any) => {
      if (e?.error === "not-allowed") toast.error("تم رفض صلاحية الميكروفون. يرجى تفعيلها من إعدادات الجهاز أو المتصفح.");
      cleanup();
    };
    voiceRef.current = { stop: () => rec.stop() };
    setListening(true);
    rec.start();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <SheetTrigger
          aria-label="المساعد الذكي"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary transition-colors hover:bg-primary/20"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 rounded-full border border-background bg-emerald-500 px-1.5 py-0.5 text-[9px] font-black leading-none text-white shadow-sm">
            AI
          </span>
        </SheetTrigger>
      )}
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 bg-background/95 p-0 backdrop-blur-xl sm:max-w-md [&>button]:hidden"
      >
        <SheetHeader className="sticky top-0 z-20 border-b border-border/50 bg-background/80 px-4 py-3 text-start backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            aria-label="سجل المحادثات"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background/70 text-foreground transition-colors hover:bg-muted/60"
          >
            <Menu className="h-4 w-4" />
          </button>
          <SheetTitle className="flex items-center gap-3">
            <span className="relative">
              <img
                src={avatarUrl}
                alt="سلمان فارس"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/30"
              />
              <span className="absolute bottom-0 end-0 h-3 w-3 rounded-full border-2 border-background bg-success shadow-[0_0_8px_var(--success)]" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-base font-extrabold">المساعد الرقمي</span>
              <span className="text-[11px] font-normal text-muted-foreground">المهندس سلمان فارس</span>
              <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold text-success">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                متصل الآن
              </span>
            </span>
          </SheetTitle>
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            aria-label="الإعدادات"
            className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 text-muted-foreground hover:bg-muted/60"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/70 px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-muted/60"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            عودة
          </button>
          </div>
        </SheetHeader>

        {historyOpen && (
          <div className="absolute inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-background/70 backdrop-blur-sm"
              onClick={() => setHistoryOpen(false)}
            />
            <aside className="relative z-10 flex h-full w-[78%] max-w-72 flex-col border-e border-border/60 bg-card shadow-xl">
              <div className="flex items-center justify-between gap-2 border-b border-border/50 px-3 py-3">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
                  <History className="h-4 w-4 text-primary" />
                  سجل المحادثات
                </span>
                <button
                  type="button"
                  onClick={() => setHistoryOpen(false)}
                  aria-label="إغلاق"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:bg-muted/60"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {userId ? (
                <>
                  <div className="px-3 py-3">
                    <button
                      type="button"
                      onClick={startNewConversation}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      محادثة جديدة
                    </button>
                  </div>
                  <div className="flex-1 space-y-1.5 overflow-y-auto px-3 pb-4">
                    {historyLoading ? (
                      <span className="text-xs text-muted-foreground">يتم التحميل...</span>
                    ) : visibleSessions.length === 0 ? (
                      <span className="text-xs text-muted-foreground">ستظهر محادثاتك المحفوظة هنا.</span>
                    ) : (
                      visibleSessions.map((session) => (
                        <div
                          key={session.id}
                          className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 transition-colors ${
                            session.id === activeSessionId
                              ? "border-primary bg-primary/10"
                              : "border-border/60 bg-background/40 hover:bg-muted/50"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => openSession(session)}
                            className="min-w-0 flex-1 truncate text-start text-xs font-semibold text-foreground"
                          >
                            {session.title}
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteSession(session.id)}
                            aria-label="حذف المحادثة"
                            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-3 px-3 py-4">
                  <p className="text-xs leading-relaxed text-foreground">
                    سجّل الدخول لحفظ محادثاتك مع مساعد سلمان فارس والعودة إليها لاحقاً.
                  </p>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    دخول
                  </Link>
                </div>
              )}
            </aside>
          </div>
        )}

        <Conversation className="min-h-0">
          <ConversationContent className="gap-4 px-4 py-4">
            {isEmpty ? (
              <div className="flex flex-col items-center px-1 pt-6 text-center">
                <img src={avatarUrl} alt="سلمان فارس" className="h-16 w-16 rounded-2xl object-cover shadow-lg ring-2 ring-primary/30" />
                <h2 className="mt-4 text-xl font-extrabold text-foreground">كيف يمكنني مساعدتك اليوم؟</h2>
                <p className="mt-1.5 text-xs text-muted-foreground">اختر اقتراحاً أو اكتب سؤالك مباشرة</p>
                <div className="mt-6 grid w-full grid-cols-2 gap-2.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => void handleSend(s.prompt).catch(() => {})}
                      className="group flex flex-col items-start gap-2 rounded-2xl border border-border/60 bg-card/60 p-3 text-start transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/5"
                    >
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <s.icon className="h-4 w-4" />
                      </span>
                      <span className="text-xs font-bold text-foreground">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.filter((m) => m !== GREETING).map((m, i) =>
                m.role === "user" ? (
                  <Message key={i} from="user" className="max-w-[86%]">
                    <MessageContent className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm leading-relaxed text-foreground">
                      <MessageResponse>{m.content}</MessageResponse>
                    </MessageContent>
                  </Message>
                ) : (
                  <AssistantBubble key={i} content={m.content} />
                ),
              )
            )}
            {streamingText !== null && <AssistantBubble content={streamingText} streaming />}
            {loading && (
              <div className="flex items-start gap-2">
                <img src={avatarUrl} alt="سلمان فارس" className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-border/70" />
                <div className="flex items-center gap-1.5 rounded-2xl border border-border/60 bg-card/60 px-4 py-3.5" aria-label="يكتب...">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-primary/80" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="px-3 pb-3 pt-2">
          {!online && (
            <p className="mx-auto mb-2 max-w-3xl rounded-xl bg-destructive/10 px-3 py-2 text-center text-xs font-bold text-destructive">
              لا يوجد اتصال بالإنترنت. يرجى الاتصال بالإنترنت لتلقي إجابات الذكاء الاصطناعي.
            </p>
          )}
          {attachment && (
            <div className="mx-auto mb-2 flex max-w-3xl items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs">
              {attachment.processing ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : attachment.image ? <img src={attachment.image.dataUrl} alt="الصورة المرفقة" className="h-10 w-10 rounded-md object-cover" /> : <FileText className="h-4 w-4 text-primary" />}
              <span className="flex-1 truncate">{attachment.processing ? (/\.pdf$/i.test(attachment.name) ? "جارِ قراءة ملف PDF..." : "جارِ قراءة الملف...") : attachment.name}</span>
              <button type="button" onClick={() => setAttachment(null)} aria-label="إزالة المرفق"><X className="h-3.5 w-3.5" /></button>
            </div>
          )}
          {listening && (
            <div className="mx-auto mb-2 flex h-10 max-w-3xl items-center justify-center gap-1 rounded-xl bg-primary/10" aria-label="جارٍ التسجيل">
              {(waveLevels.length ? waveLevels : Array(20).fill(0.1)).map((v, i) => (
                <span key={i} className="w-1 rounded-full bg-primary transition-all" style={{ height: `${Math.round(v * 32) + 4}px` }} />
              ))}
            </div>
          )}
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { void onPickFile(e.target.files?.[0]); e.target.value = ""; }} />
          <input ref={galleryRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => { void onPickFile(e.target.files?.[0]); e.target.value = ""; }} />
          <input ref={filesRef} type="file" accept="*/*" hidden onChange={(e) => { void onPickFile(e.target.files?.[0]); e.target.value = ""; }} />
          <PromptInput
            onSubmit={async (message) => {
              await handleSend(message.text);
            }}
            className="mx-auto max-w-3xl rounded-2xl border border-border/80 bg-card/90 p-2.5 shadow-2xl backdrop-blur-lg transition-shadow focus-within:ring-2 focus-within:ring-primary/50 [&_[data-slot=input-group]]:border-0 [&_[data-slot=input-group]]:bg-transparent [&_[data-slot=input-group]]:shadow-none [&_[data-slot=input-group]]:ring-0"
          >
            <PromptInputTextarea
              placeholder={userId ? "اكتب رسالتك..." : "سجّل الدخول للدردشة مع المساعد"}
              disabled={!userId}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  // Enter inserts a new line; sending is only via the send button
                  e.preventDefault();
                  document.execCommand("insertText", false, "\n");
                }
              }}
              className="max-h-32 min-h-9 py-1.5 text-[13px] leading-5 text-foreground"
            />
            <PromptInputFooter className="justify-between gap-2">
              <div className="relative flex gap-2">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                disabled={!userId}
                aria-label="إرفاق"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 text-muted-foreground hover:bg-muted/60 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div className="absolute bottom-12 start-0 z-10 w-40 overflow-hidden rounded-xl border border-border bg-popover text-sm shadow-xl">
                  <button type="button" onClick={() => cameraRef.current?.click()} className="flex w-full items-center gap-2 px-3 py-2.5 hover:bg-muted"><Camera className="h-4 w-4" />الكاميرا</button>
                  <button type="button" onClick={() => galleryRef.current?.click()} className="flex w-full items-center gap-2 px-3 py-2.5 hover:bg-muted"><ImageIcon className="h-4 w-4" />المعرض</button>
                  <button type="button" onClick={() => filesRef.current?.click()} className="flex w-full items-center gap-2 px-3 py-2.5 hover:bg-muted"><FileText className="h-4 w-4" />الملفات</button>
                </div>
              )}
              <button
                type="button"
                onClick={startVoice}
                disabled={!userId}
                aria-label="إدخال صوتي"
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 transition-colors disabled:opacity-50 ${listening ? "bg-destructive/15 text-destructive" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
              >
                <Mic className={`h-4 w-4 ${listening ? "animate-pulse" : ""}`} />
              </button>
              </div>
              <PromptInputSubmit
                status={chatStatus}
                disabled={loading || streamingText !== null || !userId || processing || !online}
                aria-label="إرسال"
                className="h-9 w-9 rounded-xl bg-primary text-primary-foreground shadow-md transition-all hover:bg-primary/90"
              >
                {chatStatus === "ready" ? <Send className="h-4 w-4 rtl:-scale-x-100" /> : undefined}
              </PromptInputSubmit>
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            اضغط زر الإرسال لإرسال رسالتك • المساعد الذكي لموقع سلمان فارس
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}