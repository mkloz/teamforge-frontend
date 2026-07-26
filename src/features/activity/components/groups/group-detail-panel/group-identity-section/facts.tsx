import { CalendarDays, Globe2, Lock, MapPin, UserCheck } from "lucide-react";
import type { Group } from "@/features/activity/lib/activity-contract";
import { FactItem } from "@/shared/components/ui/fact-item";
import { formatPanelToken } from "../lib/constants";
import type { GroupFactProps } from "./types";

interface GroupFactListProps {
  activity?: Group["activity"];
  createdLabel: string;
}

export function GroupFactList({ activity, createdLabel }: GroupFactListProps) {
  const access = activity ? getAccessDisplay(activity) : null;
  const facts = getGroupFacts({
    access,
    activity,
    createdLabel,
  });
  return (
    <div className="border-border/70 border-y py-3">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        {facts.map((fact) => (
          <FactItem
            key={fact.label}
            icon={fact.icon}
            iconTone={fact.tone}
            label={fact.label}
            value={fact.value}
          />
        ))}
      </dl>
    </div>
  );
}

function getGroupFacts({
  access,
  activity,
  createdLabel,
}: {
  access: ReturnType<typeof getAccessDisplay> | null;
  activity?: Group["activity"];
  createdLabel: string;
}) {
  const facts: GroupFactProps[] = [
    {
      icon: CalendarDays,
      label: "Created",
      value: createdLabel.replace("Created ", ""),
      tone: "amber" as const,
    },
  ];

  if (activity?.city) {
    facts.unshift({
      icon: MapPin,
      label: "Area",
      value: activity.city,
      tone: "muted",
    });
  }

  if (access) {
    facts.splice(1, 0, {
      icon: access.icon,
      label: "Joining",
      value: access.label,
      tone: "muted",
    });
  }

  return facts;
}

function getAccessDisplay(activity: NonNullable<Group["activity"]>) {
  const visibility = formatPanelToken(activity.visibility);

  if (activity.visibility === "PUBLIC") {
    return {
      icon: Globe2,
      label: activity.access === "OPEN" ? "Open" : `Request · ${visibility}`,
    };
  }

  if (activity.visibility === "FRIENDS_ONLY") {
    return {
      icon: UserCheck,
      label: "Friends only",
    };
  }

  return {
    icon: Lock,
    label: visibility,
  };
}
