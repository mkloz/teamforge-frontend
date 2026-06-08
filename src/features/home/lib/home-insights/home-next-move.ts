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

export function buildHomeNextMove({
  viewer,
  stats,
  invitations,
  plans,
  groups,
  recommendations,
}: BuildHomeNextMoveInput): HomeNextMove {
  if (viewer.nextStep) {
    const copy = getProfileMoveCopy(viewer.nextStep, stats.profileCompleteness);

    return {
      kind: "profile",
      ...copy,
      nextStep: viewer.nextStep,
    };
  }

  const pendingInvite = getPendingInvite(invitations);

  if (pendingInvite) {
    return buildInvitationMove(pendingInvite);
  }

  const proposedPlan = sortPlansByUrgency(
    plans.filter((group) => group.plan.status === "PROPOSED"),
  )[0];

  if (proposedPlan) {
    return buildProposedPlanMove(proposedPlan);
  }

  const todayOrPastPlan = sortPlansByUrgency(
    plans.filter((group) => {
      const meta = getDateMeta(group.plan.dateTime);

      return (
        meta !== null &&
        (meta.isPast || meta.isToday) &&
        group.plan.status !== "DRAFT"
      );
    }),
  )[0];

  if (todayOrPastPlan) {
    return buildTodayOrPastPlanMove(todayOrPastPlan);
  }

  const nextDatedPlan = sortPlansByUrgency(
    plans.filter((group) => {
      const meta = getDateMeta(group.plan.dateTime);

      return meta !== null && !meta.isPast && !meta.isToday;
    }),
  )[0];

  if (nextDatedPlan) {
    return buildNextDatedPlanMove(nextDatedPlan);
  }

  const draftPlan = [...plans]
    .filter((group) => group.plan.status === "DRAFT")
    .sort(
      (left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt),
    )[0];

  if (draftPlan) {
    return buildDraftPlanMove(draftPlan);
  }

  const bestRecommendation = recommendations[0];

  if (bestRecommendation) {
    return buildRecommendationMove(bestRecommendation);
  }

  if (groups.length === 0) {
    return buildFirstForgeMove();
  }

  return buildReturnForgeMove(groups.length);
}

function getPendingInvite(invitations: Invite[]) {
  return [...invitations]
    .filter((invite) => invite.status === "PENDING")
    .sort((left, right) => {
      const leftExpiry = left.expiresAt
        ? Date.parse(left.expiresAt)
        : Number.MAX_SAFE_INTEGER;
      const rightExpiry = right.expiresAt
        ? Date.parse(right.expiresAt)
        : Number.MAX_SAFE_INTEGER;

      if (leftExpiry !== rightExpiry) {
        return leftExpiry - rightExpiry;
      }

      return Date.parse(right.createdAt) - Date.parse(left.createdAt);
    })[0];
}
