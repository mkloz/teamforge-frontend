import { cn } from "@/shared/lib/utils";

interface PagerDotsProps {
  total: number;
  activeIndex: number;
  accentClass: string;
}

export function PagerDots({ total, activeIndex, accentClass }: PagerDotsProps) {
  const dots = Array.from({ length: total }, (_, index) => ({
    id: `pager-dot-${index}`,
    index,
  }));

  if (total <= 1) {
    return (
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-0.5 rounded-r-full",
          accentClass,
        )}
        aria-hidden
      />
    );
  }

  return (
    <div
      className="absolute inset-y-0 left-0 flex w-3.5 flex-col items-center justify-center gap-1"
      aria-hidden
    >
      {dots.map((dot) => {
        const isActive = dot.index === activeIndex;
        return (
          <div
            key={dot.id}
            className={cn(
              "rounded-full transition-all duration-250",
              isActive ? cn("h-1.5 w-1.5", accentClass) : "h-1 w-1 bg-border",
            )}
          />
        );
      })}
    </div>
  );
}
