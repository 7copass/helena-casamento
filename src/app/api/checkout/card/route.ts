import { NextRequest, NextResponse } from "next/server";

const ABACATEPAY_V2 = "https://api.abacatepay.com/v2";

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

  const apiKey = process.env.ABACATEPAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key não configurada" }, { status: 500 });
  }

  const cpfDigits = String(guestCpf).replace(/\D/g, "");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  // 1. Create product
  let productRes: Response;
  try {
    productRes = await fetch(`${ABACATEPAY_V2}/products/create`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: String(giftName),
        price: amount,
        currency: "BRL",
        externalId: `gift-${giftId}-${Date.now()}`,
      }),
    });
  } catch {
    return NextResponse.json({ error: "Erro de conexão com o gateway" }, { status: 502 });
  }

  const productJson = await productRes.json();
  if (!productRes.ok || productJson.error) {
    return NextResponse.json(
      { error: productJson.error ?? "Erro ao criar produto" },
      { status: 502 }
    );
  }

  const productId = productJson.data?.id;
  if (!productId) {
    return NextResponse.json({ error: "Resposta inválida ao criar produto" }, { status: 502 });
  }

  // 2. Create customer
  let customerRes: Response;
  try {
    customerRes = await fetch(`${ABACATEPAY_V2}/customers/create`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: String(guestName),
        email: String(guestEmail),
        cellphone: String(guestPhone).replace(/\D/g, ""),
        taxId: cpfDigits,
      }),
    });
  } catch {
    return NextResponse.json({ error: "Erro de conexão com o gateway" }, { status: 502 });
  }

  const customerJson = await customerRes.json();
  if (!customerRes.ok || customerJson.error) {
    return NextResponse.json(
      { error: customerJson.error ?? "Erro ao criar cliente" },
      { status: 502 }
    );
  }

  const customerId = customerJson.data?.id;
  if (!customerId) {
    return NextResponse.json({ error: "Resposta inválida ao criar cliente" }, { status: 502 });
  }

  // 3. Create checkout with installments
  // Minimum R$10 per installment — cap at what the amount allows, max 12
  const maxInstallments = Math.min(12, Math.max(1, Math.floor(amount / 1000)));

  let checkoutRes: Response;
  try {
    checkoutRes = await fetch(`${ABACATEPAY_V2}/checkouts/create`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        items: [{ id: productId, quantity: 1 }],
        methods: ["CARD"],
        frequency: "ONE_TIME",
        card: { maxInstallments },
        customerId,
        returnUrl: "https://helena-casamento.vercel.app",
        completionUrl: "https://helena-casamento.vercel.app",
      }),
    });
  } catch {
    return NextResponse.json({ error: "Erro de conexão com o gateway" }, { status: 502 });
  }

  const checkoutJson = await checkoutRes.json();
  if (!checkoutRes.ok || checkoutJson.error) {
    return NextResponse.json(
      { error: checkoutJson.error ?? "Erro ao gerar link de pagamento" },
      { status: 502 }
    );
  }

  const url = checkoutJson.data?.url;
  if (!url) {
    return NextResponse.json({ error: "Resposta inválida do gateway" }, { status: 502 });
  }

  return NextResponse.json({ url });
}
