import { cn } from "@/shared/lib/utils";

interface PagerDotsProps {
  total: number;
  activeIndex: number;
  accentClass: string;
}

export function PagerDots({ total, activeIndex, accentClass }: PagerDotsProps) {
  if (total <= 1) {
    return (
      <div
        className={cn(
          "absolute left-0 inset-y-0 w-0.5 rounded-r-full",
          accentClass,
        )}
        aria-hidden
      />
    );
  }

  return (
    <div
      className="absolute left-0 inset-y-0 w-3.5 flex flex-col items-center justify-center gap-1"
      aria-hidden
    >
      {Array.from({ length: total }, (_, i) => {
        const isActive = i === activeIndex;
        return (
          <div
            key={i}
            className={cn(
              "rounded-full transition-all duration-250",
              isActive ? cn("w-1.5 h-1.5", accentClass) : "w-1 h-1 bg-border",
            )}
          />
        );
      })}
    </div>
  );
}
