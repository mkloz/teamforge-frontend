import { Calendar, CheckCircle2, Clock } from "lucide-react";
import type { ElementType } from "react";
import type { PlannedGroup } from "@/features/home/lib/home-contract";
import type { PlanStatus } from "@/shared/schemas";

export const planStatusConfig: Record<
  PlanStatus,
  { label: string; classes: string; icon: ElementType }
> = {
  CONFIRMED: {
    label: "Confirmed",
    classes: "text-forge-teal",
    icon: CheckCircle2,
  },
  PROPOSED: {
    label: "Proposed",
    classes: "text-spark-amber",
    icon: Clock,
  },
  DRAFT: {
    label: "Draft",
    classes: "text-muted-foreground",
    icon: Calendar,
  },
  IN_PROGRESS: {
    label: "In progress",
    classes: "text-forge-teal",
    icon: Clock,
  },
  COMPLETED: {
    label: "Completed",
    classes: "text-muted-foreground",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelled",
    classes: "text-destructive",
    icon: Calendar,
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

export function getPlanMemberPreviews(group: PlannedGroup) {
  return group.members.map((member) => ({
    id: member.userId,
    avatar: member.user.avatar,
    name: member.user.name,
  }));
}
