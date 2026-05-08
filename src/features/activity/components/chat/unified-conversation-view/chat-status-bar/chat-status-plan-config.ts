import { Check, CheckCircle2, FileEdit, Pin, X } from "lucide-react";
import type { ElementType } from "react";
import type { Plan } from "@/features/activity/lib/activity-contract";

interface PlanStatusConfig {
  icon: ElementType;
  label: string;
  accentClass: string;
  colorClass: string;
}

export const PLAN_STATUS_CONFIG: Record<Plan["status"], PlanStatusConfig> = {
  DRAFT: {
    icon: FileEdit,
    label: "Upcoming",
    accentClass: "bg-spark-amber",
    colorClass: "text-spark-amber",
  },
  CONFIRMED: {
    icon: CheckCircle2,
    label: "Confirmed",
    accentClass: "bg-forge-teal",
    colorClass: "text-forge-teal",
  },
  COMPLETED: {
    icon: Check,
    label: "Completed",
    accentClass: "bg-slate-muted/50",
    colorClass: "text-slate-muted",
  },
  PROPOSED: {
    icon: FileEdit,
    label: "Proposed",
    accentClass: "bg-spark-amber/70",
    colorClass: "text-spark-amber",
  },
  IN_PROGRESS: {
    icon: FileEdit,
    label: "In Progress",
    accentClass: "bg-forge-teal",
    colorClass: "text-forge-teal",
  },
  CANCELLED: {
    icon: X,
    label: "Cancelled",
    accentClass: "bg-red-500/50",
    colorClass: "text-red-500",
  },
};

export const PINNED_MESSAGE_CONFIG = {
  accentClass: "bg-forge-teal",
  colorClass: "text-forge-teal",
  icon: Pin,
  label: "Pinned",
} as const;
