import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Loader2 } from "lucide-react";
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

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "أهلاً بك في موقع سلمان فارس. أنا المساعد الرقمي الرسمي هنا لخدمتك. كيف يمكنني مساعدتك اليوم؟ يمكنني إرشادك إلى أقسام التطبيقات، الألعاب، المواقع، وأدوات الذكاء الاصطناعي.",
};

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const send = useServerFn(chatWithAssistant);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const history = next.filter((m) => m !== GREETING).slice(-20);
      const res = await send({ data: { messages: history } });
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch (err: any) {
      const msg = String(err?.message ?? "");
      if (msg.includes("rate_limit")) toast.error("الخدمة مشغولة الآن، حاول بعد قليل");
      else if (msg.includes("credits")) toast.error("انتهى رصيد المساعد الذكي");
      else toast.error("تعذّر الاتصال بالمساعد");
      setMessages((prev) => prev.slice(0, -1));
      setInput(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="المساعد الذكي"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary transition-colors hover:bg-primary/20"
      >
        <MessageCircle className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 bg-background/95 p-0 backdrop-blur-xl sm:max-w-md"
      >
        <SheetHeader className="border-b border-border/50 bg-card/40 px-4 py-3 text-start">
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
        </SheetHeader>

        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {m.role === "assistant" ? (
                <img
                  src={avatarUrl}
                  alt="سلمان فارس"
                  className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-border/70"
                />
              ) : (
                <div className="h-8 w-8 shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  أنت
                </div>
              )}
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card/60 text-foreground border border-border/60"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <img
                src={avatarUrl}
                alt="سلمان فارس"
                className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-border/70"
              />
              <div className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-card/60 px-3.5 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                يكتب...
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="border-t border-border/50 bg-card/40 p-3"
        >
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder="اكتب رسالتك..."
              className="flex-1 resize-none rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 max-h-32"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="إرسال"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}