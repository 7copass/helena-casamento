# AbacatePay PIX Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a guest clicks "Presentear", a modal asks for name + phone, generates a PIX QR Code via AbacatePay, and when paid, forwards the payment data to an external webhook.

**Architecture:** Three pieces — a client-side modal (form → pix states), a server API route that calls AbacatePay transparent checkout via raw fetch, and a webhook receiver that forwards data to the user's external URL. The SDK is bypassed in favor of raw fetch because we need to pass `metadata` and the SDK's `CreatePixQrCodeData` type doesn't include it.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, AbacatePay REST API v2

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `.env.local` | Create | AbacatePay API key (dev) |
| `src/app/api/checkout/route.ts` | Create | POST — call AbacatePay, return `brCode` + `brCodeBase64` |
| `src/app/api/webhook/abacatepay/route.ts` | Create | POST — receive AbacatePay event, forward to external URL |
| `src/components/GiftCard.tsx` | Modify | Add modal with `form` and `pix` states |

---

## Task 1: Environment variable

**Files:**
- Create: `.env.local`

- [ ] **Step 1.1: Create `.env.local`**

```bash
cat > /path/to/project/.env.local << 'EOF'
ABACATEPAY_API_KEY=abc_dev_JUAtmgHfC0bwzefUdf3MWRPm
EOF
```

Or create the file manually with this content:

```
ABACATEPAY_API_KEY=abc_dev_JUAtmgHfC0bwzefUdf3MWRPm
```

- [ ] **Step 1.2: Verify `.env.local` is gitignored**

The project's `.gitignore` already has `.env*` — confirm the file will not be committed:

```bash
git check-ignore -v .env.local
# Expected: .gitignore:37:.env*   .env.local
```

---

## Task 2: PIX generation API route

**Files:**
- Create: `src/app/api/checkout/route.ts`

The route receives gift info + guest info, calls `POST https://api.abacatepay.com/v2/transparents/create`, and returns `{ brCode, brCodeBase64, id }`.

AbacatePay transparent checkout request body shape:
```json
{
  "data": {
    "amount": 32255,
    "description": "Gift name",
    "expiresIn": 3600,
    "customer": { "name": "João", "cellphone": "11999999999" },
    "metadata": { "giftId": 15, "giftName": "...", "guestName": "...", "guestPhone": "..." }
  }
}
```

AbacatePay response envelope: `{ "data": { "id": "...", "brCode": "...", "brCodeBase64": "...", ... }, "error": null }`

- [ ] **Step 2.1: Create the route file**

Create `src/app/api/checkout/route.ts`:

```typescript
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
      data: {
        amount,
        description: giftName,
        expiresIn: 3600,
        customer: { name: guestName, cellphone: guestPhone },
        metadata: { giftId, giftName, guestName, guestPhone },
      },
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
```

- [ ] **Step 2.2: Smoke-test the route with curl**

Start the dev server (`npm run dev`) and run:

```bash
curl -s -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "giftId": 15,
    "giftName": "Extintor de DR",
    "amount": 32255,
    "guestName": "João Teste",
    "guestPhone": "11999999999"
  }' | jq .
```

Expected response shape (dev mode returns a real QR code):
```json
{
  "id": "trans_...",
  "brCode": "00020101...",
  "brCodeBase64": "iVBORw0KGgo..."
}
```

- [ ] **Step 2.3: Commit**

```bash
git add src/app/api/checkout/route.ts .env.local
git commit -m "feat: add AbacatePay transparent PIX checkout API route"
```

---

## Task 3: Webhook receiver route

**Files:**
- Create: `src/app/api/webhook/abacatepay/route.ts`

AbacatePay webhook payload for `transparent.completed`:
```json
{
  "event": "transparent.completed",
  "data": {
    "id": "trans_...",
    "amount": 32255,
    "status": "PAID",
    "paidAt": "2026-05-05T18:00:00Z",
    "metadata": {
      "giftId": 15,
      "giftName": "Extintor de DR",
      "guestName": "João Teste",
      "guestPhone": "11999999999"
    }
  }
}
```

The route forwards to `https://editor.leaderaperformance.com.br/webhook/helena`.

- [ ] **Step 3.1: Create the webhook route file**

Create `src/app/api/webhook/abacatepay/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

const EXTERNAL_WEBHOOK = "https://editor.leaderaperformance.com.br/webhook/helena";

export async function POST(req: NextRequest) {
  const payload = await req.json();

  if (payload.event !== "transparent.completed") {
    return NextResponse.json({ received: true });
  }

  const { amount, paidAt, metadata } = payload.data ?? {};
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
      paidAt,
    }),
  });

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 3.2: Smoke-test the webhook with curl**

With the dev server running:

```bash
curl -s -X POST http://localhost:3000/api/webhook/abacatepay \
  -H "Content-Type: application/json" \
  -d '{
    "event": "transparent.completed",
    "data": {
      "id": "trans_test",
      "amount": 32255,
      "status": "PAID",
      "paidAt": "2026-05-05T18:00:00.000Z",
      "metadata": {
        "giftId": 15,
        "giftName": "Extintor de DR",
        "guestName": "João Teste",
        "guestPhone": "11999999999"
      }
    }
  }' | jq .
