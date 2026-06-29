import {
  CalendarClock,
  CalendarPlus,
  ClipboardCheck,
  Clock3,
  CreditCard,
  type LucideIcon,
  MapPin,
  MapPinPlus,
  Tag,
} from "lucide-react";

import { buildGroupPlanDetailNavigation } from "@/features/group-plan-detail/public/group-plan-detail-navigation";

import type { AttentionQueuePlan } from "./attention-queue.types";
import {
  getPlanAttentionModel,
  getPlanMeta,
  type PlanAttentionKind,
} from "./attention-queue-formatters";

type PlanMetaField = "category" | "cost" | "location" | "time";

const planActionIconMap: Record<PlanAttentionKind, LucideIcon> = {
  details: CalendarPlus,
  review: ClipboardCheck,
  time: Clock3,
  venue: MapPinPlus,
};

const changingPlanMetaFields: Record<PlanAttentionKind, PlanMetaField[]> = {
  details: ["location", "time"],
  review: [],
  time: ["time"],
  venue: ["location"],
};

export function getProposedPlanQueueItemRenderState(group: AttentionQueuePlan) {
  const model = getPlanAttentionModel(group);

  return {
    PlanActionIcon: planActionIconMap[model.kind],
    compactActionLabel: getCompactActionLabel(model.actionLabel),
    model,
    navigation: buildGroupPlanDetailNavigation(group.id, {
      source: "home",
      plan: group.plan.id,
    }),
    planMeta: getPlanMetaItems(group, model.kind),
  };
}

function getPlanMetaItems(group: AttentionQueuePlan, kind: PlanAttentionKind) {
  const [timeLabel, locationLabel, categoryLabel, costLabel] =
    getPlanMeta(group);

  return [
    {
      icon: CalendarClock,
      isChanging: isPlanMetaChanging(kind, "time"),
      label: timeLabel,
    },
    {
      icon: MapPin,
      isChanging: isPlanMetaChanging(kind, "location"),
      label: locationLabel,
    },
    {
      icon: Tag,
      isChanging: isPlanMetaChanging(kind, "category"),
      label: categoryLabel,
    },
    {
      icon: CreditCard,
      isChanging: isPlanMetaChanging(kind, "cost"),
      label: costLabel,
    },
  ];
}

function isPlanMetaChanging(kind: PlanAttentionKind, field: PlanMetaField) {
  return changingPlanMetaFields[kind].includes(field);
}

function getCompactActionLabel(label: string) {
  if (label.startsWith("Set")) {
    return "Set";
  }

  return "Review";
}
