import type { MotionStyle, MotionValue } from "framer-motion";
import { motion, useTransform } from "framer-motion";
import { useRef } from "react";
import type { AboutCard } from "@/features/landing/components/about/about-data";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

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
  const fallbackTop = 12 + (index - 3) * 4;
  const fallbackMdTop = `calc(12vh + ${index * 24}px)`;
  const motionStyle = {
    scale,
    y: yFinal,
    opacity: opacityFinal,
    zIndex: index + 10,
  } satisfies MotionStyle;

  const stackCardStyle =
    index > 2
      ? {
          ...motionStyle,
          "--stack-card-top": `${fallbackTop * 0.25}rem`,
          "--stack-card-md-top": fallbackMdTop,
        }
      : motionStyle;

  return (
    <motion.div
      ref={containerRef}
      style={stackCardStyle}
      className={cn(
        "absolute right-0 left-0 mx-auto flex min-h-80 w-full max-w-lg origin-top flex-col md:min-h-100",
        index === 0 && "top-0",
        index === 1 && "top-4 md:top-12",
        index === 2 && "top-8 md:top-24",
        index > 2 && "top-(--stack-card-top) md:top-(--stack-card-md-top)",
      )}
    >
      <Card
        className="flex h-full flex-col justify-center border-border/60 p-8 shadow-xl md:p-12"
        aria-labelledby={`card-title-${card.id}`}
      >
        <CardContent className="flex flex-col gap-6 p-0">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-forge-teal/40" aria-hidden="true" />
            <span className="font-semibold text-forge-teal text-xs tracking-wide">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(totalCards).padStart(2, "0")}
            </span>
          </div>

          <div className="flex flex-col gap-6">
            <h3
              id={`card-title-${card.id}`}
              className={cn(
                "font-bold font-sans",
                card.variant === "credo"
                  ? "text-forge-teal text-xl"
                  : "text-2xl text-ink md:text-3xl",
              )}
            >
              {card.title}
            </h3>
            <p
              className={cn(
                "text-balance font-sans leading-relaxed",
                card.variant === "credo"
                  ? "font-medium text-ink text-xl italic md:text-2xl"
                  : "text-base text-slate-muted md:text-lg",
              )}
            >
              {card.description}
            </p>
            {card.footer && (
              <p className="mt-2 font-semibold text-forge-teal text-xs">
                {card.footer}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
