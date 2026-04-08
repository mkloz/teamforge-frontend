import { motion, MotionValue, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/shared/lib/utils";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { AboutCard } from "./about-data";

interface StackCardProps {
  card: AboutCard;
  index: number;
  progress: MotionValue<number>;
  targetScale: number;
  totalCards: number;
}

export function StackCard({
  card,
  index,
  progress,
  targetScale,
  totalCards,
}: StackCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const segment = 1 / totalCards;
  const startFocus = index * segment;

  const y = useTransform(
    progress,
    [startFocus - segment, startFocus],
    ["120%", "0%"],
  );

  const yFinal = index === 0 ? "0%" : y;
  const scale = useTransform(progress, [startFocus, 1], [1, targetScale]);

  const opacity = useTransform(
    progress,
    [startFocus - segment, startFocus - segment + 0.05],
    [0, 1],
  );
  const opacityFinal = index === 0 ? 1 : opacity;

  return (
    <motion.div
      ref={containerRef}
      style={{
        scale,
        y: yFinal,
        opacity: opacityFinal,
        zIndex: index + 10,
      }}
      className={cn(
        "absolute w-full max-w-lg min-h-80 md:min-h-100 flex flex-col origin-top mx-auto left-0 right-0",
        index === 0 && "top-0 md:top-[12vh]",
        index === 1 && "top-4 md:top-[calc(12vh+24px)]",
        index === 2 && "top-8 md:top-[calc(12vh+48px)]",
        index > 2 &&
          `top-${12 + (index - 3) * 4} md:top-[calc(12vh+${index * 24}px)]`,
      )}
    >
      <Card
        className="h-full border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.06)] flex flex-col justify-center p-8 md:p-12"
        aria-labelledby={`card-title-${card.id}`}
      >
        <CardContent className="p-0 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-forge-teal/40" aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-forge-teal/70">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(totalCards).padStart(2, "0")}
            </span>
          </div>

          <div className="flex flex-col gap-6">
            <h3
              id={`card-title-${card.id}`}
              className={cn(
                "font-sans font-bold",
                card.variant === "credo"
                  ? "text-xl text-forge-teal"
                  : "text-2xl md:text-3xl text-ink",
              )}
            >
              {card.title}
            </h3>
            <p
              className={cn(
                "font-sans leading-relaxed text-balance",
                card.variant === "credo"
                  ? "text-xl md:text-2xl font-medium text-ink italic"
                  : "text-base md:text-lg text-slate-muted",
              )}
            >
              {card.description}
            </p>
            {card.footer && (
              <p className="mt-2 text-xs font-semibold text-forge-teal/60 uppercase tracking-widest">
                {card.footer}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
