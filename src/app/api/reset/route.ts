import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** Wipe all dynamic data and re-seed the demo snapshot. */
export async function POST() {
  await Promise.all([
    db.transaction.deleteMany({}),
    db.vaultTransaction.deleteMany({}),
    db.forecastRun.deleteMany({}),
    db.heatmapDay.deleteMany({}),
    db.category.deleteMany({}),
    db.chatMessage.deleteMany({}),
    db.snapshot.deleteMany({}),
    db.profile.deleteMany({}),
  ]);
  // re-seed
  const { ensureSeed } = await import("@/lib/seed");
  await ensureSeed();
  return NextResponse.json({ ok: true });
}
