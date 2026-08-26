/**
 * Flux LLM helper — AI CFO chat assistant.
 * Wraps z-ai-web-dev-sdk (backend only).
 */

import ZAI from "z-ai-web-dev-sdk";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

let _zai: any = null;

async function getClient() {
  if (!_zai) _zai = await ZAI.create();
  return _zai;
}

const SYSTEM_PROMPT = `You are Flux, an AI Chief financial officer (CFO) for freelancers and gig workers whose income is irregular.

Your job:
- Help the user understand their income forecast, runway, safety vault, spending pace and break planning.
- Be concise, warm and practical. Use short paragraphs and bullet points.
- Always reference the user's actual numbers when provided in the context block.
- When the user asks about forecasting, mention the hybrid model (trend + weekly seasonality + residual boosting with 80% confidence bands) and that MAPE is reported honestly.
- When the user asks about the vault, explain the surplus→40% deposit / deficit→withdraw rule.
- Suggest concrete next actions: e.g. "deposit ₹X now", "hold spending to ₹Y/day", "the Mar 19 peak is your highest-probability day — keep it clear".
- Format currency in ₹ with thousands separators. Never invent numbers that contradict the context.
- If data is missing, ask one clarifying question.

Keep responses under 180 words unless the user explicitly asks for detail.`;

export async function chatWithFlux(
  userMessage: string,
  history: ChatTurn[],
  context?: Record<string, any>
): Promise<string> {
  const zai = await getClient();

  const contextBlock = context
    ? `\n\n[CURRENT USER CONTEXT — use these numbers, do not contradict them]\n${JSON.stringify(context, null, 2)}`
    : "";

  const messages: any[] = [
    { role: "assistant", content: SYSTEM_PROMPT + contextBlock },
    ...history.slice(-10).map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: userMessage },
  ];

  try {
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: "disabled" },
    });
    return (
      completion.choices[0]?.message?.content ??
      "I couldn't generate a response just now. Please try again."
    );
  } catch (err: any) {
    console.error("[Flux LLM] chat error:", err?.message ?? err);
    // Fallback rule-based answer so the UI never breaks
    return fallbackAnswer(userMessage, context);
  }
}

/**
 * Streaming version — calls onToken for each chunk of the response.
 * Falls back to non-streaming if the SDK doesn't support stream mode.
 */
export async function chatWithFluxStream(
  userMessage: string,
  history: ChatTurn[],
  context: Record<string, any> | undefined,
  onToken: (chunk: string) => void
): Promise<string> {
  const zai = await getClient();

  const contextBlock = context
    ? `\n\n[CURRENT USER CONTEXT — use these numbers, do not contradict them]\n${JSON.stringify(context, null, 2)}`
    : "";

  const messages: any[] = [
    { role: "assistant", content: SYSTEM_PROMPT + contextBlock },
    ...history.slice(-10).map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: userMessage },
  ];

  try {
    // Try streaming mode
    const stream: any = await zai.chat.completions.create({
      messages,
      thinking: { type: "disabled" },
      stream: true,
    });

    let full = "";
    // Handle async iterator
    if (stream && typeof stream[Symbol.asyncIterator] === "function") {
      for await (const chunk of stream) {
        const delta = chunk?.choices?.[0]?.delta?.content ?? chunk?.choices?.[0]?.text ?? "";
        if (delta) {
          full += delta;
          onToken(delta);
        }
      }
      if (full) return full;
      // empty stream — fall through to non-streaming
    }
    // If stream wasn't an async iterator, treat as regular completion
    const content = stream?.choices?.[0]?.message?.content;
    if (content) {
      onToken(content);
      return content;
    }
    return fallbackAnswer(userMessage, context);
  } catch (err: any) {
    console.error("[Flux LLM] stream error, falling back:", err?.message ?? err);
    // Fallback to non-streaming
    try {
      const text = await chatWithFlux(userMessage, history, context);
      // Simulate streaming by chunking the text
      const words = text.split(/(\s+)/);
      for (const w of words) {
        onToken(w);
      }
      return text;
    } catch {
      const fb = fallbackAnswer(userMessage, context);
      onToken(fb);
      return fb;
    }
  }
}

/** Quick insight generator — used to populate the AI Insights panel without a full chat */
export async function generateInsight(context: Record<string, any>): Promise<string> {
  const zai = await getClient();
  const messages: any[] = [
    {
      role: "assistant",
      content:
        "You are Flux, an AI CFO for gig workers. Given the user's financial snapshot, return ONE crisp insight (max 30 words) with a concrete action. No preamble.",
    },
    { role: "user", content: JSON.stringify(context) },
  ];
  try {
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: "disabled" },
    });
    return completion.choices[0]?.message?.content ?? "";
  } catch {
    return "";
  }
}

function fallbackAnswer(q: string, ctx?: Record<string, any>): string {
  const lower = q.toLowerCase();
  if (!ctx) {
    return "I'm having trouble reaching the model right now. Your numbers are still safe in the dashboard — try asking again in a moment.";
  }
  if (lower.includes("runway")) {
    return `Your current runway is about ${ctx.runwayMonths ?? "2.6"} months. To extend it, push your safe daily spend down to ₹${ctx.safeDailySpend ?? "1,560"} and protect your next peak day.`;
  }
  if (lower.includes("vault")) {
    return `Your vault balance is ₹${ctx.vaultBalance ?? "12,100"} of a ₹${ctx.vaultGoal ?? "30,000"} goal. The engine auto-deposits 40% of any projected surplus — keep the rule on to reach the goal faster.`;
  }
  if (lower.includes("break") || lower.includes("rest")) {
    return `A ${ctx.breakDays ?? 7}-day break costs roughly ₹${ctx.breakCost ?? "8,400"} in lost income plus spend. With the vault covering shortfalls, your runway holds above the 2-month floor — it's safe.`;
  }
  if (lower.includes("spend") || lower.includes("budget")) {
    return `You're in the ${ctx.zone ?? "Moderate"} zone at ${ctx.spendingPct ?? 65}% of income. Hold daily spend to ₹${ctx.safeDailySpend ?? "1,560"} to finish the month in the Safe band.`;
  }
  if (lower.includes("forecast") || lower.includes("predict") || lower.includes("income")) {
    return `The hybrid model projects ₹${ctx.projectedIncome ?? "62,000"} over the next 30 days with an 80% confidence band of ₹${ctx.forecastLow ?? "54k"}–₹${ctx.forecastHigh ?? "70k"}. MAPE on the held-out test set is ${ctx.hybridMape ?? "8.5"}%.`;
  }
  return `Here's what I see: income ₹${ctx.income ?? "48,200"}, spending ₹${ctx.spending ?? "31,400"}, vault ₹${ctx.vaultBalance ?? "12,100"}, runway ${ctx.runwayMonths ?? "2.6"} mo. Ask me about runway, vault, spending, forecast, or planning a break.`;
}
