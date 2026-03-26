import { cn } from "@/shared/lib/utils";
import { AlertCircle, Calendar, Clock, Home, MapPin, Monitor, HelpCircle } from "lucide-react";

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

// Shared field label — readable sentence-case, no all-caps, no tracking-widest
function FieldLabel({ htmlFor, children, required }: { htmlFor?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-muted-foreground px-0.5">
      {children}
      {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
    </label>
  );
}

// Shared input wrapper with icon slot and focus ring
function InputWrapper({ icon, children, error }: { icon?: React.ReactNode; children: React.ReactNode; error?: boolean }) {
  return (
    <div className={cn(
      "relative group flex items-center rounded-xl border bg-card transition-all duration-200",
      error
        ? "border-destructive/50 ring-1 ring-destructive/20 bg-destructive/3"
        : "border-border/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15",
    )}>
      {icon && (
        <span className="absolute left-3.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors pointer-events-none shrink-0">
          {icon}
        </span>
      )}
      {children}
    </div>
  );
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

  const LOCATION_TYPES = [
    { id: "MY PLACE" as const, label: "My place", icon: <Home size={13} /> },
    { id: "TBD" as const, label: "To be decided", icon: <HelpCircle size={13} /> },
    { id: "VIRTUAL" as const, label: "Virtual", icon: <Monitor size={13} /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-4">

      {/* Event Name */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <FieldLabel htmlFor="plan-name" required>Event title</FieldLabel>
          {/* Character counter — only shown when under minimum */}
          {planName.length > 0 && nameCharCount < 3 && (
            <span className="text-xs font-semibold tabular-nums text-destructive/80 animate-in fade-in duration-200">
              {nameCharCount}/3 min
            </span>
          )}
        </div>

        <InputWrapper icon={<span className="text-xs font-black text-primary/40">#</span>} error={isNameError}>
          <input
            id="plan-name"
            type="text"
            value={planName}
            onChange={(e) => onPlanNameChange(e.target.value)}
            placeholder="e.g. Wednesday Basketball"
            autoComplete="off"
            aria-describedby={isNameError ? "name-error" : undefined}
            className="w-full h-12 pl-9 pr-4 bg-transparent text-sm font-medium placeholder:text-muted-foreground/40 focus:outline-none rounded-xl"
          />
        </InputWrapper>

        {/* Error feedback — visible, left-bordered, not buried */}
        {isNameError && (
          <div
            id="name-error"
            role="alert"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/5 border-l-2 border-destructive/50 animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <AlertCircle size={13} className="text-destructive/70 shrink-0" />
            <p className="text-xs font-medium text-destructive/80">
              Title must be at least 3 characters.
            </p>
          </div>
        )}
      </div>

      {/* Date & Time — side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <FieldLabel htmlFor="plan-date">Date</FieldLabel>
          <InputWrapper icon={<Calendar size={14} />}>
            <input
              id="plan-date"
              type="date"
              value={planDate}
              onChange={(e) => onPlanDateChange(e.target.value)}
              className="w-full h-12 pl-9 pr-3 bg-transparent text-sm font-medium focus:outline-none rounded-xl cursor-pointer"
            />
          </InputWrapper>
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="plan-time">Time</FieldLabel>
          <InputWrapper icon={<Clock size={14} />}>
            <input
              id="plan-time"
              type="time"
              value={planTime}
              onChange={(e) => onPlanTimeChange(e.target.value)}
              className="w-full h-12 pl-9 pr-3 bg-transparent text-sm font-medium focus:outline-none rounded-xl cursor-pointer"
            />
          </InputWrapper>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <FieldLabel htmlFor="plan-location">Location</FieldLabel>

        {/* Location type — 3-up pills with icons */}
        <div className="grid grid-cols-3 gap-2">
          {LOCATION_TYPES.map(({ id, label, icon }) => {
            const active = locationType === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onLocationTypeChange(id)}
                aria-pressed={active}
                className={cn(
                  "group flex flex-col items-center justify-center gap-1.5 min-h-[60px] py-2.5 px-2 rounded-xl border text-center transition-all duration-200 active:scale-[0.97]",
                  active
                    ? "border-primary bg-primary/8 ring-1 ring-primary/20 shadow-sm"
                    : "border-border/50 bg-card hover:border-primary/30 hover:bg-primary/5",
                )}
              >
                <span className={cn(
                  "transition-colors duration-200",
                  active ? "text-primary" : "text-muted-foreground/50 group-hover:text-primary/60",
                )}>
                  {icon}
                </span>
                <span className={cn(
                  "text-[11px] font-semibold leading-tight",
                  active ? "text-primary" : "text-muted-foreground",
                )}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Address / venue input */}
        <InputWrapper icon={<MapPin size={14} />}>
          <input
            id="plan-location"
            type="text"
            value={planLocation}
            onChange={(e) => onPlanLocationChange(e.target.value)}
            placeholder="Search address or venue name..."
            className="w-full h-12 pl-9 pr-4 bg-transparent text-sm font-medium placeholder:text-muted-foreground/40 focus:outline-none rounded-xl"
          />
        </InputWrapper>
      </div>

    </div>
  );
}
