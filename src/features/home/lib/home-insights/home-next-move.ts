import type { AutoForgeRequest } from "@/features/forge/public/auto-forge-request";
import type {
  HomeViewer,
  PlannedGroup,
  UserStats,
} from "@/features/home/lib/home-contract";
import type { HomeGroup } from "@/features/home/schemas/home-group.schema";
import type { ExploreGroup, Invite } from "@/shared/schemas";
import type { HomeNextMove } from "./home-next-move.types";
import {
  buildDraftPlanMove,
  buildFirstForgeMove,
  buildInvitationMove,
  buildNextDatedPlanMove,
  buildProposedPlanMove,
  buildRecommendationMove,
  buildReturnForgeMove,
  buildTodayOrPastPlanMove,
} from "./home-next-move-builders";
import { getDateMeta, sortPlansByUrgency } from "./plan-timing";
import { getProfileMoveCopy } from "./profile-move-copy";

interface BuildHomeNextMoveInput {
  autoForgeRequest: AutoForgeRequest | null;
  autoForgeRequestUnavailable: boolean;
  viewer: HomeViewer;
  stats: UserStats;
  invitations: Invite[];
  plans: PlannedGroup[];
  groups: HomeGroup[];
  recommendations: ExploreGroup[];
}

type HomeNextMoveCandidateBuilder = (
  input: BuildHomeNextMoveInput,
) => HomeNextMove | null;

const HOME_NEXT_MOVE_CANDIDATES: HomeNextMoveCandidateBuilder[] = [
  buildProfileNextMove,
  buildAutoForgeRequestUnavailableMove,
  buildAutoForgeRequestNextMove,
  buildInvitationNextMove,
  buildProposedPlanNextMove,
  buildTodayOrPastPlanNextMove,
  buildNextDatedPlanNextMove,
  buildDraftPlanNextMove,
  buildRecommendationNextMove,
  buildFirstForgeNextMove,
];

function buildAutoForgeRequestUnavailableMove({
  autoForgeRequest,
  autoForgeRequestUnavailable,
}: BuildHomeNextMoveInput): HomeNextMove | null {
  if (!autoForgeRequestUnavailable || autoForgeRequest) return null;

  return {
    kind: "auto-request-unavailable",
    eyebrow: "Request status unavailable",
    title: "Refresh before starting something new",
    body: "TeamForge could not confirm whether you already have an active request. Use the status card below to try again before making another one.",
    primaryLabel: "Check request status",
    secondaryLabel: "Browse groups",
    signal: "Status unknown",
  };
}

function buildAutoForgeRequestNextMove({
  autoForgeRequest,
}: BuildHomeNextMoveInput): HomeNextMove | null {
  if (!autoForgeRequest) return null;

  const copy = getAutoForgeRequestMoveCopy(autoForgeRequest);

  return {
    kind: "auto-request",
    request: autoForgeRequest,
    ...copy,
  };
}

function getAutoForgeRequestMoveCopy(request: AutoForgeRequest) {
  if (request.lifecycle === "DRAFT") {
    return {
      eyebrow: "Request saved as a draft",
      title: `Review ${request.activity.title}`,
      body: "Check the scope and plan details before starting the search.",
      primaryLabel: "Review request",
      secondaryLabel: "Request controls",
      signal: "Not searching yet",
      startsNewRequest: false,
    };
  }

  if (request.lifecycle === "SEARCHING") {
    return {
      eyebrow: "Search in progress",
      title: request.activity.title,
      body: "Your request is active. TeamForge will check it again automatically; you can still adjust or pause it.",
      primaryLabel: "Edit request",
      secondaryLabel: "Request controls",
      signal: "Searching",
      startsNewRequest: false,
    };
  }

  if (request.lifecycle === "PAUSED") {
    const canEdit = request.pauseReason === "USER";
    const automaticRetryFailed =
      request.pauseReason === "AUTOMATIC_RETRY_FAILURE";
    return {
      eyebrow: "Search paused",
      title: request.activity.title,
      body: canEdit
        ? "You paused this request. Adjust it or resume when you are ready."
        : automaticRetryFailed
          ? "We hit repeated errors while checking this request, so we paused it. Open the status to try again."
          : "This request is paused while another TeamForge action is resolved.",
      primaryLabel: canEdit ? "Edit request" : "View status",
      secondaryLabel: "Request controls",
      signal: "Paused",
      startsNewRequest: false,
    };
  }

  if (request.lifecycle === "EXPIRED") {
    return {
      eyebrow: "Request expired",
      title: request.activity.title,
      body: "This request is no longer searching. Start a new one when the plan still works for you.",
      primaryLabel: "Start a new request",
      secondaryLabel: "Request details",
      signal: "Search ended",
      startsNewRequest: true,
    };
  }

  return {
    eyebrow: "Request status",
    title: request.activity.title,
    body: "This request has moved beyond editing. Open its status for the latest available details.",
    primaryLabel: "View status",
    secondaryLabel: "Browse groups",
    signal: "Status changed",
    startsNewRequest: false,
  };
}

