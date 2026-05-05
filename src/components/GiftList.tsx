"use client";

import { useState } from "react";
import { GiftCard } from "./GiftCard";
import { Gift } from "@prisma/client";

interface GiftListProps {
  gifts: Gift[];
}

const FILTERS = [
  { label: "Todos", min: 0, max: Infinity },
  { label: "Até R$ 200", min: 0, max: 200 },
  { label: "R$ 200–500", min: 200, max: 500 },
  { label: "R$ 500–1.000", min: 500, max: 1000 },
  { label: "R$ 1.000+", min: 1000, max: Infinity },
];

export function GiftList({ gifts }: GiftListProps) {
  const [activeFilter, setActiveFilter] = useState(0);
  const [sortOrder, setSortOrder] = useState<"default" | "asc" | "desc">("default");

  const filter = FILTERS[activeFilter];
  let filtered = gifts.filter(
    (g) => Number(g.price) >= filter.min && Number(g.price) < filter.max
  );

  if (sortOrder === "asc") {
    filtered = [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortOrder === "desc") {
    filtered = [...filtered].sort((a, b) => Number(b.price) - Number(a.price));
  }

  return (
    <section id="presentes" className="py-20 md:py-28 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12 md:mb-16 max-w-2xl mx-auto">
          <p className="text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-foreground/50 font-sans font-medium mb-4">
            Presenteie os noivos
          </p>
          <h2 className="text-4xl md:text-5xl text-primary mb-5" style={{ fontFamily: 'var(--font-pinyon-script)' }}>
            Lista de Presentes
          </h2>
          <div className="w-16 h-[1px] bg-primary/30 mx-auto mb-8" />
          <p className="text-foreground/60 font-serif text-sm md:text-base leading-relaxed">
            Preparamos essa lista com sugestões criativas para quem deseja nos
            presentear. Fique à vontade para escolher algo que represente seu
            carinho por nós.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 md:mb-16 max-w-3xl mx-auto">
          {[
            { step: "1", text: "Escolha um presente" },
            { step: "2", text: 'Clique em "Presentear"' },
            { step: "3", text: "Realize o pagamento" },
            { step: "4", text: "Pronto! Registrado ✓" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 border border-primary/30 flex items-center justify-center font-serif text-sm text-primary">
                {item.step}
              </div>
              <p className="text-[10px] md:text-xs text-foreground/50 font-sans">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        {/* Filters + Sort */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {FILTERS.map((f, i) => (
              <button
                key={f.label}
                onClick={() => setActiveFilter(i)}
                className={`text-[10px] md:text-xs font-sans tracking-[0.1em] uppercase px-4 py-2 border transition-all ${
                  activeFilter === i
                    ? "bg-primary text-white border-primary"
                    : "bg-transparent text-foreground/50 border-primary/20 hover:border-primary/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "default" | "asc" | "desc")}
            className="text-[10px] md:text-xs font-sans tracking-[0.1em] uppercase px-4 py-2 border border-primary/20 bg-transparent text-foreground/60 cursor-pointer"
          >
            <option value="default">Ordem padrão</option>
            <option value="asc">Menor preço</option>
            <option value="desc">Maior preço</option>
          </select>
        </div>

        {/* Gift grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {filtered.map((gift) => (
            <GiftCard key={gift.id} gift={gift} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-foreground/40 font-serif text-sm mt-12">
            Nenhum presente encontrado nesta faixa de valor.
          </p>
        )}
      </div>
    </section>
  );
}
