"use client";

import { useEffect, useMemo, useState } from "react";
import { useFlux, formatINR } from "@/store/flux-store";
import { LineChart } from "@/components/flux/charts";
import { Icon } from "@/components/flux/icon";
import { CountUp } from "@/components/flux/markdown";
import { useToast } from "@/hooks/use-toast";

interface WhatIfMonth {
  month: number;
  income: number;
  spending: number;
  surplus: number;
  vaultDeposit: number;
  vaultBalance: number;
  runwayMonths: number;
  cumulativeSaved: number;
}

interface WhatIfResult {
  months: WhatIfMonth[];
  finalVault: number;
  finalRunway: number;
  totalSaved: number;
  totalVaultContrib: number;
  netWorthDelta: number;
  verdict: "improved" | "stable" | "risky";
  comparison: {
    baselineRunway: number;
    scenarioRunway: number;
    runwayDelta: number;
    baselineVault: number;
    scenarioVault: number;
    vaultDelta: number;
  };
}

const VERDICT_META = {
  improved: { label: "Improved", tone: "bg" as const, icon: "up", body: "Your changes strengthen your runway and vault. Safe to proceed." },
  stable: { label: "Stable", tone: "ba" as const, icon: "check", body: "Your runway holds roughly steady. Minor impact either way." },
  risky: { label: "Risky", tone: "br" as const, icon: "warn", body: "This scenario erodes your safety net. Consider adjusting." },
};

