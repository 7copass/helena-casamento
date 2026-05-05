# AbacatePay PIX Integration — Design Spec

**Date:** 2026-05-05  
**Project:** Helena & André — Site do Casamento  
**Public URL:** https://helena-casamento.vercel.app  

---

## Goal

When a guest clicks "Presentear" on a gift card, they enter their name and phone number, then see a PIX QR Code to pay. When payment is confirmed by AbacatePay, the app forwards the payment data to an external webhook.

---

## Architecture

### 1. `GiftCard.tsx` — Payment Modal

The "Presentear" button opens an inline modal with two states:

**State `form`:**
- Input: nome (text, required)
- Input: telefone (text, required)
- Button: "Gerar PIX" → calls `/api/checkout`

**State `pix`:**
- QR Code image (rendered from `brCodeBase64`)
- Copia-e-cola code (`brCode`) with a copy button
- Message: "Escaneie o QR Code ou copie o código PIX para pagar"
- Loading/error states handled inline

### 2. `POST /api/checkout` — PIX Generation

**Request body:**
```json
{
  "giftId": 1,
  "giftName": "Extintor de DR",
  "amount": 32255,
  "guestName": "João Silva",
  "guestPhone": "11999999999"
}
```

**What it does:**
- Validates required fields
- Calls `POST https://api.abacatepay.com/v2/transparents/create` with:
  - `data.amount`: amount in centavos
  - `data.description`: gift name
  - `data.customer.name`: guest name
  - `data.customer.cellphone`: guest phone
  - `data.metadata`: `{ giftId, giftName, guestName, guestPhone }`
- Returns `{ brCode, brCodeBase64, id }`

**Auth:** `Authorization: Bearer ${ABACATEPAY_API_KEY}`

### 3. `POST /api/webhook/abacatepay` — Payment Confirmation

**Triggered by:** AbacatePay calling this endpoint on `transparent.completed` event.

**AbacatePay webhook config:**
- URL: `https://helena-casamento.vercel.app/api/webhook/abacatepay`
- Events: `["transparent.completed"]`

**What it does:**
- Receives AbacatePay payload
- Checks `event === "transparent.completed"`
- Extracts from payload: `amount`, `metadata.giftId`, `metadata.giftName`, `metadata.guestName`, `metadata.guestPhone`
- Forwards via `POST` to `https://editor.leaderaperformance.com.br/webhook/helena` with:
```json
{
  "guestName": "João Silva",
  "guestPhone": "11999999999",
  "giftName": "Extintor de DR",
  "amount": 322.55,
  "paidAt": "2026-05-05T18:00:00Z"
}
```
- Returns `200 OK`

---

## Environment Variables

```
ABACATEPAY_API_KEY=abc_dev_JUAtmgHfC0bwzefUdf3MWRPm
```

Set this in `.env.local` for development and in Vercel dashboard for production.

---

## Files to Create / Modify

| File | Action |
|------|--------|
| `src/components/GiftCard.tsx` | Modify — add modal with form + PIX states |
| `src/app/api/checkout/route.ts` | Create — PIX generation endpoint |
| `src/app/api/webhook/abacatepay/route.ts` | Create — webhook receiver + forwarder |
| `.env.local` | Create — add API key |

---

## Out of Scope

- Storing contributions in the database (Prisma schema exists but not used in this feature)
- Webhook HMAC signature verification (can be added later)
- Credit card payments
- Payment status polling on the frontend
