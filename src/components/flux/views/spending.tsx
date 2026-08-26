"use client";

import { useEffect, useMemo, useState } from "react";
import { useFlux, formatINR, type Category, type Tx } from "@/store/flux-store";
import { LineChart, ProgressRing } from "@/components/flux/charts";
import { Icon } from "@/components/flux/icon";
import { useToast } from "@/hooks/use-toast";

/* ── Daily spending demo series (matches original expense.html) ── */
const DAILY_SERIES = [
  2400, 1800, 3200, 1200, 2800, 900, 2100, 3500, 1600, 2200,
  1900, 2700, 2100, 1400, 900, 1200, 1600, 1300,
];
const DAILY_LABELS = DAILY_SERIES.map((_, i) => String(i + 1));

/* ── 6-month trend demo series (last 5 months + current snapshot) ── */
const TREND_LABELS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
const TREND_INCOME_BASE = [42000, 58000, 46000, 49000, 44000];
const TREND_SPENDING_BASE = [30000, 38000, 34000, 32000, 28000];

/* ── Spending intensity heatmap (12 weeks × 7 days = 84 cells) ── */
const HEAT_WEEKS = 12;
const HEAT_DAYS = 7;
const HEAT_DOW_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HEAT_MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/* Day-of-week labels in the left column (only Mon/Wed/Fri to avoid clutter). */
const HEAT_DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];
/* Week labels under the grid: anchor at 12w ago / 8w ago / 4w ago / now, blank elsewhere. */
const HEAT_WEEK_LABELS = [
  "12w ago", "", "", "", "8w ago", "", "", "", "4w ago", "", "", "now",
];

interface HeatCell {
  amount: number;
  level: number;
  dateLabel: string;
}

/* Map a daily-spend amount to a 0–5 intensity level (matches the .hcell-0 … .hcell-5 palette). */
function amountToLevel(amt: number): number {
  if (amt < 500) return 0;
  if (amt < 1000) return 1;
  if (amt < 1500) return 2;
  if (amt < 2200) return 3;
  if (amt < 3000) return 4;
  return 5;
}

