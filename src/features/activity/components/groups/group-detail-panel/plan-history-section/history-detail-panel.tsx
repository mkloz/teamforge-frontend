import type { LucideIcon } from "lucide-react";
import { Banknote, CalendarClock, MapPin, ShieldCheck } from "lucide-react";
import type { PlanHistoryItem } from "@/features/activity/lib/activity-contract";
import { formatPlanLocation } from "@/features/activity/lib/plan-location";
import { FactItem } from "@/shared/components/ui/fact-item";
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
      <dl className="grid gap-3">
        {facts.map((fact) => (
          <FactItem
            key={fact.label}
            href={fact.href}
            icon={fact.icon}
            iconTone="muted"
            label={fact.label}
            linkClassName="underline-offset-4"
            value={fact.value}
          />
        ))}
      </dl>
    </div>
  );
}

interface HistoryDetailFactProps {
  href?: string | null;
  icon: LucideIcon;
  label: string;
  value: string;
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
