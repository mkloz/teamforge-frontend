import type { ActivityGroupSelectionData } from "@/features/activity/api/activity-query-data";
import type { ActivityRealtimeContext } from "@/features/activity/api/realtime/activity-realtime-types";
import type { Group, Plan } from "@/features/activity/lib/activity-contract";
import { appQueryClient } from "@/shared/api/query-client";
import { invalidatePlanDecisionSurfaces } from "@/shared/api/query-invalidation";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { PlanProposal, PlanUpdateKind, User } from "@/shared/schemas";

interface RealtimePlanUpdateInput {
  context: ActivityRealtimeContext;
  currentUser: User | undefined;
  current: ActivityGroupSelectionData | undefined;
  kind: PlanUpdateKind;
  plan: Plan;
  proposal: PlanProposal | null;
}

interface NextRealtimePlanState {
  chatId: string | null;
  nextGroup: Group;
  nextProposals: PlanProposal[];
}

export async function handleRealtimePlanUpdated(groupId: string) {
  await invalidatePlanDecisionSurfaces({ groupId });
}

export function applyRealtimePlanUpdate(
  context: ActivityRealtimeContext,
  groupId: string,
  plan: Plan,
  proposal: PlanProposal | null,
  kind: PlanUpdateKind,
) {
  const currentUser = appQueryClient.getQueryData<User>(
    APP_QUERY_KEYS.auth.currentUser,
  );

  if (proposal) {
    writeRealtimeProposalList(context, proposal, kind);
  }

  appQueryClient.setQueryData<ActivityGroupSelectionData | undefined>(
    APP_QUERY_KEYS.activity.groupSelectionById(groupId),
    (current) =>
      updateGroupSelectionForRealtimePlan({
        context,
        current,
        currentUser,
        kind,
        plan,
        proposal,
      }),
  );

  void invalidatePlanDecisionSurfaces({
    groupId,
    planId: plan.id,
  });
}

function writeRealtimeProposalList(
  context: ActivityRealtimeContext,
  proposal: PlanProposal,
  kind: PlanUpdateKind,
) {
  appQueryClient.setQueryData<PlanProposal[]>(
    APP_QUERY_KEYS.activity.planProposals(proposal.planId),
    (current) => context.mergeProposalIntoList(current ?? [], proposal, kind),
  );
}

function updateGroupSelectionForRealtimePlan({
  context,
  current,
  currentUser,
  kind,
  plan,
  proposal,
}: RealtimePlanUpdateInput): ActivityGroupSelectionData | undefined {
  const currentGroup = current?.group;
  const currentPlan = currentGroup?.plan;

  if (!currentGroup || !currentPlan) {
    return current;
  }

  const nextState = buildNextRealtimePlanState({
    context,
    current,
    currentGroup,
    currentPlan,
    kind,
    plan,
    proposal,
  });

  if (!currentUser) {
    return {
      ...current,
      group: nextState.nextGroup,
    };
  }

  return {
    ...current,
    group: nextState.nextGroup,
    proposalMessages: buildRealtimeProposalMessages({
      context,
      currentProposalMessages: current.proposalMessages,
      currentUser,
      nextState,
    }),
  };
}

function buildNextRealtimePlanState({
  context,
  current,
  currentGroup,
  currentPlan,
  kind,
  plan,
  proposal,
}: Omit<RealtimePlanUpdateInput, "current" | "currentUser"> & {
  current: ActivityGroupSelectionData;
  currentGroup: Group;
  currentPlan: Plan;
}): NextRealtimePlanState {
  const nextProposals = getNextRealtimePlanProposals({
    context,
    currentPlan,
    kind,
    proposal,
  });
  const nextPlan = {
    ...getNewestRealtimePlanBase(context, currentPlan, plan),
    proposals: nextProposals,
  };

  return {
    chatId: current.chatId,
    nextGroup: {
      ...currentGroup,
      plan: nextPlan,
    },
    nextProposals,
  };
}

function getNextRealtimePlanProposals({
  context,
  currentPlan,
  kind,
  proposal,
}: {
  context: ActivityRealtimeContext;
  currentPlan: Plan;
  kind: PlanUpdateKind;
  proposal: PlanProposal | null;
}) {
  const currentProposals = currentPlan.proposals ?? [];

  return proposal
    ? context.mergeProposalIntoList(currentProposals, proposal, kind)
    : currentProposals;
}

function getNewestRealtimePlanBase(
  context: ActivityRealtimeContext,
  currentPlan: Plan,
  plan: Plan,
) {
  return context.getPlanVersion(plan) >= context.getPlanVersion(currentPlan)
    ? {
        ...currentPlan,
        ...plan,
      }
    : currentPlan;
}

function buildRealtimeProposalMessages({
  context,
  currentProposalMessages,
  currentUser,
  nextState,
}: {
  context: ActivityRealtimeContext;
  currentProposalMessages: ActivityGroupSelectionData["proposalMessages"];
  currentUser: User;
  nextState: NextRealtimePlanState;
}) {
  const chatId = nextState.chatId;

  if (!chatId) {
    return currentProposalMessages;
  }

  const participants = context.buildGroupParticipants(
    nextState.nextGroup,
    context.mapCurrentUserParticipant(currentUser),
  );

  return nextState.nextProposals.map((item) =>
    context.buildProposalMessage(item, chatId, currentUser.id, participants),
  );
}