/* Seeded PRNG (mulberry32) so demo heatmap data stays stable across renders. */
function mulberry32(seed: number): () => number {
  let t = seed;
  return function next(): number {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Transactions pagination ── */
const TX_PAGE_SIZE = 10;

/* ── Tone → progress-bar fill class / color ── */
function toneFill(tone: string): { className?: string; color?: string } {
  switch (tone) {
    case "acc":   return { className: "pf pf-acc" };
    case "red":   return { className: "pf pf-red" };
    case "amb":   return { className: "pf pf-amb" };
    case "teal":  return { className: "pf pf-teal" };
    case "grn":   return { className: "pf pf-grn" };
    case "indigo": return { color: "var(--indigo)" };
    case "t2":    return { color: "var(--t3)" };
    default:      return { className: "pf pf-acc" };
  }
}

function statusFor(spent: number, limit: number): { cls: string; label: string } {
  if (limit <= 0) return { cls: "badge bk", label: "—" };
  const r = spent / limit;
  if (r > 1) return { cls: "badge br", label: "Over" };
  if (r >= 0.9) return { cls: "badge ba", label: "Tight" };
  return { cls: "badge bg", label: "Under" };
}

/* ── Transaction helpers ── */
function txCategoryBadge(category: string): string {
  switch (category) {
    case "Income":    return "badge bg";
    case "Food":      return "badge br";
    case "Utilities": return "badge ba";
    case "Vault":     return "badge bt";
    case "Tools":     return "badge ba";
    case "Transport": return "badge br";
    default:          return "badge bk";
  }
}

function txAmountColor(flow: string): string {
  switch (flow) {
    case "in":    return "var(--grn)";
    case "out":   return "var(--red)";
    case "vault": return "var(--teal)";
    default:      return "var(--t1)";
  }
}

function txAmountSign(flow: string): string {
  switch (flow) {
    case "in":  return "+";
    case "out": return "−";
    default:    return "";
  }
}

function formatTxDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export function SpendingView() {
  const snapshot = useFlux((s) => s.snapshot);
  const categories = useFlux((s) => s.categories);
  const load = useFlux((s) => s.load);
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const transactions = useFlux((s) => s.transactions);
  const [txSearch, setTxSearch] = useState("");
  const [txCategory, setTxCategory] = useState<string>("All");
  const [txFlow, setTxFlow] = useState<string>("All");
  const [searchFocused, setSearchFocused] = useState(false);

  /* Derived spending metrics */
  const m = useMemo(() => {
    const income = snapshot?.income ?? 0;
    const spending = snapshot?.spending ?? 0;
    const daysInMonth = snapshot?.daysInMonth ?? 31;
    const daysPassed = snapshot?.daysPassed ?? 0;
    const daysLeft = Math.max(1, daysInMonth - daysPassed);
    const remaining = Math.max(0, income - spending);
    const pct = income > 0 ? (spending / income) * 100 : 0;
    const dailyTarget = remaining / daysLeft;

    // Zone from ratio
    let zone: { badge: string; label: string; ringColor: "grn" | "amb" | "red"; name: string };
    if (pct < 50)       zone = { badge: "badge bg", label: "Safe zone",      ringColor: "grn", name: "Safe" };
    else if (pct <= 70) zone = { badge: "badge ba", label: "Moderate zone",  ringColor: "amb", name: "Moderate" };
    else                zone = { badge: "badge br", label: "Risk zone",      ringColor: "red", name: "Risk" };

    // Financial ratios
    const expenseRatio = pct;
    // assume vault contribution = 10% of income if vault activity exists; keep simple 10% baseline
    const vaultContributionPct = 10;
    const savingsRate = Math.max(0, 100 - expenseRatio - vaultContributionPct);

    return {
      income, spending, remaining, pct, dailyTarget, daysLeft,
      zone, expenseRatio, savingsRate, vaultContributionPct,
    };
  }, [snapshot]);

  const sortedCats = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories]
  );

  /* Filtered transactions (search + category + flow) */
  const txView = useMemo(() => {
    const allCategories = Array.from(
      new Set(transactions.map((t) => t.category))
    ).sort();

    const filtered = transactions.filter((t) => {
      const q = txSearch.trim().toLowerCase();
      if (q && !t.label.toLowerCase().includes(q)) return false;
      if (txCategory !== "All" && t.category !== txCategory) return false;
      if (txFlow === "Income" && t.flow !== "in") return false;
      if (txFlow === "Expenses" && t.flow !== "out") return false;
      return true;
    });

    const income = filtered
      .filter((t) => t.flow === "in")
      .reduce((s, t) => s + t.amount, 0);
    const expenses = filtered
      .filter((t) => t.flow === "out")
      .reduce((s, t) => s + t.amount, 0);
    const net = income - expenses;

    return {
      allCategories,
      rows: filtered,
      shownCount: filtered.length,
      totalCount: transactions.length,
      income,
      expenses,
      net,
    };
  }, [transactions, txSearch, txCategory, txFlow]);

  /* Pagination: 10 rows per page; reset to page 1 when filters change */
  const [txPage, setTxPage] = useState(1);
  useEffect(() => {
    setTxPage(1);
  }, [txSearch, txCategory, txFlow]);

  const txPagination = useMemo(() => {
    const total = txView.rows.length;
    const totalPages = Math.max(1, Math.ceil(total / TX_PAGE_SIZE));
    const current = Math.min(Math.max(1, txPage), totalPages);
    const start = total === 0 ? 0 : (current - 1) * TX_PAGE_SIZE + 1;
    const end = Math.min(total, current * TX_PAGE_SIZE);
    const pageRows = txView.rows.slice(start - 1, end);
    return { total, totalPages, current, start, end, pageRows };
  }, [txView.rows, txPage]);

  /* 6-month spending trend (income vs spending, ending at current snapshot) */
  const trend = useMemo(() => {
    const income = [...TREND_INCOME_BASE, snapshot?.income ?? 48200];
    const spending = [...TREND_SPENDING_BASE, snapshot?.spending ?? 31400];
    const avgIncome = income.reduce((s, v) => s + v, 0) / income.length;
    const avgSpending = spending.reduce((s, v) => s + v, 0) / spending.length;
    const avgSavings = avgIncome - avgSpending;
    const savingsRate = avgIncome > 0 ? (avgSavings / avgIncome) * 100 : 0;
    return { income, spending, avgIncome, avgSpending, avgSavings, savingsRate };
  }, [snapshot?.income, snapshot?.spending]);

  /* Spending-intensity heatmap (84 daily cells laid out as 7 rows × 12 weeks).
   * Each row = one day-of-week (Mon..Sun), each column = one week.
   * Data is generated once per mount via a seeded PRNG so it stays stable. */
  const heatmap = useMemo<HeatCell[]>(() => {
    const rand = mulberry32(20250319);
    // Anchor the start date to the Monday of the week 12 weeks ago so each row maps to the same weekday.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const jsDow = today.getDay();            // 0=Sun..6=Sat
    const daysSinceMon = (jsDow + 6) % 7;    // 0=Mon..6=Sun
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysSinceMon - (HEAT_WEEKS - 1) * 7);

    // Choose 3–4 spike-day indices (prefer weekdays so spikes read as work-day outliers).
    const spikeCount = 3 + Math.floor(rand() * 2);
    const spikeIdx = new Set<number>();
    let guard = 0;
    while (spikeIdx.size < spikeCount && guard++ < 50) {
      const w = Math.floor(rand() * HEAT_WEEKS);
      const d = Math.floor(rand() * 5); // 0..4 → Mon–Fri
      spikeIdx.add(d * HEAT_WEEKS + w);
    }

    const cells: HeatCell[] = [];
    for (let d = 0; d < HEAT_DAYS; d++) {
      for (let w = 0; w < HEAT_WEEKS; w++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + w * 7 + d);
        const isWeekend = d >= 5; // Sat / Sun
        const base = isWeekend ? 800 : 1500;
        const variance = isWeekend ? 400 : 800;
        const noise = (rand() * 2 - 1) * variance;
        let amount = Math.max(0, Math.round(base + noise));
        if (spikeIdx.has(d * HEAT_WEEKS + w)) {
          amount = 3000 + Math.round(rand() * 800); // 3000–3800
        }
        cells.push({
          amount,
          level: amountToLevel(amount),
          dateLabel: `${HEAT_DOW_SHORT[d]}, ${HEAT_MONTH_SHORT[date.getMonth()]} ${date.getDate()}`,
        });
      }
    }
    return cells;
  }, []);

  const heatStats = useMemo(() => {
    const amounts = heatmap.map((c) => c.amount);
    const sum = amounts.reduce((s, v) => s + v, 0);
    const avg = Math.round(sum / amounts.length);
    const max = Math.max(...amounts);
    const nonzero = amounts.filter((v) => v > 0);
    const minNonZero = nonzero.length ? Math.min(...nonzero) : 0;
    const active = heatmap.filter((c) => c.level > 0).length;
    return { avg, max, minNonZero, active };
  }, [heatmap]);

  async function submitExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !amount) return;
    setSubmitting(true);
    try {
      const amt = Number(amount);
      const today = new Date().toISOString();
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          date: today,
          category: category || "Other",
          amount: amt,
          flow: "out",
          tone: "br",
        }),
      });
      if (!res.ok) throw new Error("Failed to add expense");
      await load();
      toast({ title: "Expense added" });
      setLabel(""); setAmount(""); setCategory(""); setShowForm(false);
    } catch (err) {
      toast({ title: "Couldn't add expense", description: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* ─── Top row: spending meter + ratios ─── */}
      <div className="g32 mb2">
        {/* Spending meter */}
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-t">Spending meter</div>
              <div className="card-s">
                {formatINR(m.spending)} spent of {formatINR(m.income)} income
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className={m.zone.badge}>{m.zone.label}</span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowForm((v) => !v)}
                type="button"
              >
                <Icon name="plus" size={13} /> Add expense
              </button>
            </div>
          </div>

          {/* Inline add-expense form */}
          {showForm && (
            <form
              onSubmit={submitExpense}
              className="flux-surface-2"
              style={{
                display: "grid",
                gridTemplateColumns: "1.6fr 1fr 1.2fr auto",
                gap: 8,
                padding: 12,
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--bdr)",
                marginBottom: 16,
                alignItems: "end",
              }}
            >
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="label-sm">Label</span>
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Groceries"
                  required
                  style={inputStyle}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="label-sm">Amount (₹)</span>
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  required
                  style={inputStyle}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="label-sm">Category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Other</option>
                  {sortedCats.map((c: Category) => (
                    <option key={c.id} value={c.label}>{c.label}</option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ height: 34 }}
              >
                {submitting ? "Adding…" : "Submit"}
              </button>
            </form>
          )}

          {/* Body: ring + stat grid */}
          <div style={{ display: "flex", alignItems: "center", gap: 30, flexWrap: "wrap" }}>
            <div style={{ flexShrink: 0 }}>
              <ProgressRing
                value={m.pct}
                size={155}
                thickness={12}
                color={m.zone.ringColor}
                label={`${Math.round(m.pct)}%`}
                sublabel="spent"
              />
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              {/* 2x2 stat grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <StatTile label="Spent"        value={formatINR(m.spending)}     color="var(--red)" />
                <StatTile label="Remaining"    value={formatINR(m.remaining)}    color="var(--grn)" />
                <StatTile label="Daily target" value={formatINR(m.dailyTarget)}  color="var(--t1)" />
                <StatTile label="Days left"    value={String(m.daysLeft)}        color="var(--t1)" />
              </div>

              {/* Spending zone */}
              <div style={{ marginBottom: 8 }}>
                <div className="label-sm" style={{ marginBottom: 6 }}>Spending zone</div>
                <div className="zone-bar" style={{ marginBottom: 5 }}>
                  <div className="zs zs-safe" />
                  <div className="zs zs-mod" />
                  <div className="zs zs-risk" />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--t3)", marginBottom: 6 }}>
                  <span>Safe &lt;50%</span>
                  <span>Moderate 50-70%</span>
                  <span>Risk &gt;70%</span>
                </div>
              </div>

              {/* Insight */}
              <div className="ins ins-amb" style={{ margin: 0 }}>
                <div className="ins-h">
                  You are in {m.zone.name} at {Math.round(m.pct)}%
                </div>
                <div className="ins-b">
                  Spend no more than <strong>{formatINR(m.dailyTarget)}/day</strong> to
                  finish in the Safe zone with {m.daysLeft} days remaining.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right stack: ratios + recommended action */}
        <div className="stack">
          <div className="card card-sm">
            <div className="card-t" style={{ marginBottom: 12 }}>Financial ratios</div>
            <RatioRow label="Expense ratio"     value={`${Math.round(m.expenseRatio)}%`}    color="var(--amb)" />
            <RatioRow label="Savings rate"      value={`${Math.round(m.savingsRate)}%`}     color="var(--grn)" />
            <RatioRow label="Vault contribution" value={`${m.vaultContributionPct}%`}       color="var(--teal)" />
            <RatioRow label="Target ratio"      value="≤60%"                                  color="var(--t3)" />
          </div>

          <MonthOverMonth
            thisMonth={m.spending}
            lastMonth={30000}
            thisLabel={snapshot?.monthShort ?? "Mar"}
            lastLabel="Feb"
          />

          <div className="ins ins-acc" style={{ margin: 0, padding: "12px 14px" }}>
            <div className="ins-h">Recommended action</div>
            <div className="ins-b">Review category pressure and log anything still missing.</div>
          </div>
        </div>
      </div>

      {/* ─── Category breakdown ─── */}
      <div className="card mb2">
        <div className="card-h">
          <div>
            <div className="card-t">Category breakdown</div>
            <div className="card-s">{snapshot?.monthLabel ?? ""} spending vs monthly limits</div>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Spent</th>
              <th>Limit</th>
              <th style={{ width: "38%" }}>Usage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedCats.map((c: Category, i: number) => {
              const usagePct = c.limit > 0 ? Math.min(100, (c.spent / c.limit) * 100) : 0;
              const fill = toneFill(c.tone);
              const status = statusFor(c.spent, c.limit);
              return (
                <tr key={c.id} style={i % 2 === 0 ? { background: "var(--surf2)" } : undefined}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        className="li-icon"
                        style={{
                          width: 26, height: 26, borderRadius: 7,
                          background: "var(--bg3)", color: "var(--t2)",
                        }}
                      >
                        <Icon name={c.icon} size={14} />
                      </span>
                      <span className="td-m">{c.label}</span>
                    </div>
                  </td>
                  <td className="td-n">{formatINR(c.spent)}</td>
                  <td className="td-n">{formatINR(c.limit)}</td>
                  <td>
                    <div className="prog" style={{ height: 6 }}>
                      <div
                        className={fill.className}
                        style={{
                          width: `${usagePct}%`,
                          ...(fill.color ? { background: fill.color } : {}),
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <span className={status.cls}>{status.label}</span>
                  </td>
                </tr>
              );
            })}
            {sortedCats.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--t3)", padding: 24 }}>
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Daily spending chart ─── */}
      <div className="card mb2">
        <div className="card-h">
          <div>
            <div className="card-t">Daily spending</div>
            <div className="card-s">Daily pace</div>
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 11, alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--t3)" }}>
              <span style={{ width: 12, height: 0, borderTop: "2px dashed var(--acc)", display: "inline-block" }} />
              <span>Daily target</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--t3)" }}>
              <span style={{ width: 12, height: 2, background: "var(--amb)", borderRadius: 2, display: "inline-block" }} />
              <span>Daily spend</span>
            </span>
          </div>
        </div>
        <LineChart
          height={165}
          labels={DAILY_LABELS}
          formatVal={(n) => formatINR(n, { compact: true })}
          lines={[
            { data: DAILY_SERIES, color: "amb", label: "Daily spend" },
            {
              data: DAILY_SERIES.map(() => Math.round(m.dailyTarget)),
              color: "acc",
              label: "Daily target",
              dashed: true,
            },
          ]}
        />
      </div>

      {/* ─── 6-month spending trend ─── */}
      <div className="card mb2">
        <div className="card-h">
          <div>
            <div className="card-t">6-month spending trend</div>
            <div className="card-s">Income vs spending over the last 6 months</div>
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 11, alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--t3)" }}>
              <span style={{ width: 12, height: 2, background: "var(--acc)", borderRadius: 2, display: "inline-block" }} />
              <span>Income</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--t3)" }}>
              <span style={{ width: 12, height: 2, background: "var(--red)", borderRadius: 2, display: "inline-block" }} />
              <span>Spending</span>
            </span>
          </div>
        </div>

        <LineChart
          height={180}
          labels={TREND_LABELS}
          formatVal={(n) => formatINR(n, { compact: true })}
          lines={[
            { data: trend.income, color: "acc", label: "Income" },
            { data: trend.spending, color: "red", label: "Spending" },
          ]}
        />

        {/* 3-col stat callouts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 16 }}>
          <StatTile label="6-mo avg income"   value={formatINR(trend.avgIncome, { compact: true })}   color="var(--acc)" />
          <StatTile label="6-mo avg spending" value={formatINR(trend.avgSpending, { compact: true })} color="var(--red)" />
          <StatTile label="6-mo avg savings"  value={formatINR(trend.avgSavings, { compact: true })}  color="var(--grn)" />
        </div>

        {/* Savings-rate insight */}
        <div className={`ins ${trend.savingsRate >= 20 ? "ins-grn" : "ins-amb"}`} style={{ margin: "14px 0 0" }}>
          <div className="ins-h">
            Your savings rate over 6 months is {Math.round(trend.savingsRate)}%
          </div>
          <div className="ins-b">
            Averaging <strong>{formatINR(trend.avgSavings, { compact: true })}</strong> saved per month
            ({formatINR(trend.avgIncome, { compact: true })} income − {formatINR(trend.avgSpending, { compact: true })} spending).
          </div>
        </div>
      </div>

      {/* ─── Spending intensity heatmap ─── */}
      <div className="card mb2">
        <div className="card-h">
          <div>
            <div className="card-t">Spending intensity</div>
            <div className="card-s">Last 12 weeks · darker = higher spend</div>
          </div>
        </div>

        {/* Heatmap area: day labels (left) + cells grid + week labels (bottom) */}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          {/* Day-of-week labels column (Mon / Wed / Fri only) */}
          <div
            className="flux-heat-grid"
            style={{
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
              width: 28,
              fontSize: 9,
              color: "var(--t3)",
            }}
          >
            {HEAT_DAY_LABELS.map((l, i) => (
              <div
                key={i}
                className="flux-heat-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: 4,
                  whiteSpace: "nowrap",
                }}
              >
                {l}
              </div>
            ))}
          </div>

          {/* Cells grid + week labels */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* 7 rows × 12 weeks heatmap */}
            <div
              className="flux-heat-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(12, 1fr)",
              }}
            >
              {heatmap.map((c, i) => (
                <div
                  key={i}
                  className={`hcell-${c.level} flux-heat-cell`}
                  title={`${c.dateLabel}: ${formatINR(c.amount)}`}
                  style={{ justifySelf: "center" }}
                />
              ))}
            </div>

            {/* Week labels along the bottom */}
            <div
              className="flux-heat-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(12, 1fr)",
                marginTop: 6,
                fontSize: 9,
                color: "var(--t3)",
              }}
            >
              {HEAT_WEEK_LABELS.map((l, i) => (
                <div key={i} style={{ textAlign: "center", whiteSpace: "nowrap" }}>{l}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend row: Less + 6 swatches + More */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 14,
            fontSize: 10,
            color: "var(--t3)",
          }}
        >
          <span>Less</span>
          {[0, 1, 2, 3, 4, 5].map((l) => (
            <div key={l} className={`hcell-${l} flux-heat-cell`} />
          ))}
          <span>More</span>
        </div>

        {/* 4 stat callouts */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
            marginTop: 16,
          }}
        >
          <StatTile label="Avg daily spend" value={formatINR(heatStats.avg)} color="var(--t1)" />
          <StatTile label="Highest day"     value={formatINR(heatStats.max)}       color="var(--red)" />
          <StatTile label="Lowest day"      value={formatINR(heatStats.minNonZero)} color="var(--grn)" />
          <StatTile label="Active days"     value={String(heatStats.active)}        color="var(--acc)" />
        </div>
      </div>

      {/* ─── All transactions ─── */}
      <div className="card card-flush">
        <div style={{ padding: "18px 18px 0" }}>
          <div className="card-h" style={{ marginBottom: 0 }}>
            <div>
              <div className="card-t">All transactions</div>
              <div className="card-s">Search and filter your spending</div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              type="button"
              onClick={() => setShowForm((v) => !v)}
            >
              <Icon name="plus" size={13} /> Add expense
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div
          style={{
            padding: "12px 18px",
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
            borderTop: "1px solid var(--bdr)",
            borderBottom: "1px solid var(--bdr)",
            marginTop: 13,
            background: "var(--surf2)",
          }}
        >
          {/* Search input */}
          <div style={{ position: "relative", flex: "1 1 220px", minWidth: 200 }}>
            <span
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--t3)",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Icon name="search" size={14} />
            </span>
            <input
              type="text"
              value={txSearch}
              onChange={(e) => setTxSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search transactions…"
              aria-label="Search transactions"
              style={{
                ...inputStyle,
                width: "100%",
                paddingLeft: 32,
                fontFamily: "var(--font-sans)",
                borderColor: searchFocused ? "var(--acc)" : "var(--bdr)",
                boxShadow: searchFocused ? "0 0 0 3px var(--accd)" : "none",
              }}
            />
          </div>

          {/* Category filter pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            <FilterPill label="All" active={txCategory === "All"} onClick={() => setTxCategory("All")} />
            {txView.allCategories.map((cat) => (
              <FilterPill
                key={cat}
                label={cat}
                active={txCategory === cat}
                onClick={() => setTxCategory(cat)}
              />
            ))}
          </div>

          {/* Flow filter */}
          <div style={{ display: "flex", gap: 5 }}>
            {(["All", "Income", "Expenses"] as const).map((f) => (
              <FilterPill
                key={f}
                label={f}
                active={txFlow === f}
                onClick={() => setTxFlow(f)}
              />
            ))}
          </div>
        </div>

        {/* Table */}
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
            {txPagination.pageRows.map((t: Tx, i: number) => (
              <tr key={t.id} style={i % 2 === 0 ? { background: "var(--surf2)" } : undefined}>
                <td className="td-m">{t.label}</td>
                <td>{formatTxDate(t.date)}</td>
                <td>
                  <span className={txCategoryBadge(t.category)}>{t.category}</span>
                </td>
                <td
                  className="td-n"
                  style={{ textAlign: "right", color: txAmountColor(t.flow) }}
                >
                  {txAmountSign(t.flow)}{formatINR(Math.abs(t.amount))}
                </td>
              </tr>
            ))}
            {txPagination.total === 0 && (
              <tr>
                <td
                  colSpan={4}
                  style={{ textAlign: "center", color: "var(--t3)", padding: 28 }}
                >
                  No transactions match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination + totals footer */}
        <div
          className="flux-surface-2"
          style={{
            padding: "12px 18px",
            borderTop: "1px solid var(--bdr)",
            fontSize: 11.5,
            color: "var(--t3)",
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 16px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left: showing-range + totals */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 8px", alignItems: "center" }}>
            <span>
              Showing{" "}
              <span className="flux-mono" style={{ color: "var(--t1)", fontWeight: 600 }}>
                {txPagination.start}–{txPagination.end}
              </span>{" "}
              of{" "}
              <span className="flux-mono" style={{ color: "var(--t1)", fontWeight: 600 }}>
                {txPagination.total}
              </span>{" "}
              transactions
            </span>
            <span style={{ color: "var(--t4)" }}>·</span>
            <span>
              Total:{" "}
              <span className="flux-mono" style={{ color: "var(--grn)", fontWeight: 600 }}>
                +{formatINR(txView.income, { compact: true })}
              </span>
              <span style={{ margin: "0 4px" }}>(income) /</span>
              <span className="flux-mono" style={{ color: "var(--red)", fontWeight: 600 }}>
                −{formatINR(txView.expenses, { compact: true })}
              </span>
              <span style={{ margin: "0 4px" }}>(expenses) /</span>
              <span
                className="flux-mono"
                style={{
                  color: txView.net >= 0 ? "var(--grn)" : "var(--red)",
                  fontWeight: 600,
                }}
              >
                {txView.net >= 0 ? "+" : "−"}
                {formatINR(Math.abs(txView.net), { compact: true })}
              </span>
              <span style={{ marginLeft: 4 }}>(net)</span>
            </span>
          </div>

          {/* Right: prev / page indicator / next */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setTxPage((p) => Math.max(1, p - 1))}
              disabled={txPagination.current <= 1}
              style={txPagination.current <= 1 ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
            >
              <span style={{ display: "inline-flex", transform: "rotate(180deg)" }}>
                <Icon name="chevron" size={12} />
              </span>{" "}
              Prev
            </button>
            <span
              className="flux-mono"
              style={{ fontSize: 11.5, color: "var(--t2)", fontWeight: 600, whiteSpace: "nowrap" }}
            >
              Page {txPagination.current} of {txPagination.totalPages}
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setTxPage((p) => Math.min(txPagination.totalPages, p + 1))}
              disabled={txPagination.current >= txPagination.totalPages}
              style={txPagination.current >= txPagination.totalPages ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
            >
              Next{" "}
              <Icon name="chevron" size={12} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Filter pill button (used in transactions filter bar) ─── */
function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`badge ${active ? "bl" : "bk"}`}
      onClick={onClick}
      style={{ cursor: "pointer", border: "none" }}
    >
      {label}
    </button>
  );
}

/* ─── Month-over-month mini comparison card ─── */
function MonthOverMonth({
  thisMonth,
  lastMonth,
  thisLabel,
  lastLabel,
}: {
  thisMonth: number;
  lastMonth: number;
  thisLabel: string;
  lastLabel: string;
}) {
  const delta = thisMonth - lastMonth;
  const pctDelta = lastMonth > 0 ? (delta / lastMonth) * 100 : 0;
  const isFlat = delta === 0;
  const isDown = delta < 0;
  const maxBar = Math.max(thisMonth, lastMonth, 1);
  const hThis = Math.max(10, Math.round((thisMonth / maxBar) * 96));
  const hLast = Math.max(10, Math.round((lastMonth / maxBar) * 96));
  const deltaColor = isFlat ? "var(--t3)" : isDown ? "var(--grn)" : "var(--red)";
  const deltaBg = isFlat ? "var(--bg3)" : isDown ? "var(--grnd)" : "var(--redd)";

  return (
    <div className="card card-sm">
      <div className="card-t" style={{ marginBottom: 4 }}>Month-over-month</div>
      <div className="card-s" style={{ marginBottom: 12 }}>Spending vs last month</div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
        <span
          className="flux-mono"
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "var(--t1)",
            letterSpacing: "-.02em",
          }}
        >
          {formatINR(thisMonth, { compact: true })}
        </span>
        <span
          className="flux-mono"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            fontSize: 11,
            fontWeight: 700,
            color: deltaColor,
            background: deltaBg,
            padding: "2px 7px",
            borderRadius: 100,
          }}
        >
          <Icon name={isFlat ? "info" : isDown ? "down" : "up"} size={11} />
          {isFlat ? "0%" : `${Math.abs(Math.round(pctDelta))}%`}
        </span>
      </div>
      <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 14 }}>
        vs {formatINR(lastMonth, { compact: true })} in {lastLabel}
      </div>

      {/* 2-bar mini comparison */}
      <div
        style={{
          display: "flex",
          alignItems: "end",
          justifyContent: "center",
          gap: 24,
          height: 110,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            flex: "0 0 56px",
          }}
        >
          <div
            className="flux-mono"
            style={{ fontSize: 10.5, fontWeight: 600, color: "var(--t2)" }}
          >
            {formatINR(lastMonth, { compact: true })}
          </div>
          <div
            style={{
              width: "100%",
              height: hLast,
              background: "var(--bg3)",
              borderRadius: "6px 6px 0 0",
            }}
          />
          <div className="label-sm" style={{ marginBottom: 0 }}>{lastLabel}</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            flex: "0 0 56px",
          }}
        >
          <div
            className="flux-mono"
            style={{ fontSize: 10.5, fontWeight: 600, color: "var(--amb)" }}
          >
            {formatINR(thisMonth, { compact: true })}
          </div>
          <div
            style={{
              width: "100%",
              height: hThis,
              background: "var(--amb)",
              borderRadius: "6px 6px 0 0",
            }}
          />
          <div className="label-sm" style={{ marginBottom: 0 }}>{thisLabel}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Small subcomponents ─── */

const inputStyle: React.CSSProperties = {
  height: 34,
  padding: "0 10px",
  background: "var(--surf)",
  border: "1px solid var(--bdr)",
  borderRadius: "var(--radius-md)",
  color: "var(--t1)",
  fontSize: 12.5,
  fontFamily: "var(--font-mono)",
  outline: "none",
};

function StatTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        padding: "11px 13px",
        background: "var(--surf2)",
        border: "1px solid var(--bdr)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <div className="label-sm" style={{ marginBottom: 3 }}>{label}</div>
      <div
        className="flux-mono"
        style={{ fontSize: 18, fontWeight: 600, color }}
      >
        {value}
      </div>
    </div>
  );
}

function RatioRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="sr" style={{ padding: "9px 0" }}>
      <span style={{ fontSize: 12.5, color: "var(--t2)" }}>{label}</span>
      <span
        className="flux-mono"
        style={{ fontSize: 13.5, fontWeight: 600, color }}
      >
        {value}
      </span>
    </div>
  );
}
