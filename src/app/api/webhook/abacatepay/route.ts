import { NextRequest, NextResponse } from "next/server";

const EXTERNAL_WEBHOOK = "https://editor.leaderaperformance.com.br/webhook/helena";

type TransparentPayload = {
  event: "transparent.completed";
  data: {
    amount?: number;
    createdAt?: string;
    metadata?: Record<string, unknown>;
  };
};

type BillingPayload = {
  event: "billing.paid";
  data: {
    paidAmount?: number;
    createdAt?: string;
    products?: Array<{ name?: string; externalId?: string }>;
    customer?: {
      metadata?: { name?: string; cellphone?: string };
    };
  };
};

type AbacatePayload = TransparentPayload | BillingPayload | { event?: string; data?: unknown };

export async function POST(req: NextRequest) {
  let payload: AbacatePayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  if (
    payload.event !== "transparent.completed" &&
    payload.event !== "billing.paid"
  ) {
    return NextResponse.json({ received: true });
  }

  let forwardBody: Record<string, unknown>;

  if (payload.event === "transparent.completed") {
    const { amount, createdAt, metadata } = (payload as TransparentPayload).data ?? {};
    const { giftId, giftName, guestName, guestPhone } = (metadata ?? {}) as Record<string, string | number>;
    forwardBody = {
      paymentMethod: "pix",
      guestName,
      guestPhone,
      giftId,
      giftName,
      amount: typeof amount === "number" ? amount / 100 : undefined,
      paidAt: createdAt,
      _raw: payload,
    };
  } else {
    const { paidAmount, createdAt, products, customer } = (payload as BillingPayload).data ?? {};
    const giftName = products?.[0]?.name;
    const guestName = customer?.metadata?.name;
    const guestPhone = customer?.metadata?.cellphone;
    forwardBody = {
      paymentMethod: "card",
      guestName,
      guestPhone,
      giftName,
      amount: typeof paidAmount === "number" ? paidAmount / 100 : undefined,
      paidAt: createdAt,
      _raw: payload,
    };
  }

  try {
    const fwdRes = await fetch(EXTERNAL_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(forwardBody),
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
