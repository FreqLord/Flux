"use client";

import { useEffect } from "react";
import { useFlux } from "@/store/flux-store";
import { Sidebar } from "@/components/flux/sidebar";
import { Topbar } from "@/components/flux/topbar";
import { MobileNav } from "@/components/flux/mobile-nav";
import { ChatFab } from "@/components/flux/chat-fab";
import { DashboardView } from "@/components/flux/views/dashboard";
import { SpendingView } from "@/components/flux/views/spending";
import { ForecastView } from "@/components/flux/views/forecast";
import { BreakView } from "@/components/flux/views/break";
import { VaultView } from "@/components/flux/views/vault";
import { SimulatorView } from "@/components/flux/views/simulator";
import { ProfileView } from "@/components/flux/views/profile";
import { ChatView } from "@/components/flux/views/chat";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useFluxTheme } from "@/components/flux/theme-provider";

export default function Home() {
  const view = useFlux((s) => s.view);
  const load = useFlux((s) => s.load);
  const loading = useFlux((s) => s.loading);
  const error = useFlux((s) => s.error);
  const profile = useFlux((s) => s.profile);
  const { toggleTheme } = useFluxTheme();

  useEffect(() => { load(); }, [load]);
  useKeyboardShortcuts();

  // Listen for the global "cycle theme" event from the keyboard hook
  useEffect(() => {
    const handler = () => toggleTheme();
    document.addEventListener("flux:cycle-theme", handler);
    return () => document.removeEventListener("flux:cycle-theme", handler);
  }, [toggleTheme]);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <main className="flex-1" style={{ display: "flex", flexDirection: "column" }}>
          {loading && !profile ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="flex items-center gap-3">
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--acc)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13 }}>fx</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)" }}>Loading Flux…</div>
                  <div style={{ fontSize: 11, color: "var(--t3)" }}>Warming up your financial snapshot</div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <div className="ins ins-red" style={{ maxWidth: 400 }}>
                <div className="ins-h">Couldn't load Flux</div>
                <div className="ins-b">{error}</div>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }} onClick={() => load()}>Retry</button>
              </div>
            </div>
          ) : (
            <>
              <div className="page-header">
                <div className="page-header-row flex items-start justify-between gap-3 flex-wrap">
                  <ViewTitle />
                </div>
              </div>
              <div className="page-body">
                <div key={view} className="view-fade-in">
                  {view === "dashboard" && <DashboardView />}
                  {view === "spending" && <SpendingView />}
                  {view === "forecast" && <ForecastView />}
                  {view === "break" && <BreakView />}
                  {view === "vault" && <VaultView />}
                  {view === "simulator" && <SimulatorView />}
                  {view === "profile" && <ProfileView />}
                  {view === "chat" && <ChatView />}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      <MobileNav />
      <ChatFab />
    </div>
  );
}

function ViewTitle() {
  const view = useFlux((s) => s.view);
  const snap = useFlux((s) => s.snapshot);
  const profile = useFlux((s) => s.profile);
  const titles: Record<string, { t: string; s: string }> = {
    dashboard: { t: `Good ${greeting()}, ${profile?.name?.split(" ")[0] ?? "there"}`, s: `Financial overview · ${snap?.monthLabel ?? ""} · ${snap?.daysPassed ?? 0} days in` },
    spending: { t: "Spending", s: `${snap?.monthLabel ?? ""} · ${snap?.daysPassed ?? 0} days in · ${(snap?.daysInMonth ?? 31) - (snap?.daysPassed ?? 0)} days remaining` },
    forecast: { t: "Income Forecast", s: `30-day hybrid prediction · ${snap?.monthLabel ?? ""} · 94% historical accuracy` },
    break: { t: "Break Planner", s: "Model the cost of time off before you commit" },
    simulator: { t: "What-If Simulator", s: "Project your runway under income & spending changes" },
    vault: { t: "Safety Vault", s: "Your automated financial safety net" },
    profile: { t: "Profile & Settings", s: "Account, goals, appearance, and security" },
    chat: { t: "AI CFO Chat", s: "Ask Flux anything about your finances" },
  };
  const meta = titles[view] ?? titles.dashboard;
  return (
    <div>
      <h1 className="font-display page-title" style={{ fontSize: 26, fontWeight: 700, color: "var(--t1)", letterSpacing: "-.035em", lineHeight: 1.1 }}>{meta.t}</h1>
      <p style={{ fontSize: 12.5, color: "var(--t3)", marginTop: 4 }}>{meta.s}</p>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
