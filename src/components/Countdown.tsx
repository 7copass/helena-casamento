"use client";

import { useEffect, useState } from "react";

const TARGET_DATE = new Date("2026-05-30T18:00:00-03:00").getTime();

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isClient, setIsClient] = useState(false);
  const [isPassed, setIsPassed] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = TARGET_DATE - now;

      if (distance < 0) {
        clearInterval(interval);
        setIsPassed(true);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isClient)
    return (
      <div className="h-20 animate-pulse bg-muted/30 w-full max-w-md mx-auto" />
    );

  if (isPassed) {
    return (
      <div className="text-2xl md:text-3xl text-primary text-center py-4" style={{ fontFamily: 'var(--font-pinyon-script)' }}>
        Hoje é o nosso grande dia! 💛
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-[9px] md:text-[10px] text-foreground/50 mb-5 uppercase tracking-[0.25em] font-sans font-medium">
        Faltam para o nosso grande dia
      </p>
      <div className="flex items-center justify-center gap-2.5 md:gap-5">
        {[
          { label: "Dias", value: timeLeft.days },
          { label: "Horas", value: timeLeft.hours },
          { label: "Min", value: timeLeft.minutes },
          { label: "Seg", value: timeLeft.seconds },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center">
            <div className="w-14 h-14 md:w-18 md:h-18 flex items-center justify-center border border-primary/30 bg-white text-xl md:text-2xl font-serif text-primary tabular-nums">
              {item.value.toString().padStart(2, "0")}
            </div>
            <span className="text-[8px] md:text-[9px] mt-2 text-foreground/40 uppercase tracking-[0.2em] font-sans font-medium">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
