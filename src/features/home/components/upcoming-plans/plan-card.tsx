import { Link } from "@tanstack/react-router";
import { Clock, MapPinned, Tag, Wifi } from "lucide-react";
import type { PlannedGroup } from "@/features/home/lib/home-contract";
import { getPlanTimingLabel } from "@/features/home/lib/home-insights";
import {
  getHomePlanCategoryLabel,
  getHomePlanCostLabel,
  getHomePlanLocationLabel,
} from "@/features/home/lib/home-plan-presenters";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import { buildGroupPlanDetailNavigation } from "@/shared/navigation";
import { getPlanCalendarParts, planStatusConfig } from "./plan-card-model";

interface PlanCardProps {
  plannedGroup: PlannedGroup;
}

export function PlanCard({ plannedGroup }: PlanCardProps) {
  const plan = plannedGroup.plan;
  const status = planStatusConfig[plan.status] || planStatusConfig.DRAFT;
  const StatusIcon = status.icon;
  const { dayName, dayNum, month } = getPlanCalendarParts(plan);
  const timeStr = getPlanTimingLabel(plan);
  const isActionable = plan.status === "PROPOSED";
  const locationLabel = getHomePlanLocationLabel(plan);
  const LocationIcon = plan.locationMode === "ONLINE" ? Wifi : MapPinned;
  const navigation = buildGroupPlanDetailNavigation(plannedGroup.id, {
    source: "home",
    plan: plan.id,
  });

  return (
    <li
      className={cn(
        "group relative border-border/55 border-b last:border-b-0",
        "transition-colors duration-150 hover:bg-forge-teal/5",
      )}
    >
      <Link
        {...navigation}
        className="grid grid-cols-[4.25rem_minmax(0,1fr)] items-center gap-x-3 gap-y-2 py-3.5 pr-2 pl-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:pr-3 md:gap-4"
      >
        <div className="relative flex h-full min-h-16 flex-col justify-center pl-9">
          <span
            className={cn(
              "absolute top-1/2 left-4 z-10 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-background",
              isActionable ? "bg-spark-amber" : "bg-forge-teal",
            )}
            aria-hidden="true"
          />
          <span className="font-black text-muted-foreground text-xs uppercase leading-none">
            {month}
          </span>
          <span className="mt-1 font-black text-2xl text-foreground leading-none">
            {dayNum}
          </span>
          <span className="mt-1 font-bold text-muted-foreground text-xs leading-none">
            {dayName}
          </span>
        </div>

        <div className="min-w-0">
          <p className="flex min-w-0 items-center gap-1.5 font-bold text-foreground text-sm leading-snug transition-colors duration-200 group-hover:text-forge-teal">
            <span className="truncate">{plan.title}</span>
            <StatusPill
              icon={StatusIcon}
              size="xs"
              tone={status.tone}
              className="px-1.5 py-0.5"
            >
              <span className="sr-only sm:not-sr-only">{status.label}</span>
            </StatusPill>
          </p>
          <p className="mt-0.5 flex min-w-0 items-center gap-1 font-medium text-muted-foreground text-xs">
            <LocationIcon className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{locationLabel}</span>
            <span
              className="shrink-0 text-muted-foreground/65"
              aria-hidden="true"
            >
              ·
            </span>
            <span className="shrink-0">{getHomePlanCostLabel(plan)}</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1 font-semibold text-muted-foreground text-xs">
              <Clock className="size-3" aria-hidden="true" />
              {timeStr}
            </span>
            <span className="flex items-center gap-1 font-semibold text-muted-foreground text-xs">
              <Tag className="size-3" aria-hidden="true" />
              {getHomePlanCategoryLabel(plan)}
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
