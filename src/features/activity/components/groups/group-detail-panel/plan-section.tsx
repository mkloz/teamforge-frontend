import { Calendar, MapPin, Clock } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { Plan } from "@/features/activity/types/groups.types";
import { useMemo } from "react";
import {
  categoryColors,
  statusColors,
  formatDate,
  formatTime,
} from "./lib/constants";

interface PlanSectionProps {
  plan: Plan;
}

export function PlanSection({ plan }: PlanSectionProps) {
  // Memoize date/time formatting for performance
  const formattedDate = useMemo(
    () => (plan.dateTime ? formatDate(plan.dateTime) : "Date TBD"),
    [plan.dateTime],
  );
  const formattedTime = useMemo(
    () => (plan.dateTime ? formatTime(plan.dateTime) : "Time TBD"),
    [plan.dateTime],
  );

  return (
    <div className="space-y-4" aria-labelledby="current-plan-title">
      {/* Title and badges */}
      <div className="flex items-start justify-between gap-3">
        <h2
          id="current-plan-title"
          className="text-lg font-bold text-foreground tracking-tight leading-tight"
        >
          {plan.title}
        </h2>
      </div>

      {/* Category and Status Badges */}
      <div className="flex flex-wrap gap-2 mt-2">
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase",
            categoryColors[plan.category],
          )}
        >
          {plan.category}
        </span>
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase",
            statusColors[plan.status],
          )}
        >
          {plan.status === "DRAFT" ? "Pending" : plan.status}
        </span>
      </div>

      {/* Description */}
      <p className="text-[13px] text-foreground/60 mt-3 leading-relaxed line-clamp-2">
        {plan.description}
      </p>

      {/* Details - Compact List */}
      <div className="mt-4 space-y-2.5">
        {/* Date Row */}
        <div className="flex items-center gap-3 text-sm group/item">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-500/10 transition-colors duration-300"
            aria-hidden="true"
          >
            <Calendar
              size={15}
              className="text-teal-600 dark:text-teal-400 opacity-90 shadow-xs"
            />
          </div>
          <div>
            <p className="font-bold text-foreground text-sm">{formattedDate}</p>
          </div>
        </div>

        {/* Time Row */}
        <div className="flex items-center gap-3 text-sm group/item">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-500/10 transition-colors duration-300"
            aria-hidden="true"
          >
            <Clock
              size={15}
              className="text-teal-600 dark:text-teal-400 opacity-90 shadow-xs"
            />
          </div>
          <div>
            <p className="font-bold text-foreground text-sm">{formattedTime}</p>
          </div>
        </div>

        {/* Location Row */}
        <div className="flex items-center gap-3 text-sm group/item">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-500/10 transition-colors duration-300"
            aria-hidden="true"
          >
            <MapPin
              size={15}
              className="text-teal-600 dark:text-teal-400 opacity-90 shadow-xs"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-sm truncate">
              {plan.location}
            </p>
            {plan.locationLat !== null && plan.locationLng !== null && (
              <a
                href={`https://maps.google.com/?q=${plan.locationLat},${plan.locationLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[11px] text-primary font-semibold hover:underline gap-1 group-hover/item:translate-x-1 transition-transform"
              >
                Open in Maps
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
