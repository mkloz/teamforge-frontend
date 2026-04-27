import {
  Calendar,
  MapPin,
  Video,
  HelpCircle,
  BadgeCheck,
  Banknote,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { Plan } from "@/features/activity/types/groups.types";
import { useMemo } from "react";
import {
  categoryColors,
  statusColors,
  formatDate,
  formatTime,
  costColors,
  locationModeColors,
  locationModeLabels,
} from "./lib/constants";

interface PlanSectionProps {
  plan: Plan;
}

// Icon mapping for location modes
const locationModeIcons = {
  IN_PERSON: MapPin,
  ONLINE: Video,
  TBD: HelpCircle,
} as const;

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

  const LocationIcon = locationModeIcons[plan.locationMode] || HelpCircle;

  // Format cost display
  const costDisplay = useMemo(() => {
    if (plan.cost === "FREE") return "Free";
    if (plan.costAmount) {
      return `$${plan.costAmount}`;
    }
    return "Paid";
  }, [plan.cost, plan.costAmount]);

  return (
    <div className="space-y-0" aria-labelledby="current-plan-title">
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
          {plan.status === "DRAFT" ? "Pending" : plan.status.replace("_", " ")}
        </span>
      </div>

      {/* Description */}
      {plan.description && (
        <p className="text-[13px] text-foreground/60 mt-2 leading-relaxed line-clamp-2">
          {plan.description}
        </p>
      )}

      {/* Key Facts Grid - Scannable at-a-glance information */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {/* Date/Time Pill */}
        <div className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-muted/30 border border-border/30">
          <Calendar
            size={14}
            className="text-forge-teal mb-1"
            aria-hidden="true"
          />
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-0.5">
            When
          </span>
          <span className="text-[11px] font-semibold text-foreground text-center leading-tight">
            {formattedDate}
          </span>
        </div>

        {/* Location Mode Pill */}
        <div className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-muted/30 border border-border/30">
          <LocationIcon
            size={14}
            className={cn(
              "mb-1",
              plan.locationMode === "IN_PERSON" && "text-emerald-600",
              plan.locationMode === "ONLINE" && "text-blue-600",
              plan.locationMode === "TBD" && "text-slate-500",
            )}
            aria-hidden="true"
          />
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-0.5">
            Where
          </span>
          <span
            className={cn(
              "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold",
              locationModeColors[plan.locationMode],
            )}
          >
            {locationModeLabels[plan.locationMode]}
          </span>
        </div>

        {/* Cost Pill */}
        <div className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-muted/30 border border-border/30">
          {plan.cost === "FREE" ? (
            <BadgeCheck
              size={14}
              className="text-forge-teal mb-1"
              aria-hidden="true"
            />
          ) : (
            <Banknote
              size={14}
              className="text-amber-600 mb-1"
              aria-hidden="true"
            />
          )}
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-0.5">
            Cost
          </span>
          <span
            className={cn(
              "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold",
              costColors[plan.cost],
            )}
          >
            {costDisplay}
          </span>
        </div>
      </div>

      {/* Cost Details - if paid with additional info */}
      {plan.cost === "PAID" && plan.costDetails && (
        <p className="mt-2 text-[11px] text-muted-foreground/70 italic">
          {plan.costDetails}
        </p>
      )}

      {/* Location Details */}
      {plan.location && (
        <div className="mt-4 flex items-start gap-3 group/location">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-forge-teal/10 shrink-0"
            aria-hidden="true"
          >
            <MapPin size={15} className="text-forge-teal opacity-90" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-0.5">
              Location
            </p>
            <p className="font-semibold text-foreground text-[13px] truncate">
              {plan.location}
            </p>
            {plan.locationLat !== null && plan.locationLng !== null && (
              <a
                href={`https://maps.google.com/?q=${plan.locationLat},${plan.locationLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[11px] text-primary font-semibold hover:underline gap-1 mt-0.5 group-hover/location:translate-x-0.5 transition-transform"
              >
                Open in Maps
              </a>
            )}
          </div>
        </div>
      )}

      {/* Time Details - if date is set */}
      {plan.dateTime && (
        <div className="mt-3 flex items-center gap-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-forge-teal/10 shrink-0"
            aria-hidden="true"
          >
            <Calendar size={15} className="text-forge-teal opacity-90" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-0.5">
              Date & Time
            </p>
            <p className="font-semibold text-foreground text-[13px]">
              {formattedDate}{" "}
              <span className="text-muted-foreground/50 mx-1">·</span>{" "}
              {formattedTime}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
