import { Calendar, MapPin } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { Plan } from "@/features/activity/lib/activity-contract";
import { useEffect, useMemo, useRef } from "react";
import {
  categoryColors,
  statusColors,
  formatDate,
  formatTime,
} from "./lib/constants";
import { CreatePlanProposalForm } from "./create-plan-proposal-form";
import { PlanProposalsSection } from "./plan-proposals-section";

interface PlanSectionProps {
  plan: Plan;
  isFocused?: boolean;
  focusedProposalId?: string | null;
}

export function PlanSection({
  plan,
  isFocused = false,
  focusedProposalId = null,
}: PlanSectionProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  // Memoize date/time formatting for performance
  const formattedDate = useMemo(
    () => (plan.dateTime ? formatDate(plan.dateTime) : "Date TBD"),
    [plan.dateTime],
  );
  const formattedTime = useMemo(
    () => (plan.dateTime ? formatTime(plan.dateTime) : "Time TBD"),
    [plan.dateTime],
  );

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    sectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [isFocused]);

  return (
    <div
      ref={sectionRef}
      className={cn(
        "space-y-0 rounded-2xl transition-[background-color,box-shadow] duration-500",
        isFocused && "bg-forge-teal/6 shadow-[0_0_0_1px_rgba(13,148,136,0.18)]",
      )}
      aria-labelledby="current-plan-title"
    >
      {/* Eyebrow label */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-2">
        Current Plan
      </p>

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
      <p className="text-[13px] text-foreground/60 mt-2 leading-relaxed line-clamp-2">
        {plan.description}
      </p>

      {/* Details - Compact List */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {/* Date/Time Row */}
        <div className="col-span-2 flex items-center gap-3 group/item">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-forge-teal/10 transition-colors duration-300"
            aria-hidden="true"
          >
            <Calendar
              size={15}
              className="text-forge-teal opacity-90 shadow-xs"
            />
          </div>
          <div>
            <p className="font-bold text-foreground text-sm">
              {formattedDate}{" "}
              <span className="text-slate-muted/50 mx-1">·</span>{" "}
              {formattedTime}
            </p>
          </div>
        </div>

        {/* Location Row */}
        <div className="col-span-2 flex items-center gap-3 text-sm group/item">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-forge-teal/10 transition-colors duration-300"
            aria-hidden="true"
          >
            <MapPin
              size={15}
              className="text-forge-teal opacity-90 shadow-xs"
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

      <CreatePlanProposalForm plan={plan} />
      <PlanProposalsSection
        groupId={plan.groupId}
        proposals={plan.proposals ?? []}
        focusedProposalId={focusedProposalId}
      />
    </div>
  );
}
