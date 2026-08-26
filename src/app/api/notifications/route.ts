import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeed } from "@/lib/seed";

export type NotificationTone = "acc" | "grn" | "amb" | "teal" | "red";
export type NotificationType = "forecast" | "vault" | "spending" | "peak" | "break";

export interface FluxNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string; // ISO 8601
  read: boolean;
  tone: NotificationTone;
}

/** Format a date like "Thu Mar 19" given year/monthIndex/day. */
function formatDayShort(year: number, monthIndex: number, day: number): string {
  const d = new Date(year, monthIndex, day);
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const month = d.toLocaleDateString("en-US", { month: "short" });
  return `${weekday} ${month} ${day}`;
}

function toISO(d: Date | string): string {
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
}

function inr(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

/**
 * GET /api/notifications
 * Returns an array of notification objects derived from the current Flux state:
 * recent forecast runs, recent vault deposits, spending alert, peak-day reminder,
 * and an ideal-break-window suggestion. Sorted by timestamp desc, capped at 8.
 */
export async function GET() {
  await ensureSeed();
  const [forecastRuns, vaultTxs, snap, heatmapDays] = await Promise.all([
    db.forecastRun.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
    db.vaultTransaction.findMany({ where: { flow: "in" }, orderBy: { date: "desc" }, take: 3 }),
    db.snapshot.findUnique({ where: { id: 1 } }),
    db.heatmapDay.findMany({ orderBy: { day: "asc" } }),
  ]);

  const out: FluxNotification[] = [];

  // ── Recent forecast runs ─────────────────────────────────────
  for (const r of forecastRuns) {
    out.push({
      id: `fc-${r.id}`,
      type: "forecast",
      title: `Forecast run #${r.runNumber} completed`,
      body: `Projected ${inr(r.projectedIncome)}, MAPE ${r.hybridMape.toFixed(1)}%`,
      timestamp: toISO(r.createdAt),
      read: false,
      tone: "acc",
    });
  }

  // ── Recent vault deposits (flow=in) ──────────────────────────
  for (const v of vaultTxs) {
    let title: string;
    if (v.type === "Auto") title = `Auto-saved ${inr(v.amount)} to vault`;
    else if (v.type === "Interest") title = `Interest credited ${inr(v.amount)}`;
    else if (v.type === "Manual") title = `Deposited ${inr(v.amount)} to vault`;
    else title = `Vault deposit ${inr(v.amount)}`;
    out.push({
      id: `vt-${v.id}`,
      type: "vault",
      title,
      body: v.label,
      timestamp: toISO(v.date),
      read: false,
      tone: "teal",
    });
  }

  // ── Spending alert (only if spending/income > 0.65) ──────────
  const monthlyIncome = snap?.income ?? 48200;
  const monthlySpending = snap?.spending ?? 31400;
  const ratio = monthlyIncome > 0 ? monthlySpending / monthlyIncome : 0;
  const snapTs = snap?.updatedAt ? toISO(snap.updatedAt) : new Date().toISOString();
  if (ratio > 0.65) {
    out.push({
      id: "spending-alert",
      type: "spending",
      title: "Spending alert",
      body: `You're at ${Math.round(ratio * 100)}% of income`,
      timestamp: snapTs,
      read: false,
      tone: "amb",
    });
  }

  // ── Peak day reminder (highest-income upcoming day) ──────────
  const today = snap?.today ?? 18;
  const year = snap?.year ?? 2026;
  const monthIndex = snap?.monthIndex ?? 2;
  const monthShort = snap?.monthShort ?? "Mar";
  const futureDays = heatmapDays.filter((d) => d.day >= today);
  if (futureDays.length > 0) {
    const peak = futureDays.reduce(
      (best, d) => (d.amount > best.amount ? d : best),
      futureDays[0],
    );
    const dayLabel = formatDayShort(year, monthIndex, peak.day);
    out.push({
      id: "peak-day",
      type: "peak",
      title: "Next peak day",
      body: `${dayLabel} — keep it clear for higher earnings`,
      timestamp: snapTs,
      read: false,
      tone: "acc",
    });

    // ── Ideal break window: longest run of low-income days ───
    let bestStart = -1;
    let bestLen = 0;
    let curStart = -1;
    let curLen = 0;
    for (const d of futureDays) {
      if (d.level <= 1) {
        if (curStart === -1) curStart = d.day;
        curLen++;
        if (curLen > bestLen) {
          bestLen = curLen;
          bestStart = curStart;
        }
      } else {
        curStart = -1;
        curLen = 0;
      }
    }
    if (bestStart !== -1 && bestLen >= 2) {
      const endDay = bestStart + bestLen - 1;
      out.push({
        id: "break-window",
        type: "break",
        title: "Ideal break window",
        body: `${monthShort} ${bestStart}–${endDay}`,
        timestamp: snapTs,
        read: false,
        tone: "grn",
      });
    }
  }

  // Sort by timestamp descending, limit to 8
  out.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
  return NextResponse.json(out.slice(0, 8));
}
