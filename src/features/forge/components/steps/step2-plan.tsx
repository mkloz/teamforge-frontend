import { cn } from "@/shared/lib/utils";
import {
  AlertCircle,
  Calendar,
  Clock,
  Globe,
  Home,
  MapPin,
  Monitor,
  Pencil,
} from "lucide-react";

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

// ── Shared primitives ──────────────────────────────────────────────────────

function SectionCard({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-card overflow-hidden",
        accent
          ? "border-primary/20 shadow-sm shadow-primary/5"
          : "border-border/50",
      )}
    >
      {accent && (
        <div className="absolute left-0 top-3 bottom-3 w-0.75 bg-primary/70 rounded-r-full" />
      )}
      <div className="px-4 py-4 space-y-4">{children}</div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-primary">{icon}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground leading-tight">
          {title}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground/70 mt-0.5 leading-snug">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function FieldLabel({
  htmlFor,
  children,
  required,
  hint,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold text-muted-foreground"
      >
        {children}
        {required && (
          <span className="text-accent ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      {hint && (
        <span className="text-micro text-muted-foreground/50">{hint}</span>
      )}
    </div>
  );
}

function InputField({
  icon,
  error,
  children,
}: {
  icon?: React.ReactNode;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative group flex items-center rounded-xl border bg-background/60 transition-colors duration-150",
        error
          ? "border-destructive/40 ring-1 ring-destructive/15"
          : "border-border/60 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/12 focus-within:bg-background",
      )}
    >
      {icon && (
        <span className="absolute left-3 text-muted-foreground/40 group-focus-within:text-primary/60 transition-colors pointer-events-none">
          {icon}
        </span>
      )}
      {children}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

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
  const trimmed = planName.trim();
  const isNameError = planName.length > 0 && trimmed.length < 3;
  const isNameValid = trimmed.length >= 3;
  const charCount = trimmed.length;

  const showAddress = locationType !== "VIRTUAL" && locationType !== "TBD";

  const LOCATION_TYPES: {
    id: "MY PLACE" | "TBD" | "VIRTUAL";
    label: string;
    sub: string;
    Icon: React.ElementType;
  }[] = [
    {
      id: "MY PLACE",
      label: "In person",
      sub: "Specific address",
      Icon: Home,
    },
    {
      id: "TBD",
      label: "To be decided",
      sub: "Confirm later",
      Icon: Globe,
    },
    {
      id: "VIRTUAL",
      label: "Virtual",
      sub: "Online meeting",
      Icon: Monitor,
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-6">
      {/* ── Section 1: Event Title ── */}
      <SectionCard accent={isNameValid}>
        <SectionHeader
          icon={<Pencil size={14} />}
          title="Event title"
          description="Give your group gathering a name people will recognise."
        />

        <div className="space-y-2">
          <FieldLabel
            htmlFor="plan-name"
            required
            hint={
              planName.length > 0
                ? isNameValid
                  ? "Looks good"
                  : `${charCount}/3 min`
                : undefined
            }
          >
            <span
              className={cn(
                "transition-colors",
                isNameValid ? "text-primary" : "",
              )}
            >
              {isNameValid ? "Title" : "Title"}
            </span>
          </FieldLabel>

          <InputField
            icon={<span className="text-sm font-bold text-primary/30">#</span>}
            error={isNameError}
          >
            <input
              id="plan-name"
              type="text"
              value={planName}
              onChange={(e) => onPlanNameChange(e.target.value)}
              placeholder="e.g. Wednesday Basketball"
              autoComplete="off"
              maxLength={60}
              aria-describedby={isNameError ? "name-error" : undefined}
              className="w-full h-12 pl-9 pr-4 bg-transparent text-sm font-medium placeholder:text-muted-foreground/35 focus:outline-none rounded-xl"
            />
          </InputField>

          {isNameError && (
            <div
              id="name-error"
              role="alert"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/5 border border-destructive/15 animate-in fade-in slide-in-from-top-1 duration-150"
            >
              <AlertCircle size={13} className="text-destructive/60 shrink-0" />
              <p className="text-xs font-medium text-destructive/70">
                Title must be at least 3 characters.
              </p>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── Section 2: Date & Time ── */}
      <SectionCard>
        <SectionHeader
          icon={<Calendar size={14} />}
          title="Date & time"
          description="When are you planning to meet up?"
        />

        <div className="grid grid-cols-2 gap-3">
          {/* Date */}
          <div className="space-y-2">
            <FieldLabel htmlFor="plan-date">Date</FieldLabel>
            <InputField icon={<Calendar size={13} />}>
              <input
                id="plan-date"
                type="date"
                value={planDate}
                onChange={(e) => onPlanDateChange(e.target.value)}
                className="w-full h-11 pl-8 pr-2 bg-transparent text-sm font-medium text-foreground focus:outline-none rounded-xl cursor-pointer"
              />
            </InputField>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <FieldLabel htmlFor="plan-time">Time</FieldLabel>
            <InputField icon={<Clock size={13} />}>
              <input
                id="plan-time"
                type="time"
                value={planTime}
                onChange={(e) => onPlanTimeChange(e.target.value)}
                className="w-full h-11 pl-8 pr-2 bg-transparent text-sm font-medium text-foreground focus:outline-none rounded-xl cursor-pointer"
              />
            </InputField>
          </div>
        </div>

        {/* Live summary pill */}
        {(planDate || planTime) && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/10 animate-in fade-in duration-200">
            <Clock size={12} className="text-primary/60 shrink-0" />
            <p className="text-xs font-medium text-primary/80">
              {planDate
                ? new Date(planDate + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })
                : "Date TBD"}
              {planTime && ` at ${planTime}`}
            </p>
          </div>
        )}
      </SectionCard>

      {/* ── Section 3: Location ── */}
      <SectionCard>
        <SectionHeader
          icon={<MapPin size={14} />}
          title="Location"
          description="Choose where the group will meet."
        />

        {/* Location type — horizontal radio cards */}
        <div
          className="grid grid-cols-3 gap-2"
          role="radiogroup"
          aria-label="Location type"
        >
          {LOCATION_TYPES.map(({ id, label, sub, Icon }) => {
            const active = locationType === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onLocationTypeChange(id)}
                className={cn(
                  "group flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border text-center transition duration-150 active:scale-[0.97]",
                  active
                    ? "border-primary/30 bg-primary/8 ring-1 ring-primary/20 shadow-sm"
                    : "border-border/50 bg-background/40 hover:border-primary/20 hover:bg-primary/4",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                  )}
                >
                  <Icon size={15} />
                </div>
                <div>
                  <p
                    className={cn(
                      "text-xs font-semibold leading-tight",
                      active ? "text-primary" : "text-foreground",
                    )}
                  >
                    {label}
                  </p>
                  <p className="text-micro text-muted-foreground/60 leading-tight mt-0.5">
                    {sub}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Address input — only for in-person */}
        {showAddress && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <FieldLabel htmlFor="plan-location">Address or venue</FieldLabel>
            <InputField icon={<MapPin size={13} />}>
              <input
                id="plan-location"
                type="text"
                value={planLocation}
                onChange={(e) => onPlanLocationChange(e.target.value)}
                placeholder="Search address or venue name..."
                className="w-full h-11 pl-8 pr-4 bg-transparent text-sm font-medium placeholder:text-muted-foreground/35 focus:outline-none rounded-xl"
              />
            </InputField>
          </div>
        )}

        {/* Virtual / TBD contextual note */}
        {locationType === "VIRTUAL" && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border/40 animate-in fade-in duration-200">
            <Monitor size={12} className="text-muted-foreground/50 shrink-0" />
            <p className="text-xs text-muted-foreground/70">
              A meeting link can be shared with members after the group is
              forged.
            </p>
          </div>
        )}

        {locationType === "TBD" && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border/40 animate-in fade-in duration-200">
            <Globe size={12} className="text-muted-foreground/50 shrink-0" />
            <p className="text-xs text-muted-foreground/70">
              Location will be confirmed with members once the group is formed.
            </p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
