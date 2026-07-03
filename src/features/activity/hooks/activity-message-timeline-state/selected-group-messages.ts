import { activityQueries } from "@/features/activity/api/activity-queries";
import { reconcileProposalMessagesWithChatMessages } from "@/features/activity/hooks/activity-message-timeline-state/proposal-message-reconciliation";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

export function buildSelectedGroupMessages(
  flattenedMessages: UnifiedMessage[],
  proposalMessages: UnifiedMessage[],
) {
  const reconciledTimeline = reconcileProposalMessagesWithChatMessages(
    flattenedMessages,
    proposalMessages,
  );

  return activityQueries.buildConversationTimeline(
    reconciledTimeline.messages,
    reconciledTimeline.proposalMessages,
  );
}
