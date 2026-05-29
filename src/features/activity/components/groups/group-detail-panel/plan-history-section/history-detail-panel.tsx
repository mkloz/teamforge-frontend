import {
  Banknote,
  CalendarClock,
  type LucideIcon,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import type { PlanHistoryItem } from "@/features/activity/lib/activity-contract";
import { formatPlanLocation } from "@/features/activity/lib/plan-location";
import { formatPanelToken } from "../lib/constants";

interface HistoryDetailPanelProps {
  id: string;
  item: PlanHistoryItem;
}

export function HistoryDetailPanel({ id, item }: HistoryDetailPanelProps) {
  const mapsHref = getMapsHref(item);
  const facts: HistoryDetailFactProps[] = [
    {
      icon: CalendarClock,
      label: "When",
      value: formatHistoryDateTime(item.dateTime),
    },
    {
      href: mapsHref,
      icon: MapPin,
      label: "Where",
      value: formatPlanLocation(item),
    },
    {
      icon: Banknote,
      label: "Cost",
      value: formatPanelToken(item.cost),
    },
    {
      icon: ShieldCheck,
      label: "Outcome",
      value: formatPanelToken(item.status),
    },
  ];

  return (
    <div id={id} className="col-span-2 mt-3 border-border/70 border-t pt-3">
      <div className="grid gap-3">
        {facts.map((fact) => (
          <HistoryDetailFact key={fact.label} {...fact} />
        ))}
      </div>
    </div>
  );
}

interface HistoryDetailFactProps {
  href?: string | null;
  icon: LucideIcon;
  label: string;
  value: string;
}

function HistoryDetailFact({
  href,
  icon: Icon,
  label,
  value,
}: HistoryDetailFactProps) {
  return (
    <div className="flex min-w-0 gap-2.5">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-muted/10 text-slate-muted"
        aria-hidden="true"
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-slate-muted text-xs">{label}</p>
        <p className="wrap-break-word font-semibold text-ink text-sm leading-snug">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-forge-teal underline-offset-4 hover:underline"
            >
              {value}
            </a>
          ) : (
            value
          )}
        </p>
      </div>
    </div>
  );
}

function formatHistoryDateTime(dateTime: string | null) {
  if (!dateTime) {
    return "Date TBD";
  }

  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return "Date TBD";
  }

  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeLabel = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${dateLabel} · ${timeLabel}`;
}

function getMapsHref(item: PlanHistoryItem) {
  if (item.locationMode !== "IN_PERSON") {
    return null;
  }

  if (item.locationLat !== null && item.locationLng !== null) {
    return `https://maps.google.com/?q=${item.locationLat},${item.locationLng}`;
  }

  if (item.location) {
    return `https://maps.google.com/?q=${encodeURIComponent(item.location)}`;
  }

  return null;
}
