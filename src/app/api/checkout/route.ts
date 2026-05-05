import { NextRequest, NextResponse } from "next/server";

const ABACATEPAY_API = "https://api.abacatepay.com/v2";

export async function POST(req: NextRequest) {
  const { giftId, giftName, amount, guestName, guestPhone } = await req.json();

  if (!giftId || !giftName || !amount || !guestName || !guestPhone) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  const apiKey = process.env.ABACATEPAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key não configurada" }, { status: 500 });
  }

  const res = await fetch(`${ABACATEPAY_API}/transparents/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      amount,
      description: giftName,
      expiresIn: 3600,
      customer: { name: guestName, cellphone: guestPhone },
      metadata: { giftId, giftName, guestName, guestPhone },
    }),
  });

  const json = await res.json();

  if (!res.ok || json.error) {
    return NextResponse.json(
      { error: json.error ?? "Erro ao gerar PIX" },
      { status: res.status }
    );
  }

  const { id, brCode, brCodeBase64 } = json.data;
  return NextResponse.json({ id, brCode, brCodeBase64 });
}
