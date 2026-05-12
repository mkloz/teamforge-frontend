import { formatStatusLabel } from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import { cn } from "@/shared/lib/utils";
import type { PlanStatus } from "@/shared/schemas/enums";

export function PlanStatusPill({ status }: { status: PlanStatus }) {
  const label = formatStatusLabel(status);
  const isActive = status === "IN_PROGRESS" || status === "PROPOSED";
  const isConfirmed = status === "CONFIRMED";

  return (
    <span
      className={cn(
        "type-signature-label inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold uppercase tracking-widest",
        isConfirmed && "bg-forge-teal/12 text-forge-teal",
        isActive && "bg-spark-amber/12 text-spark-amber",
        !isConfirmed && !isActive && "bg-muted text-muted-foreground",
      )}
    >
      {isActive ? (
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-spark-amber opacity-75" />
          <span className="relative inline-flex size-1.5 rounded-full bg-spark-amber" />
        </span>
      ) : null}
      {label}
    </span>
  );
}
