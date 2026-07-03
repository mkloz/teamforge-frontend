import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  CircleDashed,
  CircleDot,
  MessageSquareDiff,
  Pencil,
  XCircle,
} from "lucide-react";
import type { Plan } from "@/features/activity/lib/activity-contract";
import { StatusPill } from "@/shared/components/ui/status-pill";
import {
  categoryColors,
  formatPanelToken,
  statusColors,
} from "../lib/constants";

const PLAN_STATUS_PILL_ICON_BY_STATUS: Partial<
  Record<Plan["status"], LucideIcon>
> = {
  CANCELLED: XCircle,
  COMPLETED: CheckCircle2,
  CONFIRMED: CheckCircle2,
  DRAFT: Pencil,
  IN_PROGRESS: CircleDot,
  PROPOSED: MessageSquareDiff,
};

export function PlanCategoryPill({ category }: { category: Plan["category"] }) {
  return (
    <StatusPill tone="none" className={categoryColors[category]}>
      {formatPanelToken(category)}
    </StatusPill>
  );
}

export function PlanStatusPill({ status }: { status: Plan["status"] }) {
  const Icon = getPlanStatusPillIcon(status);
  const label = formatPanelToken(status);

  return (
    <StatusPill icon={Icon} tone="none" className={statusColors[status]}>
      {label}
    </StatusPill>
  );
}

function getPlanStatusPillIcon(status: Plan["status"]) {
  return PLAN_STATUS_PILL_ICON_BY_STATUS[status] ?? CircleDashed;
}
