import Image from "next/image";

export function Hero() {
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PART 1 — Full-bleed photo hero                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section
        id="topo"
        className="relative w-full min-h-svh overflow-hidden"
      >
        {/* Background photo — center on the couple, not the sky */}
        <Image
          src="/helena-foto-2.webp"
          alt="André e Maria Helena"
          fill
          className="object-cover"
          style={{ objectPosition: "center 35%" }}
          priority
          sizes="100vw"
        />

        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#3d4d3a]/90 via-[#3d4d3a]/30 to-black/10" />

        {/* Content at the bottom */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 sm:pb-20 md:pb-24 px-6 z-10">
          {/* Names */}
          <h1
            className="text-white text-[3.5rem] sm:text-7xl md:text-8xl leading-[0.9] mb-1 drop-shadow-md"
            style={{ fontFamily: "var(--font-pinyon-script)" }}
          >
            André
          </h1>
          <span className="font-serif italic text-white/50 text-lg sm:text-xl my-0.5">
            &amp;
          </span>
          <h1
            className="text-white text-[2.8rem] sm:text-6xl md:text-7xl leading-[0.9] mb-5 drop-shadow-md"
            style={{ fontFamily: "var(--font-pinyon-script)" }}
          >
            Maria Helena
          </h1>

          {/* Quote */}
          <p className="font-serif italic text-white/60 text-xs sm:text-sm text-center max-w-xs mb-4 drop-shadow-sm">
            &ldquo;Entre encontros e escolhas, escolhemos um ao outro todos os dias&rdquo;
          </p>

          {/* Welcome message */}
          <p className="font-serif text-white/75 text-xs sm:text-sm text-center max-w-sm mb-6 leading-relaxed drop-shadow-sm px-2">
            Sejam muito bem-vindos ao nosso site! Estamos muito felizes em compartilhar esse momento tão especial com pessoas que fazem parte da nossa história. Criamos esse espaço com muito carinho para reunir algumas informações do nosso grande dia e também nossa lista de presentes.
          </p>

          {/* Date */}
          <p className="text-white/70 text-[10px] sm:text-xs tracking-[0.3em] uppercase font-sans font-medium mb-8">
            30 · Maio · 2026
          </p>

          {/* Scroll hint */}
          <a href="#convite" className="animate-bounce opacity-50 hover:opacity-80 transition-opacity">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
            </svg>
          </a>
        </div>
      </section>

    </>
  );
}
