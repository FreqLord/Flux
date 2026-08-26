import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeed } from "@/lib/seed";
import { chatWithFlux, type ChatTurn } from "@/lib/llm";

export async function GET() {
  await ensureSeed();
  const messages = await db.chatMessage.findMany({ orderBy: { createdAt: "asc" }, take: 50 });
  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  await ensureSeed();
  const body = await req.json();
  const { message } = body;
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }

  // Load recent history
  const recent = await db.chatMessage.findMany({ orderBy: { createdAt: "asc" }, take: 10 });
  const history: ChatTurn[] = recent.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Build financial context
  const [profile, snap, lastRun] = await Promise.all([
    db.profile.findUnique({ where: { id: "me" } }),
    db.snapshot.findUnique({ where: { id: 1 } }),
    db.forecastRun.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  const monthlyIncome = snap?.income ?? 48200;
  const monthlySpending = snap?.spending ?? 31400;
  const vaultBalance = snap?.vaultBalance ?? 12100;
  const runwayMonths = 2.6; // derived; could compute
  const context = {
    name: profile?.name ?? "Arjun",
    role: profile?.role ?? "Freelancer",
    monthlyIncome,
    monthlySpending,
    income: monthlyIncome,
    spending: monthlySpending,
    vaultBalance,
    vaultGoal: profile?.vaultGoal ?? 30000,
    runwayMonths,
    minRunwayMonths: profile?.minRunwayMonths ?? 2.0,
    safeDailySpend: Math.round((monthlyIncome - monthlySpending) / Math.max(1, (snap?.daysInMonth ?? 31) - (snap?.daysPassed ?? 18))),
    spendingPct: Math.round((monthlySpending / monthlyIncome) * 100),
    zone: monthlySpending / monthlyIncome < 0.5 ? "Safe" : monthlySpending / monthlyIncome < 0.7 ? "Moderate" : "Risk",
    breakDays: 7,
    breakCost: 7 * 1200,
    projectedIncome: lastRun?.projectedIncome ?? 62000,
    forecastLow: 54000,
    forecastHigh: 70000,
    hybridMape: lastRun?.hybridMape ?? 8.5,
    coverageRatio: lastRun?.coverageRatio ?? 1.7,
    nextPeakDay: "Thu, Mar 19",
    essentialExpenses: lastRun?.essentialCosts ?? 11000,
  };

  // Save user message
  await db.chatMessage.create({ data: { role: "user", content: message } });

  // Get AI response
  const reply = await chatWithFlux(message, history, context);

  // Save assistant reply
  await db.chatMessage.create({ data: { role: "assistant", content: reply } });

  return NextResponse.json({ role: "assistant", content: reply, createdAt: new Date().toISOString() });
}

export async function DELETE() {
  await db.chatMessage.deleteMany({});
  return NextResponse.json({ ok: true });
}
