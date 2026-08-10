import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  FilePenLine,
  MessageSquareDiff,
  Pin,
  X,
} from "lucide-react";
import type { Plan } from "@/features/activity/lib/activity-contract";
import { formatCountdown } from "@/features/activity/lib/chat-utils";

interface PlanStatusConfig {
  icon: LucideIcon;
  label: string;
  accentClass: string;
  badgeClass: string;
  colorClass: string;
}

export const PLAN_STATUS_CONFIG: Record<Plan["status"], PlanStatusConfig> = {
  DRAFT: {
    icon: FilePenLine,
    label: "Draft",
    accentClass: "bg-accent",
    badgeClass: "bg-accent-soft text-accent",
    colorClass: "text-accent",
  },
  CONFIRMED: {
    icon: CheckCircle2,
    label: "Confirmed",
    accentClass: "bg-primary",
    badgeClass: "bg-primary-soft text-foreground",
    colorClass: "text-foreground",
  },
  COMPLETED: {
    icon: CheckCircle2,
    label: "Completed",
    accentClass: "bg-slate-muted/50",
    badgeClass: "bg-muted-soft text-slate-muted",
    colorClass: "text-slate-muted",
  },
  PROPOSED: {
    icon: MessageSquareDiff,
    label: "Proposed",
    accentClass: "bg-accent",
    badgeClass: "bg-accent-soft text-accent",
    colorClass: "text-accent",
  },
  IN_PROGRESS: {
    icon: CalendarClock,
    label: "In Progress",
    accentClass: "bg-primary",
    badgeClass: "bg-primary-soft text-foreground",
    colorClass: "text-foreground",
  },
  CANCELLED: {
    icon: X,
    label: "Cancelled",
    accentClass: "bg-destructive/50",
    badgeClass: "bg-destructive-soft text-destructive",
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
  accentClass: "bg-primary",
  colorClass: "text-foreground",
  icon: Pin,
  label: "Pinned",
} as const;
