import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { Calendar, Clock, MapPin } from "lucide-react";

export interface Step2PlanProps {
  planName: string;
  onPlanNameChange: (v: string) => void;
  planDate: string;
  onPlanDateChange: (v: string) => void;
  planTime: string;
  onPlanTimeChange: (v: string) => void;
  planLocation: string;
  onPlanLocationChange: (v: string) => void;
  locationType: "MY PLACE" | "TBD" | "VIRTUAL";
  onLocationTypeChange: (v: "MY PLACE" | "TBD" | "VIRTUAL") => void;
}

export function Step2Plan({
  planName,
  onPlanNameChange,
  planDate,
  onPlanDateChange,
  planTime,
  onPlanTimeChange,
  planLocation,
  onPlanLocationChange,
  locationType,
  onLocationTypeChange,
}: Step2PlanProps) {
  const isNameError = planName.length > 0 && planName.trim().length < 3;
  const nameCharCount = planName.trim().length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-5">
        {/* Event Name */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-0.5">
            <p className="text-[11px] font-bold text-muted-foreground/60 tracking-widest leading-none uppercase">
              Event title <span className="text-destructive">*</span>
            </p>
            {/* Inline character counter instead of separate error line */}
            <span
              className={cn(
                "text-[11px] font-bold tabular-nums transition-colors duration-300",
                isNameError
                  ? "text-destructive"
                  : nameCharCount >= 3
                    ? "text-muted-foreground/30"
                    : "text-muted-foreground/30",
              )}
            >
              {nameCharCount < 3 ? `${nameCharCount}/3 min` : ""}
            </span>
          </div>
          <input
            type="text"
            value={planName}
            onChange={(e) => onPlanNameChange(e.target.value)}
            placeholder="e.g. Wednesday Basketball"
            className={cn(
              "w-full h-12 px-4 rounded-xl border bg-background/50 text-sm transition-all focus:outline-hidden",
              isNameError
                ? "border-destructive/60 focus:border-destructive ring-1 ring-destructive/15 bg-destructive/3"
                : "border-border/50 focus:border-primary/40 focus:bg-background",
            )}
          />
          {isNameError && (
            <div className="flex items-center gap-1.5 px-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="w-1 h-1 rounded-full bg-destructive/70 shrink-0" />
              <p className="text-xs font-medium text-destructive/80">
                Title must be at least 3 characters.
              </p>
            </div>
          )}
        </div>

        {/* Date & Time — always side-by-side on mobile */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label
              htmlFor="plan-date"
              className="text-[11px] font-bold text-muted-foreground/60 tracking-widest px-0.5 uppercase"
            >
              Date
            </label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors pointer-events-none z-10">
                <Calendar size={14} />
              </div>
              <Input
                id="plan-date"
                type="date"
                value={planDate}
                onChange={(e) => onPlanDateChange(e.target.value)}
                className="h-12 rounded-xl pl-10 pr-3 text-sm font-medium border-border/50 bg-background/50 focus:bg-background transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="plan-time"
              className="text-[11px] font-bold text-muted-foreground/60 tracking-widest px-0.5 uppercase"
            >
              Time
            </label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors pointer-events-none z-10">
                <Clock size={14} />
              </div>
              <Input
                id="plan-time"
                type="time"
                value={planTime}
                onChange={(e) => onPlanTimeChange(e.target.value)}
                className="h-12 rounded-xl pl-10 pr-3 text-sm font-medium border-border/50 bg-background/50 focus:bg-background transition-all"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <label
              htmlFor="plan-location"
              className="text-[11px] font-bold text-muted-foreground/60 tracking-widest uppercase"
            >
              Location
            </label>
          </div>

          {/* Location type pills — taller for touch */}
          <div className="flex gap-2">
            {[
              { id: "MY PLACE" as const, label: "My place" },
              { id: "TBD" as const, label: "To be decided" },
              { id: "VIRTUAL" as const, label: "Virtual" },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => onLocationTypeChange(id)}
                className={cn(
                  // Minimum 44px height for touch compliance
                  "flex-1 min-h-11 px-3 py-2 rounded-xl text-xs font-bold tracking-wide transition-all border",
                  locationType === id
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/30 text-muted-foreground border-border/30 hover:bg-muted/50 hover:border-border/50",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors pointer-events-none">
              <MapPin size={14} />
            </div>
            <Input
              id="plan-location"
              value={planLocation}
              onChange={(e) => onPlanLocationChange(e.target.value)}
              placeholder="Search address or venue name..."
              className="h-12 rounded-xl pl-10 pr-4 text-sm font-medium border-border/50 bg-background/50 focus:bg-background transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
