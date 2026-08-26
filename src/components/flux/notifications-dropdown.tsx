"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "./icon";
import { useFlux } from "@/store/flux-store";

interface FluxNotification {
  id: string;
  type: "forecast" | "vault" | "spending" | "peak" | "break";
  title: string;
  body: string;
  timestamp: string; // ISO
  read: boolean;
  tone: "acc" | "grn" | "amb" | "teal" | "red";
}

/** Map notification type → icon name in the design-system icon map. */
const TYPE_ICON: Record<FluxNotification["type"], string> = {
  forecast: "forecast",
  vault: "vault",
  spending: "warn",
  peak: "peak",
  break: "calendar",
};

/** Map tone → soft background (matching the `.badge.*` / `.ins-*` palette). */
const TONE_BG: Record<FluxNotification["tone"], string> = {
  acc: "var(--accd)",
  grn: "var(--grnd)",
  amb: "var(--ambd)",
  teal: "var(--teald)",
  red: "var(--redd)",
};

/** Map tone → foreground color. */
const TONE_FG: Record<FluxNotification["tone"], string> = {
  acc: "var(--acc)",
  grn: "var(--grn)",
  amb: "var(--amb)",
  teal: "var(--teal)",
  red: "var(--red)",
};

/** Format a timestamp as "just now" / "2m ago" / "1h ago" / "3d ago". */
function timeAgo(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  if (isNaN(t)) return "";
  const diff = Math.max(0, now - t);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  return `${wk}w ago`;
}

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<FluxNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);
  const setView = useFlux((s) => s.setView);

  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = (await res.json()) as FluxNotification[];
        if (Array.isArray(data)) setItems(data);
      }
    } catch {
      // silently ignore — dropdown just shows empty state
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount so the unread dot reflects reality before the user opens it.
  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  // Refresh whenever the dropdown is opened.
  useEffect(() => {
    if (open) fetchNotifs();
  }, [open, fetchNotifs]);

  // Click-away + Escape-to-close listeners (active only while open).
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unreadCount = items.filter((n) => !readIds.has(n.id)).length;

  function markAllRead() {
    setReadIds(new Set(items.map((n) => n.id)));
  }

  function viewAllInDashboard() {
    setOpen(false);
    setView("dashboard");
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className="theme-btn"
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
        onClick={() => setOpen((v) => !v)}
        title="Notifications"
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Icon name="bell" size={14} />
        {unreadCount > 0 && (
          <span
            className="notif-unread-dot"
            aria-label={`${unreadCount} unread`}
          />
        )}
      </button>

      {open && (
        <div
          className="flux-scroll"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            width: 340,
            maxHeight: 420,
            overflowY: "auto",
            background: "var(--surf)",
            border: "1px solid var(--bdr2)",
            borderRadius: 12,
            boxShadow: "var(--s3)",
            zIndex: 50,
            animation: "notifDropIn .15s ease-out",
          }}
          role="dialog"
          aria-label="Notifications"
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              borderBottom: "1px solid var(--bdr)",
              position: "sticky",
              top: 0,
              background: "var(--surf)",
              zIndex: 1,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>
              Notifications
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={markAllRead}
              type="button"
              style={{ fontSize: 11, padding: "3px 8px" }}
              disabled={items.length === 0 || unreadCount === 0}
            >
              Mark all read
            </button>
          </div>

          {/* Body */}
          <div>
            {loading && items.length === 0 ? (
              <div
                style={{
                  padding: "22px 14px",
                  textAlign: "center",
                  fontSize: 11.5,
                  color: "var(--t3)",
                }}
              >
                Loading…
              </div>
            ) : items.length === 0 ? (
              <div
                style={{
                  padding: "26px 14px",
                  textAlign: "center",
                  fontSize: 11.5,
                  color: "var(--t3)",
                }}
              >
                You&apos;re all caught up
              </div>
            ) : (
              items.map((n) => {
                const isUnread = !readIds.has(n.id);
                const iconName = TYPE_ICON[n.type] ?? "info";
                const bg = TONE_BG[n.tone] ?? "var(--bg3)";
                const fg = TONE_FG[n.tone] ?? "var(--t3)";
                return (
                  <div
                    key={n.id}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "10px 14px",
                      borderBottom: "1px solid var(--bdr)",
                      borderLeft: isUnread
                        ? "2px solid var(--acc)"
                        : "2px solid transparent",
                      background: isUnread ? "var(--accd)" : "transparent",
                      transition: "background .12s ease",
                    }}
                  >
                    <div
                      className="li-icon"
                      style={{
                        width: 28,
                        height: 28,
                        background: bg,
                        color: fg,
                        flexShrink: 0,
                      }}
                    >
                      <Icon name={iconName} size={13} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: "var(--t1)",
                          lineHeight: 1.3,
                        }}
                      >
                        {n.title}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--t3)",
                          marginTop: 2,
                          lineHeight: 1.4,
                        }}
                      >
                        {n.body}
                      </div>
                      <div
                        className="flux-mono"
                        style={{
                          fontSize: 10,
                          color: "var(--t4)",
                          marginTop: 4,
                        }}
                      >
                        {timeAgo(n.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <button
            className="btn btn-ghost"
            onClick={viewAllInDashboard}
            type="button"
            style={{
              width: "100%",
              borderRadius: 0,
              padding: "10px 14px",
              fontSize: 11.5,
              fontWeight: 600,
              borderTop: "1px solid var(--bdr)",
              justifyContent: "center",
            }}
          >
            View all in dashboard
          </button>
        </div>
      )}
    </div>
  );
}
