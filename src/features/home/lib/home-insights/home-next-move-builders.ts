import type { PlannedGroup } from "@/features/home/lib/home-contract";
import type { ExploreGroup, Invite } from "@/shared/schemas";

import type { HomeNextMove } from "./home-next-move.types";
import { getDateMeta, getHeroPlanSignal } from "./plan-timing";
import {
  getRecommendationFitLine,
  normalizeScore,
} from "./recommendation-insights";

type PlanDateMeta = NonNullable<ReturnType<typeof getDateMeta>>;
type InviteTimingFlag = Extract<
  keyof PlanDateMeta,
  "isPast" | "isToday" | "isTomorrow"
>;

const INVITE_TIMING_SIGNALS: Array<{
  flag: InviteTimingFlag;
  label: string;
}> = [
  {
    flag: "isPast",
    label: "Invite expiring",
  },
  {
    flag: "isToday",
    label: "Expires today",
  },
  {
    flag: "isTomorrow",
    label: "Expires tomorrow",
  },
];

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
  const copy = getPlanningMoveCopy(group.plan.nextRequiredAction);

  return {
    kind: "plan",
    eyebrow: copy.eyebrow,
    title: group.plan.title,
    body: copy.body,
    primaryLabel: copy.primaryLabel,
    secondaryLabel: "Open activity",
    signal: getHeroPlanSignal(group.plan),
    groupId: group.id,
    planId: group.plan.id,
  };
}

function getPlanningMoveCopy(
  action: PlannedGroup["plan"]["nextRequiredAction"],
) {
  if (action === null) {
    return {
      eyebrow: "Settle the plan",
      body: "A decision is open for this plan. Pick a direction so the group can move from discussion to action.",
      primaryLabel: "Open plan",
    };
  }

  const copyByAction = {
    PROPOSE_LOCATION: {
      eyebrow: "Choose the place",
      body: "The group has a time. Propose a place for everyone to consider.",
      primaryLabel: "Propose a place",
    },
    PROPOSE_TIME: {
      eyebrow: "Choose the time",
      body: "Your group is ready to plan. Propose a time for everyone to consider.",
      primaryLabel: "Propose a time",
    },
    VOTE_LOCATION: {
      eyebrow: "Place to decide",
      body: "A place is waiting for your vote.",
      primaryLabel: "Vote on the place",
    },
    VOTE_TIME: {
      eyebrow: "Time to decide",
      body: "A time is waiting for your vote.",
      primaryLabel: "Vote on the time",
    },
  } as const;

  if (action !== "READY") {
    return copyByAction[action];
  }

  return {
    eyebrow: "Review the plan",
    body: "The time and place are agreed. Review the plan before you go.",
    primaryLabel: "Open plan",
  };
}

export function buildTodayOrPastPlanMove(group: PlannedGroup): HomeNextMove {
  return {
    kind: "plan",
    eyebrow: "Check the plan",
    title: group.plan.title,
    body: "This plan is close enough to need attention. Open it and make sure the details still hold.",
    primaryLabel: "Open plan",
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
    body: "This is next on your calendar. Check the plan now if the details still feel loose.",
    primaryLabel: "Open plan",
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
    body: "This plan still needs a clearer shape before people can commit.",
    primaryLabel: "Open plan",
    secondaryLabel: "Open activity",
    signal: "Draft plan",
    groupId: group.id,
    planId: group.plan.id,
  };
}

export function buildRecommendationMove(group: ExploreGroup): HomeNextMove {
  const fitScore = normalizeScore(group.compatibility.total);

  return {
    kind: "recommendation",
    eyebrow: getRecommendationEyebrow(fitScore),
    title: getRecommendationTitle(group),
    body: `${getRecommendationFitLine(group)} Review the plan and members before joining.`,
    primaryLabel: "See group",
    secondaryLabel: "Forge instead",
    signal: "Recommended group",
    groupId: group.id,
  };
}

function getRecommendationEyebrow(fitScore: number) {
  return fitScore >= 75 ? "Nearby group" : "Group to review";
}

function getRecommendationTitle(group: ExploreGroup) {
  return (
    [group.plan?.title, group.activity.title, group.name].find(Boolean) ??
    group.name
  );
}

export function buildFirstForgeMove(): HomeNextMove {
  return {
    kind: "forge",
    eyebrow: "First move",
    title: "Start a group around an activity you want to do",
    body: "Choose the activity and add the plan details. TeamForge will form a group around them.",
    primaryLabel: "Forge my group",
    secondaryLabel: "Browse first",
    signal: "Ready when you are",
  };
}

export function buildReturnForgeMove(activeGroupCount: number): HomeNextMove {
  return {
    kind: "forge",
    eyebrow: "Start something new",
    title: "Start another group for a new plan",
    body: "Your profile is ready. Choose the activity and plan details, and TeamForge will form the group.",
    primaryLabel: "Forge my group",
    secondaryLabel: "Browse groups",
    signal: `${activeGroupCount} active spaces`,
  };
}

function getInviteSignal(invite: Invite) {
  const expiry = getDateMeta(invite.expiresAt);
  const timingSignal = getInviteTimingSignal(expiry);

  return timingSignal ?? `${invite.group.activeMembersCount} people inside`;
}

function getInviteTimingSignal(expiry: PlanDateMeta | null) {
  if (!expiry) {
    return null;
  }

  return (
    INVITE_TIMING_SIGNALS.find((signal) => expiry[signal.flag])?.label ?? null
  );
}
