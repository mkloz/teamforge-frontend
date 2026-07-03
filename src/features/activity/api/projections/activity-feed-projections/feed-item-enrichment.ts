import type {
  ActivityFeedStateMeta,
  FeedItemGroup,
  GroupFeedItem,
} from "@/features/activity/api/projections/activity-feed-projections/types";
import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import { getActivityConversationKey } from "@/features/activity/lib/activity-conversation-key";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import type { PlanProposal } from "@/shared/schemas";

export function enrichFeedItems(
  items: UnifiedConversation[],
  meta: ActivityFeedStateMeta,
  currentUserId: string,
): UnifiedConversation[] {
  const savedByConversation = groupSavedMessagesByConversation(
    meta.savedMessagesById,
  );

  return items.map((item) =>
    enrichFeedItem(item, meta, savedByConversation, currentUserId),
  );
}

function enrichFeedItem(
  item: UnifiedConversation,
  meta: ActivityFeedStateMeta,
  savedByConversation: Map<string, SavedMessageSnapshot[]>,
  currentUserId: string,
): UnifiedConversation {
  const key = getActivityConversationKey(item.kind, item.id);
  const savedMessages = savedByConversation.get(key) ?? [];
  const planProposals = getFeedItemPlanProposals(item, meta);

  return {
    ...item,
    activeProposalCount: getFeedItemActiveProposalCount(
      item,
      planProposals,
      currentUserId,
    ),
    group: getEnrichedFeedItemGroup(item, planProposals),
    isPinned: meta.pinnedConversationKeys.includes(key),
    savedMessageCount: savedMessages.length,
    latestSavedMessage: savedMessages[0]?.message,
  };
}

function getFeedItemPlanProposals(
  item: UnifiedConversation,
  meta: ActivityFeedStateMeta,
) {
  if (!isGroupFeedItem(item)) {
    return undefined;
  }

  return getGroupFeedItemPlanProposals(item, meta);
}

function isGroupFeedItem(item: UnifiedConversation): item is GroupFeedItem {
  return item.kind === "group";
}

function getGroupFeedItemPlanProposals(
  item: GroupFeedItem,
  meta: ActivityFeedStateMeta,
) {
  const proposalOverride = getPlanProposalOverride(item.id, meta);

  if (hasPlanProposalOverride(proposalOverride)) {
    return proposalOverride;
  }

  return getExistingGroupPlanProposals(item);
}

function getPlanProposalOverride(groupId: string, meta: ActivityFeedStateMeta) {
  return meta.planProposalsByGroupId?.[groupId];
}

function hasPlanProposalOverride(
  planProposals: PlanProposal[] | null | undefined,
): planProposals is PlanProposal[] {
  return planProposals !== undefined && planProposals !== null;
}

function getExistingGroupPlanProposals(item: GroupFeedItem) {
  return item.group?.plan?.proposals;
}

function getFeedItemActiveProposalCount(
  item: UnifiedConversation,
  planProposals: PlanProposal[] | undefined,
  currentUserId: string,
) {
  if (item.kind !== "group" || !planProposals) {
    return undefined;
  }

  return countPendingUnvotedProposals(planProposals, currentUserId);
}

function getEnrichedFeedItemGroup(
  item: UnifiedConversation,
  planProposals: PlanProposal[] | undefined,
) {
  if (!isGroupFeedItem(item)) {
    return item.group;
  }

  return getGroupWithEnrichedPlan(item.group, planProposals);
}

function getGroupWithEnrichedPlan(
  group: FeedItemGroup,
  planProposals: PlanProposal[] | undefined,
) {
  if (!group) {
    return group;
  }

  const { plan } = group;

  if (!plan) {
    return group;
  }

  return {
    ...group,
    plan: {
      ...plan,
      proposals: getPlanProposalsWithFallback(planProposals, plan.proposals),
    },
  };
}

function getPlanProposalsWithFallback(
  planProposals: PlanProposal[] | undefined,
  fallback: PlanProposal[] | undefined,
) {
  return planProposals ?? fallback;
}

function countPendingUnvotedProposals(
  proposals: PlanProposal[],
  currentUserId: string,
) {
  return proposals.filter(
    (proposal) =>
      proposal.status === "PENDING" &&
      !proposal.votes.some((vote) => vote.userId === currentUserId),
  ).length;
}

function groupSavedMessagesByConversation(
  savedMessagesById: Record<string, SavedMessageSnapshot>,
) {
  const grouped = new Map<string, SavedMessageSnapshot[]>();

  for (const snapshot of Object.values(savedMessagesById)) {
    const key = getActivityConversationKey(
      snapshot.conversationKind,
      snapshot.conversationId,
    );
    const current = grouped.get(key) ?? [];

    grouped.set(key, [...current, snapshot]);
  }

  for (const [key, snapshots] of grouped) {
    grouped.set(
      key,
      [...snapshots].sort(
        (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
      ),
    );
  }

  return grouped;
}
