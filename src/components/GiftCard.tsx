"use client";

import { Gift } from "@prisma/client";

interface GiftCardProps {
  gift: Gift;
}

export function GiftCard({ gift }: GiftCardProps) {
  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(gift.price));

  return (
    <div className="bg-white border border-primary/15 flex flex-col transition-all hover:border-primary/40 hover:shadow-sm group">
      {/* Top accent line */}
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
            onClick={() => {
              alert(
                "A integração de checkout será adicionada na próxima etapa."
              );
            }}
          >
            Presentear
          </button>
        </div>
      </div>
    </div>
  );
}
