"use client";

import { useFluxTheme } from "./theme-provider";
import { Icon } from "./icon";
import { useFlux, formatINR } from "@/store/flux-store";

const TITLES: Record<string, { title: string; sub: string }> = {
  dashboard: { title: "Dashboard", sub: "Financial overview" },
  spending: { title: "Spending", sub: "Pacing and category pressure" },
  forecast: { title: "Income Forecast", sub: "30-day hybrid prediction" },
  break: { title: "Break Planner", sub: "Model the cost of time off" },
  vault: { title: "Safety Vault", sub: "Your automated safety net" },
  profile: { title: "Profile & Settings", sub: "Account, goals, security" },
  chat: { title: "AI CFO Chat", sub: "Ask Flux anything" },
};

export function Topbar() {
  const { theme, setTheme, toggleTheme } = useFluxTheme();
  const view = useFlux((s) => s.view);
  const snap = useFlux((s) => s.snapshot);
  const setView = useFlux((s) => s.setView);

  const meta = TITLES[view] ?? TITLES.dashboard;

  return (
    <header className="topbar">
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)", letterSpacing: "-.02em", lineHeight: 1.1 }}>
            {meta.title}
          </div>
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }} className="truncate">
            {meta.sub}
            {snap ? ` · ${snap.monthLabel} · ${snap.daysPassed} days in` : ""}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {snap && (
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg" style={{ background: "var(--surf2)", border: "1px solid var(--bdr)" }}>
            <div className="flex items-center gap-1.5">
              <Icon name="wallet" size={12} className="flux-t3" />
              <span className="label-sm" style={{ margin: 0 }}>Vault</span>
              <span className="flux-mono flux-teal" style={{ fontSize: 12, fontWeight: 600 }}>
                {formatINR(snap.vaultBalance, { compact: true })}
              </span>
            </div>
          </div>
        )}

        <button
          className="theme-btn"
          style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={toggleTheme}
          title={`Theme: ${theme}`}
          type="button"
        >
          <Icon name={theme === "dark" ? "moon" : theme === "light" ? "sun" : "paper"} size={14} />
        </button>

        <button
          className="theme-btn md:hidden"
          style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setView("chat")}
          title="AI CFO Chat"
          type="button"
        >
          <Icon name="chat" size={14} />
        </button>
      </div>
    </header>
  );
}
