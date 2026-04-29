import type { PlanStatus } from "@/shared/schemas";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Clock, MessageCircle } from "lucide-react";
import type { PlannedGroup } from "../../api/home.queries";

const STATUS_CONFIG: Record<
  PlanStatus,
  { label: string; classes: string; icon: React.ElementType }
> = {
  CONFIRMED: {
    label: "Confirmed",
    classes: "bg-forge-teal/10 text-forge-teal",
    icon: CheckCircle2,
  },
  PROPOSED: {
    label: "Proposed",
    classes: "bg-spark-amber/10 text-spark-amber",
    icon: Clock,
  },
  DRAFT: {
    label: "Draft",
    classes: "bg-muted text-muted-foreground",
    icon: Calendar,
  },
  IN_PROGRESS: {
    label: "In Progress",
    classes: "bg-blue-500/10 text-blue-500",
    icon: Clock,
  },
  COMPLETED: {
    label: "Completed",
    classes: "bg-green-500/10 text-green-500",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelled",
    classes: "bg-red-500/10 text-red-500",
    icon: Calendar,
  },
};

interface PlanCardProps {
  group: PlannedGroup;
  index: number;
}

export function PlanCard({ group, index }: PlanCardProps) {
  const plan = group.plan;
  const status = STATUS_CONFIG[plan.status] || STATUS_CONFIG.DRAFT;
  const StatusIcon = status.icon;
  const date = plan.dateTime ? new Date(plan.dateTime) : new Date();
  const month = date.toLocaleString("en-US", { month: "short" });
  const dayNum = date.getDate();
  const dayName = date.toLocaleString("en-US", { weekday: "short" });
  const timeStr = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const memberPreviews = group.members.map((member) => ({
    id: member.userId,
    avatar: member.user.avatar,
    name: member.user.name,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.07,
        ease: [0.23, 1, 0.32, 1],
      }}
      role="listitem"
      className={cn(
        "group flex flex-row items-center gap-3 md:gap-4",
        "rounded-2xl border border-border/50 bg-card p-3 md:p-4",
        "transition-all duration-150 cursor-pointer",
        "hover:-translate-y-0.5 hover:border-ink hover:shadow-button-outline",
        "dark:hover:border-white dark:hover:shadow-button-outline-dark",
      )}
    >
      <div
        className="shrink-0 flex flex-col items-center w-13 rounded-xl border border-border/50 overflow-hidden bg-background shadow-xs"
        aria-hidden="true"
      >
        <div className="w-full bg-muted text-muted-foreground text-center py-1 text-[10px] font-black uppercase tracking-widest border-b border-border/50">
          {month}
        </div>
        <div className="w-full flex flex-col items-center py-1.5">
          <span className="text-xl font-black text-foreground leading-none">
            {dayNum}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground mt-0.5">
            {dayName}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-0.5 flex-1 min-w-0 pl-1">
        <p className="text-sm font-bold text-foreground leading-snug truncate group-hover:text-primary transition-colors duration-200">
          {plan.title}
        </p>
        <p className="text-xs text-muted-foreground font-medium truncate">
          {group.name}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <Clock className="size-3" aria-hidden="true" />
            {timeStr}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide",
              status.classes,
            )}
          >
            <StatusIcon className="size-3" aria-hidden="true" />
            {status.label}
          </span>
        </div>
      </div>

      <div className="shrink-0 flex flex-col items-end gap-2.5">
        <div
          className="flex -space-x-2.5"
          aria-label={`${memberPreviews.length} members`}
        >
          {memberPreviews.slice(0, 3).map((member) => (
            <div
              key={member.id}
              className="size-8 rounded-full border-2 border-card bg-muted overflow-hidden shadow-xs flex items-center justify-center"
            >
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="size-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="text-[10px] font-black text-forge-teal">
                  {member.name
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join("") || "TF"}
                </span>
              )}
            </div>
          ))}
          {memberPreviews.length > 3 && (
            <div className="size-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-extrabold text-muted-foreground shadow-xs">
              +{memberPreviews.length - 3}
            </div>
          )}
        </div>

        <button
          type="button"
          aria-label={`Open chat for ${plan.title}`}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-xl",
            "text-xs font-bold text-muted-foreground",
            "border border-border bg-background",
            "hover:border-forge-teal/50 hover:text-forge-teal hover:bg-secondary",
            "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <MessageCircle className="size-3" aria-hidden="true" />
          Chat
        </button>
      </div>
    </motion.div>
  );
}
