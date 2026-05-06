"use client";

import { useState, useEffect } from "react";
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
    try {
      await navigator.clipboard.writeText(pix.brCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Não foi possível copiar. Selecione o código manualmente.");
    }
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
                    <label htmlFor="guest-name" className="text-[10px] font-sans tracking-[0.15em] uppercase text-foreground/50">
                      Seu nome
                    </label>
                    <input
                      id="guest-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                      className="border border-primary/20 px-3 py-2 text-sm font-serif text-foreground focus:outline-none focus:border-primary/60 disabled:opacity-50"
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="guest-phone" className="text-[10px] font-sans tracking-[0.15em] uppercase text-foreground/50">
                      Telefone / WhatsApp
                    </label>
                    <input
                      id="guest-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      disabled={loading}
                      className="border border-primary/20 px-3 py-2 text-sm font-serif text-foreground focus:outline-none focus:border-primary/60 disabled:opacity-50"
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
          </div>
        </div>
      )}
    </>
  );
}
