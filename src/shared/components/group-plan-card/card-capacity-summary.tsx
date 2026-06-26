import type { GroupPlanCardVariant } from "@/shared/components/group-plan-card/group-plan-card-types";
import { cn } from "@/shared/lib/utils";

interface CardCapacitySummaryProps {
  capacity: number;
  currentSize: number;
  isFull: boolean;
  spotsLeft: number | null;
  variant?: GroupPlanCardVariant;
}

interface CapacitySummaryLine {
  className: string;
  key: string;
  text: string;
}

export function CardCapacitySummary({
  capacity,
  currentSize,
  isFull,
  spotsLeft,
  variant = "default",
}: CardCapacitySummaryProps) {
  const isCompact = variant === "compact";
  const lines = getCapacitySummaryLines({
    capacity,
    currentSize,
    isFull,
    spotsLeft,
  });

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col justify-center whitespace-nowrap leading-tight",
        isCompact ? "text-xs" : "text-xs",
      )}
    >
      {lines.map((line) => (
        <span key={line.key} className={line.className}>
          {line.text}
        </span>
      ))}
    </div>
  );
}

function getCapacitySummaryLines({
  capacity,
  currentSize,
  isFull,
  spotsLeft,
}: Omit<CardCapacitySummaryProps, "variant">): CapacitySummaryLine[] {
  return [
    {
      className: "font-extrabold text-foreground",
      key: "count",
      text:
        capacity > 0 ? `${currentSize}/${capacity}` : `${currentSize} joined`,
    },
    getSpotsLeftLine({ isFull, spotsLeft }),
    getFlexibleSizeLine(spotsLeft),
    getFullLine(isFull),
  ].filter((line): line is CapacitySummaryLine => line !== null);
}

function getSpotsLeftLine({
  isFull,
  spotsLeft,
}: Pick<CardCapacitySummaryProps, "isFull" | "spotsLeft">) {
  return spotsLeft !== null && !isFull
    ? {
        className: "font-bold text-accent",
        key: "spots-left",
        text: `${spotsLeft} left`,
      }
    : null;
}

function getFlexibleSizeLine(spotsLeft: number | null) {
  return spotsLeft === null
    ? {
        className: "font-bold text-slate-muted",
        key: "flexible-size",
        text: "Flexible size",
      }
    : null;
}

function getFullLine(isFull: boolean) {
  return isFull
    ? {
        className: "font-bold text-destructive",
        key: "full",
        text: "Full",
      }
    : null;
}
