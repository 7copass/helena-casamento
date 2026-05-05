import Image from "next/image";
import { Countdown } from "./Countdown";

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
          src="/helena-andre.jpeg"
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

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PART 2 — Invitation details (convite)                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="convite" className="relative bg-white px-4 py-14 sm:py-20 md:py-24 overflow-hidden">
        {/* Border */}
        <div className="absolute inset-3 sm:inset-5 md:inset-8 lg:inset-10 border border-primary/40 pointer-events-none z-0" />

        {/* Roses */}
        <Image
          src="/roses-top-right.png"
          alt=""
          width={420}
          height={420}
          className="absolute top-0 right-0 w-28 h-28 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 object-contain pointer-events-none select-none z-0"
        />
        <Image
          src="/roses-bottom-left.png"
          alt=""
          width={420}
          height={420}
          className="absolute bottom-0 left-0 w-28 h-28 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 object-contain pointer-events-none select-none z-0"
        />

        <div className="z-10 relative max-w-2xl mx-auto flex flex-col items-center text-center px-4 sm:px-8 md:px-12">
          {/* Quote */}
          <p className="font-serif italic text-foreground/60 text-xs sm:text-sm md:text-base leading-relaxed mb-6 sm:mb-8">
            &ldquo;Entre encontros e escolhas, escolhemos um ao outro todos os dias&rdquo;
          </p>

          {/* Parents */}
          <p className="text-[8px] sm:text-[10px] md:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase text-foreground font-sans font-semibold mb-4 sm:mb-5">
            Com a benção de Deus e de seus pais
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 md:gap-x-16 gap-y-0.5 mb-8 sm:mb-12 text-foreground/60 font-serif text-[11px] sm:text-xs md:text-sm">
            <span>Rosinery Coelho Costa</span>
            <span>Maria Buchalle</span>
            <span>Jorge Aluísio Coelho Costa</span>
            <span>Nerivaldo César Mota</span>
            <span className="sm:col-span-2 text-center mt-1">José Cilas Pimentel da Costa (in memoriam)</span>
            <span className="sm:col-span-2 text-center">Elineide dos Santos Vasconcelos</span>
          </div>

          {/* Names */}
          <h2
            className="text-primary text-5xl sm:text-6xl md:text-7xl leading-[0.9] mb-1"
            style={{ fontFamily: "var(--font-pinyon-script)" }}
          >
            André
          </h2>
          <span className="font-serif italic text-foreground/30 text-lg sm:text-xl my-0.5">&amp;</span>
          <h2
            className="text-primary text-4xl sm:text-5xl md:text-6xl leading-[0.9] mb-6 sm:mb-8"
            style={{ fontFamily: "var(--font-pinyon-script)" }}
          >
            Maria Helena
          </h2>

          {/* "Convidam" */}
          <p className="text-[8px] sm:text-[10px] md:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase text-foreground/80 font-sans font-medium mb-8 sm:mb-12">
            Convidam para a cerimônia de seu casamento
          </p>

          {/* Date: MAIO | 30 | 2026 */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 mb-6 sm:mb-8">
            <span className="font-serif text-base sm:text-lg md:text-2xl tracking-[0.2em] uppercase text-foreground font-light">
              Maio
            </span>
            <span className="w-[1px] h-8 sm:h-10 md:h-12 bg-foreground/20" />
            <span className="font-serif text-4xl sm:text-5xl md:text-7xl text-secondary font-bold leading-none">
              30
            </span>
            <span className="w-[1px] h-8 sm:h-10 md:h-12 bg-foreground/20" />
            <span className="font-serif text-base sm:text-lg md:text-2xl tracking-[0.12em] text-foreground font-light italic">
              2026
            </span>
          </div>

          {/* Venue */}
          <p className="font-serif text-foreground text-sm sm:text-base md:text-lg font-medium mb-1">18:00h</p>
          <p className="font-serif text-foreground/60 text-xs sm:text-sm md:text-base mb-4 leading-relaxed">
            Igreja Nossa Senhora da Saúde - Alter do Chão
          </p>
          <p className="font-serif text-foreground/50 text-[11px] sm:text-xs md:text-sm leading-relaxed mb-10 sm:mb-14">
            O casal recepcionará seus convidados<br />
            no espaço de eventos Casa Imperial<br />
            Jacundá 01 Alter do Chão.
          </p>

          {/* Divider */}
          <div className="w-12 sm:w-16 h-[1px] bg-primary/30 mb-8 sm:mb-10" />

          {/* Welcome */}
          <div className="max-w-md mx-auto mb-8 sm:mb-10 space-y-2">
            <p className="text-foreground/50 font-sans text-[11px] sm:text-xs md:text-sm leading-relaxed font-light">
              Sua presença já é um presente — mas, se desejar nos presentear, preparamos algumas opções com muito amor.
            </p>
          </div>

          {/* CTA */}
          <a
            href="#presentes"
            className="inline-flex items-center justify-center bg-primary text-white hover:bg-primary/90 transition-all text-[10px] sm:text-xs md:text-sm font-sans font-medium tracking-[0.15em] sm:tracking-[0.2em] uppercase px-6 sm:px-8 py-3 sm:py-3.5 active:scale-95"
          >
            Ver lista de presentes
          </a>

          {/* Countdown */}
          <div className="mt-12 sm:mt-16 md:mt-20 w-full">
            <Countdown />
          </div>
        </div>
      </section>
    </>
  );
}
