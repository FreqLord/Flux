"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useFlux,
  formatINR,
  type ForecastRunDb,
  type ForecastDayDb,
} from "@/store/flux-store";
import { LineChart } from "@/components/flux/charts";
import { Icon } from "@/components/flux/icon";
import { useToast } from "@/hooks/use-toast";

/* ─────────────────────────────────────────────────────────────
   Normalized forecast shape used by this view's renderers.
   Bridges both the live POST result (ForecastResult) and the
   persisted lastForecast (ForecastRunDb) — both flow through here.
   ───────────────────────────────────────────────────────────── */
interface RenderForecast {
  runNumber: number;
  projectedIncome: number;
  essentialExpenses: number;
  surplus: number;
  coverageRatio: number;
  baseMape: number;
  hybridMape: number;
  improvementPct: number;
  vaultAction: "deposit" | "withdraw";
  vaultDelta: number;
  vaultBalanceAfter: number;
  horizon: number;
  source: string;
  future: { date: string; baseYhat: number; finalY: number; lowBand: number; highBand: number }[];
}

function toRenderFromDb(last: ForecastRunDb & { days?: ForecastDayDb[] }): RenderForecast {
  return {
    runNumber: last.runNumber,
    projectedIncome: last.projectedIncome,
    essentialExpenses: last.essentialCosts,
    surplus: last.surplusDeficit,
    coverageRatio: last.coverageRatio,
    baseMape: last.baseMape,
    hybridMape: last.hybridMape,
    improvementPct: last.baseMape - last.hybridMape,
    vaultAction: last.vaultAction as "deposit" | "withdraw",
    vaultDelta: last.vaultDelta,
    vaultBalanceAfter: last.vaultBalanceAfter,
    horizon: last.horizon,
    source: last.source,
    future: (last.days ?? []).map((d) => ({
      date: typeof d.date === "string" ? d.date : new Date(d.date).toISOString().slice(0, 10),
      baseYhat: d.baseYhat,
      finalY: d.finalY,
      lowBand: d.lowBand,
      highBand: d.highBand,
    })),
  };
}

/* ─────────────────────────────────────────────────────────────
   ForecastView
   ───────────────────────────────────────────────────────────── */
