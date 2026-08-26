import { NextResponse } from "next/server";
import { ensureSeed, getFluxState } from "@/lib/seed";
import { db } from "@/lib/db";

export async function GET() {
  await ensureSeed();
  const state = await getFluxState();
  return NextResponse.json(state);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const allowed = [
    "name", "email", "city", "role", "stabilityScore",
    "incomeTarget", "spendingTarget", "vaultGoal", "minRunwayMonths",
    "workType", "paymentFreq",
  ];
  const data: Record<string, any> = {};
  for (const k of allowed) if (k in body) data[k] = body[k];
  const profile = await db.profile.upsert({
    where: { id: "me" },
    update: data,
    create: { id: "me", ...data },
  });
  return NextResponse.json(profile);
}
