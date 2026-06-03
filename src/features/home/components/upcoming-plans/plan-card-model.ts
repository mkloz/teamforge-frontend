import { Calendar, CheckCircle2, Clock, type LucideIcon } from "lucide-react";
import type { PlannedGroup } from "@/features/home/lib/home-contract";
import type { StatusPillTone } from "@/shared/components/ui/status-pill";
import type { PlanStatus } from "@/shared/schemas";

export const planStatusConfig: Record<
  PlanStatus,
  { label: string; icon: LucideIcon; tone: StatusPillTone }
> = {
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle2,
    tone: "teal",
  },
  PROPOSED: {
    label: "Proposed",
    icon: Clock,
    tone: "amber",
  },
  DRAFT: {
    label: "Draft",
    icon: Calendar,
    tone: "neutral",
  },
  IN_PROGRESS: {
    label: "In progress",
    icon: Clock,
    tone: "teal",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    tone: "neutral",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: Calendar,
    tone: "destructive",
  },
};

export function getPlanCalendarParts(plan: PlannedGroup["plan"]) {
  const date = plan.dateTime ? new Date(plan.dateTime) : null;
  const hasValidDate = date ? !Number.isNaN(date.getTime()) : false;

  return {
    dayName:
      date && hasValidDate
        ? date.toLocaleString("en-US", { weekday: "short" })
        : "Open",
    dayNum: date && hasValidDate ? date.getDate().toString() : "--",
    month:
      date && hasValidDate
        ? date.toLocaleString("en-US", { month: "short" })
        : "TBD",
  };
}
