import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeed } from "@/lib/seed";

export async function GET() {
  await ensureSeed();
  const [vts, snap] = await Promise.all([
    db.vaultTransaction.findMany({ orderBy: { date: "desc" }, take: 50 }),
    db.snapshot.findUnique({ where: { id: 1 } }),
  ]);
  return NextResponse.json({ transactions: vts, balance: snap?.vaultBalance ?? 0 });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { action, amount, label } = body; // action: deposit | withdraw
  if (!action || !amount) {
    return NextResponse.json({ error: "action and amount required" }, { status: 400 });
  }
  const amt = Math.round(Number(amount));
  if (amt <= 0) return NextResponse.json({ error: "amount must be positive" }, { status: 400 });

  const snap = await db.snapshot.findUnique({ where: { id: 1 } });
  if (!snap) return NextResponse.json({ error: "no snapshot" }, { status: 500 });

  let newBalance = snap.vaultBalance;
  let flow: "in" | "out" = "in";
  let tone = "bg";
  let type = "Manual";

  if (action === "deposit") {
    newBalance = snap.vaultBalance + amt;
    flow = "in";
    tone = "bl";
    type = "Manual";
  } else if (action === "withdraw") {
    if (amt > snap.vaultBalance) {
      return NextResponse.json({ error: "insufficient vault balance" }, { status: 400 });
    }
    newBalance = snap.vaultBalance - amt;
    flow = "out";
    tone = "ba";
    type = "Withdraw";
  } else {
    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  }

  const [vt, updatedSnap] = await Promise.all([
    db.vaultTransaction.create({
      data: {
        label: label || (action === "deposit" ? "Manual deposit" : "Manual withdrawal"),
        date: new Date(),
        type,
        amount: amt,
        flow,
        tone,
      },
    }),
    db.snapshot.update({ where: { id: 1 }, data: { vaultBalance: newBalance } }),
  ]);

  return NextResponse.json({ transaction: vt, balance: updatedSnap.vaultBalance });
}
