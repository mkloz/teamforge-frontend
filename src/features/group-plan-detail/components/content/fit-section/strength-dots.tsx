import type { GroupPlanFitSignal } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { cn } from "@/shared/lib/utils";

const STRENGTH_DOT_KEYS = ["first", "second", "third"] as const;

export function StrengthDots({
  strength,
}: {
  strength: GroupPlanFitSignal["strength"];
}) {
  const filled = getFilledDotCount(strength);

  return (
    <div className="flex gap-0.5">
      <span className="sr-only">{strength.toLowerCase()} strength</span>
      {STRENGTH_DOT_KEYS.map((key, index) => (
        <span
          key={key}
          aria-hidden="true"
          className={cn(
            "size-1 rounded-full",
            index < filled ? getFilledDotClass(strength) : "bg-border",
          )}
        />
      ))}
    </div>
  );
}

function getFilledDotCount(strength: GroupPlanFitSignal["strength"]) {
  if (strength === "HIGH") {
    return 3;
  }
  if (strength === "MEDIUM") {
    return 2;
  }
  return 1;
}

function getFilledDotClass(strength: GroupPlanFitSignal["strength"]) {
  if (strength === "HIGH") {
    return "bg-brand-teal";
  }
  if (strength === "MEDIUM") {
    return "bg-brand-amber";
  }
  return "bg-muted-foreground";
}
