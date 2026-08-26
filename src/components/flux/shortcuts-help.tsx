"use client";

import { useState, useEffect } from "react";
import { Icon } from "./icon";

const SHORTCUTS: { keys: string; label: string; group: string }[] = [
  { keys: "g d", label: "Dashboard", group: "Navigation" },
  { keys: "g s", label: "Spending", group: "Navigation" },
  { keys: "g f", label: "Income Forecast", group: "Navigation" },
  { keys: "g b", label: "Break Planner", group: "Navigation" },
  { keys: "g w", label: "What-If Simulator", group: "Navigation" },
  { keys: "g v", label: "Safety Vault", group: "Navigation" },
  { keys: "g p", label: "Profile & Settings", group: "Navigation" },
  { keys: "g c", label: "AI CFO Chat", group: "Navigation" },
  { keys: "?", label: "Cycle theme (dark → light → paper)", group: "Actions" },
  { keys: "/", label: "Jump to AI chat", group: "Actions" },
  { keys: "Esc", label: "Close this dialog", group: "Actions" },
];

export function ShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      // Shift+? opens it too
      if (e.key === "h" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const el = document.activeElement as HTMLElement | null;
        const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
        if (!typing) setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) {
    return (
      <button
        className="theme-btn"
        style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
        onClick={() => setOpen(true)}
        title="Keyboard shortcuts (h)"
        type="button"
        aria-label="Keyboard shortcuts"
      >
        <Icon name="info" size={14} />
      </button>
    );
  }

  const groups = Array.from(new Set(SHORTCUTS.map((s) => s.group)));

  return (
    <>
      <button
        className="theme-btn"
        style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--acc)", color: "#fff", borderColor: "var(--acc)" }}
        onClick={() => setOpen(false)}
        title="Close shortcuts (Esc)"
        type="button"
      >
        <Icon name="info" size={14} />
      </button>
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.55)",
          backdropFilter: "blur(4px)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "var(--surf)", border: "1px solid var(--bdr2)",
            borderRadius: 18, boxShadow: "var(--s4)",
            maxWidth: 480, width: "100%", maxHeight: "85vh", overflowY: "auto",
            padding: 22,
          }}
          className="flux-scroll"
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div className="card-t" style={{ fontSize: 16 }}>Keyboard shortcuts</div>
              <div className="card-s" style={{ marginTop: 3 }}>Press a key combo to navigate faster</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)} type="button">
              <Icon name="x" size={14} />
            </button>
          </div>

          {groups.map((g) => (
            <div key={g} style={{ marginBottom: 14 }}>
              <div className="label-sm" style={{ marginBottom: 8 }}>{g}</div>
              {SHORTCUTS.filter((s) => s.group === g).map((s) => (
                <div key={s.keys} className="sr" style={{ padding: "8px 0" }}>
                  <span style={{ fontSize: 12.5, color: "var(--t2)" }}>{s.label}</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {s.keys.split(" ").map((k, i) => (
                      <kbd key={i} style={{
                        background: "var(--bg2)", border: "1px solid var(--bdr2)",
                        borderRadius: 5, padding: "2px 7px", fontSize: 10.5, fontWeight: 700,
                        fontFamily: "var(--font-mono)", color: "var(--t1)", boxShadow: "0 1px 0 var(--bdr)",
                      }}>
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div className="ins ins-acc" style={{ marginTop: 8 }}>
            <div className="ins-h" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="sparkles" size={11} /> Pro tip
            </div>
            <div className="ins-b">Press <kbd style={{ background: "var(--bg3)", borderRadius: 4, padding: "1px 5px", fontFamily: "var(--font-mono)", fontSize: 10 }}>g</kbd> then a letter — no need to hold them down.</div>
          </div>
        </div>
      </div>
    </>
  );
}
