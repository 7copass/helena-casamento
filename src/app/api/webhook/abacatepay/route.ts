import { NextRequest, NextResponse } from "next/server";

const EXTERNAL_WEBHOOK = "https://editor.leaderaperformance.com.br/webhook/helena";

export async function POST(req: NextRequest) {
  let payload: { event?: string; data?: { amount?: number; createdAt?: string; metadata?: Record<string, unknown> } };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  if (payload.event !== "transparent.completed") {
    return NextResponse.json({ received: true });
  }

  const { amount, createdAt, metadata } = payload.data ?? {};
  const { giftId, giftName, guestName, guestPhone } = (metadata ?? {}) as Record<string, string | number>;

  try {
    const fwdRes = await fetch(EXTERNAL_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestName,
        guestPhone,
        giftId,
        giftName,
        amount: typeof amount === "number" ? amount / 100 : undefined,
        paidAt: createdAt,
        _raw: payload,
      }),
    });

    if (!fwdRes.ok) {
      console.error("Webhook forward failed", fwdRes.status);
    }
  } catch (err) {
    console.error("Webhook forward error", err);
  }

  // Always return 200 so AbacatePay does not retry and send duplicate events
  return NextResponse.json({ received: true });
}
