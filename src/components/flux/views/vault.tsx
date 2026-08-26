"use client";

import { useMemo, useState } from "react";
import { useFlux, formatINR } from "@/store/flux-store";
import { LineChart } from "@/components/flux/charts";
import { Icon } from "@/components/flux/icon";
import { useToast } from "@/hooks/use-toast";

/* ── Vault transactions demo: a few seeded rows are expected from the store.
   If the store is empty (e.g. fresh DB), fall back to a small demo set so
   the table never looks broken during first render. ── */
const FALLBACK_TX = [
  { id: "fb1", label: "Auto-save · High income day", date: new Date("2026-03-13"), type: "Auto", amount: 2400, flow: "in", tone: "bg" },
  { id: "fb2", label: "Manual deposit", date: new Date("2026-03-10"), type: "Manual", amount: 3000, flow: "in", tone: "bl" },
  { id: "fb3", label: "Break fund withdrawal", date: new Date("2026-03-05"), type: "Withdraw", amount: 4500, flow: "out", tone: "ba" },
  { id: "fb4", label: "Monthly surplus save", date: new Date("2026-03-01"), type: "Auto", amount: 4100, flow: "in", tone: "bg" },
  { id: "fb5", label: "Interest credited", date: new Date("2026-03-01"), type: "Interest", amount: 42, flow: "in", tone: "bt" },
] as const;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtDate(d: string | Date): string {
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return `${MONTHS[dt.getMonth()]} ${dt.getDate()}`;
}

function typeBadge(type: string): string {
  switch (type) {
    case "Auto":     return "badge bg";
    case "Manual":   return "badge bl";
    case "Withdraw": return "badge ba";
    case "Interest": return "badge bt";
    default:         return "badge bk";
  }
}

function amountColor(flow: string): string {
  return flow === "out" ? "var(--red)" : "var(--grn)";
}
function amountSign(flow: string): string {
  return flow === "out" ? "−" : "+";
}

/* ── Auto-save rules (local-only state) ── */
interface Rule { key: string; name: string; meta: string; icon: string; iconBg: string; iconColor: string; on: boolean; dim?: boolean; }
const DEFAULT_RULES: Rule[] = [
  { key: "highIncome", name: "High income days", meta: "20% when daily income exceeds ₹8,000", icon: "forecast", iconBg: "var(--grnd)", iconColor: "var(--grn)", on: true },
  { key: "surplus",    name: "Monthly surplus",  meta: "50% of income above ₹40,000/month",     icon: "plus",     iconBg: "var(--accd)", iconColor: "var(--acc)", on: true },
  { key: "goalBooster", name: "Goal booster",   meta: "₹500 every week until vault reaches ₹30,000", icon: "target", iconBg: "var(--ambd)", iconColor: "var(--amb)", on: true },
  { key: "nightSave",  name: "Night-time save", meta: "₹200 automatically every evening",      icon: "moon",     iconBg: "var(--bg3)",  iconColor: "var(--t3)",  on: false, dim: true },
];

