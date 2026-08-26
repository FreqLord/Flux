"use client";

import { useEffect } from "react";
import { useFlux, type ViewKey } from "@/store/flux-store";

/**
 * Global keyboard shortcuts for Flux.
 *   g d → Dashboard
 *   g s → Spending
 *   g f → Income Forecast
 *   g b → Break Planner
 *   g w → What-If simulator
 *   g v → Safety Vault
 *   g p → Profile
 *   g c → AI CFO Chat
 *   ?   → cycle theme (dark→light→paper)
 *   /   → focus AI chat input (jump to chat)
 *   Esc → close any overlay (delegates to document)
 *
 * Only triggers when not typing in an input/textarea/contenteditable.
 */
const GOTO: Record<string, ViewKey> = {
  d: "dashboard",
  s: "spending",
  f: "forecast",
  b: "break",
  w: "simulator",
  v: "vault",
  p: "profile",
  c: "chat",
};

export function useKeyboardShortcuts() {
  const setView = useFlux((s) => s.setView);

  useEffect(() => {
    let prefix = false;
    let prefixTimer: ReturnType<typeof setTimeout> | null = null;

    function isTyping() {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (isTyping()) return;
      // ignore modifier combos (except plain keys)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // "g" prefix
      if (e.key === "g" && !prefix) {
        prefix = true;
        if (prefixTimer) clearTimeout(prefixTimer);
        prefixTimer = setTimeout(() => { prefix = false; }, 1200);
        e.preventDefault();
        return;
      }
      if (prefix) {
        const view = GOTO[e.key.toLowerCase()];
        if (view) {
          setView(view);
          e.preventDefault();
        }
        prefix = false;
        if (prefixTimer) clearTimeout(prefixTimer);
        return;
      }

      // "?" → cycle theme
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        // theme cycling handled by reading current + toggling via custom event
        document.dispatchEvent(new CustomEvent("flux:cycle-theme"));
        e.preventDefault();
        return;
      }
      // "/" → jump to chat
      if (e.key === "/") {
        setView("chat");
        e.preventDefault();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setView]);
}
