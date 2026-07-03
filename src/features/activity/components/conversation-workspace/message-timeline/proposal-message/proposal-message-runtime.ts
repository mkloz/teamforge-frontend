import { getProposalMessageViewState } from "@/features/activity/components/conversation-workspace/message-timeline/proposal-message/proposal-message-view-model";
import { useActivityMessageActions } from "@/features/activity/hooks/use-activity-message-actions";
import { useMessageLayout } from "@/features/activity/hooks/use-message-layout";
import { usePlanProposalActions } from "@/features/activity/hooks/use-plan-proposal-actions";
import { useSavedMessageIds } from "@/features/activity/hooks/use-saved-message-ids";
import { useSwipeToReply } from "@/features/activity/hooks/use-swipe-to-reply";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";

type ProposalMessageLayoutState = ReturnType<typeof useMessageLayout>;

export interface ProposalMessageRuntimeState {
  isReadByOthers: ProposalMessageLayoutState["isReadByOthers"];
  messageActions: ReturnType<typeof useActivityMessageActions>;
  proposalActions: ReturnType<typeof usePlanProposalActions>;
  reactionGroups: ProposalMessageLayoutState["reactionGroups"];
  savedMessageIds: ReturnType<typeof useSavedMessageIds>;
  swipeState: ReturnType<typeof useSwipeToReply>;
  viewState: ReturnType<typeof getProposalMessageViewState>;
}

export interface AvailableProposalMessageRuntimeState
  extends ProposalMessageRuntimeState {
  viewState: NonNullable<ReturnType<typeof getProposalMessageViewState>>;
}

export function useProposalMessageRuntime(
  message: UnifiedMessage,
): ProposalMessageRuntimeState {
  const { data: currentUser } = useCurrentUserQuery();
  const viewState = getProposalMessageViewState(message, currentUser?.id);
  const { reactionGroups, isReadByOthers } = useMessageLayout({
    message,
    isOwn: message.isOwn,
  });
  const swipeState = useSwipeToReply(message, message.isOwn);
  const messageActions = useActivityMessageActions();
  const savedMessageIds = useSavedMessageIds();
  const proposalActions = usePlanProposalActions({
    mutationKeyScope: `message-${viewState?.proposal.id ?? "missing"}`,
  });

  return {
    isReadByOthers,
    messageActions,
    proposalActions,
    reactionGroups,
    savedMessageIds,
    swipeState,
    viewState,
  };
}

export function hasProposalMessageViewState(
  runtime: ProposalMessageRuntimeState,
): runtime is AvailableProposalMessageRuntimeState {
  return Boolean(runtime.viewState);
}
