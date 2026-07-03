import type { LucideIcon } from "lucide-react";
import { Banknote, Calendar, MapPin } from "lucide-react";
import { FactItem } from "@/shared/components/ui/fact-item";
import type { IconTileTone } from "@/shared/components/ui/icon-tile";

interface PlanFactListProps {
  cost: string;
  date: string;
  location: string;
  locationHref: string | null;
  time: string;
}

interface PlanFactProps {
  href?: string | null;
  icon: LucideIcon;
  label: string;
  meta?: string;
  tone: Extract<IconTileTone, "amber" | "muted" | "teal">;
  value: string;
  wide?: boolean;
}

export function PlanFactList({
  cost,
  date,
  location,
  locationHref,
  time,
}: PlanFactListProps) {
  const facts: PlanFactProps[] = [
    {
      icon: Calendar,
      label: "When",
      meta: time,
      tone: "teal" as const,
      value: date,
      wide: true,
    },
    {
      href: locationHref,
      icon: MapPin,
      label: "Where",
      tone: "muted" as const,
      value: location,
      wide: true,
    },
    {
      icon: Banknote,
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
    <FactItem
      className={wide ? "col-span-2" : undefined}
      href={href}
      icon={icon}
      iconTone={tone}
      label={label}
      linkClassName={wide ? "wrap-break-word" : undefined}
      meta={meta}
      value={value}
    />
  );
}
