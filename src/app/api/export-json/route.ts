import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeed } from "@/lib/seed";

/**
 * GET /api/export-json
 * Returns the full Flux state as a downloadable JSON file
 * (profile, snapshot, transactions, vaultTransactions, categories,
 *  heatmapDays, forecast runs with days, chatMessages).
 *
 * This is the "full backup" format consumed by /api/import-json.
 */
export async function GET() {
  await ensureSeed();

  const [profile, snapshot, transactions, vaultTransactions, categories, heatmapDays, forecastRuns, chatMessages] =
    await Promise.all([
      db.profile.findUnique({ where: { id: "me" } }),
      db.snapshot.findUnique({ where: { id: 1 } }),
      db.transaction.findMany({ orderBy: { date: "desc" } }),
      db.vaultTransaction.findMany({ orderBy: { date: "desc" } }),
      db.category.findMany({ orderBy: { order: "asc" } }),
      db.heatmapDay.findMany({ orderBy: { day: "asc" } }),
      db.forecastRun.findMany({
        orderBy: { runNumber: "asc" },
        include: { days: { orderBy: { dayIndex: "asc" } } },
      }),
      db.chatMessage.findMany({ orderBy: { createdAt: "asc" } }),
    ]);

  const payload = {
    version: "flux-backup-1",
    exportedAt: new Date().toISOString(),
    profile,
    snapshot,
    transactions: transactions.map((t) => ({
      ...t,
      date: t.date instanceof Date ? t.date.toISOString() : t.date,
      createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
    })),
    vaultTransactions: vaultTransactions.map((t) => ({
      ...t,
      date: t.date instanceof Date ? t.date.toISOString() : t.date,
      createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
    })),
    categories,
    heatmapDays,
    forecastRuns: forecastRuns.map((r) => ({
      ...r,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      days: r.days.map((d) => ({
        ...d,
        date: d.date instanceof Date ? d.date.toISOString() : d.date,
      })),
    })),
    chatMessages: chatMessages.map((m) => ({
      ...m,
      createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
    })),
  };

  const body = JSON.stringify(payload, null, 2);
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="flux-backup-${ts}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
