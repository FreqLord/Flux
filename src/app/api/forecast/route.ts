import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeed } from "@/lib/seed";
import { runForecast, generateSyntheticHistory, type ForecastInputRow, type VaultState } from "@/lib/forecast";

export async function GET() {
  await ensureSeed();
  const runs = await db.forecastRun.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { days: { orderBy: { dayIndex: "asc" } } },
  });
  return NextResponse.json(runs);
}

/**
 * POST /api/forecast
 * Body: { source?: "synthetic" | "csv", rows?: ForecastInputRow[], horizon?: number }
 * Runs the hybrid forecast engine, persists the run + vault action, returns the result.
 */
export async function POST(req: Request) {
  await ensureSeed();
  let body: any;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const horizon = Math.min(Math.max(Number(body.horizon) || 30, 7), 90);
  const source: "synthetic" | "csv" = body.source === "csv" ? "csv" : "synthetic";

  let rows: ForecastInputRow[];
  if (source === "csv" && Array.isArray(body.rows) && body.rows.length >= 30) {
    rows = body.rows;
  } else {
    // Use synthetic 90-day history (deterministic-ish, seeded by current month)
    rows = generateSyntheticHistory(90);
  }

  // Build vault state from existing runs
  const priorRuns = await db.forecastRun.findMany({ orderBy: { runNumber: "asc" } });
  const vaultState: VaultState = {
    balance: 0,
    totalRuns: priorRuns.length,
    history: priorRuns.map((r) => ({
      run: r.runNumber,
      projectedIncome: r.projectedIncome,
      essentialCosts: r.essentialCosts,
      surplusDeficit: r.surplusDeficit,
      vaultBalance: r.vaultBalanceAfter,
    })),
  };

  let result;
  try {
    result = runForecast(rows, vaultState, horizon);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Persist the run + days
  const run = await db.forecastRun.create({
    data: {
      runNumber: result.runNumber,
      projectedIncome: result.projectedIncome,
      essentialCosts: result.essentialExpenses,
      surplusDeficit: result.surplus,
      coverageRatio: result.coverageRatio,
      vaultAction: result.vaultAction,
      vaultDelta: result.vaultDelta,
      vaultBalanceAfter: result.vaultBalanceAfter,
      baseMape: result.baseMape,
      hybridMape: result.hybridMape,
      horizon,
      source,
      csvFilename: body.csvFilename || null,
      historyJson: JSON.stringify(result.historical.slice(-60)),
      days: {
        create: result.future.map((f, i) => ({
          dayIndex: i,
          date: new Date(f.date),
          baseYhat: f.baseYhat,
          finalY: f.finalY,
          lowBand: f.lowBand,
          highBand: f.highBand,
          isFuture: true,
        })),
      },
    },
    include: { days: true },
  });

  // Update snapshot vault balance
  await db.snapshot.update({
    where: { id: 1 },
    data: { vaultBalance: Math.round(result.vaultBalanceAfter) },
  });

  // Add a vault transaction for the auto action
  if (result.vaultDelta > 0) {
    await db.vaultTransaction.create({
      data: {
        label:
          result.vaultAction === "deposit"
            ? `Auto-save · Forecast surplus (Run #${result.runNumber})`
            : `Auto-release · Forecast deficit (Run #${result.runNumber})`,
        date: new Date(),
        type: "Auto",
        amount: Math.round(result.vaultDelta),
        flow: result.vaultAction === "deposit" ? "in" : "out",
        tone: result.vaultAction === "deposit" ? "bg" : "ba",
      },
    });
  }

  return NextResponse.json({ run, result });
}
