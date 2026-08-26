"use client";

import { useEffect, useState } from "react";
import { useFlux, formatINR, type ViewKey } from "@/store/flux-store";
import { BarChart, Donut, Sparkline } from "@/components/flux/charts";
import { CountUp } from "@/components/flux/markdown";
import { Icon } from "@/components/flux/icon";

/* ── Static historical series used by the cash-picture card ── */
const HIST_INCOME = [42000, 58000, 31000, 46000, 49000, 44000, 43000, 48200];
const HIST_SPEND = [30000, 38000, 26000, 34000, 32000, 28000, 29000, 31400];
const HIST_LABELS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

/* ── Sparkline series for the 4 metric cards ── */
const SPARK_INCOME = [38000, 42000, 36000, 44000, 41000, 46000, 43000, 48200];
const SPARK_SPEND = [28000, 33000, 31000, 35000, 29000, 32000, 30000, 31400];
const SPARK_VAULT = [9200, 9800, 10400, 10900, 11200, 11500, 11800, 12100];

/* ── Weekly predicted-income trend for the "This week" card ── */
const WEEK_INCOME_TREND = [22, 25, 28, 24, 26, 27, 28];

/* ── Tiny helpers ── */
function mean(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
}

function fmtDateShort(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "—";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

/* Category tone → CSS color var (for legend dots) */
function toneVar(tone: string) {
  switch (tone) {
    case "acc": return "var(--acc)";
    case "red": return "var(--red)";
    case "amb": return "var(--amb)";
    case "teal": return "var(--teal)";
    case "indigo": return "var(--indigo)";
    case "t2": return "var(--t2)";
    default: return "var(--t3)";
  }
}

/* Tone → Donut color union */
function toneDonut(tone: string): "acc" | "red" | "grn" | "amb" | "teal" | "t2" | "indigo" {
  switch (tone) {
    case "acc": return "acc";
    case "red": return "red";
    case "amb": return "amb";
    case "teal": return "teal";
    case "indigo": return "indigo";
    case "t2": return "t2";
    default: return "t2";
  }
}

/* Tx tone → badge class */
function badgeClass(tone: string) {
  switch (tone) {
    case "bg": return "badge bg";
    case "br": return "badge br";
    case "ba": return "badge ba";
    case "bt": return "badge bt";
    case "bl": return "badge bl";
    default: return "badge bk";
  }
}

/* AI insight tone → class */
function insClass(tone: string) {
  switch (tone) {
    case "acc": return "ins ins-acc";
    case "amb": return "ins ins-amb";
    case "teal": return "ins ins-teal";
    case "grn": return "ins ins-grn";
    case "red": return "ins ins-red";
    default: return "ins ins-acc";
  }
}

interface Insight {
  type?: string;
  tone: string;
  heading: string;
  body: string;
}

export function DashboardView() {
  const snap = useFlux((s) => s.snapshot);
  const profile = useFlux((s) => s.profile);
  const transactions = useFlux((s) => s.transactions);
  const categories = useFlux((s) => s.categories);
  const setView = useFlux((s) => s.setView);

  const [insights, setInsights] = useState<Insight[] | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/insights")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("insights failed"))))
      .then((d: { insights: Insight[] }) => {
        if (!alive) return;
        setInsights(d.insights ?? []);
      })
      .catch(() => {
        if (!alive) return;
        // Fallback insights if the API fails
        setInsights([
          { type: "peak", tone: "acc", heading: "Peak day", body: "Keep Mar 19 clear — it's your highest-probability earning day (89%)." },
          { type: "spending", tone: "amb", heading: "Spending nudge", body: "You're in the Moderate zone. Hold daily spend to ₹2,200 to finish the month safely." },
          { type: "vault", tone: "teal", heading: "Vault on track", body: "₹2,400 auto-saved today. Runway holds at 2.6 months." },
        ]);
      })
      .finally(() => {
        if (alive) setInsightsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  /* ── Derived numbers ── */
  const income = snap?.income ?? 48200;
  const spending = snap?.spending ?? 31400;
  const vaultBalance = snap?.vaultBalance ?? 12100;
  const incomeTarget = profile?.incomeTarget ?? 67000;
  const vaultGoal = profile?.vaultGoal ?? 30000;
  const daysPassed = snap?.daysPassed ?? 14;
  const daysInMonth = snap?.daysInMonth ?? 30;
  const baselineNeed = snap?.baselineNeed ?? 30000;

  const incomePct = Math.min(100, Math.round((income / incomeTarget) * 100));
  const vaultPct = Math.min(100, Math.round((vaultBalance / vaultGoal) * 100));
  const spendingPct = Math.round((spending / income) * 100);

  /* ── KPI mini-tile derived values (safe against div-by-zero) ── */
  const avgDailyIncome = income / Math.max(1, daysPassed);
  const remainingDays = Math.max(1, daysInMonth - daysPassed);
  const safeDailySpend = (income - spending) / remainingDays;
  const savingsRate = ((income - spending) / Math.max(1, income)) * 100;
  const vaultCoverage = (vaultBalance / Math.max(1, baselineNeed)) * 100;

  const avgIncome = mean(HIST_INCOME);
  const avgSpend = mean(HIST_SPEND);
  const bestMonth = Math.max(...HIST_INCOME);
  const avgSaved = mean(HIST_INCOME.map((v, i) => v - HIST_SPEND[i]));

  const recentTx = transactions.slice(0, 5);
  const totalSpentCats = categories.reduce((a, c) => a + c.spent, 0);

  /* Quick-access list */
  const quickAccess: { icon: string; title: string; sub: string; view: ViewKey }[] = [
    { icon: "gauge", title: "Spending", sub: "Daily pacing and category pressure", view: "spending" },
    { icon: "forecast", title: "Income Forecast", sub: "Peak-day calendar and weekly plan", view: "forecast" },
    { icon: "calendar", title: "Break Planner", sub: "Runway-safe rest windows", view: "break" },
    { icon: "vault", title: "Safety Vault", sub: "Buffer growth and coverage", view: "vault" },
  ];

  return (
    <>
      {/* ── TOP METRIC ROW ── */}
      <div className="g4 mb2">
        {/* Monthly Income */}
        <div className="metric-card">
          <div className="metric-lbl">Monthly Income</div>
          <CountUp
            value={income}
            format={(n) => formatINR(n)}
            className="metric-val flux-mono"
            style={{ display: "block" }}
          />
          <div className="metric-d dp" style={{ marginBottom: 10 }}>Up 12% vs February</div>
          <div className="prog" style={{ marginBottom: 4 }}>
            <div className="pf pf-acc" style={{ width: `${incomePct}%` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--t3)" }}>
            <span>{formatINR(incomeTarget, { compact: true })} target</span>
            <span>{incomePct}% reached</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <Sparkline data={SPARK_INCOME} color="acc" height={34} />
          </div>
        </div>

        {/* Monthly Spending */}
        <div className="metric-card">
          <div className="metric-lbl">Monthly Spending</div>
          <CountUp
            value={spending}
            format={(n) => formatINR(n)}
            className="metric-val flux-mono"
            style={{ display: "block", color: "var(--red)" }}
          />
          <div className="metric-d dn" style={{ marginBottom: 9 }}>Up 4% vs February</div>
          <div className="zone-bar" style={{ marginBottom: 5 }}>
            <div className="zs zs-safe" />
            <div className="zs zs-mod" />
            <div className="zs zs-risk" />
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 600 }}>
            {spendingPct < 50 ? "Safe zone" : spendingPct < 70 ? "Moderate zone" : "Risk zone"} · {spendingPct}% of income
          </div>
          <div style={{ marginTop: 10 }}>
            <Sparkline data={SPARK_SPEND} color="red" height={34} />
          </div>
        </div>

        {/* Financial Runway */}
        <div className="runway-card">
          <div className="metric-lbl" style={{ color: "rgba(255,255,255,.75)" }}>Financial Runway</div>
          <CountUp
            value={2.6}
            format={(n) => `${n.toFixed(1)} mo`}
            className="flux-mono"
            style={{
              display: "block",
              fontSize: 32,
              fontWeight: 600,
              color: "#fff",
              lineHeight: 1,
              letterSpacing: "-.035em",
              marginBottom: 5,
              position: "relative",
              zIndex: 1,
            }}
          />
          <div
            className="metric-d"
            style={{ color: "rgba(255,255,255,.75)", marginBottom: 10, position: "relative", zIndex: 1 }}
          >
            Up +0.3 vs last month
          </div>
          <div
            style={{
              height: 4,
              background: "rgba(255,255,255,.2)",
              borderRadius: 100,
              overflow: "hidden",
              marginBottom: 5,
              position: "relative",
              zIndex: 1,
            }}
          >
            <div style={{ width: "43%", height: "100%", background: "rgba(255,255,255,.85)", borderRadius: 100, transition: "width .6s" }} />
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.52)", position: "relative", zIndex: 1 }}>
            Minimum safe floor: {profile?.minRunwayMonths ?? 2.0} months
          </div>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.72)", marginTop: 6, position: "relative", zIndex: 1, fontWeight: 500 }}>
            Survive 2.6 months without new income
          </div>
        </div>

        {/* Safety Vault */}
        <div className="metric-card">
          <div className="metric-lbl">Safety Vault</div>
          <CountUp
            value={vaultBalance}
            format={(n) => formatINR(n)}
            className="metric-val flux-mono"
            style={{ display: "block", color: "var(--teal)" }}
          />
          <div className="metric-d dp" style={{ marginBottom: 10 }}>Auto-saving is running normally</div>
          <div className="prog" style={{ marginBottom: 4 }}>
            <div className="pf pf-teal" style={{ width: `${vaultPct}%` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--t3)" }}>
            <span>{formatINR(vaultGoal, { compact: true })} goal</span>
            <span>{vaultPct}% reached</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <Sparkline data={SPARK_VAULT} color="teal" height={34} />
          </div>
        </div>
      </div>

      {/* ── KPI MINI-TILES ROW ── */}
      <div className="g4 mb2">
        <div className="kpi-mini">
          <div className="kpi-mini-lbl">Avg daily income</div>
          <div className="kpi-mini-val">{formatINR(avgDailyIncome, { compact: true })}</div>
        </div>
        <div className="kpi-mini">
          <div className="kpi-mini-lbl">Safe daily spend</div>
          <div className="kpi-mini-val" style={{ color: "var(--amb)" }}>{formatINR(Math.max(0, safeDailySpend), { compact: true })}</div>
        </div>
        <div className="kpi-mini">
          <div className="kpi-mini-lbl">Savings rate</div>
          <div className="kpi-mini-val" style={{ color: "var(--grn)" }}>{savingsRate.toFixed(0)}%</div>
        </div>
        <div className="kpi-mini">
          <div className="kpi-mini-lbl">Vault coverage</div>
          <div className="kpi-mini-val" style={{ color: "var(--teal)" }}>{vaultCoverage.toFixed(0)}%</div>
        </div>
      </div>

      {/* ── MIDDLE ROW ── */}
      <div className="g32 mb2">
        {/* Left: cash picture */}
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-t">Monthly cash picture</div>
              <div className="card-s">Income and spending by month</div>
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 11, alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--t3)" }}>
                <span style={{ width: 14, height: 2, background: "var(--acc)", display: "inline-block", borderRadius: 3 }} />
                <span>Income</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--t3)" }}>
                <span style={{ width: 14, height: 2, background: "var(--red)", display: "inline-block", borderRadius: 3 }} />
                <span>Spending</span>
              </span>
            </div>
          </div>
          <BarChart
            series={[
              { data: HIST_INCOME, color: "acc", label: "Income" },
              { data: HIST_SPEND, color: "red", label: "Spending" },
            ]}
            labels={HIST_LABELS}
            height={195}
            formatVal={(n) => formatINR(n, { compact: true })}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
              marginTop: 16,
              paddingTop: 16,
              borderTop: "1px solid var(--bdr)",
            }}
          >
            <div className="stat-callout">
              <span className="stat-n">{formatINR(avgIncome, { compact: true })}</span>
              <span className="stat-l">Avg income</span>
            </div>
            <div className="stat-callout">
              <span className="stat-n">{formatINR(avgSpend, { compact: true })}</span>
              <span className="stat-l">Avg spend</span>
            </div>
            <div className="stat-callout">
              <span className="stat-n" style={{ color: "var(--grn)" }}>{formatINR(bestMonth, { compact: true })}</span>
              <span className="stat-l">Best month</span>
            </div>
            <div className="stat-callout">
              <span className="stat-n" style={{ color: "var(--teal)" }}>{formatINR(avgSaved, { compact: true })}</span>
              <span className="stat-l">Avg saved</span>
            </div>
          </div>
        </div>

        {/* Right: stack */}
        <div className="stack">
          {/* This week */}
          <div className="card card-sm">
            <div className="card-h" style={{ marginBottom: 10 }}>
              <div>
                <div className="card-t">This week</div>
                <div className="card-s">Live operating window</div>
              </div>
              <span className="badge bg">
                <span className="dot dot-live" />
                &nbsp;Live
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              <Row label="Predicted income" value="₹22k - ₹28k" mono />
              <div style={{ marginTop: -2, marginBottom: -2 }}>
                <Sparkline data={WEEK_INCOME_TREND} color="acc" height={24} />
              </div>
              <Row
                label="Today's outlook"
                value={
                  <span className="badge bg">
                    <span className="dot dot-live" />
                    &nbsp;High probability
                  </span>
                }
              />
              <Row label="Next peak day" value="Thu, Mar 19" />
              <Row label="Safe daily spend" value="₹2,200" mono />
              <Row label="Auto-saved today" value="₹2,400" mono valueColor="var(--teal)" />
            </div>
          </div>

          {/* AI Insights */}
          <div className="card card-sm">
            <div className="card-t" style={{ marginBottom: 11 }}>AI Insights</div>
            {insightsLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <div className="skeleton" style={{ width: "60%", height: 8 }} />
                    <div className="skeleton" style={{ width: "90%", height: 8 }} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {(insights ?? []).slice(0, 4).map((ins, i) => (
                  <div key={i} className={insClass(ins.tone)}>
                    <div className="ins-h">{ins.heading}</div>
                    <div className="ins-b">{ins.body}</div>
                  </div>
                ))}
                {(!insights || insights.length === 0) && (
                  <div className="ins ins-acc">
                    <div className="ins-h">All good</div>
                    <div className="ins-b">No critical insights right now.</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="g21">
        {/* Left: recent transactions */}
        <div className="card card-flush">
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid var(--bdr)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div className="card-t">Recent transactions</div>
              <div className="card-s">Last 5 entries</div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setView("spending")}
              type="button"
            >
              All transactions →
            </button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Date</th>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTx.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: "center",
                      padding: 28,
                      color: "var(--t3)",
                      cursor: "pointer",
                    }}
                    onClick={() => setView("spending")}
                  >
                    No transactions yet · Add one in Spending
                  </td>
                </tr>
              ) : (
                recentTx.map((t) => {
                  const sign = t.flow === "in" ? "+" : t.flow === "vault" ? "+" : "−";
                  const color =
                    t.flow === "in" ? "var(--grn)" : t.flow === "vault" ? "var(--teal)" : "var(--red)";
                  return (
                    <tr key={t.id}>
                      <td className="td-m">{t.label}</td>
                      <td>{fmtDateShort(t.date)}</td>
                      <td>
                        <span className={badgeClass(t.tone)}>{t.category}</span>
                      </td>
                      <td className="td-n" style={{ textAlign: "right", color }}>
                        {sign}₹{Math.abs(t.amount).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Right: stack */}
        <div className="stack">
          {/* Spending mix */}
          <div className="card card-sm">
            <div className="card-t" style={{ marginBottom: 3 }}>
              {snap?.monthShort ?? "Mar"} spending mix
            </div>
            <div className="card-s" style={{ marginBottom: 14 }}>
              By category · {formatINR(totalSpentCats, { compact: true })} total
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 120, height: 120, flexShrink: 0, position: "relative" }}>
                <Donut
                  segments={categories.map((c) => ({
                    value: c.spent,
                    color: toneDonut(c.tone),
                    label: c.label,
                  }))}
                  size={120}
                  thickness={14}
                  centerValue={formatINR(totalSpentCats, { compact: true })}
                  centerLabel="Total"
                />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                {categories.map((c) => (
                  <div
                    key={c.id}
                    style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5 }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: toneVar(c.tone),
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ color: "var(--t2)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.label}
                    </span>
                    <span className="flux-mono" style={{ fontWeight: 600, color: "var(--t1)" }}>
                      {formatINR(c.spent, { compact: true })}
                    </span>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div style={{ fontSize: 11, color: "var(--t3)" }}>No categories</div>
                )}
              </div>
            </div>
          </div>

          {/* Quick access */}
          <div className="card card-sm">
            <div className="card-t" style={{ marginBottom: 10 }}>Quick access</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {quickAccess.map((q) => (
                <button
                  key={q.view}
                  type="button"
                  className="quick-link"
                  onClick={() => setView(q.view)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 11px",
                    background: "var(--surf2)",
                    border: "1px solid var(--bdr)",
                    borderRadius: 9,
                    color: "var(--t1)",
                    transition: "border-color .14s, background .14s",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--bdr2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--bdr)";
                  }}
                >
                  <span style={{ color: "var(--t3)" }}>
                    <Icon name={q.icon} size={15} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{q.title}</div>
                    <div style={{ fontSize: 10.5, color: "var(--t3)" }}>{q.sub}</div>
                  </div>
                  <span className="quick-arrow" style={{ fontSize: 12, color: "var(--t3)" }}>→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Small row helper for the "This week" card ── */
function Row({
  label,
  value,
  mono,
  valueColor,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  valueColor?: string;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5 }}>
      <span style={{ color: "var(--t3)" }}>{label}</span>
      <span
        className={mono ? "flux-mono" : undefined}
        style={{ fontWeight: 600, color: valueColor ?? "var(--t1)" }}
      >
        {value}
      </span>
    </div>
  );
}
