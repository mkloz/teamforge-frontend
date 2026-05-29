import {
  CheckCircle2,
  CircleDot,
  FileEdit,
  MessageSquareDiff,
  XCircle,
} from "lucide-react";
import { formatStatusLabel } from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import { cn } from "@/shared/lib/utils";
import type { PlanStatus } from "@/shared/schemas/enums";

export function PlanStatusPill({ status }: { status: PlanStatus }) {
  const label = formatStatusLabel(status);
  const Icon = getPlanStatusIcon(status);
  const isDraft = status === "DRAFT";
  const isProposed = status === "PROPOSED";
  const isInProgress = status === "IN_PROGRESS";
  const isConfirmed = status === "CONFIRMED";
  const isTerminal = status === "COMPLETED" || status === "CANCELLED";

  return (
    <span
      className={cn(
        "type-signature-label inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-0.5 font-bold uppercase tracking-widest",
        (isConfirmed || isInProgress) && "border-forge-teal/25 text-forge-teal",
        (isDraft || isProposed) && "border-spark-amber/25 text-spark-amber",
        isTerminal && "border-border/60 text-muted-foreground",
      )}
    >
      <Icon className="size-3" aria-hidden="true" strokeWidth={2} />
      {label}
    </span>
  );
}

function getPlanStatusIcon(status: PlanStatus) {
  if (status === "DRAFT") {
    return FileEdit;
  }

  if (status === "PROPOSED") {
    return MessageSquareDiff;
  }

  if (status === "CONFIRMED" || status === "COMPLETED") {
    return CheckCircle2;
  }

  if (status === "CANCELLED") {
    return XCircle;
  }

  return CircleDot;
}
