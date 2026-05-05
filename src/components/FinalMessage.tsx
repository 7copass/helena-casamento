import Image from "next/image";

export function FinalMessage() {
  return (
    <section
      id="mensagem"
      className="py-24 md:py-32 px-4 bg-muted/30 relative overflow-hidden flex flex-col items-center text-center border-t border-primary/20"
    >
      {/* Subtle rose accent */}
      <Image
        src="/roses-top-right.png"
        alt=""
        width={200}
        height={200}
        className="absolute top-0 right-0 w-28 h-28 md:w-44 md:h-44 opacity-20 pointer-events-none select-none"
      />

      <div className="max-w-2xl mx-auto z-10">
        <p className="text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-foreground/40 font-sans font-medium mb-6">
          Uma palavra dos noivos
        </p>

        <p className="text-3xl md:text-4xl lg:text-5xl text-primary leading-snug mb-10 py-2" style={{ fontFamily: 'var(--font-pinyon-script)' }}>
          &ldquo;Estamos muito felizes em viver esse momento com você.
          Obrigado por fazer parte da nossa história.&rdquo;
        </p>

        <div className="w-12 h-[1px] bg-primary/30 mx-auto mb-8" />

        <p className="text-[9px] text-foreground/40 uppercase tracking-[0.25em] font-sans font-medium mb-3">
          Com carinho,
        </p>
        <h2 className="text-4xl md:text-5xl text-primary" style={{ fontFamily: 'var(--font-pinyon-script)' }}>
          André &amp; Maria Helena
        </h2>
      </div>
    </section>
  );
}
