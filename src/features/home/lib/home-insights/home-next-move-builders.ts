import type { PlannedGroup } from "@/features/home/lib/home-contract";
import type { ExploreGroup, Invite } from "@/shared/schemas";

import type { HomeNextMove } from "./home-next-move.types";
import { getDateMeta, getHeroPlanSignal } from "./plan-timing";
import {
  getRecommendationFitLine,
  normalizeScore,
} from "./recommendation-insights";

export function buildInvitationMove(invite: Invite): HomeNextMove {
  const inviterName = invite.inviter?.name ?? "Someone";

  return {
    kind: "invitation",
    eyebrow: "Waiting on you",
    title: `${invite.group.name} invited you in`,
    body: `${inviterName} thinks this group fits you. Review the room, then accept only if the plan feels right.`,
    primaryLabel: "Review invite",
    secondaryLabel: "Browse groups",
    signal: getInviteSignal(invite),
    inviteId: invite.id,
  };
}

export function buildProposedPlanMove(group: PlannedGroup): HomeNextMove {
  return {
    kind: "plan",
    eyebrow: "Settle the plan",
    title: group.plan.title,
    body: `${group.name} has a decision open. Pick a direction so the group can move from discussion to action.`,
    primaryLabel: "Open plan",
    secondaryLabel: "Open activity",
    signal: getHeroPlanSignal(group.plan),
    groupId: group.id,
    planId: group.plan.id,
  };
}

export function buildTodayOrPastPlanMove(group: PlannedGroup): HomeNextMove {
  return {
    kind: "plan",
    eyebrow: "Check the plan",
    title: group.plan.title,
    body: `${group.name} is close enough to need attention. Open the group and make sure the details still hold.`,
    primaryLabel: "Open group",
    secondaryLabel: "View all activity",
    signal: getHeroPlanSignal(group.plan),
    groupId: group.id,
    planId: group.plan.id,
  };
}

export function buildNextDatedPlanMove(group: PlannedGroup): HomeNextMove {
  return {
    kind: "plan",
    eyebrow: "Next up",
    title: group.plan.title,
    body: `${group.name} is next on your calendar. Check the thread now if the details still feel loose.`,
    primaryLabel: "Open group",
    secondaryLabel: "View all activity",
    signal: getHeroPlanSignal(group.plan),
    groupId: group.id,
    planId: group.plan.id,
  };
}

export function buildDraftPlanMove(group: PlannedGroup): HomeNextMove {
  return {
    kind: "plan",
    eyebrow: "Shape the plan",
    title: group.plan.title,
    body: `${group.name} has the room, but the plan still needs a clearer shape before people can commit.`,
    primaryLabel: "Open plan",
    secondaryLabel: "Open activity",
    signal: "Draft plan",
    groupId: group.id,
    planId: group.plan.id,
  };
}

export function buildRecommendationMove(group: ExploreGroup): HomeNextMove {
  const fitScore = normalizeScore(group.compatibility.total);
  const title = group.plan?.title || group.activity.title || group.name;

  return {
    kind: "recommendation",
    eyebrow: fitScore >= 75 ? "Strong fit nearby" : "Worth checking",
    title,
    body: `${getRecommendationFitLine(group)} Take a look before the room fills up.`,
    primaryLabel: "See group",
    secondaryLabel: "Forge instead",
    signal: `${fitScore}% fit`,
    groupId: group.id,
  };
}

export function buildFirstForgeMove(): HomeNextMove {
  return {
    kind: "forge",
    eyebrow: "First move",
    title: "Forge a group around something you would actually do",
    body: "Choose the activity and the shape of the plan. TeamForge will look for people who fit the room.",
    primaryLabel: "Forge my group",
    secondaryLabel: "Browse first",
    signal: "Ready when you are",
  };
}

export function buildReturnForgeMove(activeGroupCount: number): HomeNextMove {
  return {
    kind: "forge",
    eyebrow: "Start something new",
    title: "Start a new group when the current ones go quiet",
    body: "Your profile has enough signal to form something useful. Pick the plan; TeamForge can handle the room.",
    primaryLabel: "Forge my group",
    secondaryLabel: "Browse groups",
    signal: `${activeGroupCount} active spaces`,
  };
}

function getInviteSignal(invite: Invite) {
  const expiry = getDateMeta(invite.expiresAt);

  if (expiry?.isPast) {
    return "Invite expiring";
  }

  if (expiry?.isToday) {
    return "Expires today";
  }

  if (expiry?.isTomorrow) {
    return "Expires tomorrow";
  }

  return `${invite.group.activeMembersCount} people inside`;
}
