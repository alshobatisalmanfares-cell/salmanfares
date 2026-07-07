import { useEffect, useMemo, useState } from "react";
import { ArrowRight, History, LogIn, MessageCircle, PlusCircle } from "lucide-react";
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
import { Shimmer } from "@/components/ai-elements/shimmer";

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

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
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

  const chatStatus = loading ? "submitted" : "ready";

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
  }

  function openSession(session: SavedSession) {
    setActiveSessionId(session.id);
    setMessages(session.messages);
  }

  async function handleSend(textInput: string) {
    const text = textInput.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const history = next.filter((m) => m !== GREETING).slice(-20);
      const res = await send({ data: { messages: history } });
      const finalMessages: Msg[] = [...next, { role: "assistant", content: res.reply }];
      setMessages(finalMessages);
      await saveSession(finalMessages);
    } catch (err: any) {
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="المساعد الذكي"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary transition-colors hover:bg-primary/20"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="absolute -right-1 -top-1 rounded-full border border-background bg-emerald-500 px-1.5 py-0.5 text-[9px] font-black leading-none text-white shadow-sm">
          AI
        </span>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 bg-background/95 p-0 backdrop-blur-xl sm:max-w-md"
      >
        <SheetHeader className="border-b border-border/50 bg-card/40 px-4 py-3 text-start">
          <div className="flex items-center justify-between gap-3 pe-8">
          <SheetTitle className="flex items-center gap-3">
            <img
              src={avatarUrl}
              alt="سلمان فارس"
              className="h-9 w-9 rounded-full object-cover ring-1 ring-border/70"
            />
            <span className="flex flex-col leading-tight">
              <span className="text-base font-extrabold">المساعد الرقمي</span>
              <span className="text-[11px] font-normal text-muted-foreground">سلمان فارس</span>
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

        <div className="border-b border-border/50 bg-background/50 px-4 py-3">
          {userId ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <History className="h-3.5 w-3.5 text-primary" />
                  سجل المحادثات
                </div>
                <button
                  type="button"
                  onClick={startNewConversation}
                  className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary hover:bg-primary/20"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  جديد
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {historyLoading ? (
                  <span className="text-xs text-muted-foreground">يتم التحميل...</span>
                ) : visibleSessions.length === 0 ? (
                  <span className="text-xs text-muted-foreground">ستظهر محادثاتك المحفوظة هنا.</span>
                ) : (
                  visibleSessions.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => openSession(session)}
                      className={`max-w-40 shrink-0 truncate rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                        session.id === activeSessionId
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/70 bg-card/40 text-foreground hover:bg-muted/60"
                      }`}
                    >
                      {session.title}
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2">
              <p className="text-xs leading-relaxed text-foreground">
                سجّل الدخول لحفظ محادثاتك مع مساعد سلمان فارس والعودة إليها لاحقاً.
              </p>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
              >
                <LogIn className="h-3.5 w-3.5" />
                دخول
              </Link>
            </div>
          )}
        </div>

        <Conversation className="min-h-0">
          <ConversationContent className="gap-4 px-4 py-4">
            {messages.map((m, i) => (
              <Message key={i} from={m.role} className={m.role === "assistant" ? "max-w-full" : "max-w-[86%]"}>
                <div className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {m.role === "assistant" ? (
                    <img
                      src={avatarUrl}
                      alt="سلمان فارس"
                      className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-border/70"
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                      أنت
                    </div>
                  )}
                  <MessageContent
                    className={
                      m.role === "user"
                        ? "rounded-2xl bg-primary px-3.5 py-2 text-sm leading-relaxed text-primary-foreground"
                        : "max-w-[82%] px-0 py-1 text-sm leading-relaxed text-foreground"
                    }
                  >
                    <MessageResponse>{m.content}</MessageResponse>
                  </MessageContent>
                </div>
              </Message>
            ))}
            {loading && (
              <div className="flex gap-2">
                <img
                  src={avatarUrl}
                  alt="سلمان فارس"
                  className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-border/70"
                />
                <div className="px-0 py-2 text-sm text-muted-foreground">
                  <Shimmer>يكتب مساعد سلمان فارس...</Shimmer>
                </div>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput
          onSubmit={async (message) => {
            await handleSend(message.text);
          }}
          className="border-t border-border/50 bg-card/40 p-3"
        >
          <PromptInputTextarea
            placeholder="اكتب رسالتك..."
            disabled={loading}
            className="min-h-14 text-sm text-foreground"
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={chatStatus} disabled={loading} />
          </PromptInputFooter>
        </PromptInput>
      </SheetContent>
    </Sheet>
  );
}