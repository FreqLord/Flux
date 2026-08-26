"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFlux, formatINR, runwayMonths } from "@/store/flux-store";
import { LineChart } from "@/components/flux/charts";
import { Icon } from "@/components/flux/icon";
import { useToast } from "@/hooks/use-toast";

/* ── API contract (mirror of BreakSimResult in src/lib/forecast.ts) ── */
interface ProjectionPoint {
  day: number;
  cash: number;
  vault: number;
  label: string;
}

interface BreakSimResult {
  afterRunwayMonths: number;
  deltaMonths: number;
  lostIncome: number;
  breakCost: number;
  vaultUsed: number;
  cashAfter: number;
  projection: ProjectionPoint[];
  verdict: "safe" | "tight" | "risky";
  recommendedWindow: { start: number; end: number };
}

/* ── verdict meta ── */
const VERDICT_META: Record<
  BreakSimResult["verdict"],
  { badgeCls: string; label: string; insCls: string; message: string }
> = {
  safe: {
    badgeCls: "badge bg",
    label: "Safe",
    insCls: "ins ins-grn",
    message: "Your runway holds above the 2-month floor — enjoy the break.",
  },
  tight: {
    badgeCls: "badge ba",
    label: "Tight",
    insCls: "ins ins-amb",
    message:
      "Borderline. Consider shortening the break or lowering daily spend.",
  },
  risky: {
    badgeCls: "badge br",
    label: "Risky",
    insCls: "ins ins-red",
    message: "This break dips below your safe floor. Postpone or use the vault.",
  },
};

/* ── month short formatter for the recommended-window footer ── */
function formatWindowLabel(start: number, end: number): string {
  if (typeof window === "undefined") return `${start}-${end}`;
  const base = new Date();
  const d1 = new Date(base.getTime() + start * 24 * 60 * 60 * 1000);
  const d2 = new Date(base.getTime() + end * 24 * 60 * 60 * 1000);
  const month = (d: Date) =>
    d.toLocaleString("en-US", { month: "short" });
  const sameMonth = d1.getMonth() === d2.getMonth();
  if (sameMonth) return `${month(d1)} ${d1.getDate()}-${d2.getDate()}`;
  return `${month(d1)} ${d1.getDate()} - ${month(d2)} ${d2.getDate()}`;
}