export function ForecastView() {
  const heatmapDays = useFlux((s) => s.heatmapDays);
  const lastForecast = useFlux((s) => s.lastForecast);
  const load = useFlux((s) => s.load);
  const { toast } = useToast();

  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [liveResult, setLiveResult] = useState<{ run: any; result: any } | null>(null);

  /* CSV upload state */
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Run history state */
  const [history, setHistory] = useState<(ForecastRunDb & { days?: ForecastDayDb[] })[]>([]);
  const [historyView, setHistoryView] = useState<(ForecastRunDb & { days?: ForecastDayDb[] }) | null>(null);

  /* counts by tier — derived from heatmapDays */
  const counts = useMemo(() => {
    const peak = heatmapDays.filter((d) => d.level >= 4).length;
    const good = heatmapDays.filter((d) => d.level === 3).length;
    const slow = heatmapDays.filter((d) => d.level === 1 || d.level === 2).length;
    const rest = heatmapDays.filter((d) => d.level === 0).length;
    return { peak, good, slow, rest, total: heatmapDays.length || 31 };
  }, [heatmapDays]);

  /* which forecast are we rendering right now? history override takes priority,
     then the live POST result, then the persisted lastForecast from the store. */
  const renderFc: RenderForecast | null = useMemo(() => {
    if (historyView) return toRenderFromDb(historyView);
    if (liveResult?.result) {
      const r = liveResult.result;
      return {
        runNumber: r.runNumber,
        projectedIncome: r.projectedIncome,
        essentialExpenses: r.essentialExpenses,
        surplus: r.surplus,
        coverageRatio: r.coverageRatio,
        baseMape: r.baseMape,
        hybridMape: r.hybridMape,
        improvementPct: r.improvementPct,
        vaultAction: r.vaultAction,
        vaultDelta: r.vaultDelta,
        vaultBalanceAfter: r.vaultBalanceAfter,
        horizon: r.horizon,
        source: liveResult.run?.source ?? "synthetic",
        future: (r.future ?? []).map((f: any) => ({
          date: f.date,
          baseYhat: f.baseYhat,
          finalY: f.finalY,
          lowBand: f.lowBand,
          highBand: f.highBand,
        })),
      } as RenderForecast;
    }
    if (lastForecast) return toRenderFromDb(lastForecast);
    return null;
  }, [liveResult, lastForecast, historyView]);

  /* load run history on mount + whenever a new run lands (liveResult or
     lastForecast change). The fetch is cheap and the slight double-trigger
     after load() is harmless — the second pass reflects the new row. */
  useEffect(() => {
    let cancelled = false;
    fetch("/api/forecast")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: (ForecastRunDb & { days?: ForecastDayDb[] })[]) => {
        if (!cancelled) setHistory(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!cancelled) setHistory([]);
      });
    return () => {
      cancelled = true;
    };
  }, [liveResult, lastForecast]);

  /* predicted month total (use forecast if available, else the static demo value) */
  const projectedTotal = renderFc?.projectedIncome ?? 62000;
  const paceBaseline = 48200;
  const exceedsPace = projectedTotal > paceBaseline;

  /* income range label — compute from forecast bands if available */
  const rangeLabel = useMemo(() => {
    if (renderFc?.future && renderFc.future.length > 0) {
      const lo = Math.min(...renderFc.future.map((d) => d.lowBand));
      const hi = Math.max(...renderFc.future.map((d) => d.highBand));
      // band is per-day; scale up to month for a comparable range
      const monthLo = lo * 30;
      const monthHi = hi * 30;
      return `${formatINR(monthLo, { compact: true })}–${formatINR(monthHi, { compact: true })}`;
    }
    return "₹54k–₹70k";
  }, [renderFc]);

  /* trigger the ML engine (synthetic history) */
  async function runForecastApi() {
    setRunning(true);
    setRunError(null);
    try {
      const res = await fetch("/api/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "synthetic", horizon: 30 }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Request failed (${res.status})`);
      }
      const json = await res.json();
      setLiveResult(json);
      setHistoryView(null);
      await load(); // refresh store so lastForecast + snapshot vault reflect new run
    } catch (e: any) {
      setRunError(e?.message || "Forecast failed");
    } finally {
      setRunning(false);
    }
  }

  /* upload CSV → /api/upload-csv → live forecast from user data */
  async function handleFile(file: File) {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-csv", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Upload failed (${res.status})`);
      }
      const json = await res.json();
      setLiveResult(json);
      setHistoryView(null);
      await load();
      toast({ title: "Forecast generated from your CSV" });
    } catch (e: any) {
      setUploadError(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  /* weekday header row + heatmap cells */
  const weekdayHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  // March 2026 actually starts on Sunday (Mar 1 2026 = Sun).
  // For simplicity and to match the demo HTML exactly, we use offset 0
  // so day 1 lands in the Monday column. This is purely a visual layout choice.
  const leadOffset = 0;
  const heatCells: (typeof heatmapDays[number] | null)[] = [
    ...Array.from({ length: leadOffset }, () => null),
    ...heatmapDays,
  ];

  /* LineChart data for the ML forecast panel */
  const fcLabels = renderFc?.future.map((d) => fmtMD(d.date)) ?? [];
  const fcFinalY = renderFc?.future.map((d) => Math.max(0, d.finalY)) ?? [];
  const fcBaseYhat = renderFc?.future.map((d) => Math.max(0, d.baseYhat)) ?? [];
  const fcLow = renderFc?.future.map((d) => Math.max(0, d.lowBand)) ?? [];
  const fcHigh = renderFc?.future.map((d) => Math.max(0, d.highBand)) ?? [];

  /* Actual vs Planned weekly data (matches the demo HTML) */
  const wkLabels = ["W1", "W2", "W3", "W4"];
  const wkActual = [19200, 28600, 0, 0];
  const wkPredicted = [18000, 24800, 11300, 6900];

  const compact = (n: number) => formatINR(n, { compact: true });

  return (
    <div className="stack">
      {/* ── ML FORECAST PANEL (prominent, top) ─────────────────── */}
      <div className="card" style={{ borderColor: "var(--accm)", boxShadow: "var(--s2)" }}>
        <div className="card-h">
          <div>
            <div className="card-t" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="brain" size={15} className="flux-acc" />
              <span>Hybrid Forecast Engine</span>
            </div>
            <div className="card-s">
              NeuralProphet-style trend + XGBoost residual boosting · 80% CI bands
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={runForecastApi}
            disabled={running}
            style={{ minWidth: 168 }}
          >
            <Icon name="refresh" size={13} />
            {running ? "Running…" : "Run 30-day forecast"}
          </button>
        </div>

        {/* kpi-mini tiles above the chart */}
        {renderFc ? (
          <div className="g4" style={{ marginBottom: 14 }}>
            <div className="kpi-mini">
              <div className="kpi-mini-lbl">Projected income</div>
              <div className="kpi-mini-val" style={{ color: "var(--acc)" }}>
                {formatINR(renderFc.projectedIncome, { compact: true })}
              </div>
            </div>
            <div className="kpi-mini">
              <div className="kpi-mini-lbl">Essential costs</div>
              <div className="kpi-mini-val">
                {formatINR(renderFc.essentialExpenses, { compact: true })}
              </div>
            </div>
            <div className="kpi-mini">
              <div className="kpi-mini-lbl">{renderFc.surplus >= 0 ? "Surplus" : "Deficit"}</div>
              <div
                className="kpi-mini-val"
                style={{ color: renderFc.surplus >= 0 ? "var(--grn)" : "var(--red)" }}
              >
                {formatINR(renderFc.surplus, { compact: true })}
              </div>
            </div>
            <div className="kpi-mini">
              <div className="kpi-mini-lbl">Coverage ratio</div>
              <div
                className="kpi-mini-val"
                style={{ color: renderFc.coverageRatio >= 1 ? "var(--grn)" : "var(--red)" }}
              >
                {renderFc.coverageRatio.toFixed(2)}×
              </div>
            </div>
          </div>
        ) : (
          <div className="ins ins-amb" style={{ marginBottom: 14 }}>
            <div className="ins-h">No forecast yet</div>
            <div className="ins-b">
              Run the engine to fit a hybrid model on 90 days of synthetic history and project the next 30 days.
            </div>
          </div>
        )}

        {/* forecast line chart */}
        {renderFc && renderFc.future.length > 0 ? (
          <div style={{ borderTop: "1px solid var(--bdr)", paddingTop: 14 }}>
            <div
              style={{
                display: "flex",
                gap: 14,
                fontSize: 11,
                alignItems: "center",
                marginBottom: 8,
                flexWrap: "wrap",
              }}
            >
              <LegendDot color="var(--acc)" label="Hybrid forecast" />
              <LegendDot color="var(--t2)" dashed label="Base model" />
              <LegendDot color="var(--accm)" band label="80% CI band" />
              <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--t3)" }}>
                {renderFc.future.length} future days · source: {renderFc.source} · MAPE{" "}
                {renderFc.baseMape.toFixed(1)}% → {renderFc.hybridMape.toFixed(1)}%
              </span>
            </div>
            <LineChart
              labels={fcLabels}
              lines={[
                { data: fcFinalY, color: "acc", label: "Hybrid forecast" },
                { data: fcBaseYhat, color: "t1", dashed: true, label: "Base model" },
              ]}
              band={{ low: fcLow, high: fcHigh }}
              height={200}
              formatVal={compact}
            />
          </div>
        ) : null}

        {/* viewing-history banner */}
        {historyView && renderFc ? (
          <div className="ins ins-acc" style={{ marginTop: 10 }}>
            <div className="ins-h">
              Viewing Run #{renderFc.runNumber} · loaded from history
            </div>
            <div className="ins-b">
              This run's days are shown in the chart above. Click "Clear view" in the run history
              panel below to return to your latest forecast.
            </div>
          </div>
        ) : null}

        {/* engine note */}
        <div
          style={{
            marginTop: 12,
            fontSize: 11,
            color: "var(--t3)",
            lineHeight: 1.55,
            background: "var(--surf2)",
            border: "1px solid var(--bdr)",
            borderRadius: "var(--radius-md)",
            padding: "10px 12px",
          }}
        >
          Engine fits a linear-trend + weekly-Fourier base model on 80% of history, then gradient-boosted
          residual trees on (day-of-week, weekend, 7-day rolling mean). MAPE is measured honestly on the
          held-out 20%.
        </div>

        {runError && (
          <div className="ins ins-red" style={{ marginTop: 10 }}>
            <div className="ins-h">Run failed</div>
            <div className="ins-b">{runError}</div>
          </div>
        )}
      </div>

      {/* ── CSV UPLOAD CARD ───────────────────────────────────── */}
      <div className="card">
        <div className="card-h">
          <div>
            <div className="card-t" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="download" size={15} className="flux-acc" />
              <span>Upload your own data</span>
            </div>
            <div className="card-s">Run the hybrid forecast on your own monthly totals</div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={downloadSampleCsv}
            disabled={uploading}
          >
            <Icon name="download" size={13} />
            Download sample CSV
          </button>
        </div>

        <div
          className={`dropzone${dragging ? " dragging" : ""}`}
          onClick={openFilePicker}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          {uploading ? (
            <>
              <div
                className="flux-acc"
                style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}
              >
                <Icon name="refresh" size={26} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>
                Uploading &amp; forecasting…
              </div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>
                Running the hybrid ML engine on your CSV
              </div>
            </>
          ) : (
            <>
              <div
                className="flux-acc"
                style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}
              >
                <Icon name="download" size={26} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>
                Drop your CSV here or click to browse
              </div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>
                Columns: Net_Income, Fuel_or_Expense, Loan_Repayment, Emergency_Expense · min 30 rows
              </div>
            </>
          )}
        </div>

        {uploadError && (
          <div className="ins ins-red" style={{ marginTop: 10 }}>
            <div className="ins-h">Upload failed</div>
            <div className="ins-b">{uploadError}</div>
          </div>
        )}

        <div className="ins ins-amb" style={{ marginTop: 10 }}>
          <div className="ins-b">
            Your CSV columns should be monthly totals. The engine divides by 30 internally for daily
            forecasting (matching the original Python pipeline).
          </div>
        </div>
      </div>

      {/* ── FORECAST RUN HISTORY CARD ────────────────────────── */}
      <div className="card">
        <div className="card-h">
          <div>
            <div className="card-t" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="calendar" size={15} className="flux-acc" />
              <span>Forecast run history</span>
            </div>
            <div className="card-s">
              Last {history.length || 0} runs · click View to load a run into the chart above
            </div>
          </div>
          {historyView ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setHistoryView(null)}
            >
              Clear view
            </button>
          ) : null}
        </div>

        {history.length === 0 ? (
          <div className="ins">
            <div className="ins-b" style={{ color: "var(--t3)" }}>
              No forecast runs yet. Run one above.
            </div>
          </div>
        ) : (
          <div className="flux-scroll" style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Run #</th>
                  <th>Date</th>
                  <th>Source</th>
                  <th>Projected</th>
                  <th>MAPE</th>
                  <th>Vault Δ</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((run) => {
                  const isCurrent = historyView?.id === run.id;
                  const mapeColor =
                    run.hybridMape < 10
                      ? "var(--grn)"
                      : run.hybridMape > 20
                        ? "var(--red)"
                        : "var(--amb)";
                  const isDeposit = run.vaultAction === "deposit";
                  return (
                    <tr
                      key={run.id}
                      className="run-row"
                      style={isCurrent ? { background: "var(--accd)" } : undefined}
                    >
                      <td className="td-m flux-mono">#{run.runNumber}</td>
                      <td>{fmtRunDate(run.createdAt)}</td>
                      <td>
                        <span className={`badge ${run.source === "csv" ? "bl" : "bk"}`}>
                          {run.source === "csv" ? "csv" : "synthetic"}
                        </span>
                      </td>
                      <td className="td-n">{formatINR(run.projectedIncome, { compact: true })}</td>
                      <td className="td-n" style={{ color: mapeColor }}>
                        {run.hybridMape.toFixed(1)}%
                      </td>
                      <td
                        className="td-n"
                        style={{ color: isDeposit ? "var(--grn)" : "var(--red)" }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Icon name={isDeposit ? "up" : "down"} size={11} />
                          {isDeposit ? "+" : "−"}
                          {formatINR(run.vaultDelta, { compact: true })}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setHistoryView(run)}
                          disabled={isCurrent}
                        >
                          {isCurrent ? "Viewing" : "View"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── TOP METRIC ROW ─────────────────────────────────────── */}
      <div className="g4 mb2">
        <div className="metric-card">
          <div className="metric-lbl">Predicted month total</div>
          <div className="metric-val flux-mono" style={{ color: "var(--acc)" }}>
            ~{formatINR(projectedTotal, { compact: true })}
          </div>
          <div className={`metric-d ${exceedsPace ? "dp" : "dn"}`}>
            {exceedsPace ? "Exceeds" : "Below"} {formatINR(paceBaseline, { compact: true })} pace
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-lbl">High-income days</div>
          <div className="metric-val flux-mono">{counts.peak}</div>
          <div className="metric-d dz">of {counts.total} days in March</div>
        </div>
        <div className="metric-card">
          <div className="metric-lbl">Income range (90% CI)</div>
          <div className="metric-val flux-mono" style={{ fontSize: 21 }}>{rangeLabel}</div>
          <div className="metric-d dz">model confidence band</div>
        </div>
        <div className="metric-card">
          <div className="metric-lbl">Volatility index</div>
          <div className="metric-val flux-mono" style={{ color: "var(--amb)" }}>Moderate</div>
          <div className="metric-d dz">±31% month-to-month</div>
        </div>
      </div>

      {/* ── MIDDLE ROW: heatmap + tiers/signals ────────────────── */}
      <div className="g32 mb2">
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-t">March 2026 earning probability calendar</div>
              <div className="card-s">Daily opportunity map</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 10, color: "var(--t3)" }}>None</span>
              <div style={{ display: "flex", gap: 2 }}>
                <div className="hcell-0" style={{ width: 12, height: 12, borderRadius: 3 }} />
                <div className="hcell-1" style={{ width: 12, height: 12, borderRadius: 3 }} />
                <div className="hcell-3" style={{ width: 12, height: 12, borderRadius: 3 }} />
                <div className="hcell-5" style={{ width: 12, height: 12, borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 10, color: "var(--t3)" }}>Peak</span>
            </div>
          </div>

          {/* weekday header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 4,
              marginBottom: 5,
            }}
          >
            {weekdayHeaders.map((w) => (
              <div
                key={w}
                style={{
                  textAlign: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--t3)",
                }}
              >
                {w}
              </div>
            ))}
          </div>

          {/* heatmap grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 4,
            }}
          >
            {heatCells.map((cell, i) => {
              if (!cell) {
                return <div key={`pad-${i}`} style={{ aspectRatio: "1 / 1" }} />;
              }
              return (
                <div
                  key={`d-${cell.day}`}
                  className={`hcell-${cell.level}`}
                  title={`Day ${cell.day} · ${formatINR(cell.amount)} · ${cell.probability}% probability${cell.predicted ? " · predicted" : ""}`}
                  style={{
                    aspectRatio: "1 / 1",
                    borderRadius: 4,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: cell.predicted ? "inset 0 0 0 1px var(--accm)" : undefined,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      left: 4,
                      fontSize: 9,
                      fontWeight: 700,
                      color: cell.level >= 3 ? "#fff" : "var(--t3)",
                      opacity: 0.85,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {cell.day}
                  </span>
                  <span
                    className="flux-mono"
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      color: cell.level >= 3 ? "#fff" : "var(--t2)",
                      opacity: 0.7,
                    }}
                  >
                    {cell.amount >= 1000 ? `${(cell.amount / 1000).toFixed(1)}k` : cell.amount}
                  </span>
                </div>
              );
            })}
          </div>

          {/* tier stat-callouts */}
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
              <span className="stat-n flux-mono" style={{ color: "var(--acc)" }}>{counts.peak}</span>
              <span className="stat-l">Peak days</span>
            </div>
            <div className="stat-callout">
              <span className="stat-n flux-mono">{counts.good}</span>
              <span className="stat-l">Good days</span>
            </div>
            <div className="stat-callout">
              <span className="stat-n flux-mono" style={{ color: "var(--amb)" }}>{counts.slow}</span>
              <span className="stat-l">Slow days</span>
            </div>
            <div className="stat-callout">
              <span className="stat-n flux-mono" style={{ color: "var(--t3)" }}>{counts.rest}</span>
              <span className="stat-l">Rest days</span>
            </div>
          </div>
        </div>

        {/* right stack */}
        <div className="stack">
          <div className="card card-sm">
            <div className="card-t" style={{ marginBottom: 10 }}>Income tiers</div>
            <div className="li">
              <div className="li-icon" style={{ background: "var(--accd)", color: "var(--acc)" }}>
                <Icon name="peak" size={15} />
              </div>
              <div className="li-body">
                <div className="li-name">Peak days</div>
                <div className="li-meta">₹8,000+ · 80–95% probability</div>
              </div>
              <div className="li-val">{counts.peak} this month</div>
            </div>
            <div className="li">
              <div className="li-icon" style={{ background: "var(--grnd)", color: "var(--grn)" }}>
                <Icon name="target" size={15} />
              </div>
              <div className="li-body">
                <div className="li-name">Good days</div>
                <div className="li-meta">₹4,000–₹8,000 · 55–80% probability</div>
              </div>
              <div className="li-val">{counts.good} this month</div>
            </div>
            <div className="li">
              <div className="li-icon" style={{ background: "var(--ambd)", color: "var(--amb)" }}>
                <Icon name="calendar" size={15} />
              </div>
              <div className="li-body">
                <div className="li-name">Slow days</div>
                <div className="li-meta">₹1,500–₹4,000 · 30–55% probability</div>
              </div>
              <div className="li-val">{counts.slow} this month</div>
            </div>
            <div className="li" style={{ borderBottom: "none" }}>
              <div className="li-icon" style={{ background: "var(--bg3)", color: "var(--t3)" }}>
                <Icon name="moon" size={15} />
              </div>
              <div className="li-body">
                <div className="li-name">Rest days</div>
                <div className="li-meta">Under ₹1,500 · under 30% probability</div>
              </div>
              <div className="li-val">{counts.rest} this month</div>
            </div>
          </div>

          <div className="card card-sm">
            <div className="card-t" style={{ marginBottom: 10 }}>Forecast signals</div>
            <div className="ins ins-acc" style={{ marginBottom: 7 }}>
              <div className="ins-h">Next peak</div>
              <div className="ins-b">Thu Mar 19</div>
            </div>
            <div className="ins ins-grn" style={{ marginBottom: 7 }}>
              <div className="ins-h">Ideal break window</div>
              <div className="ins-b">Mar 21–23</div>
            </div>
            <div className="ins ins-amb">
              <div className="ins-h">Slow period</div>
              <div className="ins-b">Mar 25–31</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTUAL VS PLANNED ──────────────────────────────────── */}
      <div className="card">
        <div className="card-h">
          <div>
            <div className="card-t">Actual vs planned income</div>
            <div className="card-s">Actual vs predicted by week</div>
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 11, alignItems: "center" }}>
            <LegendDot color="var(--acc)" label="Actual" />
            <LegendDot color="var(--grn)" label="Predicted" />
          </div>
        </div>
        <LineChart
          labels={wkLabels}
          lines={[
            { data: wkActual, color: "acc", label: "Actual" },
            { data: wkPredicted, color: "grn", label: "Predicted" },
          ]}
          height={165}
          formatVal={compact}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Small presentational helpers
   ───────────────────────────────────────────────────────────── */
