"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useFlux, type ChatMsg } from "@/store/flux-store";
import { Icon } from "./icon";
import { Markdown } from "./markdown";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const MAX_CHARS = 500;

const SUGGESTIONS = [
  "How's my runway looking?",
  "Should I take a break next week?",
  "What's my forecast for next month?",
  "How does the vault work?",
];

/* ── HH:MM timestamp formatter ── */
function fmtTime(d?: string | Date): string {
  if (!d) return "";
  try {
    return new Date(d).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "";
  }
}

/* ── 3-dot typing indicator (staggered via inline animation-delay) ── */
function TypingDots() {
  return (
    <span
      style={{ display: "inline-flex", gap: 4, alignItems: "center" }}
      aria-label="Flux is typing"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "var(--t2)",
            display: "inline-block",
            animation: "fluxTyping 1.4s infinite",
            animationDelay: `${i * 160}ms`,
          }}
        />
      ))}
    </span>
  );
}

/* ── Compact message row for the FAB panel ── */
function FabMessageRow({
  m,
  onCopy,
}: {
  m: ChatMsg;
  onCopy: (text: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isUser = m.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={isUser ? "flex justify-end" : "flex justify-start"}
      style={{ gap: 6, alignItems: "flex-start" }}
    >
      {!isUser && (
        <div
          aria-hidden
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            flexShrink: 0,
            background: "var(--accd)",
            color: "var(--acc)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 2,
          }}
        >
          <Icon name="brain" size={11} />
        </div>
      )}
      <div
        style={{
          position: "relative",
          maxWidth: "85%",
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
          gap: 3,
        }}
      >
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 12,
            fontSize: 12.5,
            lineHeight: 1.5,
            wordBreak: "break-word",
            background: isUser ? "var(--acc)" : "var(--surf2)",
            color: isUser ? "#fff" : "var(--t1)",
            border: isUser ? "none" : "1px solid var(--bdr)",
            borderBottomRightRadius: isUser ? 3 : 12,
            borderBottomLeftRadius: isUser ? 12 : 3,
            transition: "background .15s, border-color .15s",
            ...(isUser ? { whiteSpace: "pre-wrap" as const } : {}),
            ...(hovered && !isUser
              ? { background: "var(--surf3)", borderColor: "var(--bdr2)" }
              : {}),
          }}
        >
          {isUser ? m.content : <Markdown content={m.content} />}
        </div>

        {/* copy button — assistant only, on hover */}
        {!isUser && hovered && (
          <button
            type="button"
            onClick={() => onCopy(m.content)}
            title="Copy to clipboard"
            aria-label="Copy message to clipboard"
            style={{
              position: "absolute",
              top: 3,
              right: 3,
              background: "var(--surf)",
              border: "1px solid var(--bdr)",
              borderRadius: 5,
              padding: "2px 4px",
              cursor: "pointer",
              color: "var(--t2)",
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 9.5,
              lineHeight: 1,
              zIndex: 2,
            }}
          >
            <Icon name="copy" size={10} />
          </button>
        )}

        {m.createdAt ? (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <span
              className="flux-mono"
              style={{ fontSize: 9, color: "var(--t3)", padding: "0 3px" }}
            >
              {fmtTime(m.createdAt)}
            </span>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

export function ChatFab() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messages = useFlux((s) => s.chatMessages);
  const addMsg = useFlux((s) => s.addChatMsg);
  const setMessages = useFlux((s) => s.setChatMessages);
  const setView = useFlux((s) => s.setView);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, sending]);

  const handleCopy = useCallback(
    (text: string) => {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        toast({ title: "Couldn't copy", description: "Clipboard unavailable." });
        return;
      }
      navigator.clipboard
        .writeText(text)
        .then(() => toast({ title: "Copied to clipboard" }))
        .catch(() =>
          toast({ title: "Couldn't copy", description: "Please try again." }),
        );
    },
    [toast],
  );

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setInput("");
    addMsg({ role: "user", content: trimmed });
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      if (data.content) {
        addMsg({ role: "assistant", content: data.content });
      } else if (data.error) {
        addMsg({ role: "assistant", content: `Sorry — ${data.error}` });
      }
    } catch {
      addMsg({
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  const clearChat = async () => {
    try {
      await fetch("/api/chat", { method: "DELETE" });
      setMessages([]);
    } catch {
      /* swallow */
    }
  };

  const sendDisabled = !input.trim() || sending;
  const charCount = input.length;
  const nearLimit = charCount > MAX_CHARS * 0.9;

  return (
    <>
      <button
        className={`chat-fab${open ? " is-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        title="Ask Flux AI"
        type="button"
        aria-label="Open AI CFO chat"
      >
        <Icon name={open ? "x" : "bot"} size={22} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            style={{
              position: "fixed", bottom: 88, right: 24,
              width: "min(380px, calc(100vw - 32px))",
              height: "min(560px, calc(100vh - 120px))",
              background: "var(--surf)", border: "1px solid var(--bdr)",
              borderRadius: 18, boxShadow: "var(--s4)", zIndex: 50,
              display: "flex", flexDirection: "column", overflow: "hidden",
            }}
          >
            {/* header */}
            <div className="flex items-center gap-2.5 px-4 py-3" style={{ borderBottom: "1px solid var(--bdr)", background: "var(--surf2)" }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--acc)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="brain" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>Flux AI CFO</div>
                <div className="flex items-center gap-1.5" style={{ fontSize: 10.5, color: "var(--t3)" }}>
                  <span className="dot dot-live" /> Online · knows your numbers
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={clearChat} title="Clear chat" type="button" disabled={sending}>
                <Icon name="refresh" size={13} />
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setView("chat"); setOpen(false); }}
                title="Open full view"
                type="button"
              >
                <Icon name="chevron" size={13} />
              </button>
            </div>

            {/* messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto flux-scroll px-4 py-3" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.length === 0 && (
                <div className="ins ins-acc" style={{ marginTop: 4 }}>
                  <div className="ins-h flex items-center gap-1.5"><Icon name="sparkles" size={11} /> Hi, I'm your Flux AI CFO</div>
                  <div className="ins-b">Ask me about your runway, vault, forecast, or spending — I can see your live numbers.</div>
                </div>
              )}
              {messages.map((m, i) => (
                <FabMessageRow key={i} m={m} onCopy={handleCopy} />
              ))}
              {sending && (
                <div className="flex justify-start" style={{ gap: 6, alignItems: "flex-start" }}>
                  <div
                    aria-hidden
                    style={{
                      width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                      background: "var(--accd)", color: "var(--acc)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginTop: 2,
                    }}
                  >
                    <Icon name="brain" size={11} />
                  </div>
                  <div
                    style={{
                      padding: "10px 13px", borderRadius: 12, borderBottomLeftRadius: 3,
                      background: "var(--surf2)", border: "1px solid var(--bdr)",
                      display: "inline-flex", alignItems: "center", gap: 8,
                    }}
                  >
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>

            {/* suggestions */}
            {messages.length === 0 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="badge bl" style={{ cursor: "pointer", padding: "5px 10px" }} onClick={() => send(s)} type="button" disabled={sending}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* input */}
            <div className="p-3 flex gap-2 items-center" style={{ borderTop: "1px solid var(--bdr)", background: "var(--surf2)" }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
                placeholder="Ask about your finances…"
                className="flex-1"
                maxLength={MAX_CHARS}
                style={{
                  background: "var(--surf)", border: "1px solid var(--bdr)",
                  borderRadius: 10, padding: "8px 12px", fontSize: 12.5, color: "var(--t1)",
                  outline: "none",
                }}
              />
              <span
                className="flux-mono"
                style={{
                  fontSize: 9.5, color: nearLimit ? "var(--amb)" : "var(--t3)",
                  minWidth: 36, textAlign: "right", userSelect: "none",
                }}
              >
                {charCount > 0 ? `${charCount}/${MAX_CHARS}` : ""}
              </span>
              <button
                className="btn btn-primary"
                style={{
                  width: 36, height: 36, padding: 0,
                  opacity: sendDisabled ? 0.5 : 1, transition: "opacity .15s",
                }}
                onClick={() => send(input)}
                disabled={sendDisabled}
                type="button"
                aria-label="Send message"
              >
                <Icon name="send" size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
