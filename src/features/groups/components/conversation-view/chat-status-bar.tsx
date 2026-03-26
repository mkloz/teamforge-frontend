import { FileEdit, CheckCircle2, Check, Calendar, MapPin } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { Plan, GroupStatus } from "../../types/groups.types";

interface ChatStatusBarProps {
  plan: Plan;
  groupStatus: GroupStatus;
  onViewDetails: () => void;
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const statusConfig = {
  DRAFT: {
    icon: FileEdit,
    label: "Awaiting Confirmation",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600 dark:text-amber-400",
    iconColor: "text-amber-500",
  },
  CONFIRMED: {
    icon: CheckCircle2,
    label: "Confirmed",
    bgColor: "bg-green-500/10",
    textColor: "text-green-600 dark:text-green-400",
    iconColor: "text-green-500",
  },
  COMPLETED: {
    icon: Check,
    label: "Completed",
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
    iconColor: "text-muted-foreground",
  },
};

export function ChatStatusBar({ plan, onViewDetails }: ChatStatusBarProps) {
  const config = statusConfig[plan.status];
  const StatusIcon = config.icon;

  return (
    <button
      onClick={onViewDetails}
      className={cn(
        "flex-shrink-0 w-full flex items-center gap-2 px-3 py-1.5",
        "border-b border-border/50",
        config.bgColor,
        "hover:opacity-90 transition-opacity text-left",
      )}
    >
      {/* Status indicator */}
      <div className="flex items-center gap-1.5">
        <StatusIcon size={12} className={config.iconColor} />
        <span className={cn("text-[11px] font-medium", config.textColor)}>
          {config.label}
        </span>
      </div>

      <span className="text-muted-foreground/50">|</span>

      {/* Date/Time */}
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Calendar size={10} />
        <span>{formatDateTime(plan.dateTime)}</span>
      </div>

      <span className="text-muted-foreground/50">|</span>

      {/* Location */}
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate flex-1">
        <MapPin size={10} className="flex-shrink-0" />
        <span className="truncate">{plan.location}</span>
      </div>
    </button>
  );
}
