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
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfDate = new Date(date);
  startOfDate.setHours(0, 0, 0, 0);

  const dayDiff = Math.round(
    (startOfDate.getTime() - startOfToday.getTime()) / 86_400_000,
  );

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
  const needsLocation = plan.locationMode === "TBD" || !plan.location?.trim();
  const needsTime = !plan.dateTime;

  if (needsLocation && needsTime) {
    return {
      actionLabel: "Set details",
      description: "Pick the time and venue.",
      kind: "details",
    };
  }

  if (needsLocation) {
    return {
      actionLabel: "Set venue",
      description: "Pick where this happens.",
      kind: "venue",
    };
  }

  if (needsTime) {
    return {
      actionLabel: "Set time",
      description: "Pick when this happens.",
      kind: "time",
    };
  }

  return {
    actionLabel: "Review plan",
    description: "Review the latest proposal.",
    kind: "review",
  };
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
  if (nextStep.kind === "personality") {
    return ["Group fit", "Personality signal"];
  }

  if (nextStep.kind === "interests") {
    return ["Group fit", "Interest signal"];
  }

  if (nextStep.kind === "security") {
    return ["Account safety"];
  }

  return ["Profile setup"];
}
