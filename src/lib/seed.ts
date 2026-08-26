/**
 * Flux seed data — used to initialize a fresh database with the demo
 * financial snapshot (matches the original flux.js DEFAULT_STATE).
 */

import { db } from "@/lib/db";

export async function ensureSeed() {
  // Profile
  const profile = await db.profile.findUnique({ where: { id: "me" } });
  if (!profile) {
    await db.profile.create({
      data: {
        id: "me",
        name: "Arjun Kumar",
        email: "arjun.kumar@gmail.com",
        city: "Mumbai, India",
        role: "Freelance Developer",
        stabilityScore: 72,
        incomeTarget: 67000,
        spendingTarget: 38000,
        vaultGoal: 30000,
        minRunwayMonths: 2.0,
        workType: "Freelancer",
        paymentFreq: "Irregular",
        currency: "INR",
      },
    });
  }

  // Snapshot
  const snap = await db.snapshot.findUnique({ where: { id: 1 } });
  if (!snap) {
    await db.snapshot.create({
      data: {
        id: 1,
        monthLabel: "March 2026",
        monthShort: "Mar",
        year: 2026,
        monthIndex: 2,
        today: 18,
        daysInMonth: 31,
        daysPassed: 18,
        income: 48200,
        spending: 31400,
        baselineNeed: 11000,
        vaultBalance: 12100,
      },
    });
  }

  // Categories
  const catCount = await db.category.count();
  if (catCount === 0) {
    const cats = [
      { icon: "home", label: "Rent & housing", spent: 12000, limit: 12000, tone: "acc", order: 0 },
      { icon: "utensils", label: "Food & dining", spent: 6200, limit: 8000, tone: "red", order: 1 },
      { icon: "briefcase", label: "Subscriptions & tools", spent: 4100, limit: 4000, tone: "amb", order: 2 },
      { icon: "car", label: "Transport", spent: 3800, limit: 5000, tone: "teal", order: 3 },
      { icon: "pulse", label: "Health & medical", spent: 2100, limit: 3000, tone: "indigo", order: 4 },
      { icon: "sparkles", label: "Entertainment", spent: 3200, limit: 4000, tone: "t2", order: 5 },
    ];
    await db.category.createMany({ data: cats });
  }

  // Transactions
  const txCount = await db.transaction.count();
  if (txCount === 0) {
    const txs = [
      { label: "Freelance UI project", date: new Date("2026-03-13"), category: "Income", amount: 18000, flow: "in", tone: "bg" },
      { label: "Groceries & household", date: new Date("2026-03-11"), category: "Food", amount: 3400, flow: "out", tone: "br" },
      { label: "Design consultation", date: new Date("2026-03-10"), category: "Income", amount: 8500, flow: "in", tone: "bg" },
      { label: "Electricity bill", date: new Date("2026-03-09"), category: "Utilities", amount: 1850, flow: "out", tone: "ba" },
      { label: "Auto-save to vault", date: new Date("2026-03-08"), category: "Vault", amount: 2100, flow: "vault", tone: "bt" },
      { label: "Fuel — bike refill", date: new Date("2026-03-07"), category: "Transport", amount: 1200, flow: "out", tone: "br" },
      { label: "Figma subscription", date: new Date("2026-03-05"), category: "Tools", amount: 2400, flow: "out", tone: "ba" },
      { label: "Copywriting gig", date: new Date("2026-03-03"), category: "Income", amount: 9500, flow: "in", tone: "bg" },
    ];
    await db.transaction.createMany({ data: txs });
  }

  // Vault transactions
  const vtCount = await db.vaultTransaction.count();
  if (vtCount === 0) {
    const vts = [
      { label: "Auto-save · High income day", date: new Date("2026-03-13"), type: "Auto", amount: 2400, flow: "in", tone: "bg" },
      { label: "Manual deposit", date: new Date("2026-03-10"), type: "Manual", amount: 3000, flow: "in", tone: "bl" },
      { label: "Break fund withdrawal", date: new Date("2026-03-05"), type: "Withdraw", amount: 4500, flow: "out", tone: "ba" },
      { label: "Monthly surplus save", date: new Date("2026-03-01"), type: "Auto", amount: 4100, flow: "in", tone: "bg" },
      { label: "Interest credited", date: new Date("2026-03-01"), type: "Interest", amount: 42, flow: "in", tone: "bt" },
      { label: "Auto-save · High income", date: new Date("2026-02-28"), type: "Auto", amount: 1800, flow: "in", tone: "bg" },
    ];
    await db.vaultTransaction.createMany({ data: vts });
  }

  // Heatmap days
  const hmCount = await db.heatmapDay.count();
  if (hmCount === 0) {
    const days = [
      { day: 1, level: 1, amount: 1200, probability: 32, predicted: false },
      { day: 2, level: 3, amount: 4800, probability: 71, predicted: false },
      { day: 3, level: 4, amount: 7200, probability: 82, predicted: false },
      { day: 4, level: 2, amount: 2800, probability: 54, predicted: false },
      { day: 5, level: 5, amount: 11500, probability: 91, predicted: false },
      { day: 6, level: 4, amount: 8400, probability: 85, predicted: false },
      { day: 7, level: 0, amount: 400, probability: 12, predicted: false },
      { day: 8, level: 0, amount: 200, probability: 8, predicted: false },
      { day: 9, level: 2, amount: 3100, probability: 58, predicted: false },
      { day: 10, level: 3, amount: 5200, probability: 74, predicted: false },
      { day: 11, level: 4, amount: 8500, probability: 88, predicted: false },
      { day: 12, level: 3, amount: 4900, probability: 72, predicted: false },
      { day: 13, level: 5, amount: 12000, probability: 93, predicted: false },
      { day: 14, level: 0, amount: 0, probability: 5, predicted: false },
      { day: 15, level: 0, amount: 0, probability: 7, predicted: false },
      { day: 16, level: 2, amount: 2800, probability: 55, predicted: false },
      { day: 17, level: 3, amount: 5400, probability: 70, predicted: false },
      { day: 18, level: 3, amount: 4800, probability: 68, predicted: false },
      { day: 19, level: 5, amount: 12500, probability: 89, predicted: true },
      { day: 20, level: 4, amount: 9000, probability: 84, predicted: true },
      { day: 21, level: 0, amount: 300, probability: 9, predicted: true },
      { day: 22, level: 0, amount: 100, probability: 4, predicted: true },
      { day: 23, level: 1, amount: 1800, probability: 38, predicted: true },
      { day: 24, level: 2, amount: 3200, probability: 61, predicted: true },
      { day: 25, level: 2, amount: 2900, probability: 56, predicted: true },
      { day: 26, level: 1, amount: 1400, probability: 32, predicted: true },
      { day: 27, level: 1, amount: 1200, probability: 28, predicted: true },
      { day: 28, level: 0, amount: 500, probability: 14, predicted: true },
      { day: 29, level: 0, amount: 200, probability: 6, predicted: true },
      { day: 30, level: 1, amount: 2100, probability: 42, predicted: true },
      { day: 31, level: 2, amount: 3500, probability: 62, predicted: true },
    ];
    await db.heatmapDay.createMany({ data: days });
  }
}

