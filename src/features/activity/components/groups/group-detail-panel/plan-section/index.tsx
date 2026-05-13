import {
  Banknote,
  Calendar,
  CheckCircle2,
  CircleDashed,
  MapPin,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import type { Plan } from "@/features/activity/lib/activity-contract";
import { formatPlanLocation } from "@/features/activity/lib/plan-location";
import { cn } from "@/shared/lib/utils";
import {
  categoryColors,
  formatDate,
  formatPanelToken,
  formatTime,
  statusColors,
} from "../lib/constants";

interface PlanSectionProps {
  plan: Plan;
  isFocused?: boolean;
  focusedProposalId?: string | null;
  isReadOnly?: boolean;
}

export function PlanSection({
  plan,
  isFocused = false,
  isReadOnly = false,
}: PlanSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const formattedDate = plan.dateTime ? formatDate(plan.dateTime) : "Date TBD";
  const formattedTime = plan.dateTime ? formatTime(plan.dateTime) : "Time TBD";
  const formattedLocation = formatPlanLocation(plan);
  const displayTitle = stripStatusPrefix(
    plan.title,
    formatPanelToken(plan.status),
  );
  const sectionLabel = getPlanSectionLabel(plan.status, isReadOnly);
  const shouldShowStatusPill = !(isReadOnly && plan.status === "COMPLETED");

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
    <section
      ref={sectionRef}
      className={cn(
        "border-border/70 border-t pt-5 transition-all duration-500",
        isFocused &&
          "rounded-xl bg-forge-teal/8 px-3 pb-3 ring-1 ring-forge-teal/20",
      )}
      aria-labelledby="current-plan-title"
    >
      <div className="flex flex-col gap-3 border-border/70 border-b pb-4">
        <div className="flex items-start justify-between gap-3">
          <p className="font-bold text-slate-muted text-xs">{sectionLabel}</p>
          <div className="flex flex-wrap justify-end gap-1.5">
            <PlanCategoryPill category={plan.category} />
            {shouldShowStatusPill ? (
              <PlanStatusPill status={plan.status} />
            ) : null}
          </div>
        </div>

        <h2
          id="current-plan-title"
          className="text-balance font-bold text-ink text-xl leading-tight tracking-tight"
        >
          {displayTitle}
        </h2>
      </div>

      {plan.description ? (
        <p className="mt-2 line-clamp-2 text-ink/70 text-sm leading-relaxed">
          {plan.description}
        </p>
      ) : null}

      <PlanFactList
        cost={formatPlanCost(plan)}
        date={formattedDate}
        location={formattedLocation}
        locationHref={
          plan.locationMode === "IN_PERSON" &&
          plan.locationLat !== null &&
          plan.locationLng !== null
            ? `https://maps.google.com/?q=${plan.locationLat},${plan.locationLng}`
            : null
        }
        time={formattedTime}
      />
    </section>
  );
}

function PlanCategoryPill({ category }: { category: Plan["category"] }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 font-bold text-micro",
        categoryColors[category],
      )}
    >
      {formatPanelToken(category)}
    </span>
  );
}

function PlanStatusPill({ status }: { status: Plan["status"] }) {
  const Icon =
    status === "CONFIRMED"
      ? CheckCircle2
      : status === "CANCELLED"
        ? XCircle
        : CircleDashed;
  const label = status === "DRAFT" ? "Pending" : formatPanelToken(status);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-bold text-micro",
        statusColors[status],
      )}
    >
      <Icon className="size-3" />
      {label}
    </span>
  );
}

function PlanFactList({
  cost,
  date,
  location,
  locationHref,
  time,
}: {
  cost: string;
  date: string;
  location: string;
  locationHref: string | null;
  time: string;
}) {
  const facts: PlanFactProps[] = [
    {
      icon: <Calendar className="size-4" />,
      label: "When",
      meta: time,
      tone: "teal" as const,
      value: date,
      wide: true,
    },
    {
      href: locationHref,
      icon: <MapPin className="size-4" />,
      label: "Where",
      tone: "muted" as const,
      value: location,
      wide: true,
    },
    {
      icon: <Banknote className="size-4" />,
      label: "Cost",
      tone: "muted" as const,
      value: cost,
    },
  ];

  return (
    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-border/70 border-b pb-3">
      {facts.map((fact) => (
        <PlanFact key={fact.label} {...fact} />
      ))}
    </dl>
  );
}

function PlanFact({
  href,
  icon,
  label,
  meta,
  tone,
  value,
  wide = false,
}: PlanFactProps) {
  return (
    <div
      className={cn("flex min-w-0 items-center gap-2", wide && "col-span-2")}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          tone === "teal" && "bg-forge-teal/10 text-forge-teal",
          tone === "amber" && "bg-spark-amber/10 text-spark-amber",
          tone === "muted" && "bg-slate-muted/10 text-slate-muted",
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-slate-muted text-xs">{label}</dt>
        <dd
          className={cn(
            "wrap-break-word font-semibold text-ink text-sm leading-snug",
          )}
        >
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-forge-teal hover:underline",
                wide && "wrap-break-word",
              )}
            >
              {value}
            </a>
          ) : (
            value
          )}
          {meta ? (
            <span className="ml-1 font-medium text-slate-muted">{meta}</span>
          ) : null}
        </dd>
      </div>
    </div>
  );
}

interface PlanFactProps {
  href?: string | null;
  icon: ReactNode;
  label: string;
  meta?: string;
  tone: "amber" | "muted" | "teal";
  value: string;
  wide?: boolean;
}

function getPlanSectionLabel(planStatus: Plan["status"], isReadOnly: boolean) {
  if (!isReadOnly) {
    return "Current plan";
  }

  if (planStatus === "COMPLETED") {
    return "Final plan";
  }

  if (planStatus === "CANCELLED") {
    return "Cancelled plan";
  }

  return "Plan";
}

function stripStatusPrefix(value: string, statusLabel: string) {
  const prefix = `${statusLabel} `;

  if (!value.toLowerCase().startsWith(prefix.toLowerCase())) {
    return value;
  }

  const strippedValue = value.slice(prefix.length).trim();
  return strippedValue || value;
}

function formatPlanCost(plan: Plan) {
  if (plan.cost === "FREE") {
    return plan.costDetails ? `Free · ${plan.costDetails}` : "Free";
  }

  if (typeof plan.costAmount === "number") {
    return `About £${plan.costAmount.toFixed(0)}`;
  }

  return plan.costDetails ?? "Paid";
}
