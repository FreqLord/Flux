"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useFlux, type ViewKey } from "@/store/flux-store";
import { useFluxTheme } from "./theme-provider";
import { Icon } from "./icon";
import { motion, AnimatePresence } from "framer-motion";

interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: string;
  group: "Navigation" | "Actions" | "Theme" | "Forecast";
  action: () => void;
  keywords?: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const lastQueryRef = useRef("");

  const setView = useFlux((s) => s.setView);
  const { theme, setTheme } = useFluxTheme();

  // Listen for Cmd+K / Ctrl+K and a custom "flux:open-command-palette" event
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    function onCustomOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("flux:open-command-palette", onCustomOpen as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("flux:open-command-palette", onCustomOpen as EventListener);
    };
  }, [open]);

  // Focus input when opened + reset query/activeIdx (deferred to avoid setState in effect)
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => {
        inputRef.current?.focus();
        setQuery("");
        lastQueryRef.current = "";
        setActiveIdx(0);
      }, 50);
      return () => clearTimeout(id);
    }
  }, [open]);

  const commands = useMemo<Command[]>(() => {
    const nav: Command[] = [
      { id: "nav-dash", label: "Go to Dashboard", icon: "dashboard", group: "Navigation", action: () => setView("dashboard"), keywords: "home overview" },
      { id: "nav-spend", label: "Go to Spending", icon: "gauge", group: "Navigation", action: () => setView("spending"), keywords: "expenses budget categories" },
      { id: "nav-forecast", label: "Go to Income Forecast", icon: "forecast", group: "Navigation", action: () => setView("forecast"), keywords: "predict ml hybrid" },
      { id: "nav-break", label: "Go to Break Planner", icon: "calendar", group: "Navigation", action: () => setView("break"), keywords: "rest vacation time off" },
      { id: "nav-sim", label: "Go to What-If Simulator", icon: "cpu", group: "Navigation", action: () => setView("simulator"), keywords: "scenario projection" },
      { id: "nav-vault", label: "Go to Safety Vault", icon: "vault", group: "Navigation", action: () => setView("vault"), keywords: "savings buffer emergency" },
      { id: "nav-profile", label: "Go to Profile & Settings", icon: "profile", group: "Navigation", action: () => setView("profile"), keywords: "account goals" },
      { id: "nav-chat", label: "Go to AI CFO Chat", icon: "chat", group: "Navigation", action: () => setView("chat"), keywords: "ask assistant" },
    ];
    const actions: Command[] = [
      { id: "act-export", label: "Export all data (CSV)", icon: "download", group: "Actions", action: () => { window.location.href = "/api/export"; }, keywords: "download backup" },
      { id: "act-reset", label: "Reset app stats", icon: "refresh", group: "Actions", action: () => { if (confirm("Reset all Flux data to demo defaults?")) { fetch("/api/reset", { method: "POST" }).then(() => window.location.reload()); } }, keywords: "clear wipe" },
      { id: "act-shortcuts", label: "Show keyboard shortcuts", icon: "info", group: "Actions", action: () => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "h" })); }, keywords: "help keys" },
    ];
    const themeCmds: Command[] = [
      { id: "theme-dark", label: "Switch to Dark theme", icon: "moon", group: "Theme", action: () => setTheme("dark"), keywords: "graphite" },
      { id: "theme-light", label: "Switch to Light theme", icon: "sun", group: "Theme", action: () => setTheme("light"), keywords: "airy" },
      { id: "theme-paper", label: "Switch to Paper theme", icon: "paper", group: "Theme", action: () => setTheme("paper"), keywords: "ledger warm" },
      { id: "theme-cycle", label: "Cycle theme", icon: "sparkles", group: "Theme", action: () => document.dispatchEvent(new CustomEvent("flux:cycle-theme")), keywords: "toggle" },
    ];
    return [...nav, ...actions, ...themeCmds];
  }, [setView, setTheme]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter((c) =>
      c.label.toLowerCase().includes(q) ||
      c.group.toLowerCase().includes(q) ||
      (c.keywords ?? "").toLowerCase().includes(q)
    );
  }, [commands, query]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[activeIdx];
      if (cmd) {
        cmd.action();
        setOpen(false);
      }
    }
  }

  function onQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    // Reset active index when the query changes (derived, not in an effect)
    if (lastQueryRef.current !== e.target.value) {
      lastQueryRef.current = e.target.value;
      setActiveIdx(0);
    }
  }

  // Scroll active item into view (no setState — allowed)
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const groups = Array.from(new Set(filtered.map((c) => c.group)));

  return (
    <>
      {/* Trigger hint in topbar is handled by the keyboard hook; this is the palette itself */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={() => setOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 200,
              background: "rgba(0,0,0,.55)", backdropFilter: "blur(6px)",
              display: "flex", alignItems: "flex-start", justifyContent: "center",
              paddingTop: "12vh", padding: "12vh 20px 20px",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: 560,
                background: "var(--surf)", border: "1px solid var(--bdr2)",
                borderRadius: 14, boxShadow: "var(--s4)", overflow: "hidden",
              }}
            >
              {/* Search input */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--bdr)" }}>
                <Icon name="search" size={16} className="flux-t3" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={onQueryChange}
                  onKeyDown={onKeyDown}
                  placeholder="Search commands, views, actions…"
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    fontSize: 14, color: "var(--t1)", fontFamily: "var(--font-inter)",
                  }}
                />
                <kbd style={{ background: "var(--bg2)", border: "1px solid var(--bdr)", borderRadius: 5, padding: "2px 7px", fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--t3)" }}>ESC</kbd>
              </div>

              {/* Command list */}
              <div ref={listRef} className="flux-scroll" style={{ maxHeight: "min(50vh, 400px)", overflowY: "auto", padding: "6px" }}>
                {filtered.length === 0 && (
                  <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--t3)", fontSize: 13 }}>
                    No commands match "{query}"
                  </div>
                )}
                {groups.map((g) => (
                  <div key={g} style={{ marginBottom: 4 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--t4)", padding: "8px 12px 4px" }}>{g}</div>
                    {filtered.filter((c) => c.group === g).map((cmd) => {
                      const idx = filtered.indexOf(cmd);
                      const isActive = idx === activeIdx;
                      return (
                        <button
                          key={cmd.id}
                          data-idx={idx}
                          onClick={() => { cmd.action(); setOpen(false); }}
                          onMouseEnter={() => setActiveIdx(idx)}
                          style={{
                            display: "flex", alignItems: "center", gap: 11,
                            width: "100%", padding: "9px 12px",
                            borderRadius: 9, cursor: "pointer",
                            background: isActive ? "var(--accd)" : "transparent",
                            border: "none", textAlign: "left",
                            transition: "background .1s",
                          }}
                        >
                          <div style={{
                            width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: isActive ? "var(--acc)" : "var(--bg2)",
                            color: isActive ? "#fff" : "var(--t2)",
                            transition: "background .1s, color .1s",
                          }}>
                            <Icon name={cmd.icon} size={13} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? "var(--t1)" : "var(--t1)" }}>{cmd.label}</div>
                            {cmd.hint && <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 1 }}>{cmd.hint}</div>}
                          </div>
                          {isActive && (
                            <kbd style={{ background: "var(--bg2)", border: "1px solid var(--bdr)", borderRadius: 4, padding: "1px 5px", fontSize: 9, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--t3)" }}>↵</kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", borderTop: "1px solid var(--bdr)", background: "var(--surf2)", fontSize: 10.5, color: "var(--t3)" }}>
                <div style={{ display: "flex", gap: 14 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <kbd style={{ background: "var(--bg3)", borderRadius: 3, padding: "1px 5px", fontSize: 9, fontFamily: "var(--font-mono)" }}>↑↓</kbd> navigate
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <kbd style={{ background: "var(--bg3)", borderRadius: 3, padding: "1px 5px", fontSize: 9, fontFamily: "var(--font-mono)" }}>↵</kbd> select
                  </span>
                </div>
                <span>{filtered.length} commands</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
