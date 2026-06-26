import type {
  HomeViewer,
  PlannedGroup,
} from "@/features/home/lib/home-contract";
import { getPlanTimingLabel } from "@/features/home/lib/home-insights";
import {
  getHomePlanCategoryLabel,
  getHomePlanCostLabel,
  getHomePlanLocationLabel,
} from "@/features/home/lib/home-plan-presenters";
import { normalizeTrustScore } from "@/shared/lib/user-psychometrics";

import type {
  AttentionQueueFriendRequest,
  AttentionQueueInvitation,
  AttentionQueuePlan,
} from "./attention-queue.types";

export type PlanAttentionKind = "details" | "review" | "time" | "venue";

interface PlanAttentionModel {
  actionLabel: string;
  description: string;
  kind: PlanAttentionKind;
}

interface PlanAttentionNeeds {
  needsLocation: boolean;
  needsTime: boolean;
}

const MILLISECONDS_PER_DAY = 86_400_000;

const PLAN_ATTENTION_MODELS = {
  details: {
    actionLabel: "Set details",
    description: "Pick the time and venue.",
    kind: "details",
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
} satisfies Record<PlanAttentionKind, PlanAttentionModel>;

const PROFILE_STEP_META_BY_KIND = {
  account: ["Profile setup"],
  interests: ["Group fit", "Interest signal"],
  personality: ["Group fit", "Personality signal"],
  security: ["Account safety"],
} satisfies Record<
  NonNullable<HomeViewer["nextStep"]>["kind"],
  readonly string[]
>;

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
    `Trust ${normalizeTrustScore(request.counterpart.trustScore)}`,
    getQueueMomentLabel(request.createdAt, "Sent"),
  ];

  return meta.filter(Boolean);
}

export function getPlanAttentionModel(
  group: AttentionQueuePlan,
): PlanAttentionModel {
  const plan = group.plan;
  const attentionKind = getPlanAttentionKind({
    needsLocation: plan.locationMode === "TBD" || !plan.location?.trim(),
    needsTime: !plan.dateTime,
  });

  return { ...PLAN_ATTENTION_MODELS[attentionKind] };
}

function getPlanAttentionKind({
  needsLocation,
  needsTime,
}: PlanAttentionNeeds): PlanAttentionKind {
  if (needsLocation && needsTime) {
    return "details";
  }

  if (needsLocation) {
    return "venue";
  }

  if (needsTime) {
    return "time";
  }

  return "review";
}

export function getPlanMeta(group: PlannedGroup) {
  return [
    getPlanTimingLabel(group.plan),
    getHomePlanLocationLabel(group.plan),
    getHomePlanCategoryLabel(group.plan),
    getHomePlanCostLabel(group.plan),
  ];
}

export function getProfileStepMeta(
  nextStep: NonNullable<HomeViewer["nextStep"]>,
) {
  return [...PROFILE_STEP_META_BY_KIND[nextStep.kind]];
}
