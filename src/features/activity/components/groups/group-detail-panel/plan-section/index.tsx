import { Calendar, MapPin } from "lucide-react";
import type { Plan } from "@/features/activity/lib/activity-contract";
import { formatPlanLocation } from "@/features/activity/lib/plan-location";
import { cn } from "@/shared/lib/utils";
import { useEffect, useRef } from "react";
import {
  categoryColors,
  statusColors,
  formatDate,
  formatTime,
} from "../lib/constants";
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
  const formattedDate = plan.dateTime ? formatDate(plan.dateTime) : "Date TBD";
  const formattedTime = plan.dateTime ? formatTime(plan.dateTime) : "Time TBD";
  const formattedLocation = formatPlanLocation(plan);

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
        "rounded-xl transition-[background-color,box-shadow] duration-500",
        isFocused && "bg-forge-teal/6 shadow-[0_0_0_1px_rgba(13,148,136,0.18)]",
      )}
      aria-labelledby="current-plan-title"
    >
      {/* Eyebrow label */}
      <p className="mb-2 text-xs font-bold tracking-wider text-muted-foreground/50 uppercase">
        Current Plan
      </p>

      {/* Title and badges */}
      <div className="flex items-start justify-between gap-3">
        <h2
          id="current-plan-title"
          className="text-lg leading-tight font-bold tracking-tight text-foreground"
        >
          {plan.title}
        </h2>
      </div>

      {/* Category and Status Badges */}
      <div className="mt-2 flex flex-wrap gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold tracking-wider uppercase",
            categoryColors[plan.category],
          )}
        >
          {plan.category}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold tracking-wider uppercase",
            statusColors[plan.status],
          )}
        >
          {plan.status === "DRAFT" ? "Pending" : plan.status}
        </span>
      </div>

      {/* Description */}
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground/60">
        {plan.description}
      </p>

      {/* Details - Compact List */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {/* Date/Time Row */}
        <div className="group/item col-span-2 flex items-center gap-3">
          <div
            className="flex size-8 items-center justify-center rounded-lg bg-forge-teal/10 transition-colors duration-300"
            aria-hidden="true"
          >
            <Calendar className="size-4 text-forge-teal opacity-90 shadow-xs" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              {formattedDate}{" "}
              <span className="mx-1 text-slate-muted/50">·</span>{" "}
              {formattedTime}
            </p>
          </div>
        </div>

        {/* Location Row */}
        <div className="group/item col-span-2 flex items-center gap-3 text-sm">
          <div
            className="flex size-8 items-center justify-center rounded-lg bg-forge-teal/10 transition-colors duration-300"
            aria-hidden="true"
          >
            <MapPin className="size-4 text-forge-teal opacity-90 shadow-xs" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">
              {formattedLocation}
            </p>
            {plan.locationMode === "IN_PERSON" &&
              plan.locationLat !== null &&
              plan.locationLng !== null && (
                <a
                  href={`https://maps.google.com/?q=${plan.locationLat},${plan.locationLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-transform group-hover/item:translate-x-1 hover:underline"
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
