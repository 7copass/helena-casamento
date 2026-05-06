# Card Payment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add credit card payment option (up to 12x, guest pays interest) alongside existing PIX in the gift modal.

**Architecture:** The existing transparent PIX flow stays unchanged. For card, a new `/api/checkout/card` route calls AbacatePay's v1 billing API and returns a hosted payment URL. The frontend opens this URL in a new tab and shows a "waiting" screen. The existing webhook route gains a second event handler for `billing.paid`. Two API keys are needed: `ABACATEPAY_API_KEY` (v2, already set) and `ABACATEPAY_BILLING_API_KEY` (v1, new).

**Tech Stack:** Next.js 16 App Router, React 19, AbacatePay transparent API v2 (PIX), AbacatePay billing API v1 (card), Tailwind CSS

---

## File Map

| File | Change |
|------|--------|
| `src/app/api/checkout/card/route.ts` | CREATE — billing API proxy |
| `src/components/GiftCard.tsx` | MODIFY — payment method toggle, extra fields, card flow |
| `src/app/api/webhook/abacatepay/route.ts` | MODIFY — handle `billing.paid` event |

**Env vars to add to Vercel:** `ABACATEPAY_BILLING_API_KEY=abc_prod_eBDSrEJ0jTTxnpgMFCzhETJH`

---

## Task 1: Backend — card checkout route

**Files:**
- Create: `src/app/api/checkout/card/route.ts`

- [ ] **Step 1: Create the file**

```typescript
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

  return NextResponse.json({ url: json.data.url });
}
```

- [ ] **Step 2: Test the route manually with curl**

```bash
curl -s -X POST http://localhost:3000/api/checkout/card \
  -H "Content-Type: application/json" \
  -d '{
    "giftId": 99,
    "giftName": "Presente de teste (R$10)",
    "amount": 1000,
    "guestName": "Teste Silva",
    "guestPhone": "11999999999",
    "guestEmail": "teste@teste.com",
    "guestCpf": "529.982.247-25"
  }'
```

Expected: `{"url":"https://app.abacatepay.com/pay/bill_..."}`

- [ ] **Step 3: Commit**

```bash
git add src/app/api/checkout/card/route.ts
git commit -m "feat: add card checkout route via AbacatePay billing API"
```

---

## Task 2: Webhook — handle billing.paid

**Files:**
- Modify: `src/app/api/webhook/abacatepay/route.ts`

The billing webhook payload shape (from AbacatePay) is:
```json
{
  "event": "billing.paid",
  "data": {
    "id": "bill_...",
    "paidAmount": 1000,
    "createdAt": "2026-05-06T...",
    "products": [{ "name": "Nome do presente", "externalId": "...", "quantity": 1 }],
    "customer": {
      "metadata": { "name": "Fulano", "cellphone": "11999999999" }
    }
  }
}
```

- [ ] **Step 1: Replace the file with the updated version**

```typescript
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

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/webhook/abacatepay/route.ts
git commit -m "feat: handle billing.paid webhook event for card payments"
```

---

## Task 3: Frontend — payment method toggle + card flow

**Files:**
- Modify: `src/components/GiftCard.tsx`

This is a full replacement of the component. The changes are:
1. Add `paymentMethod: "pix" | "card"` state
2. Add `email` and `cpf` state (used only for card)
3. Add `Step` variant `"card-pending"`
4. `openModal` resets all new state
5. Form shows toggle PIX/Cartão; when card is selected, email + CPF fields appear
6. `handleSubmit` branches on `paymentMethod`: PIX path is unchanged, card path calls `/api/checkout/card` and opens the URL in a new tab
7. New `"card-pending"` step renders a "waiting" screen

- [ ] **Step 1: Replace `src/components/GiftCard.tsx` with the full updated version**

