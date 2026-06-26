import {
  CheckCircle2,
  CircleDot,
  FileEdit,
  type LucideIcon,
  MessageSquareDiff,
  XCircle,
} from "lucide-react";
import { formatStatusLabel } from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import type { PlanStatus } from "@/shared/schemas/enums";

const PLAN_STATUS_ICONS = {
  CANCELLED: XCircle,
  COMPLETED: CheckCircle2,
  CONFIRMED: CheckCircle2,
  DRAFT: FileEdit,
  IN_PROGRESS: CircleDot,
  PROPOSED: MessageSquareDiff,
} satisfies Record<PlanStatus, LucideIcon>;

const PLAN_STATUS_CLASS_NAMES = {
  CANCELLED: "border-border/60 text-muted-foreground",
  COMPLETED: "border-border/60 text-muted-foreground",
  CONFIRMED: "border-forge-teal/25 text-forge-teal",
  DRAFT: "border-spark-amber/25 text-spark-amber",
  IN_PROGRESS: "border-forge-teal/25 text-forge-teal",
  PROPOSED: "border-spark-amber/25 text-spark-amber",
} satisfies Record<PlanStatus, string>;

export function PlanStatusPill({ status }: { status: PlanStatus }) {
  const label = formatStatusLabel(status);

  return (
    <StatusPill
      icon={PLAN_STATUS_ICONS[status]}
      tone="none"
      size="xs"
      textCase="upper"
      className={cn(
        "type-signature-label border-transparent px-2 py-0.5 tracking-widest",
        PLAN_STATUS_CLASS_NAMES[status],
      )}
    >
      {label}
    </StatusPill>
  );
}
