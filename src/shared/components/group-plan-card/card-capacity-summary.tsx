import type { GroupPlanCardVariant } from "@/shared/components/group-plan-card/group-plan-card-types";
import { cn } from "@/shared/lib/utils";

interface CardCapacitySummaryProps {
  capacity: number;
  currentSize: number;
  isFull: boolean;
  spotsLeft: number | null;
  variant?: GroupPlanCardVariant;
}

export function CardCapacitySummary({
  capacity,
  currentSize,
  isFull,
  spotsLeft,
  variant = "default",
}: CardCapacitySummaryProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col justify-center whitespace-nowrap leading-tight",
        isCompact ? "text-xs" : "text-xs",
      )}
    >
      <span className="font-extrabold text-foreground">
        {capacity > 0 ? `${currentSize}/${capacity}` : `${currentSize} joined`}
      </span>
      {spotsLeft !== null && !isFull ? (
        <span className="font-bold text-accent">{spotsLeft} left</span>
      ) : null}
      {spotsLeft === null ? (
        <span className="font-bold text-slate-muted">Flexible size</span>
      ) : null}
      {isFull ? <span className="font-bold text-destructive">Full</span> : null}
    </div>
  );
}
