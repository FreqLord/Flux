import { db } from "@/lib/db";
import { ensureSeed } from "@/lib/seed";
import { chatWithFluxStream, type ChatTurn } from "@/lib/llm";

/**
 * POST /api/chat/stream
 * Body: { message: string }
 * Returns a Server-Sent Events stream of tokens.
 *
 * Format:
 *   data: {"token":"..."}\n\n   (for each token chunk)
 *   data: {"done":true,"content":"...","createdAt":"..."}\n\n  (final)
 *   data: {"error":"..."}\n\n  (on error)
 */
export async function POST(req: Request) {
  await ensureSeed();
  const body = await req.json();
  const { message } = body;
  if (!message || typeof message !== "string") {
    return new Response(JSON.stringify({ error: "message required" }), { status: 400 });
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
  const context = {
    name: profile?.name ?? "Arjun",
    role: profile?.role ?? "Freelancer",
    monthlyIncome,
    monthlySpending,
    income: monthlyIncome,
    spending: monthlySpending,
    vaultBalance,
    vaultGoal: profile?.vaultGoal ?? 30000,
    runwayMonths: 2.6,
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

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      try {
        const fullText = await chatWithFluxStream(message, history, context, (token) => {
          send({ token });
        });

        // Save assistant reply
        await db.chatMessage.create({ data: { role: "assistant", content: fullText } });

        send({ done: true, content: fullText, createdAt: new Date().toISOString() });
      } catch (err: any) {
        send({ error: err?.message ?? "Stream failed" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