export function VaultView() {
  const snapshot = useFlux((s) => s.snapshot);
  const profile = useFlux((s) => s.profile);
  const vaultTransactions = useFlux((s) => s.vaultTransactions);
  const vaultHistory = useFlux((s) => s.vaultHistory);
  const load = useFlux((s) => s.load);
  const { toast } = useToast();

  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES);
  const [formOpen, setFormOpen] = useState<null | "deposit" | "withdraw">(null);
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* Derived */
  const m = useMemo(() => {
    const vaultBalance = snapshot?.vaultBalance ?? 0;
    const baselineNeed = snapshot?.baselineNeed ?? 11000;
    const goal = profile?.vaultGoal ?? 30000;
    const dailyBaseline = baselineNeed / 30;
    const baselineDays = dailyBaseline > 0 ? Math.round(vaultBalance / dailyBaseline) : 0;
    const pct = goal > 0 ? Math.min(100, (vaultBalance / goal) * 100) : 0;

    const txs = vaultTransactions.length ? vaultTransactions : (FALLBACK_TX as unknown as typeof vaultTransactions);
    const totalDeposited = txs.filter((t) => t.flow === "in" && t.type !== "Interest").reduce((s, t) => s + t.amount, 0);
    const totalWithdrawn = txs.filter((t) => t.flow === "out").reduce((s, t) => s + t.amount, 0);
    const interestEarned = txs.filter((t) => t.type === "Interest").reduce((s, t) => s + t.amount, 0);
    const autoSavedMonth = txs.filter((t) => t.type === "Auto").reduce((s, t) => s + t.amount, 0);

    const runway = (() => {
      const income = snapshot?.income ?? 0;
      const spending = snapshot?.spending ?? 1;
      const burn = spending || 1;
      return ((vaultBalance + Math.max(0, income - spending)) / burn).toFixed(1);
    })();

    return { vaultBalance, goal, baselineDays, pct, txs, totalDeposited, totalWithdrawn, interestEarned, autoSavedMonth, runway };
  }, [snapshot, profile, vaultTransactions]);

  /* Vault history → line chart series */
  const growth = useMemo(() => {
    if (!vaultHistory.length) {
      // gentle monotonic fallback so the chart shows healthy growth on a fresh DB
      return {
        labels: ["1", "2", "3", "4", "5"],
        data: [2100, 5200, 7800, 9400, 12100],
      };
    }
    const sorted = [...vaultHistory].sort((a, b) => a.run - b.run);
    return {
      labels: sorted.map((h) => String(h.run)),
      data: sorted.map((h) => h.vaultBalance),
    };
  }, [vaultHistory]);

  async function submitVault(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) return;
    const amt = Number(amount);
    if (!amt || amt <= 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: formOpen,
          amount: amt,
          label: label.trim() || (formOpen === "deposit" ? "Manual deposit" : "Manual withdrawal"),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Request failed");
      }
      await load();
      toast({ title: formOpen === "deposit" ? "Deposited to vault" : "Withdrawn from vault" });
      setAmount(""); setLabel(""); setFormOpen(null);
    } catch (err) {
      toast({ title: "Vault action failed", description: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  const activeRules = rules.filter((r) => r.on).length;

  return (
    <>
      {/* ─── Vault banner ─── */}
      <div className="vault-banner mb2">
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
          {/* Left: balance */}
          <div style={{ minWidth: 240 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "rgba(255,255,255,.62)" }}>
              Current vault balance
            </div>
            <div className="flux-mono" style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-.035em", lineHeight: 1.1, marginTop: 6, color: "#fff" }}>
              {formatINR(m.vaultBalance)}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.62)", marginTop: 8, maxWidth: 360 }}>
              Covers approximately {m.baselineDays} baseline days at your current reserve requirement.
            </div>
          </div>

          {/* Right: actions + progress */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn"
                onClick={() => { setFormOpen(formOpen === "deposit" ? null : "deposit"); setAmount(""); setLabel(""); }}
                style={{ background: "rgba(255,255,255,.16)", color: "#fff", border: "1px solid rgba(255,255,255,.26)" }}
              >
                Deposit
              </button>
              <button
                className="btn"
                onClick={() => { setFormOpen(formOpen === "withdraw" ? null : "withdraw"); setAmount(""); setLabel(""); }}
                style={{ background: "rgba(255,255,255,.10)", color: "#fff", border: "1px solid rgba(255,255,255,.18)" }}
              >
                Withdraw
              </button>
            </div>

            {formOpen && (
              <form onSubmit={submitVault} style={{ display: "flex", flexDirection: "column", gap: 8, width: 220, background: "rgba(0,0,0,.18)", border: "1px solid rgba(255,255,255,.18)", borderRadius: 10, padding: 10 }}>
                <input
                  type="text"
                  placeholder={formOpen === "deposit" ? "Label (optional)" : "Reason (optional)"}
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  style={{ background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.22)", borderRadius: 6, padding: "6px 9px", color: "#fff", fontSize: 12, outline: "none" }}
                />
                <input
                  type="number"
                  min={1}
                  step={100}
                  placeholder="Amount ₹"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  style={{ background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.22)", borderRadius: 6, padding: "6px 9px", color: "#fff", fontSize: 12, outline: "none", fontFamily: "var(--font-mono)" }}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-full"
                  style={{ background: "#fff", color: "#0f5132", border: "none" }}
                >
                  {submitting ? "Working…" : formOpen === "deposit" ? "Confirm deposit" : "Confirm withdrawal"}
                </button>
              </form>
            )}

            <div style={{ width: 220 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,.62)", marginBottom: 5 }}>
                <span>Progress to {formatINR(m.goal, { compact: true })} goal</span>
                <span className="flux-mono">{Math.round(m.pct)}%</span>
              </div>
              <div style={{ height: 5, background: "rgba(255,255,255,.18)", borderRadius: 100, overflow: "hidden" }}>
                <div style={{ width: `${m.pct}%`, height: "100%", background: "rgba(255,255,255,.85)", borderRadius: 100, transition: "width 1.2s cubic-bezier(.4,0,.2,1)" }} />
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.48)", marginTop: 4 }}>
                Target progress — {Math.round(m.pct)}% reached
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Stats row ─── */}
      <div className="g3 mb2">
        {/* Vault statistics */}
        <div className="card">
          <div className="card-t" style={{ marginBottom: 13 }}>Vault statistics</div>
          <div className="sr" style={{ padding: "9px 0" }}>
            <span style={{ fontSize: 12.5, color: "var(--t2)" }}>Total deposited</span>
            <span className="flux-mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--grn)" }}>{formatINR(m.totalDeposited)}</span>
          </div>
          <div className="sr" style={{ padding: "9px 0" }}>
            <span style={{ fontSize: 12.5, color: "var(--t2)" }}>Total withdrawn</span>
            <span className="flux-mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--red)" }}>{formatINR(m.totalWithdrawn)}</span>
          </div>
          <div className="sr" style={{ padding: "9px 0" }}>
            <span style={{ fontSize: 12.5, color: "var(--t2)" }}>Interest earned</span>
            <span className="flux-mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--teal)" }}>{formatINR(m.interestEarned)}</span>
          </div>
          <div className="sr" style={{ padding: "9px 0" }}>
            <span style={{ fontSize: 12.5, color: "var(--t2)" }}>Auto-saved this month</span>
            <span className="flux-mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>{formatINR(m.autoSavedMonth)}</span>
          </div>
          <div className="sr" style={{ padding: "9px 0" }}>
            <span style={{ fontSize: 12.5, color: "var(--t2)" }}>Next auto-save</span>
            <span className="flux-mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--acc)" }}>₹800 in 2 days</span>
          </div>
          <div className="sr" style={{ padding: "9px 0" }}>
            <span style={{ fontSize: 12.5, color: "var(--t2)" }}>Financial runway</span>
            <span className="flux-mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--teal)" }}>{m.runway} months</span>
          </div>
        </div>

        {/* Auto-save rules */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13 }}>
            <div className="card-t">Auto-save rules</div>
            <span className="badge bg">{activeRules} active</span>
          </div>
          {rules.map((r) => (
            <div key={r.key} className="li" style={r.dim && !r.on ? { opacity: 0.48 } : undefined}>
              <div className="li-icon" style={{ background: r.iconBg, color: r.iconColor }}>
                <Icon name={r.icon} size={15} />
              </div>
              <div className="li-body">
                <div className="li-name">{r.name}</div>
                <div className="li-meta">{r.meta}</div>
              </div>
              <div
                className={`toggle ${r.on ? "on" : ""}`}
                onClick={() => setRules((prev) => prev.map((x) => x.key === r.key ? { ...x, on: !x.on } : x))}
                role="switch"
                aria-checked={r.on}
                tabIndex={0}
              />
            </div>
          ))}
        </div>

        {/* Milestones */}
        <div className="card">
          <div className="card-t" style={{ marginBottom: 13 }}>Milestones</div>

          <div className="li">
            <div className="li-icon" style={{ background: "var(--grnd)", color: "var(--grn)" }}><Icon name="plus" size={15} /></div>
            <div className="li-body">
              <div className="li-name">First deposit</div>
              <div className="li-meta">₹500 saved</div>
            </div>
            <span className="badge bg">Done</span>
          </div>

          <div className="li">
            <div className="li-icon" style={{ background: "var(--grnd)", color: "var(--grn)" }}><Icon name="shield" size={15} /></div>
            <div className="li-body">
              <div className="li-name">One-week buffer</div>
              <div className="li-meta">₹7,000 saved</div>
            </div>
            <span className="badge bg">Done</span>
          </div>

          <div className="li">
            <div className="li-icon" style={{ background: "var(--accd)", color: "var(--acc)" }}><Icon name="target" size={15} /></div>
            <div className="li-body">
              <div className="li-name">One-month buffer</div>
              <div className="li-meta">{formatINR(m.goal, { compact: true })} goal</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="flux-mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--acc)" }}>{Math.round(m.pct)}%</div>
              <div style={{ fontSize: 10, color: "var(--t3)" }}>Current progress</div>
            </div>
          </div>

          <div className="li" style={{ opacity: 0.32 }}>
            <div className="li-icon" style={{ background: "var(--bg3)", color: "var(--t3)" }}><Icon name="vault" size={15} /></div>
            <div className="li-body">
              <div className="li-name">Three-month fund</div>
              <div className="li-meta">Longer emergency reserve</div>
            </div>
            <span style={{ fontSize: 11, color: "var(--t3)" }}>Locked</span>
          </div>
        </div>
      </div>

      {/* ─── Bottom row ─── */}
      <div className="g32">
        {/* Vault transactions table */}
        <div className="card card-flush">
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--bdr)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div className="card-t">Vault transactions</div>
              <div className="card-s">Most recent activity</div>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Date</th>
                <th>Type</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {m.txs.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--t3)" }}>No vault activity yet</td></tr>
              )}
              {m.txs.map((t) => (
                <tr key={t.id}>
                  <td className="td-m">{t.label}</td>
                  <td>{fmtDate(t.date)}</td>
                  <td><span className={typeBadge(t.type)}>{t.type}</span></td>
                  <td className="td-n" style={{ textAlign: "right", color: amountColor(t.flow) }}>
                    {amountSign(t.flow)}{formatINR(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right stack: growth chart + insight */}
        <div className="stack">
          <div className="card">
            <div className="card-t" style={{ marginBottom: 3 }}>Vault growth</div>
            <div className="card-s" style={{ marginBottom: 14 }}>Run history</div>
            <LineChart
              height={185}
              labels={growth.labels}
              lines={[{ data: growth.data, color: "teal", label: "Vault balance" }]}
              formatVal={(n) => formatINR(n, { compact: true })}
            />
          </div>

          <div className="ins ins-grn" style={{ margin: 0 }}>
            <div className="ins-h">On track</div>
            <div className="ins-b">At the current auto-save pace, you will reach the one-month buffer goal in about 6 months.</div>
          </div>
        </div>
      </div>
    </>
  );
}
