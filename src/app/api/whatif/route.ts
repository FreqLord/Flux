import { NextResponse } from "next/server";
import { simulateWhatIf } from "@/lib/forecast";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    currentIncome = 48200,
    currentSpending = 31400,
    vaultBalance = 12100,
    baselineNeed = 11000,
    incomeChangePct = 0,
    spendingChangePct = 0,
    vaultContributionPct = 40,
    horizonMonths = 6,
  } = body;

  const result = simulateWhatIf({
    currentIncome: Number(currentIncome),
    currentSpending: Number(currentSpending),
    vaultBalance: Number(vaultBalance),
    baselineNeed: Number(baselineNeed),
    incomeChangePct: Number(incomeChangePct),
    spendingChangePct: Number(spendingChangePct),
    vaultContributionPct: Number(vaultContributionPct),
    horizonMonths: Math.min(Math.max(Number(horizonMonths), 1), 12),
  });

  return NextResponse.json(result);
}
