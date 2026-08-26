import { NextResponse } from "next/server";
import { simulateBreak } from "@/lib/forecast";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    currentRunwayMonths = 2.6,
    breakDays = 7,
    dailySpend = 1200,
    startInDays = 3,
    useVault = true,
    vaultBalance = 12100,
    monthlyIncome = 48200,
    monthlySpending = 31400,
    baselineNeed = 11000,
  } = body;

  const result = simulateBreak({
    currentRunwayMonths: Number(currentRunwayMonths),
    breakDays: Number(breakDays),
    dailySpend: Number(dailySpend),
    startInDays: Number(startInDays),
    useVault: Boolean(useVault),
    vaultBalance: Number(vaultBalance),
    monthlyIncome: Number(monthlyIncome),
    monthlySpending: Number(monthlySpending),
    baselineNeed: Number(baselineNeed),
  });

  return NextResponse.json(result);
}