export function BreakView() {
  const snapshot = useFlux((s) => s.snapshot);
  const profile = useFlux((s) => s.profile);
  const { toast } = useToast();

  /* ── local form state ── */
  const [breakDays, setBreakDays] = useState(7);
  const [dailySpend, setDailySpend] = useState(1200);
  const [startInDays, setStartInDays] = useState(3);
  const [useVault, setUseVault] = useState(true);

  /* ── result state ── */
  const [result, setResult] = useState<BreakSimResult | null>(null);
  const [loading, setLoading] = useState(false);
  const reqId = useRef(0);

  /* ── derived live runway from store snapshot ── */
  const currentRunway = useMemo(() => {
    if (!snapshot) return 2.6;
    return runwayMonths(snapshot.income, snapshot.spending, snapshot.vaultBalance);
  }, [snapshot]);

  /* ── debounce: re-run simulation whenever inputs or snapshot change ── */
  useEffect(() => {
    if (!snapshot) return;
    const thisReq = ++reqId.current;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const body = {
          currentRunwayMonths: Number(currentRunway.toFixed(2)),
          breakDays,
          dailySpend,
          startInDays,
          useVault,
          vaultBalance: snapshot.vaultBalance,
          monthlyIncome: snapshot.income,
          monthlySpending: snapshot.spending,
          baselineNeed: snapshot.baselineNeed,
        };
        const res = await fetch("/api/break", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("break api failed");
        const data = (await res.json()) as BreakSimResult;
        if (reqId.current === thisReq) setResult(data);
      } catch {
        /* swallow — banner simply stays at last value */
      } finally {
        if (reqId.current === thisReq) setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [
    snapshot,
    currentRunway,
    breakDays,
    dailySpend,
    startInDays,
    useVault,
  ]);

  /* ── Run simulation button: lock current scenario ── */
  function onRunSim() {
    toast({
      title: "Scenario locked",
      description: result
        ? `${breakDays}-day break starting in ${startInDays} day${
            startInDays === 1 ? "" : "s"
          } pinned.`
        : "Break scenario pinned.",
    });
  }

  /* ── recommended-window calendar pills (14 days: 0..13) ── */
  const calendarDays = Array.from({ length: 14 }, (_, i) => i);
  const recStart = result?.recommendedWindow.start ?? 14;
  const recEnd = result?.recommendedWindow.end ?? 21;

  /* ── verdict meta for current result ── */
  const verdict = result ? VERDICT_META[result.verdict] : null;

  /* ── chart series derived from projection ── */
  const chartLabels = useMemo(
    () => result?.projection.map((p) => p.label) ?? [],
    [result]
  );
  const cashSeries = useMemo(
    () => result?.projection.map((p) => p.cash) ?? [],
    [result]
  );
  const vaultSeries = useMemo(
    () => result?.projection.map((p) => p.vault) ?? [],
    [result]
  );

  /* ── format compact currency for chart axis ── */
  const fmtCompact = (n: number) =>
    formatINR(n, { compact: true });

  /* ── delta color helper ── */
  const deltaColor = (d: number | undefined) => {
    if (d == null) return "#fff";
    return d >= 0 ? "var(--grn)" : "var(--red)";
  };

  return (
    <>
      {/* ── BANNER ─────────────────────────────────────────── */}
      <div
        className="runway-card mb2"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 28,
          flexWrap: "wrap",
          padding: "24px 28px",
        }}
      >
        {/* left: current runway */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".1em",
              color: "rgba(255,255,255,.6)",
              marginBottom: 6,
            }}
          >
            Current financial runway
          </div>
          <div
            className="flux-mono"
            style={{
              fontSize: 42,
              fontWeight: 600,
              color: "#fff",
              lineHeight: 1,
              letterSpacing: "-.035em",
            }}
          >
            {currentRunway.toFixed(1)} months
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: "rgba(255,255,255,.55)",
              marginTop: 5,
            }}
          >
            {loading ? "Recomputing…" : "Numbers update live below."}
          </div>
        </div>

        {/* divider */}
        <div
          style={{
            width: 1,
            height: 52,
            background: "rgba(255,255,255,.15)",
            flexShrink: 0,
            position: "relative",
            zIndex: 1,
          }}
        />

        {/* stat tiles */}
        <div
          style={{
            display: "flex",
            gap: 12,
            position: "relative",
            zIndex: 1,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              textAlign: "center",
              padding: "12px 20px",
              background: "rgba(255,255,255,.12)",
              borderRadius: 10,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,.6)",
                textTransform: "uppercase",
                letterSpacing: ".08em",
                marginBottom: 4,
              }}
            >
              After break
            </div>
            <div
              className="flux-mono"
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: "#fff",
                transition: "color .25s",
              }}
            >
              {result ? `${result.afterRunwayMonths.toFixed(1)} mo` : "—"}
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "12px 20px",
              background: "rgba(255,255,255,.12)",
              borderRadius: 10,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,.6)",
                textTransform: "uppercase",
                letterSpacing: ".08em",
                marginBottom: 4,
              }}
            >
              Change
            </div>
            <div
              className="flux-mono"
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: result ? deltaColor(result.deltaMonths) : "#fff",
                transition: "color .25s",
              }}
            >
              {result
                ? `${result.deltaMonths >= 0 ? "+" : ""}${result.deltaMonths.toFixed(
                    1
                  )} mo`
                : "—"}
            </div>
          </div>
        </div>

        {/* right hint */}
        <div
          style={{
            marginLeft: "auto",
            position: "relative",
            zIndex: 1,
            fontSize: 11.5,
            color: "rgba(255,255,255,.45)",
            maxWidth: 200,
            lineHeight: 1.6,
          }}
        >
          Pick a start date, click any low-pressure day in the calendar, and
          rerun the scenario if you want a locked result card.
        </div>
      </div>

      {/* ── CONFIG + RESULTS GRID ─────────────────────────── */}
      <div className="g32 mb2">
        {/* LEFT — configure card */}
        <div className="card">
          <div className="card-t" style={{ marginBottom: 3 }}>
            Configure your break
          </div>
          <div className="card-s" style={{ marginBottom: 20 }}>
            Every change updates the runway numbers above and the projection
            below
          </div>

          {/* duration slider */}
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 9,
              }}
            >
              <label
                className="form-label"
                style={{ margin: 0, color: "var(--t3)" }}
              >
                Duration
              </label>
              <span
                className="flux-mono"
                style={{
                  fontSize: 30,
                  fontWeight: 600,
                  color: "var(--t1)",
                  lineHeight: 1,
                }}
              >
                {breakDays} {breakDays === 1 ? "day" : "days"}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={21}
              value={breakDays}
              onChange={(e) => setBreakDays(Number(e.target.value))}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                color: "var(--t3)",
                marginTop: 4,
              }}
            >
              <span>1 day</span>
              <span>7 days</span>
              <span>21 days</span>
            </div>
          </div>

          <div className="div" />

          {/* daily spend slider */}
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 9,
              }}
            >
              <label
                className="form-label"
                style={{ margin: 0, color: "var(--t3)" }}
              >
                Daily spend during break
              </label>
              <span
                className="flux-mono"
                style={{ fontSize: 17, fontWeight: 600 }}
              >
                {formatINR(dailySpend)}
              </span>
            </div>
            <input
              type="range"
              min={500}
              max={5000}
              step={100}
              value={dailySpend}
              onChange={(e) => setDailySpend(Number(e.target.value))}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                color: "var(--t3)",
                marginTop: 4,
              }}
            >
              <span>₹500</span>
              <span>₹5,000</span>
            </div>
          </div>

          <div className="div" />

          {/* start date slider */}
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 9,
              }}
            >
              <label
                className="form-label"
                style={{ margin: 0, color: "var(--t3)" }}
              >
                Start date
              </label>
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                In {startInDays} {startInDays === 1 ? "day" : "days"}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={13}
              value={startInDays}
              onChange={(e) => setStartInDays(Number(e.target.value))}
            />
          </div>

          <div className="div" />

          {/* vault toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 0",
              marginBottom: 18,
            }}
          >
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--t1)" }}>
                Draw from Safety Vault
              </div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>
                Use vault only if daily cash runs short
              </div>
            </div>
            <div
              role="switch"
              aria-checked={useVault}
              className={`toggle${useVault ? " on" : ""}`}
              onClick={() => setUseVault((v) => !v)}
              style={{ outline: "none" }}
            />
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={onRunSim}
            style={{ fontSize: 13 }}
          >
            Run simulation
          </button>
        </div>

        {/* RIGHT — results stack */}
        <div className="stack">
          {/* simulation results card */}
          <div className="card card-sm">
            <div className="card-t" style={{ marginBottom: 14 }}>
              Simulation results
            </div>

            {!result ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "30px 0",
                  color: "var(--t3)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 10,
                    opacity: 0.35,
                  }}
                >
                  <Icon name="calendar" size={32} />
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>
                  Move the sliders or tap a day in the calendar, then run the
                  simulation to pin the current break scenario.
                </div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 12 }}>
                  <span className={verdict?.badgeCls}>{verdict?.label}</span>
                </div>

                <ResultRow
                  label="After runway"
                  value={`${result.afterRunwayMonths.toFixed(1)} mo`}
                  mono
                />
                <ResultRow
                  label="Change"
                  value={`${result.deltaMonths >= 0 ? "+" : ""}${result.deltaMonths.toFixed(
                    1
                  )} mo`}
                  mono
                  valueColor={deltaColor(result.deltaMonths)}
                />
                <ResultRow
                  label="Lost income"
                  value={formatINR(result.lostIncome)}
                  valueColor="var(--red)"
                />
                <ResultRow
                  label="Break cost"
                  value={formatINR(result.breakCost)}
                  valueColor="var(--amb)"
                />
                <ResultRow
                  label="Vault used"
                  value={formatINR(result.vaultUsed)}
                  valueColor="var(--teal)"
                />
                <ResultRow
                  label="Cash after"
                  value={formatINR(result.cashAfter)}
                  mono
                />

                <div
                  className={verdict?.insCls}
                  style={{ marginTop: 12 }}
                >
                  <div className="ins-h">{verdict?.label} scenario</div>
                  <div className="ins-b">{verdict?.message}</div>
                </div>
              </>
            )}
          </div>

          {/* recommended windows card */}
          <div className="card card-sm">
            <div className="card-t" style={{ marginBottom: 3 }}>
              Recommended windows
            </div>
            <div className="card-s" style={{ marginBottom: 13 }}>
              Low-pressure dates
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                marginBottom: 10,
              }}
            >
              {calendarDays.map((d) => {
                const highlighted = d >= recStart && d <= recEnd;
                const selected = d === startInDays;
                return (
                  <button
                    key={d}
                    onClick={() => setStartInDays(d)}
                    className={highlighted ? "badge bl" : "badge bk"}
                    style={{
                      cursor: "pointer",
                      minWidth: 34,
                      justifyContent: "center",
                      padding: "5px 9px",
                      outline: selected ? "1.5px solid var(--acc)" : "none",
                      outlineOffset: 1,
                    }}
                    title={`In ${d} day${d === 1 ? "" : "s"}`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 10,
                color: "var(--t3)",
                gap: 8,
              }}
            >
              <span>Tap a day to move the break start date instantly</span>
              <span
                className="flux-mono"
                style={{ color: "var(--acc)", fontWeight: 600 }}
              >
                {formatWindowLabel(recStart, recEnd)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── PROJECTION CHART CARD ─────────────────────────── */}
      <div className="card">
        <div className="card-h">
          <div>
            <div className="card-t">Cash and vault projection</div>
            <div className="card-s">
              Impact over a {breakDays}-day break
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 14,
              fontSize: 11,
              alignItems: "center",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                color: "var(--t3)",
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 2,
                  background: "var(--red)",
                  display: "inline-block",
                  borderRadius: 3,
                }}
              />
              Available cash
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                color: "var(--t3)",
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 2,
                  background: "var(--acc)",
                  display: "inline-block",
                  borderRadius: 3,
                }}
              />
              Vault balance
            </span>
          </div>
        </div>

        {result && cashSeries.length > 1 ? (
          <LineChart
            labels={chartLabels}
            lines={[
              { data: cashSeries, color: "red", label: "Cash" },
              { data: vaultSeries, color: "acc", label: "Vault" },
            ]}
            height={170}
            formatVal={fmtCompact}
          />
        ) : (
          <div
            style={{
              height: 170,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--t3)",
              fontSize: 12.5,
            }}
          >
            {loading
              ? "Running projection…"
              : "Adjust the sliders to see your cash and vault projection."}
          </div>
        )}
      </div>
    </>
  );
}

/* ── stat-row helper ── */
function ResultRow({
  label,
  value,
  mono,
  valueColor,
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "11px 0",
        borderBottom: "1px solid var(--bdr)",
      }}
    >
      <span style={{ fontSize: 12.5, color: "var(--t2)" }}>{label}</span>
      <span
        className={mono ? "flux-mono" : undefined}
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: valueColor ?? "var(--t1)",
        }}
      >
        {value}
      </span>
    </div>
  );
}
