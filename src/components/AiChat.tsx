import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bot, Check, Copy, Gamepad2, History, LogIn, Menu, MessageCircle, Mic, PlusCircle, Smartphone, Trash2, Wrench, X } from "lucide-react";
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
    setSessions(
      (data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        messages: normalizeMessages(row.messages),
        updated_at: row.updated_at,
      })),
    );
  }

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
    if (activeSessionId === id) {
      setActiveSessionId(null);
      setMessages([GREETING]);
    }
    toast.success("تم حذف المحادثة");
  }

  async function handleSend(textInput: string) {
    const text = textInput.trim();
    if (!text || loading) return;
    if (!userId) {
      toast.error("سجّل الدخول لاستخدام المساعد الذكي");
      return;
    }
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const history = next.filter((m) => m !== GREETING).slice(-20);
      const res = await send({ data: { messages: history } });
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
      else toast.error("تعذّر الاتصال بالمساعد أو حفظ المحادثة");
      setMessages((prev) => prev.slice(0, -1));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  const isEmpty = !messages.some((m) => m.role === "user") && !loading && streamingText === null;

  function startVoice() {
    const W = window as any;
    const SR = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SR) {
      toast.error("الإدخال الصوتي غير مدعوم في هذا المتصفح");
      return;
    }
    const rec = new SR();
    rec.lang = "ar-SA";
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const t = e.results?.[0]?.[0]?.transcript;
      if (t) void handleSend(t).catch(() => {});
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
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
              <button
                type="button"
                onClick={startVoice}
                disabled={!userId}
                aria-label="إدخال صوتي"
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 transition-colors disabled:opacity-50 ${listening ? "bg-destructive/15 text-destructive" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
              >
                <Mic className={`h-4 w-4 ${listening ? "animate-pulse" : ""}`} />
              </button>
              <PromptInputSubmit
                status={chatStatus}
                disabled={loading || streamingText !== null || !userId}
                aria-label="إرسال"
                className="h-9 w-9 rounded-xl bg-primary text-primary-foreground shadow-md transition-all hover:bg-primary/90"
              >
                {chatStatus === "ready" || chatStatus === "error" ? <Send className="h-4 w-4 rtl:-scale-x-100" /> : undefined}
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