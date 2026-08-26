"use client";

import { useState, useRef, useEffect } from "react";
import { useFlux, formatINR } from "@/store/flux-store";
import { Icon } from "./icon";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTIONS = [
  "How's my runway looking?",
  "Should I take a break next week?",
  "What's my forecast for next month?",
  "How does the vault work?",
];

export function ChatFab() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messages = useFlux((s) => s.chatMessages);
  const addMsg = useFlux((s) => s.addChatMsg);
  const setMessages = useFlux((s) => s.setChatMessages);
  const setView = useFlux((s) => s.setView);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

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
    } catch (e) {
      addMsg({ role: "assistant", content: "I'm having trouble connecting right now. Please try again." });
    } finally {
      setSending(false);
    }
  };

  const clearChat = async () => {
    try {
      await fetch("/api/chat", { method: "DELETE" });
      setMessages([]);
    } catch {}
  };

  return (
    <>
      <button
        className="chat-fab"
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
              <button className="btn btn-ghost btn-sm" onClick={clearChat} title="Clear chat" type="button">
                <Icon name="refresh" size={13} />
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)} title="Open full view" type="button"
                onClickCapture={() => { setView("chat"); setOpen(false); }}
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
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    style={{
                      maxWidth: "85%", padding: "8px 12px", borderRadius: 12,
                      fontSize: 12.5, lineHeight: 1.5,
                      background: m.role === "user" ? "var(--acc)" : "var(--surf2)",
                      color: m.role === "user" ? "#fff" : "var(--t1)",
                      border: m.role === "user" ? "none" : "1px solid var(--bdr)",
                      borderBottomRightRadius: m.role === "user" ? 3 : 12,
                      borderBottomLeftRadius: m.role === "user" ? 12 : 3,
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div style={{ padding: "8px 12px", borderRadius: 12, background: "var(--surf2)", border: "1px solid var(--bdr)", fontSize: 12.5, color: "var(--t3)" }}>
                    <span className="dot dot-live" style={{ marginRight: 4 }} /> Flux is thinking…
                  </div>
                </div>
              )}
            </div>

            {/* suggestions */}
            {messages.length === 0 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="badge bl" style={{ cursor: "pointer", padding: "5px 10px" }} onClick={() => send(s)} type="button">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* input */}
            <div className="p-3 flex gap-2" style={{ borderTop: "1px solid var(--bdr)", background: "var(--surf2)" }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
                placeholder="Ask about your finances…"
                className="flex-1"
                style={{
                  background: "var(--surf)", border: "1px solid var(--bdr)",
                  borderRadius: 10, padding: "8px 12px", fontSize: 12.5, color: "var(--t1)",
                  outline: "none",
                }}
              />
              <button
                className="btn btn-primary"
                style={{ width: 36, height: 36, padding: 0 }}
                onClick={() => send(input)}
                disabled={!input.trim() || sending}
                type="button"
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
