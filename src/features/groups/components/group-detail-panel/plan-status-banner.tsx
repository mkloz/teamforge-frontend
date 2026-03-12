import { Check, Clock, FileEdit, CheckCircle2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { Plan } from "../../types/groups.types";

interface PlanStatusBannerProps {
  plan: Plan;
}

const statusConfig = {
  DRAFT: {
    icon: FileEdit,
    label: "Plan Awaiting Confirmation",
    description: "Review and confirm the plan details",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    iconColor: "text-amber-500",
    textColor: "text-amber-700 dark:text-amber-400",
  },
  CONFIRMED: {
    icon: CheckCircle2,
    label: "Plan Confirmed",
    description: "Everyone has confirmed. You're all set!",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    iconColor: "text-green-500",
    textColor: "text-green-700 dark:text-green-400",
  },
  COMPLETED: {
    icon: Check,
    label: "Plan Completed",
    description: "This activity has been completed",
    bgColor: "bg-muted",
    borderColor: "border-border",
    iconColor: "text-muted-foreground",
    textColor: "text-muted-foreground",
  },
};

export function PlanStatusBanner({ plan }: PlanStatusBannerProps) {
  const config = statusConfig[plan.status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 border-b",
        config.bgColor,
        config.borderColor,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full",
          config.bgColor,
        )}
      >
        <Icon size={18} className={config.iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold", config.textColor)}>
          {config.label}
        </p>
        <p className="text-xs text-muted-foreground">
          {config.description}
        </p>
      </div>
      {plan.status === "DRAFT" && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock size={12} />
          <span>Pending</span>
        </div>
      )}
    </div>
  );
}
