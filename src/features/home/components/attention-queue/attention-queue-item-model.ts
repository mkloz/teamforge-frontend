import {
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  Handshake,
  type LucideIcon,
  MessageCircleQuestion,
  UserPlus,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";

import type {
  AttentionQueueContinuation,
  AttentionQueueFriendRequest,
  AttentionQueueInvitation,
  AttentionQueueParticipation,
  AttentionQueuePlan,
} from "./attention-queue.types";
import {
  getPlanAttentionModel,
  getQueueMomentLabel,
} from "./attention-queue-formatters";
import type { AttentionQueueRenderItem } from "./attention-queue-render-state";

export type AttentionQueueUrgency = "later" | "now" | "soon";

export interface AttentionQueueCompactModel {
  avatar?: {
    name: string;
    shape: "circle" | "rounded";
    src: string | null;
  };
  badgeIcon?: LucideIcon;
  batchable: boolean;
  contextLabel: string | null;
  icon: LucideIcon;
  iconTone: "amber" | "muted" | "teal";
  key: string;
  subtitle: string;
  title: string;
  urgency: AttentionQueueUrgency;
}

interface AttentionQueueUrgencyCountInput {
  continuationCheckIns: AttentionQueueContinuation[];
  pendingParticipations: AttentionQueueParticipation[];
  proposedPlans: AttentionQueuePlan[];
  visibleInvitations: AttentionQueueInvitation[];
  visibleRequests: AttentionQueueFriendRequest[];
}

const MILLISECONDS_PER_DAY = 86_400_000;
const NOW_WINDOW_DAYS = 2;
const SOON_WINDOW_DAYS = 7;

export function getAttentionQueueCompactModel(
  item: Exclude<AttentionQueueRenderItem, { kind: "see-rest" }>,
  currentTime = Date.now(),
): AttentionQueueCompactModel {
  if (item.kind === "invitation") {
    return getInvitationCompactModel(item.invite, currentTime);
  }

  if (item.kind === "request") {
    return getRequestCompactModel(item.request, currentTime);
  }

  if (item.kind === "participation") {
    return getParticipationCompactModel(item.group, currentTime);
  }

  if (item.kind === "continuation") {
    return getContinuationCompactModel(item.group, currentTime);
  }

  if (item.kind === "plan") {
    return getPlanCompactModel(item.group, currentTime);
  }

  const exhaustiveItem: never = item;
  throw new Error("Unsupported attention queue item", {
    cause: exhaustiveItem,
  });
}

export function getAttentionQueueUrgencyCounts({
  continuationCheckIns,
  pendingParticipations,
  proposedPlans,
  visibleInvitations,
  visibleRequests,
}: AttentionQueueUrgencyCountInput) {
  const counts: Record<AttentionQueueUrgency, number> = {
    now: 0,
    soon: 0,
    later: 0,
  };
  const currentTime = Date.now();

  for (const invite of visibleInvitations) {
    counts[getInvitationUrgency(invite, currentTime)] += 1;
  }

  for (const request of visibleRequests) {
    counts[getRequestUrgency(request, currentTime)] += 1;
  }

  for (const group of pendingParticipations) {
    counts[getParticipationUrgency(group, currentTime)] += 1;
  }

  for (const group of continuationCheckIns) {
    counts[getContinuationUrgency(group, currentTime)] += 1;
  }

  for (const group of proposedPlans) {
    counts[getPlanUrgency(group, currentTime)] += 1;
  }

  return counts;
}

function getInvitationCompactModel(
  invite: AttentionQueueInvitation,
  currentTime: number,
): AttentionQueueCompactModel {
  const isJoinRequest = invite.type === "JOIN_REQUEST";

  return {
    avatar: {
      name: invite.group.name,
      shape: "rounded",
      src: invite.group.avatar,
    },
    badgeIcon: getInviteBadgeIcon(invite.type),
    batchable: true,
    contextLabel: invite.expiresAt
      ? getQueueMomentLabel(invite.expiresAt, "Expires")
      : getQueueMomentLabel(invite.createdAt, "Sent"),
    icon: getInviteBadgeIcon(invite.type),
    iconTone: "teal",
    key: `invitation:${invite.id}`,
    subtitle: isJoinRequest
      ? "Membership request"
      : `${invite.inviter?.name ?? "Someone"} invited you`,
    title: invite.group.name,
    urgency: getInvitationUrgency(invite, currentTime),
  };
}

function getRequestCompactModel(
  request: AttentionQueueFriendRequest,
  currentTime: number,
): AttentionQueueCompactModel {
  return {
    avatar: {
      name: request.counterpart.name,
      shape: "circle",
      src: request.counterpart.avatar,
    },
    badgeIcon: UserPlus,
    batchable: true,
    contextLabel: getQueueMomentLabel(request.createdAt, "Sent"),
    icon: UserPlus,
    iconTone: "teal",
    key: `request:${request.requesterId}`,
    subtitle: "Connection request",
    title: request.counterpart.name,
    urgency: getRequestUrgency(request, currentTime),
  };
}

function getParticipationCompactModel(
  group: AttentionQueueParticipation,
  currentTime: number,
): AttentionQueueCompactModel {
  const plan = group.pendingParticipationPlan;

  return {
    batchable: false,
    contextLabel: plan.responseDeadline
      ? getQueueMomentLabel(plan.responseDeadline, "Answer by")
      : getQueueMomentLabel(plan.completedAt, "Completed"),
    icon: CalendarCheck2,
    iconTone: "teal",
    key: `participation:${plan.id}`,
    subtitle: "Private participation check-in",
    title: `Did you take part in ${plan.title}?`,
    urgency: getParticipationUrgency(group, currentTime),
  };
}

function getContinuationCompactModel(
  group: AttentionQueueContinuation,
  currentTime: number,
): AttentionQueueCompactModel {
  return {
    batchable: false,
    contextLabel: getQueueMomentLabel(
      group.continuationCheckIn.responseWindowEndsAt,
      "Answer by",
    ),
    icon: MessageCircleQuestion,
    iconTone: "teal",
    key: `continuation:${group.continuationCheckIn.id}`,
    subtitle: "Private group check-in",
    title: `Still in touch with ${group.name}?`,
    urgency: getContinuationUrgency(group, currentTime),
  };
}

function getPlanCompactModel(
  group: AttentionQueuePlan,
  currentTime: number,
): AttentionQueueCompactModel {
  const model = getPlanAttentionModel(group);

  return {
    batchable: false,
    contextLabel: group.plan.dateTime
      ? getQueueMomentLabel(group.plan.dateTime, "Happening")
      : "Details needed",
    icon: ClipboardCheck,
    iconTone: "amber",
    key: `plan:${group.plan.id}`,
    subtitle: model.description,
    title: group.plan.title,
    urgency: getPlanUrgency(group, currentTime),
  };
}

function getInvitationUrgency(
  invite: AttentionQueueInvitation,
  currentTime: number,
) {
  if (invite.type === "JOIN_REQUEST" || !invite.expiresAt) {
    return "now" as const;
  }

  return getFutureDateUrgency(invite.expiresAt, currentTime);
}

function getRequestUrgency(
  request: AttentionQueueFriendRequest,
  currentTime: number,
) {
  const ageInDays =
    (currentTime - Date.parse(request.createdAt)) / MILLISECONDS_PER_DAY;

  if (!Number.isFinite(ageInDays) || ageInDays <= NOW_WINDOW_DAYS) {
    return "now" as const;
  }

  return ageInDays <= SOON_WINDOW_DAYS ? ("soon" as const) : ("later" as const);
}

function getParticipationUrgency(
  group: AttentionQueueParticipation,
  currentTime: number,
) {
  const deadline =
    group.pendingParticipationPlan.responseDeadline ??
    group.pendingParticipationPlan.completedAt;

  return getFutureDateUrgency(deadline, currentTime);
}

function getContinuationUrgency(
  group: AttentionQueueContinuation,
  currentTime: number,
) {
  return getFutureDateUrgency(
    group.continuationCheckIn.responseWindowEndsAt,
    currentTime,
  );
}

function getPlanUrgency(group: AttentionQueuePlan, currentTime: number) {
  if (!group.plan.dateTime) {
    return "soon" as const;
  }

  return getFutureDateUrgency(group.plan.dateTime, currentTime);
}

function getFutureDateUrgency(value: string, currentTime: number) {
  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return "soon" as const;
  }

  const remainingDays = (timestamp - currentTime) / MILLISECONDS_PER_DAY;

  if (remainingDays <= NOW_WINDOW_DAYS) {
    return "now" as const;
  }

  return remainingDays <= SOON_WINDOW_DAYS
    ? ("soon" as const)
    : ("later" as const);
}

function getInviteBadgeIcon(
  type: AttentionQueueInvitation["type"],
): LucideIcon {
  if (type === "ALGORITHM_MATCH") {
    return UsersRound;
  }

  if (type === "FRIEND_INVITE") {
    return Handshake;
  }

  return type === "JOIN_REQUEST" ? UserRoundPlus : CheckCircle2;
}