```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import { Gift } from "@prisma/client";

interface GiftCardProps {
  gift: Gift;
}

type Step = "form" | "pix" | "card-pending" | "success";
type PaymentMethod = "pix" | "card";

interface PixData {
  id: string;
  brCode: string;
  brCodeBase64: string;
}

export function GiftCard({ gift }: GiftCardProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pix, setPix] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(gift.price));

  function openModal() {
    setOpen(true);
    setStep("form");
    setPaymentMethod("pix");
    setName("");
    setPhone("");
    setEmail("");
    setCpf("");
    setError(null);
    setPix(null);
    setCopied(false);
  }

  function closeModal() {
    setOpen(false);
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function startPolling(pixId: string) {
    let attempts = 0;
    const MAX_ATTEMPTS = 120;

    pollRef.current = setInterval(async () => {
      attempts++;
      if (attempts > MAX_ATTEMPTS) {
        clearInterval(pollRef.current!);
        pollRef.current = null;
        return;
      }
      try {
        const res = await fetch(`/api/checkout/status?id=${pixId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "PAID" || data.status === "COMPLETED") {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setStep("success");
        }
      } catch {
        // silently retry
      }
    }, 5000);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    if (paymentMethod === "card" && (!email.trim() || !cpf.trim())) return;
    setLoading(true);
    setError(null);

    try {
      if (paymentMethod === "pix") {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            giftId: gift.id,
            giftName: gift.name,
            amount: Math.round(Number(gift.price) * 100),
            guestName: name.trim(),
            guestPhone: phone.trim(),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Erro ao gerar PIX. Tente novamente.");
          return;
        }
        setPix(data);
        setStep("pix");
        startPolling(data.id);
      } else {
        const res = await fetch("/api/checkout/card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            giftId: gift.id,
            giftName: gift.name,
            amount: Math.round(Number(gift.price) * 100),
            guestName: name.trim(),
            guestPhone: phone.trim(),
            guestEmail: email.trim(),
            guestCpf: cpf.trim(),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Erro ao gerar link de pagamento. Tente novamente.");
          return;
        }
        window.open(data.url, "_blank", "noopener,noreferrer");
        setStep("card-pending");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!pix) return;
    try {
      await navigator.clipboard.writeText(pix.brCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Não foi possível copiar. Selecione o código manualmente.");
    }
  }

  const inputClass =
    "border border-primary/20 px-3 py-2 text-sm font-serif text-foreground focus:outline-none focus:border-primary/60 disabled:opacity-50";
  const labelClass =
    "text-[10px] font-sans tracking-[0.15em] uppercase text-foreground/50";

  return (
    <>
      <div className="bg-white border border-primary/15 flex flex-col transition-all hover:border-primary/40 hover:shadow-sm group">
        <div className="h-[2px] bg-primary/20 group-hover:bg-primary/50 transition-colors" />
        <div className="p-5 md:p-6 flex-1 flex flex-col">
          <h3 className="text-sm md:text-base font-serif text-foreground leading-snug mb-4 flex-1">
            {gift.name}
          </h3>
          <div className="pt-4 border-t border-primary/10 flex items-center justify-between gap-3">
            <span className="font-serif text-lg md:text-xl text-secondary font-semibold">
              {formattedPrice}
            </span>
            <button
              className="bg-primary text-white hover:bg-primary/90 transition-all text-[10px] md:text-xs font-sans font-medium tracking-[0.15em] uppercase px-5 py-2.5 shadow-sm hover:shadow-md"
              onClick={openModal}
            >
              Presentear
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white w-full max-w-sm p-6 md:p-8 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-foreground/40 hover:text-foreground text-xl leading-none"
              aria-label="Fechar"
            >
              ×
            </button>

            {step === "form" && (
              <>
                <p className="text-[9px] tracking-[0.3em] uppercase text-foreground/40 font-sans mb-2">
                  Presentear
                </p>
                <h2
                  className="text-2xl text-primary mb-1"
                  style={{ fontFamily: "var(--font-pinyon-script)" }}
                >
                  {gift.name}
                </h2>
                <p className="font-serif text-lg text-secondary font-semibold mb-6">
                  {formattedPrice}
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="guest-name" className={labelClass}>
                      Seu nome
                    </label>
                    <input
                      id="guest-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                      className={inputClass}
                      placeholder="Nome completo"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="guest-phone" className={labelClass}>
                      Telefone / WhatsApp
                    </label>
                    <input
                      id="guest-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      disabled={loading}
                      className={inputClass}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className={labelClass}>Forma de pagamento</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("pix")}
                        disabled={loading}
                        className={`flex-1 py-2 text-[10px] font-sans font-medium tracking-[0.15em] uppercase border transition-all disabled:opacity-50 ${
                          paymentMethod === "pix"
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-foreground/60 border-primary/20 hover:border-primary/50"
                        }`}
                      >
                        PIX
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        disabled={loading}
                        className={`flex-1 py-2 text-[10px] font-sans font-medium tracking-[0.15em] uppercase border transition-all disabled:opacity-50 ${
                          paymentMethod === "card"
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-foreground/60 border-primary/20 hover:border-primary/50"
                        }`}
                      >
                        Cartão
                      </button>
                    </div>
                  </div>

                  {paymentMethod === "card" && (
                    <>
                      <div className="flex flex-col gap-1">
                        <label htmlFor="guest-email" className={labelClass}>
                          E-mail
                        </label>
                        <input
                          id="guest-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                          className={inputClass}
                          placeholder="seu@email.com"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label htmlFor="guest-cpf" className={labelClass}>
                          CPF
                        </label>
                        <input
                          id="guest-cpf"
                          type="text"
                          value={cpf}
                          onChange={(e) => setCpf(e.target.value)}
                          required
                          disabled={loading}
                          className={inputClass}
                          placeholder="000.000.000-00"
                        />
                      </div>
                      <p className="text-[10px] text-foreground/40 font-sans -mt-2">
                        Parcelamento em até 12x com juros.
                      </p>
                    </>
                  )}

                  {error && (
                    <p className="text-xs text-red-500 font-sans">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-white text-[10px] font-sans font-medium tracking-[0.15em] uppercase px-5 py-3 mt-2 hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {loading
                      ? paymentMethod === "pix"
                        ? "Gerando PIX..."
                        : "Gerando link..."
                      : paymentMethod === "pix"
                      ? "Gerar PIX"
                      : "Pagar com Cartão"}
                  </button>
                </form>
              </>
            )}

            {step === "pix" && pix && (
              <div className="flex flex-col items-center text-center">
                <p className="text-[9px] tracking-[0.3em] uppercase text-foreground/40 font-sans mb-3">
                  Pague com PIX
                </p>
                <h2
                  className="text-2xl text-primary mb-4"
                  style={{ fontFamily: "var(--font-pinyon-script)" }}
                >
                  {gift.name}
                </h2>
                <img
                  src={pix.brCodeBase64}
                  alt="QR Code PIX"
                  className="w-48 h-48 mb-4"
                />
                <p className="text-xs text-foreground/50 font-sans mb-3">
                  Escaneie o QR Code ou copie o código abaixo
                </p>
                <button
                  onClick={handleCopy}
                  className="w-full border border-primary/20 px-4 py-2 text-[10px] font-sans tracking-[0.1em] uppercase text-foreground/60 hover:border-primary/50 transition-all"
                >
                  {copied ? "Copiado! ✓" : "Copiar código PIX"}
                </button>
                <p className="text-[10px] text-foreground/40 font-sans mt-4">
                  O código expira em 1 hora.
                </p>
              </div>
            )}

            {step === "card-pending" && (
              <div className="flex flex-col items-center text-center py-4">
                <div className="text-4xl mb-4">💳</div>
                <p className="text-[9px] tracking-[0.3em] uppercase text-foreground/40 font-sans mb-3">
                  Pagamento em andamento
                </p>
                <h2
                  className="text-2xl text-primary mb-3"
                  style={{ fontFamily: "var(--font-pinyon-script)" }}
                >
                  {gift.name}
                </h2>
                <p className="text-sm font-serif text-foreground/70 leading-relaxed mb-1">
                  Uma nova aba foi aberta com a página de pagamento.
                </p>
                <p className="text-sm font-serif text-foreground/70 leading-relaxed mb-6">
                  Conclua o pagamento por lá e pode fechar este modal.
                </p>
                <button
                  onClick={closeModal}
                  className="bg-primary text-white text-[10px] font-sans font-medium tracking-[0.15em] uppercase px-8 py-3 hover:bg-primary/90 transition-all"
                >
                  Fechar
                </button>
              </div>
            )}

            {step === "success" && (
              <div className="flex flex-col items-center text-center py-4">
                <div className="text-4xl mb-4">🌿</div>
                <p className="text-[9px] tracking-[0.3em] uppercase text-foreground/40 font-sans mb-3">
                  Pagamento confirmado
                </p>
                <h2
                  className="text-3xl text-primary mb-3"
                  style={{ fontFamily: "var(--font-pinyon-script)" }}
                >
                  Obrigado!
                </h2>
                <p className="text-sm font-serif text-foreground/70 leading-relaxed mb-1">
                  Seu presente foi registrado com carinho.
                </p>
                <p className="text-sm font-serif text-foreground/70 leading-relaxed mb-6">
                  André e Maria Helena agradecem de coração. 💚
                </p>
                <button
                  onClick={closeModal}
                  className="bg-primary text-white text-[10px] font-sans font-medium tracking-[0.15em] uppercase px-8 py-3 hover:bg-primary/90 transition-all"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles with no errors**

```bash
npx tsc --noEmit
```

Expected: no output (no errors)

- [ ] **Step 3: Start dev server and open the site**

```bash
npm run dev
```

Open http://localhost:3000, click "Presentear" on any gift and verify:
- Toggle PIX/Cartão appears
- Selecting Cartão shows Email + CPF fields
- Selecting PIX hides them
- Button label changes ("Gerar PIX" vs "Pagar com Cartão")

- [ ] **Step 4: Test card flow end-to-end**

With dev server running, click Presentear, select Cartão, fill all fields (use CPF `529.982.247-25` for test), click "Pagar com Cartão".

**Note:** The `/api/checkout/card` route requires `ABACATEPAY_BILLING_API_KEY` in `.env.local`. Add it:
```
ABACATEPAY_BILLING_API_KEY=abc_prod_eBDSrEJ0jTTxnpgMFCzhETJH
```

Expected: new tab opens at `https://app.abacatepay.com/pay/bill_...` and modal shows "Pagamento em andamento".

- [ ] **Step 5: Commit**

```bash
git add src/components/GiftCard.tsx
git commit -m "feat: add card payment option with PIX/card toggle in gift modal"
```

---

## Task 4: Add env var to Vercel + push

- [ ] **Step 1: Add env var in Vercel dashboard**

In the Vercel project settings → Environment Variables, add:
- Key: `ABACATEPAY_BILLING_API_KEY`
- Value: `abc_prod_eBDSrEJ0jTTxnpgMFCzhETJH`
- Environment: Production

- [ ] **Step 2: Push all commits**

```bash
git push
```

- [ ] **Step 3: Test on production**

Open https://helena-casamento.vercel.app, click Presentear, select Cartão, fill the form, confirm a new tab opens with the AbacatePay payment page.