/* Aggregate state returned to the frontend */
export async function getFluxState() {
  const [profile, snap, transactions, vaultTransactions, categories, heatmapDays, lastRun, chatMessages] =
    await Promise.all([
      db.profile.findUnique({ where: { id: "me" } }),
      db.snapshot.findUnique({ where: { id: 1 } }),
      db.transaction.findMany({ orderBy: { date: "desc" }, take: 30 }),
      db.vaultTransaction.findMany({ orderBy: { date: "desc" }, take: 30 }),
      db.category.findMany({ orderBy: { order: "asc" } }),
      db.heatmapDay.findMany({ orderBy: { day: "asc" } }),
      db.forecastRun.findFirst({ orderBy: { createdAt: "desc" }, include: { days: { orderBy: { dayIndex: "asc" } } } }),
      db.chatMessage.findMany({ orderBy: { createdAt: "asc" }, take: 50 }),
    ]);

  // vault history from forecast runs
  const runs = await db.forecastRun.findMany({ orderBy: { runNumber: "asc" } });
  const vaultHistory = runs.map((r) => ({
    run: r.runNumber,
    projectedIncome: r.projectedIncome,
    essentialCosts: r.essentialCosts,
    surplusDeficit: r.surplusDeficit,
    vaultBalance: r.vaultBalanceAfter,
  }));

  return {
    profile,
    snapshot: snap,
    transactions,
    vaultTransactions,
    categories,
    heatmapDays,
    lastForecast: lastRun,
    vaultHistory,
    chatMessages,
  };
}
