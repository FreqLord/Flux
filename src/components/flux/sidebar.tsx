"use client";

import { useFlux, type ViewKey } from "@/store/flux-store";
import { Icon } from "./icon";

const NAV: { section: string; items: { key: ViewKey; icon: string; label: string }[] }[] = [
  {
    section: "Overview",
    items: [{ key: "dashboard", icon: "dashboard", label: "Dashboard" }],
  },
  {
    section: "Predictions",
    items: [
      { key: "spending", icon: "gauge", label: "Spending" },
      { key: "forecast", icon: "forecast", label: "Income Forecast" },
      { key: "break", icon: "calendar", label: "Break Planner" },
      { key: "simulator", icon: "cpu", label: "What-If Simulator" },
    ],
  },
  {
    section: "Savings",
    items: [{ key: "vault", icon: "vault", label: "Safety Vault" }],
  },
  {
    section: "Account",
    items: [
      { key: "profile", icon: "profile", label: "Profile & Settings" },
      { key: "chat", icon: "chat", label: "AI CFO Chat" },
    ],
  },
];

export function Sidebar() {
  const view = useFlux((s) => s.view);
  const setView = useFlux((s) => s.setView);

  return (
    <aside className="sidebar">
      <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: "1px solid var(--bdr)" }}>
        <div
          className="flex items-center justify-center"
          style={{
            width: 32, height: 32, borderRadius: 9,
            background: "var(--acc)", color: "#fff",
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13,
            letterSpacing: "-.02em",
          }}
        >
          fx
        </div>
        <div>
          <div className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "var(--t1)", letterSpacing: "-.02em", lineHeight: 1 }}>
            Flux
          </div>
          <div style={{ fontSize: 9.5, color: "var(--t3)", marginTop: 2, letterSpacing: ".04em" }}>AI CFO · v2.0</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto flux-scroll" style={{ padding: "8px 0" }}>
        {NAV.map((sec) => (
          <div key={sec.section}>
            <div className="nav-section">{sec.section}</div>
            {sec.items.map((it) => (
              <button
                key={it.key}
                className={`nav-item w-full text-left ${view === it.key ? "active" : ""}`}
                onClick={() => setView(it.key)}
                type="button"
              >
                <Icon name={it.icon} size={16} />
                <span>{it.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="px-5 py-4" style={{ borderTop: "1px solid var(--bdr)" }}>
        <div className="ins ins-acc" style={{ padding: "10px 12px" }}>
          <div className="ins-h flex items-center gap-1.5">
            <Icon name="brain" size={11} /> Hybrid Engine
          </div>
          <div className="ins-b" style={{ fontSize: 11 }}>
            Trend + weekly seasonality + residual boosting. 80% CI bands.
          </div>
        </div>
      </div>
    </aside>
  );
}
