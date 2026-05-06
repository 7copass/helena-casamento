import { NextRequest, NextResponse } from "next/server";

const EXTERNAL_WEBHOOK = "https://editor.leaderaperformance.com.br/webhook/helena";

export async function POST(req: NextRequest) {
  const payload = await req.json();

  if (payload.event !== "transparent.completed") {
    return NextResponse.json({ received: true });
  }

  const { amount, createdAt, metadata } = payload.data ?? {};
  const { giftId, giftName, guestName, guestPhone } = metadata ?? {};

  await fetch(EXTERNAL_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      guestName,
      guestPhone,
      giftId,
      giftName,
      amount: amount / 100,
      paidAt: createdAt,
    }),
  });

  return NextResponse.json({ received: true });
}
