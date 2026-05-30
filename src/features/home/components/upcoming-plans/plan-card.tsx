import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Banknote,
  Clock,
  MapPinned,
  Tag,
  Wifi,
} from "lucide-react";
import { buildGroupPlanDetailNavigation } from "@/features/group-plan-detail/lib/group-plan-detail-route";
import type { PlannedGroup } from "@/features/home/lib/home-contract";
import { getPlanTimingLabel } from "@/features/home/lib/home-insights";
import {
  getHomePlanCategoryLabel,
  getHomePlanCostLabel,
  getHomePlanLocationLabel,
} from "@/features/home/lib/home-plan-presenters";
import { cn } from "@/shared/lib/utils";
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
        aria-label={`Open ${plan.title} plan`}
        className="grid grid-cols-[4.25rem_minmax(0,1fr)] items-center gap-x-3 gap-y-2 py-3.5 pr-2 pl-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[4.25rem_minmax(0,1fr)_auto] sm:pr-3 md:gap-4"
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
          <p className="truncate font-bold text-foreground text-sm leading-snug transition-colors duration-200 group-hover:text-forge-teal">
            {plan.title}
          </p>
          <p className="mt-0.5 flex min-w-0 items-center gap-1 truncate font-medium text-muted-foreground text-xs">
            <LocationIcon className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{locationLabel}</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1 font-semibold text-muted-foreground text-xs">
              <Clock className="size-3" aria-hidden="true" />
              {timeStr}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 font-bold text-xs",
                status.classes,
              )}
            >
              <StatusIcon className="size-3" aria-hidden="true" />
              {status.label}
            </span>
            <span className="flex items-center gap-1 font-semibold text-muted-foreground text-xs">
              <Tag className="size-3" aria-hidden="true" />
              {getHomePlanCategoryLabel(plan)}
            </span>
            <span className="flex items-center gap-1 font-semibold text-muted-foreground text-xs">
              <Banknote className="size-3" aria-hidden="true" />
              {getHomePlanCostLabel(plan)}
            </span>
          </div>
        </div>

        <div className="col-start-2 flex items-center justify-end sm:col-start-3">
          <span
            className={cn(
              "ml-auto inline-flex h-8 shrink-0 items-center gap-1 rounded-md px-2.5 py-1 font-black text-xs sm:ml-0",
              "text-forge-teal transition-colors duration-150 group-hover:bg-forge-teal/10",
            )}
            aria-hidden="true"
          >
            Open
            <ArrowRight className="size-3 transition-transform duration-150 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </li>
  );
}
