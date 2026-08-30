"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  useFlux,
  formatINR,
  runwayMonths,
  type ChatMsg,
} from "@/store/flux-store";
import { Icon } from "@/components/flux/icon";
import { Markdown } from "@/components/flux/markdown";
import { useToast } from "@/hooks/use-toast";

const MAX_CHARS = 500;

/* ── Suggestion prompts (shown only while the conversation is short) ── */
const SUGGESTIONS = [
  "How's my runway?",
  "Should I take a break?",
  "What's my 30-day forecast?",
  "How does the vault work?",
  "Where can I cut spending?",
];

/* ── Sidebar capability list ── */
const CAPABILITIES = [
  { icon: "peak", label: "Interpret your forecast & confidence bands" },
  { icon: "calendar", label: "Plan a break safely" },
  { icon: "piggy", label: "Optimize vault auto-save rules" },
  { icon: "target", label: "Find your next peak earning day" },
  { icon: "pulse", label: "Diagnose spending pressure" },
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
            width: 6,
            height: 6,
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

/* ── Single message row: avatar + bubble + (assistant) copy button ── */
function MessageRow({
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        flexDirection: isUser ? "row-reverse" : "row",
      }}
    >
      {/* avatar */}
      <div
        aria-hidden
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          flexShrink: 0,
          background: "var(--accd)",
          color: isUser ? "var(--t2)" : "var(--acc)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 2,
        }}
      >
        <Icon name={isUser ? "user" : "brain"} size={13} />
      </div>

      {/* bubble + meta */}
      <div
        style={{
          position: "relative",
          maxWidth: "80%",
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
          gap: 3,
        }}
      >
        <div
          style={{
            padding: "9px 13px",
            borderRadius: 12,
            fontSize: 13,
            lineHeight: 1.55,
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
              top: 4,
              right: 4,
              background: "var(--surf)",
              border: "1px solid var(--bdr)",
              borderRadius: 6,
              padding: "3px 5px",
              cursor: "pointer",
              color: "var(--t2)",
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 10,
              lineHeight: 1,
              zIndex: 2,
            }}
          >
            <Icon name="copy" size={11} />
          </button>
        )}

        {m.createdAt ? (
          <div
            className="flux-mono"
            style={{ fontSize: 9.5, color: "var(--t3)", padding: "0 4px" }}
          >
            {fmtTime(m.createdAt)}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

export function ChatView() {
  const messages = useFlux((s) => s.chatMessages);
  const addChatMsg = useFlux((s) => s.addChatMsg);
  const setChatMessages = useFlux((s) => s.setChatMessages);
  const snapshot = useFlux((s) => s.snapshot);
  const lastForecast = useFlux((s) => s.lastForecast);
  const setView = useFlux((s) => s.setView);
  const { toast } = useToast();

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  /* ── On mount: if history is empty, fetch GET /api/chat (store.load also does this — double-check) ── */
  useEffect(() => {
    if (messages.length === 0) {
      fetch("/api/chat")
        .then((r) => (r.ok ? r.json() : []))
        .then((data: ChatMsg[] | []) => {
          if (Array.isArray(data) && data.length > 0) {
            setChatMessages(data);
          }
        })
        .catch(() => {
          /* swallow — store.load will retry on next app boot */
        });
    }
  }, []);

  /* ── Auto-scroll to the latest message ── */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  /* ── Copy assistant message to clipboard ── */
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
    addChatMsg({
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    });
    setSending(true);
    setStreamingText("");

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;
          try {
            const data = JSON.parse(jsonStr);
            if (data.token) {
              fullContent += data.token;
              setStreamingText(fullContent);
            }
            if (data.done) {
              fullContent = data.content || fullContent;
              setStreamingText("");
              addChatMsg({
                role: "assistant",
                content: fullContent,
                createdAt: data.createdAt ?? new Date().toISOString(),
              });
            }
            if (data.error) {
              setStreamingText("");
              addChatMsg({
                role: "assistant",
                content: `Sorry — ${data.error}. Please try again in a moment.`,
              });
            }
          } catch {
            /* skip malformed */
          }
        }
      }
    } catch {
      setStreamingText("");
      addChatMsg({
        role: "assistant",
        content:
          "I'm having trouble connecting right now. Please try again in a moment.",
      });
    } finally {
      setSending(false);
    }
  };

  const clearChat = async () => {
    try {
      const res = await fetch("/api/chat", { method: "DELETE" });
      if (res.ok) {
        setChatMessages([]);
        toast({ title: "Chat cleared" });
      }
    } catch {
      toast({
        title: "Couldn't clear chat",
        description: "Please try again in a moment.",
      });
    }
  };

  /* ── Derived live numbers from the snapshot ── */
  const income = snapshot?.income ?? 0;
  const spending = snapshot?.spending ?? 0;
  const vault = snapshot?.vaultBalance ?? 0;
  const runway = income > 0 ? runwayMonths(income, spending, vault) : 0;
  const spendRatio = income > 0 ? spending / income : 0;
  const zoneBadge =
    spendRatio < 0.5
      ? { cls: "badge bg", label: "Safe" }
      : spendRatio < 0.7
        ? { cls: "badge ba", label: "Moderate" }
        : { cls: "badge br", label: "Risk" };

  const showSuggestions = true;
  const showWelcome = messages.length === 0 && !sending;
  const sendDisabled = !input.trim() || sending;
  const charCount = input.length;
  const nearLimit = charCount > MAX_CHARS * 0.9;

  return (
    <div className="g32">
      {/* ════════════ LEFT: chat panel ════════════ */}
      <div
        className="card"
        style={{
          padding: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* header */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{
            borderBottom: "1px solid var(--bdr)",
            background: "var(--surf2)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              background: "var(--accd)",
              color: "var(--acc)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="brain" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)" }}>
              Flux AI CFO
            </div>
            <div
              style={{ fontSize: 11, color: "var(--t3)", marginTop: 1 }}
            >
              Powered by hybrid forecasting · knows your live numbers
            </div>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={clearChat}
            type="button"
            title="Clear chat history"
            disabled={sending}
          >
            <Icon name="refresh" size={13} /> Clear
          </button>
        </div>

        {/* messages */}
        <div
          ref={scrollRef}
          className="flux-scroll"
          style={{
            maxHeight: "60vh",
            overflowY: "auto",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {showWelcome && (
            <div className="ins ins-acc" style={{ marginBottom: 4 }}>
              <div
                className="ins-h"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <Icon name="sparkles" size={12} /> Hi, I&apos;m your Flux AI CFO
              </div>
              <div className="ins-b">
                Ask me about your runway, vault, forecast, or spending — I can
                see your live numbers.
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <MessageRow key={i} m={m} onCopy={handleCopy} />
          ))}

          {sending && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div
                aria-hidden
                style={{
                  width: 24,
                  height: 24,
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
                <Icon name="brain" size={13} />
              </div>
              <div
                style={{
                  padding: "11px 14px",
                  borderRadius: 12,
                  borderBottomLeftRadius: 3,
                  background: "var(--surf2)",
                  border: "1px solid var(--bdr)",
                  display: "inline-flex",
                  alignItems: streamingText ? "flex-start" : "center",
                  gap: 8,
                  maxWidth: "85%",
                }}
              >
                {streamingText ? (
                  <div className="flux-markdown" style={{ color: "var(--t1)" }}>
                    <Markdown content={streamingText} />
                    <span style={{ display: "inline-block", width: 6, height: 13, background: "var(--acc)", borderRadius: 1, marginLeft: 2, verticalAlign: "text-bottom", animation: "fluxTyping 1s infinite" }} />
                  </div>
                ) : (
                  <TypingDots />
                )}
              </div>
            </div>
          )}
        </div>

        {/* suggestions */}
        {showSuggestions && (
          <div
            className="flex flex-wrap gap-1.5 px-5 py-3"
            style={{
              borderTop: "1px solid var(--bdr)",
              background: "var(--surf2)",
            }}
          >
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="badge bl"
                type="button"
                style={{ cursor: "pointer", padding: "5px 11px", fontSize: 11 }}
                onClick={() => send(s)}
                disabled={sending}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* input */}
        <div
          className="flex gap-2 items-center px-5 py-4"
          style={{
            borderTop: "1px solid var(--bdr)",
            background: "var(--surf2)",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about your finances…"
            className="flex-1"
            maxLength={MAX_CHARS}
            style={{
              background: "var(--surf)",
              border: "1px solid var(--bdr)",
              borderRadius: 10,
              padding: "9px 13px",
              fontSize: 13,
              color: "var(--t1)",
              outline: "none",
            }}
          />
          <span
            className="flux-mono"
            style={{
              fontSize: 10,
              color: nearLimit ? "var(--amb)" : "var(--t3)",
              minWidth: 42,
              textAlign: "right",
              userSelect: "none",
            }}
          >
            {charCount > 0 ? `${charCount}/${MAX_CHARS}` : ""}
          </span>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => send(input)}
            disabled={sendDisabled}
            style={{
              width: 38,
              height: 38,
              padding: 0,
              opacity: sendDisabled ? 0.5 : 1,
              transition: "opacity .15s",
            }}
            aria-label="Send message"
          >
            <Icon name="send" size={15} />
          </button>
        </div>
      </div>

      {/* ════════════ RIGHT: context sidebar ════════════ */}
      <div className="stack">
        {/* ── Live numbers ── */}
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-t">Your live numbers</div>
              <div className="card-s">Pulled from this month&apos;s snapshot</div>
            </div>
            <span className="dot dot-live" style={{ marginTop: 6 }} />
          </div>
          <div>
            <div className="sr">
              <div className="sr-info">
                <div className="sr-icon">
                  <Icon name="peak" size={14} />
                </div>
                <div>
                  <div className="sr-name">Monthly income</div>
                  <div className="sr-desc">Avg inflow this month</div>
                </div>
              </div>
              <div
                className="flux-mono"
                style={{ fontSize: 13, fontWeight: 600, color: "var(--acc)" }}
              >
                {formatINR(income)}
              </div>
            </div>
            <div className="sr">
              <div className="sr-info">
                <div className="sr-icon">
                  <Icon name="down" size={14} />
                </div>
                <div>
                  <div className="sr-name">Monthly spending</div>
                  <div className="sr-desc">Logged expenses</div>
                </div>
              </div>
              <div
                className="flux-mono"
                style={{ fontSize: 13, fontWeight: 600, color: "var(--red)" }}
              >
                {formatINR(spending)}
              </div>
            </div>
            <div className="sr">
              <div className="sr-info">
                <div
                  className="sr-icon"
                  style={{ background: "var(--teald)", color: "var(--teal)" }}
                >
                  <Icon name="piggy" size={14} />
                </div>
                <div>
                  <div className="sr-name">Vault balance</div>
                  <div className="sr-desc">Auto-saved buffer</div>
                </div>
              </div>
              <div
                className="flux-mono"
                style={{ fontSize: 13, fontWeight: 600, color: "var(--teal)" }}
              >
                {formatINR(vault)}
              </div>
            </div>
            <div className="sr">
              <div className="sr-info">
                <div
                  className="sr-icon"
                  style={{ background: "var(--accd)", color: "var(--acc)" }}
                >
                  <Icon name="gauge" size={14} />
                </div>
                <div>
                  <div className="sr-name">Runway</div>
                  <div className="sr-desc">If income stopped today</div>
                </div>
              </div>
              <div
                className="flux-mono"
                style={{ fontSize: 13, fontWeight: 600, color: "var(--acc)" }}
              >
                {runway.toFixed(1)} mo
              </div>
            </div>
            <div className="sr">
              <div className="sr-info">
                <div className="sr-icon">
                  <Icon name="pulse" size={14} />
                </div>
                <div>
                  <div className="sr-name">Spending zone</div>
                  <div className="sr-desc">{Math.round(spendRatio * 100)}% of income</div>
                </div>
              </div>
              <span className={zoneBadge.cls}>{zoneBadge.label}</span>
            </div>
          </div>
        </div>

        {/* ── Forecast snapshot ── */}
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-t">Forecast snapshot</div>
              <div className="card-s">Latest hybrid run</div>
            </div>
            <Icon name="forecast" size={16} className="flux-t3" />
          </div>
          {lastForecast ? (
            <div>
              <div className="sr">
                <div className="sr-info">
                  <div className="sr-icon">
                    <Icon name="peak" size={14} />
                  </div>
                  <div>
                    <div className="sr-name">Projected income</div>
                    <div className="sr-desc">Next {lastForecast.horizon} days</div>
                  </div>
                </div>
                <div
                  className="flux-mono"
                  style={{ fontSize: 13, fontWeight: 600, color: "var(--acc)" }}
                >
                  {formatINR(lastForecast.projectedIncome, { compact: true })}
                </div>
              </div>
              <div className="sr">
                <div className="sr-info">
                  <div className="sr-icon">
                    <Icon name="down" size={14} />
                  </div>
                  <div>
                    <div className="sr-name">Essential costs</div>
                    <div className="sr-desc">Non-discretionary</div>
                  </div>
                </div>
                <div
                  className="flux-mono"
                  style={{ fontSize: 13, fontWeight: 600, color: "var(--red)" }}
                >
                  {formatINR(lastForecast.essentialCosts, { compact: true })}
                </div>
              </div>
              <div className="sr">
                <div className="sr-info">
                  <div
                    className="sr-icon"
                    style={{
                      background:
                        lastForecast.surplusDeficit >= 0
                          ? "var(--grnd)"
                          : "var(--redd)",
                      color:
                        lastForecast.surplusDeficit >= 0
                          ? "var(--grn)"
                          : "var(--red)",
                    }}
                  >
                    <Icon
                      name={lastForecast.surplusDeficit >= 0 ? "up" : "down"}
                      size={14}
                    />
                  </div>
                  <div>
                    <div className="sr-name">
                      {lastForecast.surplusDeficit >= 0 ? "Surplus" : "Deficit"}
                    </div>
                    <div className="sr-desc">Projected net</div>
                  </div>
                </div>
                <div
                  className="flux-mono"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color:
                      lastForecast.surplusDeficit >= 0
                        ? "var(--grn)"
                        : "var(--red)",
                  }}
                >
                  {formatINR(Math.abs(lastForecast.surplusDeficit), {
                    compact: true,
                  })}
                </div>
              </div>
              <div className="sr">
                <div className="sr-info">
                  <div className="sr-icon">
                    <Icon name="gauge" size={14} />
                  </div>
                  <div>
                    <div className="sr-name">Coverage ratio</div>
                    <div className="sr-desc">Income ÷ essential costs</div>
                  </div>
                </div>
                <div
                  className="flux-mono"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color:
                      lastForecast.coverageRatio >= 1
                        ? "var(--grn)"
                        : "var(--red)",
                  }}
                >
                  {lastForecast.coverageRatio.toFixed(2)}×
                </div>
              </div>
              <div className="sr">
                <div className="sr-info">
                  <div className="sr-icon">
                    <Icon name="sparkles" size={14} />
                  </div>
                  <div>
                    <div className="sr-name">Hybrid MAPE</div>
                    <div className="sr-desc">Forecast error</div>
                  </div>
                </div>
                <div
                  className="flux-mono"
                  style={{ fontSize: 13, fontWeight: 600, color: "var(--amb)" }}
                >
                  {lastForecast.hybridMape.toFixed(1)}%
                </div>
              </div>
            </div>
          ) : (
            <div className="ins ins-amb">
              <div className="ins-h">No forecast yet</div>
              <div className="ins-b" style={{ marginBottom: 9 }}>
                Run the hybrid engine to unlock a 30-day projection with
                confidence bands the AI can reason about.
              </div>
              <button
                className="btn btn-secondary btn-sm"
                type="button"
                onClick={() => setView("forecast")}
              >
                <Icon name="forecast" size={13} /> Run a forecast
              </button>
            </div>
          )}
        </div>

        {/* ── What I can help with ── */}
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-t">What I can help with</div>
              <div className="card-s">Try asking me about…</div>
            </div>
            <Icon name="bot" size={16} className="flux-t3" />
          </div>
          <div>
            {CAPABILITIES.map((c, i) => (
              <div key={i} className="li">
                <div
                  className="li-icon"
                  style={{ background: "var(--accd)", color: "var(--acc)" }}
                >
                  <Icon name={c.icon} size={14} />
                </div>
                <div className="li-body">
                  <div className="li-name">{c.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tip ── */}
        <div className="ins ins-grn">
          <div className="ins-h">Tip</div>
          <div className="ins-b">
            Ask me <em>&quot;what should I do this week?&quot;</em> for a concrete
            action plan.
          </div>
        </div>
      </div>
    </div>
  );
}
