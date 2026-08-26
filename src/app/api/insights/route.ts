import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeed } from "@/lib/seed";
import { generateInsight } from "@/lib/llm";

export async function GET() {
  await ensureSeed();
  const [profile, snap, lastRun] = await Promise.all([
    db.profile.findUnique({ where: { id: "me" } }),
    db.snapshot.findUnique({ where: { id: 1 } }),
    db.forecastRun.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  const monthlyIncome = snap?.income ?? 48200;
  const monthlySpending = snap?.spending ?? 31400;
  const vaultBalance = snap?.vaultBalance ?? 12100;

  const context = {
    monthlyIncome,
    monthlySpending,
    vaultBalance,
    vaultGoal: profile?.vaultGoal ?? 30000,
    runwayMonths: 2.6,
    spendingPct: Math.round((monthlySpending / monthlyIncome) * 100),
    projectedIncome: lastRun?.projectedIncome ?? 62000,
    coverageRatio: lastRun?.coverageRatio ?? 1.7,
    nextPeakDay: "Thu, Mar 19",
  };

  // Try LLM insight; fall back to rule-based
  let insight = "";
  try {
    insight = await generateInsight(context);
  } catch {
    insight = "";
  }
  if (!insight) {
    if (vaultBalance < (profile?.vaultGoal ?? 30000) * 0.5) {
      insight = `Vault is at ${Math.round((vaultBalance / (profile?.vaultGoal ?? 30000)) * 100)}% of goal. Keep the high-income-day auto-save rule on to close the gap faster.`;
    } else if (monthlySpending / monthlyIncome > 0.65) {
      insight = `Spending is at ${Math.round((monthlySpending / monthlyIncome) * 100)}% of income. Hold daily spend to ₹${Math.round((monthlyIncome - monthlySpending) / 13).toLocaleString("en-IN")} to finish the month in the Safe zone.`;
    } else {
      insight = `Forecast projects ₹${Math.round(lastRun?.projectedIncome ?? 62000).toLocaleString("en-IN")} over 30 days — coverage ${(lastRun?.coverageRatio ?? 1.7).toFixed(2)}× your essential costs. Your runway is stable.`;
    }
  }

  // Build a few rule-based secondary insights too
  const insights = [
    { type: "peak", tone: "acc", heading: "Peak day", body: "Keep Mar 19 clear — it's your highest-probability earning day (89%)." },
    {
      type: "spending",
      tone: "amb",
      heading: "Spending nudge",
      body: `You're in the ${monthlySpending / monthlyIncome < 0.5 ? "Safe" : "Moderate"} zone at ${Math.round((monthlySpending / monthlyIncome) * 100)}% of income. Hold daily spend to ₹${Math.round((monthlyIncome - monthlySpending) / 13).toLocaleString("en-IN")}.`,
    },
    {
      type: "vault",
      tone: "teal",
      heading: "Vault on track",
      body: `₹${vaultBalance.toLocaleString("en-IN")} saved — ${Math.round((vaultBalance / (profile?.vaultGoal ?? 30000)) * 100)}% of your ₹${(profile?.vaultGoal ?? 30000).toLocaleString("en-IN")} goal. Runway holds at 2.6 months.`,
    },
    { type: "ai", tone: "grn", heading: "AI CFO", body: insight },
  ];

  return NextResponse.json({ insights });
}
