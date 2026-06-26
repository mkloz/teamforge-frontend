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

const EMPTY_PLAN_CALENDAR_PARTS = {
  dayName: "Open",
  dayNum: "--",
  month: "TBD",
};

export function getPlanCalendarParts(plan: PlannedGroup["plan"]) {
  const date = getValidPlanDate(plan.dateTime);

  return date ? getDatedPlanCalendarParts(date) : EMPTY_PLAN_CALENDAR_PARTS;
}

function getValidPlanDate(dateTime: string | null | undefined) {
  const date = dateTime ? new Date(dateTime) : null;

  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function getDatedPlanCalendarParts(date: Date) {
  return {
    dayName: date.toLocaleString("en-US", { weekday: "short" }),
    dayNum: date.getDate().toString(),
    month: date.toLocaleString("en-US", { month: "short" }),
  };
}