```

Expected: `{ "received": true }` and the external webhook should receive the forwarded payload.

- [ ] **Step 3.3: Commit**

```bash
git add src/app/api/webhook/abacatepay/route.ts
git commit -m "feat: add AbacatePay webhook receiver with external forwarding"
```

---

## Task 4: Payment modal in GiftCard

**Files:**
- Modify: `src/components/GiftCard.tsx`

The modal has two states managed by a `step` variable:
- `"form"`: nome + telefone inputs + "Gerar PIX" button
- `"pix"`: QR Code image + copia-e-cola code + copy button

- [ ] **Step 4.1: Replace `GiftCard.tsx` with the modal version**

Replace the entire content of `src/components/GiftCard.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Gift } from "@prisma/client";

interface GiftCardProps {
  gift: Gift;
}

type Step = "form" | "pix";

interface PixData {
  id: string;
  brCode: string;
  brCodeBase64: string;
}

export function GiftCard({ gift }: GiftCardProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pix, setPix] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(gift.price));

  function openModal() {
    setOpen(true);
    setStep("form");
    setName("");
    setPhone("");
    setError(null);
    setPix(null);
    setCopied(false);
  }

  function closeModal() {
    setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    setError(null);
    try {
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
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!pix) return;
    await navigator.clipboard.writeText(pix.brCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
          <div className="bg-white w-full max-w-sm p-6 md:p-8 relative">
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
                    <label className="text-[10px] font-sans tracking-[0.15em] uppercase text-foreground/50">
                      Seu nome
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="border border-primary/20 px-3 py-2 text-sm font-serif text-foreground focus:outline-none focus:border-primary/60"
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-sans tracking-[0.15em] uppercase text-foreground/50">
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="border border-primary/20 px-3 py-2 text-sm font-serif text-foreground focus:outline-none focus:border-primary/60"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-red-500 font-sans">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-white text-[10px] font-sans font-medium tracking-[0.15em] uppercase px-5 py-3 mt-2 hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {loading ? "Gerando PIX..." : "Gerar PIX"}
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
                  src={`data:image/png;base64,${pix.brCodeBase64}`}
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
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4.2: Test the modal in the browser**

Start the dev server:
```bash
npm run dev
```

Open `http://localhost:3000`, scroll to the gift list, click "Presentear" on any gift.

Verify:
1. Modal opens with name + phone fields
2. Submitting without fields shows browser validation
3. Filling fields and clicking "Gerar PIX" shows loading state
4. QR Code appears after API response
5. "Copiar código PIX" button copies and shows "Copiado! ✓"
6. Clicking outside the modal or × closes it

- [ ] **Step 4.3: Commit**

```bash
git add src/components/GiftCard.tsx
git commit -m "feat: add PIX payment modal to gift cards"
```

---

## Task 5: Configure webhook in AbacatePay dashboard

- [ ] **Step 5.1: Register the webhook endpoint**

In the AbacatePay dashboard (or via API), create a webhook pointing to:

```
URL: https://helena-casamento.vercel.app/api/webhook/abacatepay
Events: ["transparent.completed"]
```

Via API (optional, can be done manually in the dashboard):

```bash
curl -s -X POST https://api.abacatepay.com/v2/webhooks/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer abc_dev_JUAtmgHfC0bwzefUdf3MWRPm" \
  -d '{
    "name": "Helena Casamento",
    "endpoint": "https://helena-casamento.vercel.app/api/webhook/abacatepay",
    "secret": "helena2026",
    "events": ["transparent.completed"]
  }' | jq .
```

- [ ] **Step 5.2: Deploy to Vercel and add env var**

Push the branch and add `ABACATEPAY_API_KEY` to Vercel:

```bash
git push origin main
```

In Vercel dashboard → Project → Settings → Environment Variables:
```
ABACATEPAY_API_KEY = abc_dev_JUAtmgHfC0bwzefUdf3MWRPm
```

- [ ] **Step 5.3: End-to-end test on production**

1. Open `https://helena-casamento.vercel.app`
2. Click "Presentear" on any gift
3. Fill in name + phone, click "Gerar PIX"
4. QR Code appears
5. Simulate payment via AbacatePay sandbox (or use the `/transparents/simulate-payment` endpoint)
6. Verify the external webhook at `https://editor.leaderaperformance.com.br/webhook/helena` received the payload

---

## Self-Review Notes

- All spec requirements covered: form (name + phone), PIX QR code in modal, webhook forwarding
- No placeholders or TBDs
- `amount` is converted to centavos (`Math.round(price * 100)`) before sending to AbacatePay
- `brCodeBase64` is rendered as `data:image/png;base64,...` — correct format for AbacatePay's response
- Webhook forwards `amount / 100` (reais, not centavos) to the external URL for readability
- Modal closes on overlay click and × button
- Error state shown inline in the form