export function SimulatorView() {
  const snapshot = useFlux((s) => s.snapshot);
  const { toast } = useToast();

  // scenario inputs
  const [incomeChange, setIncomeChange] = useState(15); // +15%
  const [spendingChange, setSpendingChange] = useState(-5); // -5%
  const [vaultRate, setVaultRate] = useState(40); // 40% of surplus
  const [horizon, setHorizon] = useState(6); // 6 months

  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [loading, setLoading] = useState(false);

  // debounced auto-run
  useEffect(() => {
    if (!snapshot) return;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/whatif", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentIncome: snapshot.income,
            currentSpending: snapshot.spending,
            vaultBalance: snapshot.vaultBalance,
            baselineNeed: snapshot.baselineNeed,
            incomeChangePct: incomeChange,
            spendingChangePct: spendingChange,
            vaultContributionPct: vaultRate,
            horizonMonths: horizon,
          }),
        });
        if (!res.ok) throw new Error("sim failed");
        const data = (await res.json()) as WhatIfResult;
        setResult(data);
      } catch {
        /* swallow */
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [snapshot, incomeChange, spendingChange, vaultRate, horizon]);

  const m = useMemo(() => {
    if (!snapshot) return { newIncome: 0, newSpending: 0, surplus: 0, monthlyNet: 0 };
    const newIncome = snapshot.income * (1 + incomeChange / 100);
    const newSpending = snapshot.spending * (1 + spendingChange / 100);
    return {
      newIncome,
      newSpending,
      surplus: newIncome - newSpending,
      monthlyNet: (newIncome - newSpending) * horizon,
    };
  }, [snapshot, incomeChange, spendingChange, horizon]);

  const verdict = result ? VERDICT_META[result.verdict] : null;

  // chart series
  const chartLabels = result?.months.map((x) => `M${x.month}`) ?? [];
  const vaultSeries = result?.months.map((x) => x.vaultBalance) ?? [];
  const baselineVaultSeries = result
    ? Array.from({ length: result.months.length }, (_, i) => result.comparison.baselineVault * ((i + 1) / result.months.length) * 0.6 + (snapshot?.vaultBalance ?? 0) * 0.4)
    : [];
  const runwaySeries = result?.months.map((x) => x.runwayMonths) ?? [];

  function preset(name: string, inc: number, spd: number, vr: number) {
    setIncomeChange(inc);
    setSpendingChange(spd);
    setVaultRate(vr);
    toast({ title: `Preset applied: ${name}`, description: "Sliders updated — see the projection update live." });
  }

  function reset() {
    setIncomeChange(0);
    setSpendingChange(0);
    setVaultRate(40);
    setHorizon(6);
    toast({ title: "Scenario reset" });
  }

  if (!snapshot) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--t3)" }}>
        Loading your financial snapshot…
      </div>
    );
  }

  return (
    <>
      {/* ─── Banner: scenario outcome ─── */}
      <div className="runway-card mb2" style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap", padding: "24px 28px" }}>
        <div style={{ position: "relative", zIndex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "rgba(255,255,255,.6)", marginBottom: 6 }}>
            Scenario outcome
          </div>
          <div className="flux-mono" style={{ fontSize: 36, fontWeight: 600, color: "#fff", lineHeight: 1, letterSpacing: "-.035em" }}>
            {result ? `${result.finalRunway.toFixed(1)} mo` : "—"}
          </div>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.55)", marginTop: 5 }}>
            runway after {horizon} months
          </div>
        </div>
        <div style={{ width: 1, height: 52, background: "rgba(255,255,255,.15)", flexShrink: 0, position: "relative", zIndex: 1 }} />
        <div style={{ display: "flex", gap: 12, position: "relative", zIndex: 1, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center", padding: "12px 20px", background: "rgba(255,255,255,.12)", borderRadius: 10 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>Δ Runway</div>
            <div className="flux-mono" style={{ fontSize: 24, fontWeight: 600, color: result ? (result.comparison.runwayDelta >= 0 ? "#7bed9f" : "#ffa3a3") : "#fff", transition: "color .25s" }}>
              {result ? `${result.comparison.runwayDelta >= 0 ? "+" : ""}${result.comparison.runwayDelta.toFixed(1)} mo` : "—"}
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "12px 20px", background: "rgba(255,255,255,.12)", borderRadius: 10 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>Δ Vault</div>
            <div className="flux-mono" style={{ fontSize: 24, fontWeight: 600, color: result ? (result.comparison.vaultDelta >= 0 ? "#7bed9f" : "#ffa3a3") : "#fff", transition: "color .25s" }}>
              {result ? `${result.comparison.vaultDelta >= 0 ? "+" : ""}${formatINR(result.comparison.vaultDelta, { compact: true })}` : "—"}
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "12px 20px", background: "rgba(255,255,255,.12)", borderRadius: 10 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>Net saved</div>
            <div className="flux-mono" style={{ fontSize: 24, fontWeight: 600, color: "#fff", transition: "color .25s" }}>
              {result ? formatINR(result.totalSaved, { compact: true }) : "—"}
            </div>
          </div>
        </div>
        <div style={{ marginLeft: "auto", position: "relative", zIndex: 1 }}>
          {verdict && (
            <span className={`badge ${verdict.tone}`} style={{ fontSize: 13, padding: "6px 14px" }}>
              <Icon name={verdict.icon} size={13} /> {verdict.label}
            </span>
          )}
        </div>
      </div>

      {/* ─── KPI mini-tiles row ─── */}
      <div className="g4 mb2">
        <div className="kpi-mini">
          <div className="kpi-mini-lbl">New monthly income</div>
          <CountUp className="kpi-mini-val" value={m.newIncome} format={(n) => formatINR(n, { compact: true })} />
        </div>
        <div className="kpi-mini">
          <div className="kpi-mini-lbl">New monthly spend</div>
          <CountUp className="kpi-mini-val" value={m.newSpending} format={(n) => formatINR(n, { compact: true })} />
        </div>
        <div className="kpi-mini">
          <div className="kpi-mini-lbl">Monthly surplus</div>
          <CountUp className="kpi-mini-val" value={m.surplus} format={(n) => formatINR(n, { compact: true })} />
        </div>
        <div className="kpi-mini">
          <div className="kpi-mini-lbl">Horizon total</div>
          <CountUp className="kpi-mini-val" value={m.monthlyNet} format={(n) => formatINR(n, { compact: true })} />
        </div>
      </div>

      {/* ─── Config + verdict ─── */}
      <div className="g32 mb2">
        {/* Config card */}
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-t">Scenario controls</div>
              <div className="card-s">Every change updates the projection live</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={reset} type="button">
              <Icon name="refresh" size={12} /> Reset
            </button>
          </div>

          {/* Income change */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 9 }}>
              <label className="label-sm" style={{ margin: 0 }}>Income change</label>
              <span className="flux-mono" style={{ fontSize: 24, fontWeight: 600, color: incomeChange >= 0 ? "var(--grn)" : "var(--red)" }}>
                {incomeChange >= 0 ? "+" : ""}{incomeChange}%
              </span>
            </div>
            <input type="range" min={-50} max={100} step={5} value={incomeChange} onChange={(e) => setIncomeChange(Number(e.target.value))} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--t3)", marginTop: 4 }}>
              <span>−50%</span><span>0%</span><span>+100%</span>
            </div>
          </div>

          <div className="div" />

          {/* Spending change */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 9 }}>
              <label className="label-sm" style={{ margin: 0 }}>Spending change</label>
              <span className="flux-mono" style={{ fontSize: 24, fontWeight: 600, color: spendingChange <= 0 ? "var(--grn)" : "var(--red)" }}>
                {spendingChange >= 0 ? "+" : ""}{spendingChange}%
              </span>
            </div>
            <input type="range" min={-50} max={100} step={5} value={spendingChange} onChange={(e) => setSpendingChange(Number(e.target.value))} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--t3)", marginTop: 4 }}>
              <span>−50%</span><span>0%</span><span>+100%</span>
            </div>
          </div>

          <div className="div" />

          {/* Vault rate */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 9 }}>
              <label className="label-sm" style={{ margin: 0 }}>Vault contribution</label>
              <span className="flux-mono" style={{ fontSize: 24, fontWeight: 600, color: "var(--teal)" }}>{vaultRate}%</span>
            </div>
            <input type="range" min={0} max={100} step={5} value={vaultRate} onChange={(e) => setVaultRate(Number(e.target.value))} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--t3)", marginTop: 4 }}>
              <span>0%</span><span>40% (default)</span><span>100%</span>
            </div>
          </div>

          <div className="div" />

          {/* Horizon */}
          <div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 9 }}>
              <label className="label-sm" style={{ margin: 0 }}>Horizon</label>
              <span className="flux-mono" style={{ fontSize: 24, fontWeight: 600 }}>{horizon} mo</span>
            </div>
            <input type="range" min={1} max={12} step={1} value={horizon} onChange={(e) => setHorizon(Number(e.target.value))} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--t3)", marginTop: 4 }}>
              <span>1 mo</span><span>6 mo</span><span>12 mo</span>
            </div>
          </div>
        </div>

        {/* Right stack: presets + verdict */}
        <div className="stack">
          <div className="card card-sm">
            <div className="card-t" style={{ marginBottom: 10 }}>Quick presets</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: "space-between" }} onClick={() => preset("Raise rates 20%", 20, 0, 40)} type="button">
                <span><Icon name="up" size={12} /> Raise rates +20%</span>
                <span style={{ color: "var(--grn)", fontFamily: "var(--font-mono)" }}>+20% income</span>
              </button>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: "space-between" }} onClick={() => preset("Cut spending 15%", 0, -15, 50)} type="button">
                <span><Icon name="down" size={12} /> Cut spending 15%</span>
                <span style={{ color: "var(--grn)", fontFamily: "var(--font-mono)" }}>−15% spend</span>
              </button>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: "space-between" }} onClick={() => preset("Aggressive saver", 0, -10, 80)} type="button">
                <span><Icon name="piggy" size={12} /> Aggressive saver</span>
                <span style={{ color: "var(--teal)", fontFamily: "var(--font-mono)" }}>80% to vault</span>
              </button>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: "space-between" }} onClick={() => preset("Lean season", -25, -10, 20)} type="button">
                <span><Icon name="warn" size={12} /> Lean season</span>
                <span style={{ color: "var(--red)", fontFamily: "var(--font-mono)" }}>−25% income</span>
              </button>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: "space-between" }} onClick={() => preset("Freelance surge", 40, 10, 50)} type="button">
                <span><Icon name="peak" size={12} /> Freelance surge</span>
                <span style={{ color: "var(--acc)", fontFamily: "var(--font-mono)" }}>+40% income</span>
              </button>
            </div>
          </div>

          {verdict && result && (
            <div className={`ins ins-${verdict.tone === "bg" ? "grn" : verdict.tone === "ba" ? "amb" : "red"}`} style={{ margin: 0 }}>
              <div className="ins-h" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name={verdict.icon} size={12} /> {verdict.label} scenario
              </div>
              <div className="ins-b">{verdict.body}</div>
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--bdr)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 9.5, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 700 }}>Baseline runway</div>
                  <div className="flux-mono" style={{ fontSize: 14, fontWeight: 600 }}>{result.comparison.baselineRunway.toFixed(1)} mo</div>
                </div>
                <div>
                  <div style={{ fontSize: 9.5, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 700 }}>Scenario runway</div>
                  <div className="flux-mono" style={{ fontSize: 14, fontWeight: 600, color: result.comparison.runwayDelta >= 0 ? "var(--grn)" : "var(--red)" }}>{result.comparison.scenarioRunway.toFixed(1)} mo</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Projection chart ─── */}
      <div className="card mb2">
        <div className="card-h">
          <div>
            <div className="card-t">Vault & runway projection</div>
            <div className="card-s">Over {horizon} months under the scenario</div>
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 11, alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--t3)" }}>
              <span style={{ width: 14, height: 2, background: "var(--teal)", display: "inline-block", borderRadius: 3 }} /> Vault (scenario)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--t3)" }}>
              <span style={{ width: 14, height: 2, background: "var(--t3)", display: "inline-block", borderRadius: 3, opacity: 0.5 }} /> Vault (baseline)
            </span>
          </div>
        </div>
        {loading && !result ? (
          <div className="skeleton" style={{ height: 200 }} />
        ) : (
          <LineChart
            height={200}
            labels={chartLabels}
            lines={[
              { data: vaultSeries, color: "teal", label: "Vault (scenario)" },
              { data: baselineVaultSeries, color: "t1", label: "Vault (baseline)", dashed: true },
            ]}
            formatVal={(n) => formatINR(n, { compact: true })}
          />
        )}
      </div>

      {/* ─── Monthly breakdown table ─── */}
      <div className="card card-flush">
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--bdr)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="card-t">Monthly breakdown</div>
            <div className="card-s">How each month plays out under the scenario</div>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Income</th>
              <th>Spending</th>
              <th>Surplus</th>
              <th>Vault Δ</th>
              <th>Vault balance</th>
              <th>Runway</th>
            </tr>
          </thead>
          <tbody>
            {result?.months.map((mo) => (
              <tr key={mo.month}>
                <td className="td-m">Month {mo.month}</td>
                <td className="td-n" style={{ color: "var(--grn)" }}>{formatINR(mo.income, { compact: true })}</td>
                <td className="td-n" style={{ color: "var(--red)" }}>{formatINR(mo.spending, { compact: true })}</td>
                <td className="td-n" style={{ color: mo.surplus >= 0 ? "var(--grn)" : "var(--red)" }}>
                  {mo.surplus >= 0 ? "+" : ""}{formatINR(mo.surplus, { compact: true })}
                </td>
                <td className="td-n" style={{ color: mo.vaultDeposit >= 0 ? "var(--teal)" : "var(--red)" }}>
                  {mo.vaultDeposit >= 0 ? "+" : ""}{formatINR(mo.vaultDeposit, { compact: true })}
                </td>
                <td className="td-n" style={{ color: "var(--teal)" }}>{formatINR(mo.vaultBalance, { compact: true })}</td>
                <td className="td-n" style={{ color: "var(--acc)" }}>{mo.runwayMonths.toFixed(1)} mo</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