export function buildHomeNextMove(input: BuildHomeNextMoveInput): HomeNextMove {
  for (const buildCandidate of HOME_NEXT_MOVE_CANDIDATES) {
    const candidate = buildCandidate(input);

    if (candidate) {
      return candidate;
    }
  }

  return buildReturnForgeMove(input.groups.length);
}

function buildProfileNextMove({
  viewer,
  stats,
}: BuildHomeNextMoveInput): HomeNextMove | null {
  if (viewer.nextStep) {
    const copy = getProfileMoveCopy(viewer.nextStep, stats.profileCompleteness);

    return {
      kind: "profile",
      ...copy,
      nextStep: viewer.nextStep,
    };
  }

  return null;
}

function buildInvitationNextMove({
  invitations,
}: BuildHomeNextMoveInput): HomeNextMove | null {
  const pendingInvite = getPendingInvite(invitations);

  if (pendingInvite) {
    return buildInvitationMove(pendingInvite);
  }

  return null;
}

function buildProposedPlanNextMove({
  plans,
}: BuildHomeNextMoveInput): HomeNextMove | null {
  const proposedPlan = getFirstProposedPlan(plans);

  if (proposedPlan) {
    return buildProposedPlanMove(proposedPlan);
  }

  return null;
}

function buildTodayOrPastPlanNextMove({
  plans,
}: BuildHomeNextMoveInput): HomeNextMove | null {
  const todayOrPastPlan = getFirstTodayOrPastPlan(plans);

  if (todayOrPastPlan) {
    return buildTodayOrPastPlanMove(todayOrPastPlan);
  }

  return null;
}

function buildNextDatedPlanNextMove({
  plans,
}: BuildHomeNextMoveInput): HomeNextMove | null {
  const nextDatedPlan = getFirstNextDatedPlan(plans);

  if (nextDatedPlan) {
    return buildNextDatedPlanMove(nextDatedPlan);
  }

  return null;
}

function buildDraftPlanNextMove({
  plans,
}: BuildHomeNextMoveInput): HomeNextMove | null {
  const draftPlan = getMostRecentlyUpdatedDraftPlan(plans);

  if (draftPlan) {
    return buildDraftPlanMove(draftPlan);
  }

  return null;
}

function buildRecommendationNextMove({
  recommendations,
}: BuildHomeNextMoveInput): HomeNextMove | null {
  const bestRecommendation = recommendations[0];

  if (bestRecommendation) {
    return buildRecommendationMove(bestRecommendation);
  }

  return null;
}

function buildFirstForgeNextMove({
  groups,
}: BuildHomeNextMoveInput): HomeNextMove | null {
  if (groups.length === 0) {
    return buildFirstForgeMove();
  }

  return null;
}

function getPendingInvite(invitations: Invite[]) {
  return [...invitations]
    .filter(isPendingInvite)
    .sort(comparePendingInvites)[0];
}

function isPendingInvite(invite: Invite) {
  return invite.status === "PENDING";
}

function comparePendingInvites(left: Invite, right: Invite) {
  const leftExpiry = getInviteExpiryTimestamp(left);
  const rightExpiry = getInviteExpiryTimestamp(right);

  if (leftExpiry !== rightExpiry) {
    return leftExpiry - rightExpiry;
  }

  return Date.parse(right.createdAt) - Date.parse(left.createdAt);
}

function getInviteExpiryTimestamp(invite: Invite) {
  return invite.expiresAt
    ? Date.parse(invite.expiresAt)
    : Number.MAX_SAFE_INTEGER;
}

function getFirstProposedPlan(plans: PlannedGroup[]) {
  return sortPlansByUrgency(plans.filter(isProposedPlan))[0];
}

function isProposedPlan(group: PlannedGroup) {
  return group.plan.status === "PROPOSED";
}

function getFirstTodayOrPastPlan(plans: PlannedGroup[]) {
  return sortPlansByUrgency(plans.filter(isTodayOrPastActionablePlan))[0];
}

function isTodayOrPastActionablePlan(group: PlannedGroup) {
  const meta = getDateMeta(group.plan.dateTime);

  return (
    meta !== null &&
    (meta.isPast || meta.isToday) &&
    group.plan.status !== "DRAFT"
  );
}

function getFirstNextDatedPlan(plans: PlannedGroup[]) {
  return sortPlansByUrgency(plans.filter(isFutureDatedPlan))[0];
}

function isFutureDatedPlan(group: PlannedGroup) {
  const meta = getDateMeta(group.plan.dateTime);

  return meta !== null && !meta.isPast && !meta.isToday;
}

function getMostRecentlyUpdatedDraftPlan(plans: PlannedGroup[]) {
  return [...plans].filter(isDraftPlan).sort(compareRecentlyUpdatedPlans)[0];
}

function isDraftPlan(group: PlannedGroup) {
  return group.plan.status === "DRAFT";
}

function compareRecentlyUpdatedPlans(left: PlannedGroup, right: PlannedGroup) {
  return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
}
