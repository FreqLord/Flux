import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeed } from "@/lib/seed";

export async function GET() {
  await ensureSeed();
  const txs = await db.transaction.findMany({ orderBy: { date: "desc" }, take: 50 });
  return NextResponse.json(txs);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { label, date, category, amount, flow, tone } = body;
  if (!label || !date || !amount) {
    return NextResponse.json({ error: "label, date, amount are required" }, { status: 400 });
  }
  const tx = await db.transaction.create({
    data: {
      label,
      date: new Date(date),
      category: category || "Other",
      amount: Number(amount),
      flow: flow || "out",
      tone: tone || "br",
    },
  });
  return NextResponse.json(tx, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.transaction.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
