import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeed } from "@/lib/seed";

export async function GET() {
  await ensureSeed();
  const [txs, vts, runs, profile, snap] = await Promise.all([
    db.transaction.findMany({ orderBy: { date: "desc" } }),
    db.vaultTransaction.findMany({ orderBy: { date: "desc" } }),
    db.forecastRun.findMany({ orderBy: { runNumber: "asc" }, include: { days: true } }),
    db.profile.findUnique({ where: { id: "me" } }),
    db.snapshot.findUnique({ where: { id: 1 } }),
  ]);

  const lines: string[] = [];
  lines.push("Flux Export — " + new Date().toISOString());
  lines.push("");
  lines.push("PROFILE");
  lines.push(`Name,${profile?.name ?? ""}`);
  lines.push(`Email,${profile?.email ?? ""}`);
  lines.push(`Role,${profile?.role ?? ""}`);
  lines.push(`Income Target,${profile?.incomeTarget ?? ""}`);
  lines.push(`Spending Target,${profile?.spendingTarget ?? ""}`);
  lines.push(`Vault Goal,${profile?.vaultGoal ?? ""}`);
  lines.push("");
  lines.push("SNAPSHOT");
  lines.push(`Month,${snap?.monthLabel ?? ""}`);
  lines.push(`Income,${snap?.income ?? ""}`);
  lines.push(`Spending,${snap?.spending ?? ""}`);
  lines.push(`Vault Balance,${snap?.vaultBalance ?? ""}`);
  lines.push("");
  lines.push("TRANSACTIONS");
  lines.push("Date,Label,Category,Amount,Flow");
  for (const t of txs) {
    lines.push(`${t.date.toISOString().slice(0, 10)},"${t.label.replace(/"/g, '""')}",${t.category},${t.amount},${t.flow}`);
  }
  lines.push("");
  lines.push("VAULT TRANSACTIONS");
  lines.push("Date,Label,Type,Amount,Flow");
  for (const t of vts) {
    lines.push(`${t.date.toISOString().slice(0, 10)},"${t.label.replace(/"/g, '""')}",${t.type},${t.amount},${t.flow}`);
  }
  lines.push("");
  lines.push("FORECAST RUNS");
  lines.push("Run,Date,ProjectedIncome,EssentialCosts,Surplus,CoverageRatio,VaultAction,VaultDelta,VaultBalanceAfter,BaseMAPE,HybridMAPE");
  for (const r of runs) {
    lines.push(`${r.runNumber},${r.createdAt.toISOString().slice(0, 10)},${r.projectedIncome},${r.essentialCosts},${r.surplusDeficit},${r.coverageRatio},${r.vaultAction},${r.vaultDelta},${r.vaultBalanceAfter},${r.baseMape},${r.hybridMape}`);
  }

  const csv = lines.join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="flux-export-${Date.now()}.csv"`,
    },
  });
}
