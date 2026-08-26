import { NextResponse } from "next/server";
import { runForecast, type ForecastInputRow, type VaultState } from "@/lib/forecast";
import { db } from "@/lib/db";
import { ensureSeed } from "@/lib/seed";

/**
 * POST /api/upload-csv
 * Multipart form: field "file" = CSV with columns
 *   Net_Income, Fuel_or_Expense, Loan_Repayment, Emergency_Expense
 * (optional Date column). One row per day (monthly totals divided by 30 internally).
 * Returns the forecast result + persisted run id.
 */
export async function POST(req: Request) {
  await ensureSeed();
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded (field 'file' required)" }, { status: 400 });
  }
  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length < 30) {
    return NextResponse.json(
      { error: `Need at least 30 rows. Got ${rows.length}.` },
      { status: 400 }
    );
  }

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
    result = runForecast(rows, vaultState, 30);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

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
      horizon: 30,
      source: "csv",
      csvFilename: file.name,
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
  });

  await db.snapshot.update({
    where: { id: 1 },
    data: { vaultBalance: Math.round(result.vaultBalanceAfter) },
  });

  if (result.vaultDelta > 0) {
    await db.vaultTransaction.create({
      data: {
        label: `Auto-save · CSV forecast (Run #${result.runNumber})`,
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

function parseCsv(text: string): ForecastInputRow[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n").filter((l) => l.trim().length);
  if (lines.length < 2) return [];
  const header = splitCsvLine(lines[0]).map((h) => h.trim());
  const idx: Record<string, number> = {};
  header.forEach((h, i) => {
    const key = h.toLowerCase().replace(/[^a-z]/g, "");
    idx[key] = i;
  });
  const iNet = idx["netincome"] ?? 0;
  const iFuel = idx["fuelorexpense"] ?? idx["fuel"] ?? 1;
  const iLoan = idx["loanrepayment"] ?? idx["loan"] ?? 2;
  const iEmg = idx["emergencyexpense"] ?? idx["emergency"] ?? 3;
  const iDate = idx["date"] ?? idx["ds"] ?? -1;

  const rows: ForecastInputRow[] = [];
  const today = new Date();
  for (let li = 1; li < lines.length; li++) {
    const cols = splitCsvLine(lines[li]);
    const net = Number(cols[iNet]);
    const fuel = Number(cols[iFuel]);
    const loan = Number(cols[iLoan]);
    const emg = Number(cols[iEmg]);
    if (!isFinite(net)) continue;
    let dateStr: string;
    if (iDate >= 0 && cols[iDate]) {
      const d = new Date(cols[iDate]);
      dateStr = isFinite(d.getTime()) ? d.toISOString().slice(0, 10) : today.toISOString().slice(0, 10);
    } else {
      // assign dates backwards from today
      const offset = lines.length - 1 - li;
      const d = new Date(today);
      d.setDate(d.getDate() - offset);
      dateStr = d.toISOString().slice(0, 10);
    }
    rows.push({
      date: dateStr,
      netIncome: net,
      fuel: isFinite(fuel) ? fuel : 0,
      loan: isFinite(loan) ? loan : 0,
      emergency: isFinite(emg) ? emg : 0,
    });
  }
  return rows;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === "," && !inQ) {
      out.push(cur); cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}
