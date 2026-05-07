import { MapPin, Church, Wine } from "lucide-react";

export function EventInfo() {
  return (
    <section id="info" className="py-20 md:py-28 px-4 bg-muted/50 border-y border-primary/20">
      <div className="max-w-5xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-14 md:mb-18">
          <p className="text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-foreground/50 font-sans font-medium mb-4">
            Informações
          </p>
          <h2 className="text-4xl md:text-5xl text-primary mb-4" style={{ fontFamily: 'var(--font-pinyon-script)' }}>
            Onde &amp; Quando
          </h2>
          <div className="w-16 h-[1px] bg-primary/30 mx-auto" />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          {/* Cerimônia */}
          <div className="bg-white border border-primary/20 p-8 md:p-10 flex flex-col items-center text-center transition-all hover:border-primary/40 hover:shadow-sm">
            <div className="w-14 h-14 flex items-center justify-center border border-primary/20 text-primary mb-6">
              <Church size={28} strokeWidth={1.2} />
            </div>
            <h3 className="text-xl md:text-2xl font-serif text-foreground mb-1">
              Cerimônia
            </h3>
            <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/40 font-sans font-medium mb-5">
              18:00h
            </p>
            <p className="text-foreground/70 font-serif text-sm leading-relaxed mb-6">
              Igreja N. Sra. da Saúde
              <br />
              Alter do Chão
            </p>
            <a
              href="https://maps.app.goo.gl/cF4RTsbK1X6QAGya9?g_st=ipc"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center text-[10px] md:text-xs font-sans font-medium text-primary hover:text-primary/70 transition-colors uppercase tracking-[0.15em]"
            >
              <MapPin size={14} className="mr-1.5" />
              Ver no mapa
            </a>
          </div>

          {/* Recepção */}
          <div className="bg-white border border-primary/20 p-8 md:p-10 flex flex-col items-center text-center transition-all hover:border-primary/40 hover:shadow-sm">
            <div className="w-14 h-14 flex items-center justify-center border border-primary/20 text-primary mb-6">
              <Wine size={28} strokeWidth={1.2} />
            </div>
            <h3 className="text-xl md:text-2xl font-serif text-foreground mb-1">
              Recepção
            </h3>
            <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/40 font-sans font-medium mb-5">
              Após a cerimônia
            </p>
            <p className="text-foreground/70 font-serif text-sm leading-relaxed mb-6">
              Casa Imperial, Jacundá 1
              <br />
              Alter do Chão
            </p>
            <a
              href="https://maps.app.goo.gl/T9Msp7JhvMMJJ3Gf7?g_st=iw"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center text-[10px] md:text-xs font-sans font-medium text-primary hover:text-primary/70 transition-colors uppercase tracking-[0.15em]"
            >
              <MapPin size={14} className="mr-1.5" />
              Ver no mapa
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
