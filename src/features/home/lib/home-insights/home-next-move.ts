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
  buildInvitationNextMove,
  buildProposedPlanNextMove,
  buildTodayOrPastPlanNextMove,
  buildNextDatedPlanNextMove,
  buildDraftPlanNextMove,
  buildRecommendationNextMove,
  buildFirstForgeNextMove,
];

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
