import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import TextType from "@/components/text/TextType";
import { sendChatMessage } from "@/lib/chatbot";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  /** Solo respuestas del asistente exitosas usan efecto de escritura */
  useTyping?: boolean;
}

function AssistantBubble({ content, useTyping, messageKey }: { content: string; useTyping?: boolean; messageKey: string }) {
  const base = "whitespace-pre-wrap wrap-break-word text-[13px] leading-relaxed text-foreground";
  if (!useTyping) {
    return <p className={base}>{content}</p>;
  }
  return (
    <TextType
      key={messageKey}
      as="p"
      className={base}
      text={content}
      loop={false}
      showCursor
      cursorCharacter="|"
      cursorClassName="text-primary"
      typingSpeed={22}
      initialDelay={0}
    />
  );
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending, open, scrollToBottom]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const historyPayload = messages.map(({ role, content }) => ({ role, content }));

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const { reply, history: serverHistory } = await sendChatMessage(trimmed, historyPayload);

      if (serverHistory && serverHistory.length > 0) {
        setMessages(
          serverHistory.map((h, idx) => ({
            id: crypto.randomUUID(),
            role: h.role,
            content: h.content,
            useTyping: idx === serverHistory.length - 1 && h.role === "assistant",
          }))
        );
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: reply,
            useTyping: true,
          },
        ]);
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string"
          ? (err as { message: string }).message
          : "No se pudo obtener respuesta. Intenta de nuevo.";
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: msg,
          useTyping: false,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Chat con el asistente"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="fixed z-90 bottom-24 right-4 sm:right-6 w-[min(100%-2rem,420px)] max-h-[min(72vh,560px)] flex flex-col rounded-[3px] border border-border bg-white text-foreground shadow-lg dark:bg-[#0F172A] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
          >
            <div className="relative overflow-hidden shrink-0 border-b border-border px-4 py-3 flex items-center justify-between gap-2">
              <div className="pointer-events-none absolute inset-0 grain-overlay opacity-[0.04] dark:opacity-[0.06]" />
              <div className="relative z-1 min-w-0">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Asistente</p>
                <p className="font-mono text-sm text-foreground truncate">FACE Skyview</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="relative z-1 inline-flex h-9 w-9 items-center justify-center rounded-[3px] border border-border text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Cerrar chat"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <div
              ref={listRef}
              className="relative flex-1 min-h-[200px] overflow-y-auto hide-scrollbar px-3 py-3 space-y-3"
            >
              {messages.length === 0 && (
                <p className="font-mono text-[13px] text-muted-foreground px-1">
                  Escribe un mensaje para comenzar. Respuestas con estilo terminal.
                </p>
              )}
              {messages.map((m) => (
                <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[85%] rounded-[3px] border border-border bg-foreground px-3 py-2 text-background dark:border-white/20 dark:bg-white/15 dark:text-foreground"
                        : "max-w-[92%] rounded-[3px] border border-border bg-muted/60 px-3 py-2 dark:bg-white/5"
                    }
                  >
                    {m.role === "user" ? (
                      <p className="font-mono text-[13px] leading-relaxed">{m.content}</p>
                    ) : (
                      <AssistantBubble content={m.content} useTyping={m.useTyping} messageKey={m.id} />
                    )}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-[3px] border border-border bg-muted/50 px-3 py-2 font-mono text-xs text-muted-foreground dark:bg-white/5">
                    <span className="inline-block animate-pulse">_</span> procesando…
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-border p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder="Escribe aquí…"
                  disabled={sending}
                  className="font-mono flex-1 min-w-0 h-11 px-3 rounded-[3px] bg-muted/50 border border-border text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:bg-muted/70 disabled:opacity-50 dark:bg-white/5 dark:focus:bg-white/10"
                />
                <button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={sending || !input.trim()}
                  className="shrink-0 h-11 px-4 rounded-[3px] border border-border bg-foreground font-mono text-sm text-background hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none transition-opacity dark:bg-white dark:text-[#0F172A]"
                >
                  Enviar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clic fuera para cerrar (capa semitransparente detrás del panel, no cubre el FAB) */}
      <AnimatePresence>
        {open && (
          <motion.button
            type="button"
            aria-label="Cerrar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-80 bg-foreground/10 dark:bg-black/40"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB: fondo oscuro en ambos temas para que el logo (blanco) contraste; logo a casi todo el círculo */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed z-100 bottom-6 right-4 sm:right-6 h-16 w-16 overflow-hidden rounded-full border border-border/80 bg-foreground shadow-lg transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-white/15 dark:bg-[#0F172A] dark:hover:opacity-95 dark:hover:bg-[#152238]"
        aria-label={open ? "Cerrar asistente" : "Abrir asistente"}
        aria-expanded={open}
      >
        <img
          src="/logo-face.png"
          alt=""
          className="h-full w-full scale-[1.2] object-contain object-center select-none pointer-events-none"
        />
      </button>
    </>
  );
}
