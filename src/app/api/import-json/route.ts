import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeed } from "@/lib/seed";

/**
 * POST /api/import-json
 * Body: a JSON object with the same shape as /api/export-json output.
 *
 * Behavior:
 *   - Upsert profile (id="me") with the imported fields.
 *   - Upsert snapshot (id=1) with the imported fields.
 *   - Delete + recreate: transactions, vaultTransactions, categories, heatmapDays.
 *   - PRESERVE forecast runs + chatMessages (do NOT wipe them on import).
 *
 * Returns: { ok: true, imported: { transactions, vaultTransactions, categories } }
 */
export async function POST(req: Request) {
  await ensureSeed();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Expected a JSON object" }, { status: 400 });
  }

  // Coerce helper — accepts string|number|Date and returns a Date.
  const asDate = (v: any): Date => {
    if (!v) return new Date();
    if (v instanceof Date) return v;
    const d = new Date(v);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const num = (v: any, fallback = 0): number => {
    const n = typeof v === "string" ? parseFloat(v) : Number(v);
    return isNaN(n) ? fallback : n;
  };

  const str = (v: any, fallback = ""): string =>
    v == null ? fallback : String(v);

  try {
    // ── 1. Profile upsert ─────────────────────────────────────────
    if (body.profile && typeof body.profile === "object") {
      const p = body.profile;
      await db.profile.upsert({
        where: { id: "me" },
        update: {
          name:           str(p.name, "Arjun Kumar"),
          email:          str(p.email, "arjun.kumar@gmail.com"),
          city:           str(p.city, "Mumbai, India"),
          role:           str(p.role, "Freelance Developer"),
          stabilityScore: num(p.stabilityScore, 72),
          incomeTarget:   num(p.incomeTarget, 67000),
          spendingTarget: num(p.spendingTarget, 38000),
          vaultGoal:      num(p.vaultGoal, 30000),
          minRunwayMonths: num(p.minRunwayMonths, 2.0),
          workType:       str(p.workType, "Freelancer"),
          paymentFreq:    str(p.paymentFreq, "Irregular"),
          currency:       str(p.currency, "INR"),
        },
        create: {
          id: "me",
          name:           str(p.name, "Arjun Kumar"),
          email:          str(p.email, "arjun.kumar@gmail.com"),
          city:           str(p.city, "Mumbai, India"),
          role:           str(p.role, "Freelance Developer"),
          stabilityScore: num(p.stabilityScore, 72),
          incomeTarget:   num(p.incomeTarget, 67000),
          spendingTarget: num(p.spendingTarget, 38000),
          vaultGoal:      num(p.vaultGoal, 30000),
          minRunwayMonths: num(p.minRunwayMonths, 2.0),
          workType:       str(p.workType, "Freelancer"),
          paymentFreq:    str(p.paymentFreq, "Irregular"),
          currency:       str(p.currency, "INR"),
        },
      });
    }

    // ── 2. Snapshot upsert ────────────────────────────────────────
    if (body.snapshot && typeof body.snapshot === "object") {
      const s = body.snapshot;
      await db.snapshot.upsert({
        where: { id: 1 },
        update: {
          monthLabel:    str(s.monthLabel, "March 2026"),
          monthShort:    str(s.monthShort, "Mar"),
          year:          num(s.year, 2026),
          monthIndex:    num(s.monthIndex, 2),
          today:         num(s.today, 18),
          daysInMonth:   num(s.daysInMonth, 31),
          daysPassed:    num(s.daysPassed, 18),
          income:        num(s.income, 48200),
          spending:      num(s.spending, 31400),
          baselineNeed:  num(s.baselineNeed, 11000),
          vaultBalance:  num(s.vaultBalance, 12100),
        },
        create: {
          id: 1,
          monthLabel:    str(s.monthLabel, "March 2026"),
          monthShort:    str(s.monthShort, "Mar"),
          year:          num(s.year, 2026),
          monthIndex:    num(s.monthIndex, 2),
          today:         num(s.today, 18),
          daysInMonth:   num(s.daysInMonth, 31),
          daysPassed:    num(s.daysPassed, 18),
          income:        num(s.income, 48200),
          spending:      num(s.spending, 31400),
          baselineNeed:  num(s.baselineNeed, 11000),
          vaultBalance:  num(s.vaultBalance, 12100),
        },
      });
    }

    // ── 3. Transactions (wipe + recreate) ────────────────────────
    if (Array.isArray(body.transactions)) {
      await db.transaction.deleteMany({});
      const rows = body.transactions
        .filter((t: any) => t && t.label != null && t.amount != null)
        .map((t: any) => ({
          label:    str(t.label),
          date:     asDate(t.date),
          category: str(t.category, "Other"),
          amount:   num(t.amount, 0),
          flow:     str(t.flow, "out"),
          tone:     str(t.tone, "br"),
        }));
      if (rows.length > 0) {
        await db.transaction.createMany({ data: rows });
      }
    }

    // ── 4. Vault transactions (wipe + recreate) ──────────────────
    if (Array.isArray(body.vaultTransactions)) {
      await db.vaultTransaction.deleteMany({});
      const rows = body.vaultTransactions
        .filter((t: any) => t && t.label != null && t.amount != null)
        .map((t: any) => ({
          label: str(t.label),
          date:  asDate(t.date),
          type:  str(t.type, "Manual"),
          amount: num(t.amount, 0),
          flow:  str(t.flow, "in"),
          tone:  str(t.tone, "bg"),
        }));
      if (rows.length > 0) {
        await db.vaultTransaction.createMany({ data: rows });
      }
    }

    // ── 5. Categories (wipe + recreate) ───────────────────────────
    if (Array.isArray(body.categories)) {
      await db.category.deleteMany({});
      const rows = body.categories
        .filter((c: any) => c && c.label != null)
        .map((c: any, i: number) => ({
          icon:  str(c.icon, "home"),
          label: str(c.label),
          spent: num(c.spent, 0),
          limit: num(c.limit, 0),
          tone:  str(c.tone, "acc"),
          order: num(c.order, i),
        }));
      if (rows.length > 0) {
        await db.category.createMany({ data: rows });
      }
    }

    // ── 6. Heatmap days (wipe + recreate) ────────────────────────
    if (Array.isArray(body.heatmapDays)) {
      await db.heatmapDay.deleteMany({});
      const rows = body.heatmapDays
        .filter((h: any) => h && h.day != null)
        .map((h: any) => ({
          day:         num(h.day, 0),
          level:       num(h.level, 0),
          amount:      num(h.amount, 0),
          probability: num(h.probability, 0),
          predicted:  !!h.predicted,
        }));
      if (rows.length > 0) {
        await db.heatmapDay.createMany({ data: rows });
      }
    }

    // NOTE: Forecast runs + chat messages are intentionally preserved.

    const [txCount, vtCount, catCount] = await Promise.all([
      db.transaction.count(),
      db.vaultTransaction.count(),
      db.category.count(),
    ]);

    return NextResponse.json({
      ok: true,
      imported: {
        transactions: txCount,
        vaultTransactions: vtCount,
        categories: catCount,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Import failed" },
      { status: 400 },
    );
  }
}