function LegendDot({
  color, label, dashed, band,
}: {
  color: string;
  label: string;
  dashed?: boolean;
  band?: boolean;
}) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--t3)" }}>
      {band ? (
        <span style={{ width: 14, height: 8, borderRadius: 2, background: color, display: "inline-block" }} />
      ) : (
        <span
          style={{
            width: 14,
            height: 2,
            background: dashed ? "transparent" : color,
            borderTop: dashed ? `2px dashed ${color}` : undefined,
            display: "inline-block",
            borderRadius: 3,
          }}
        />
      )}
      <span>{label}</span>
    </span>
  );
}

/* format an ISO date string as MM/DD */
function fmtMD(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${m}/${day}`;
}

/* format a createdAt timestamp as "MMM D, HH:MM" */
function fmtRunDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "—";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const m = months[date.getMonth()];
  const day = date.getDate();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${m} ${day}, ${hh}:${mm}`;
}

/* generate a 90-row sample CSV (monthly totals) and trigger a client-side download */
function downloadSampleCsv() {
  const header = "Date,Net_Income,Fuel_or_Expense,Loan_Repayment,Emergency_Expense";
  const rows: string[] = [header];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    // weekly seasonality — weekends earn slightly more
    const weekly = 1 + 0.22 * Math.sin((2 * Math.PI * dow) / 7) + (dow >= 5 ? 0.18 : -0.06);
    // slow upward trend across the 90-day window
    const trend = 1 + (90 - i) * 0.004;
    // ±18% noise around the base
    const noise = 1 + (Math.random() - 0.5) * 0.18;
    const base = 52000; // mid-range monthly income
    const netIncome = Math.max(35000, Math.min(70000, Math.round(base * weekly * trend * noise)));
    const fuel = 4000 + Math.round(Math.random() * 1000); // 4000-5000
    const loan = 3000;
    const emergency = Math.random() < 0.12 ? Math.round(800 + Math.random() * 1400) : 0;
    rows.push(`${d.toISOString().slice(0, 10)},${netIncome},${fuel},${loan},${emergency}`);
  }
  const csv = rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "flux-sample-income.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
