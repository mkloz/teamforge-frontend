import {
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  FilePenLine,
  MessageSquareDiff,
  Pin,
  X,
} from "lucide-react";
import type { ElementType } from "react";
import type { Plan } from "@/features/activity/lib/activity-contract";
import { formatCountdown } from "@/features/activity/lib/chat-utils";

interface PlanStatusConfig {
  icon: ElementType;
  label: string;
  accentClass: string;
  badgeClass: string;
  colorClass: string;
}

export const PLAN_STATUS_CONFIG: Record<Plan["status"], PlanStatusConfig> = {
  DRAFT: {
    icon: FilePenLine,
    label: "Draft",
    accentClass: "bg-spark-amber",
    badgeClass: "bg-spark-amber/12 text-spark-amber",
    colorClass: "text-spark-amber",
  },
  CONFIRMED: {
    icon: CheckCircle2,
    label: "Confirmed",
    accentClass: "bg-forge-teal",
    badgeClass: "bg-forge-teal/8 text-forge-teal",
    colorClass: "text-forge-teal",
  },
  COMPLETED: {
    icon: Check,
    label: "Completed",
    accentClass: "bg-slate-muted/50",
    badgeClass: "bg-muted text-muted-foreground",
    colorClass: "text-slate-muted",
  },
  PROPOSED: {
    icon: MessageSquareDiff,
    label: "Proposed",
    accentClass: "bg-spark-amber",
    badgeClass: "bg-spark-amber/12 text-spark-amber",
    colorClass: "text-spark-amber",
  },
  IN_PROGRESS: {
    icon: CalendarClock,
    label: "In Progress",
    accentClass: "bg-forge-teal",
    badgeClass: "bg-forge-teal/8 text-forge-teal",
    colorClass: "text-forge-teal",
  },
  CANCELLED: {
    icon: X,
    label: "Cancelled",
    accentClass: "bg-destructive/50",
    badgeClass: "bg-muted text-muted-foreground",
    colorClass: "text-destructive",
  },
};

export function getPlanStatusConfig(plan: Plan): PlanStatusConfig {
  const countdown =
    plan.status === "CONFIRMED" && plan.dateTime
      ? formatCountdown(plan.dateTime)
      : null;

  if (countdown) {
    return {
      ...PLAN_STATUS_CONFIG.CONFIRMED,
      icon: Clock,
      label: countdown,
    };
  }

  return PLAN_STATUS_CONFIG[plan.status];
}

export const PINNED_MESSAGE_CONFIG = {
  accentClass: "bg-forge-teal",
  colorClass: "text-forge-teal",
  icon: Pin,
  label: "Pinned",
} as const;
