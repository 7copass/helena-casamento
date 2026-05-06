import { NextRequest, NextResponse } from "next/server";

const ABACATEPAY_API = "https://api.abacatepay.com/v2";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  }

  const apiKey = process.env.ABACATEPAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key não configurada" }, { status: 500 });
  }

  let res: Response;
  try {
    res = await fetch(`${ABACATEPAY_API}/transparents/${id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  } catch {
    return NextResponse.json({ error: "Erro de conexão com o gateway" }, { status: 502 });
  }

  const json = await res.json();

  if (!res.ok || json.error) {
    return NextResponse.json({ error: json.error ?? "Erro ao consultar status" }, { status: 502 });
  }

  return NextResponse.json({ status: json.data?.status ?? json.data?.payment_status ?? null });
}
