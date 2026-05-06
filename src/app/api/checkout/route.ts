import { NextRequest, NextResponse } from "next/server";

const ABACATEPAY_API = "https://api.abacatepay.com/v2";

export async function POST(req: NextRequest) {
  let body: { giftId?: unknown; giftName?: unknown; amount?: unknown; guestName?: unknown; guestPhone?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const { giftId, giftName, amount, guestName, guestPhone } = body;

  if (
    giftId === undefined || giftId === null ||
    !giftName ||
    typeof amount !== "number" ||
    !Number.isInteger(amount) ||
    amount <= 0 ||
    !guestName ||
    !guestPhone
  ) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  const apiKey = process.env.ABACATEPAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key não configurada" }, { status: 500 });
  }

  let res: Response;
  try {
    res = await fetch(`${ABACATEPAY_API}/transparents/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        method: "PIX",
        data: {
          amount,
          description: giftName,
          expiresIn: 3600,
          metadata: { giftId, giftName, guestName, guestPhone },
        },
      }),
    });
  } catch {
    return NextResponse.json({ error: "Erro de conexão com o gateway de pagamento" }, { status: 502 });
  }

  const json = await res.json();

  if (!res.ok || json.error) {
    return NextResponse.json(
      { error: json.error ?? "Erro ao gerar PIX" },
      { status: 502 }
    );
  }

  const { id, brCode, brCodeBase64 } = json.data;
  return NextResponse.json({ id, brCode, brCodeBase64 });
}
