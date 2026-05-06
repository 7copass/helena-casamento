import { NextRequest, NextResponse } from "next/server";

const ABACATEPAY_BILLING_API = "https://api.abacatepay.com/v1";

export async function POST(req: NextRequest) {
  let body: {
    giftId?: unknown;
    giftName?: unknown;
    amount?: unknown;
    guestName?: unknown;
    guestPhone?: unknown;
    guestEmail?: unknown;
    guestCpf?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const { giftId, giftName, amount, guestName, guestPhone, guestEmail, guestCpf } = body;

  if (
    giftId === undefined || giftId === null ||
    !giftName ||
    typeof amount !== "number" ||
    !Number.isInteger(amount) ||
    amount <= 0 ||
    !guestName ||
    !guestPhone ||
    !guestEmail ||
    !guestCpf
  ) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  const apiKey = process.env.ABACATEPAY_BILLING_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Billing API key não configurada" }, { status: 500 });
  }

  const cpfDigits = String(guestCpf).replace(/\D/g, "");

  let res: Response;
  try {
    res = await fetch(`${ABACATEPAY_BILLING_API}/billing/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        products: [
          {
            externalId: String(giftId),
            name: String(giftName),
            quantity: 1,
            price: amount,
          },
        ],
        customer: {
          name: String(guestName),
          email: String(guestEmail),
          cellphone: String(guestPhone).replace(/\D/g, ""),
          taxId: cpfDigits,
        },
        returnUrl: "https://helena-casamento.vercel.app",
        completionUrl: "https://helena-casamento.vercel.app",
        methods: ["CARD"],
        frequency: "ONE_TIME",
        maxInstallments: 12,
      }),
    });
  } catch {
    return NextResponse.json({ error: "Erro de conexão com o gateway de pagamento" }, { status: 502 });
  }

  const json = await res.json();

  if (!res.ok || json.error) {
    return NextResponse.json(
      { error: json.error ?? "Erro ao gerar link de pagamento" },
      { status: 502 }
    );
  }

  const url = json.data?.url;
  if (!url) {
    return NextResponse.json({ error: "Resposta inválida do gateway" }, { status: 502 });
  }

  return NextResponse.json({ url });
}
