import type { PlannedGroup } from "@/features/home/lib/home-contract";
import { getPlanTimingLabel } from "@/features/home/lib/home-insights";
import {
  getHomePlanCategoryLabel,
  getHomePlanCostLabel,
  getHomePlanLocationLabel,
} from "@/features/home/lib/home-plan-presenters";
import type {
  AttentionQueueFriendRequest,
  AttentionQueueInvitation,
  AttentionQueuePlan,
} from "./attention-queue.types";

export type PlanAttentionKind =
  | "details"
  | "propose-location"
  | "propose-time"
  | "review"
  | "time"
  | "venue"
  | "vote-location"
  | "vote-time";

interface PlanAttentionModel {
  actionLabel: string;
  description: string;
  kind: PlanAttentionKind;
}

const MILLISECONDS_PER_DAY = 86_400_000;

const PLAN_ATTENTION_MODELS = {
  details: {
    actionLabel: "Set details",
    description: "Pick the time and venue.",
    kind: "details",
  },
  "propose-location": {
    actionLabel: "Propose a place",
    description: "Choose a place for the group to consider.",
    kind: "propose-location",
  },
  "propose-time": {
    actionLabel: "Propose a time",
    description: "Choose a time for the group to consider.",
    kind: "propose-time",
  },
  review: {
    actionLabel: "Review plan",
    description: "Review the latest proposal.",
    kind: "review",
  },
  time: {
    actionLabel: "Set time",
    description: "Pick when this happens.",
    kind: "time",
  },
  venue: {
    actionLabel: "Set venue",
    description: "Pick where this happens.",
    kind: "venue",
  },
  "vote-location": {
    actionLabel: "Vote on a place",
    description: "A place is waiting for your vote.",
    kind: "vote-location",
  },
  "vote-time": {
    actionLabel: "Vote on a time",
    description: "A time is waiting for your vote.",
    kind: "vote-time",
  },
} satisfies Record<PlanAttentionKind, PlanAttentionModel>;

const PLAN_ATTENTION_KIND_BY_ACTION = {
  PROPOSE_LOCATION: "propose-location",
  PROPOSE_TIME: "propose-time",
  READY: "review",
  VOTE_LOCATION: "vote-location",
  VOTE_TIME: "vote-time",
} as const;

export function formatQueueCount(count: number, singular: string) {
  if (count === 0) {
    return null;
  }

  return `${count} ${singular}${count === 1 ? "" : "s"}`;
}

export function getInviteMemberLabel(invite: AttentionQueueInvitation) {
  return `${invite.group.activeMembersCount}/${invite.group.maxMembers} inside`;
}

export function getQueueMomentLabel(value: string, prefix: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const now = new Date();
  const dayDiff = getCalendarDayDiff(date, now);

  if (dayDiff === 0) {
    return `${prefix} today`;
  }

  if (dayDiff === -1) {
    return `${prefix} yesterday`;
  }

  if (dayDiff > 0 && dayDiff < 7) {
    return `${prefix} ${date.toLocaleString("en-GB", { weekday: "long" })}`;
  }

  return `${prefix} ${date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
  })}`;
}

function getCalendarDayDiff(date: Date, now: Date) {
  return Math.round(
    (getStartOfDay(date).getTime() - getStartOfDay(now).getTime()) /
      MILLISECONDS_PER_DAY,
  );
}

function getStartOfDay(date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

export function getFriendRequestMeta(request: AttentionQueueFriendRequest) {
  const meta = [
    request.counterpart.city,
    getQueueMomentLabel(request.createdAt, "Sent"),
  ];

  return meta.filter(Boolean);
}

export function getPlanAttentionModel(
  group: AttentionQueuePlan,
): PlanAttentionModel {
  const action = group.plan.nextRequiredAction;
  const attentionKind = action
    ? PLAN_ATTENTION_KIND_BY_ACTION[action]
    : getLegacyPlanAttentionKind(group.plan);

  return { ...PLAN_ATTENTION_MODELS[attentionKind] };
}

function getLegacyPlanAttentionKind(
  plan: AttentionQueuePlan["plan"],
): PlanAttentionKind {
  const needsLocation = plan.locationMode === "TBD" || !plan.location?.trim();
  const needsTime = !plan.dateTime;

  if (needsLocation && needsTime) {
    return "details";
  }

  if (needsLocation) {
    return "venue";
  }

  return needsTime ? "time" : "review";
}

export function getPlanMeta(group: PlannedGroup) {
  return [
    getPlanTimingLabel(group.plan),
    getHomePlanLocationLabel(group.plan),
    getHomePlanCategoryLabel(group.plan),
    getHomePlanCostLabel(group.plan),
  ];
}
