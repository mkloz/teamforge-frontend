import { type RefObject, useRef, useState } from "react";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import { HomeAttentionQueueRowsSkeleton } from "@/features/home/components/home-skeletons";
import type {
  HomeInvitationView,
  HomePanel,
} from "@/shared/navigation/home-navigation";

import { ActionErrorBanner } from "./action-error-banner";
import { AttentionQueueGroupedList } from "./attention-queue-grouped-list";
import { getAttentionQueueUrgencyCounts } from "./attention-queue-item-model";
import {
  type AttentionQueueRenderItem,
  getAttentionQueueRenderState,
} from "./attention-queue-render-state";
import { ContinuationQueueItem } from "./continuation-queue-item";
import { EmptyQueueItem } from "./empty-queue-item";
import { FriendRequestQueueItem } from "./friend-request-queue-item";
import { InvitationQueueItem } from "./invitation-queue-item";
import { ParticipationQueueItem } from "./participation-queue-item";
import { ProposedPlanQueueItem } from "./proposed-plan-queue-item";
import { useAttentionQueueFocus } from "./use-attention-queue-focus";
import { useAttentionQueueState } from "./use-attention-queue-state";

type AttentionQueueViewState = ReturnType<typeof useAttentionQueueState>;

interface LoadedAttentionQueueProps {
  maxVisibleItems?: number;
  focusedPanel?: HomePanel | null;
  focusedInviteId?: string | null;
  focusedRequestId?: string | null;
  invitationView?: HomeInvitationView;
  focusRef?: RefObject<HTMLElement | null>;
  onClearInvitationFocus?: () => void;
  onClearFriendRequestFocus?: () => void;
}

export function LoadedAttentionQueue({
  maxVisibleItems,
  focusedPanel = null,
  focusedInviteId = null,
  focusedRequestId = null,
  invitationView = "received",
  focusRef,
  onClearInvitationFocus,
  onClearFriendRequestFocus,
}: LoadedAttentionQueueProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollRef = focusRef ?? sectionRef;
  const state = useAttentionQueueState({
    focusedInviteId,
    focusedRequestId,
    onClearFriendRequestFocus,
    onClearInvitationFocus,
  });

  return (
    <AttentionQueueView
      focusedInviteId={focusedInviteId}
      maxVisibleItems={maxVisibleItems}
      focusedPanel={focusedPanel}
      focusedRequestId={focusedRequestId}
      invitationView={invitationView}
      onClearFriendRequestFocus={onClearFriendRequestFocus}
      onClearInvitationFocus={onClearInvitationFocus}
      scrollRef={scrollRef}
      state={state}
    />
  );
}

interface AttentionQueueViewProps
  extends Omit<LoadedAttentionQueueProps, "focusRef"> {
  scrollRef: RefObject<HTMLElement | null>;
  state: AttentionQueueViewState;
}

function AttentionQueueView({
  focusedInviteId = null,
  focusedPanel = null,
  focusedRequestId = null,
  invitationView = "received",
  maxVisibleItems,
  onClearFriendRequestFocus,
  onClearInvitationFocus,
  scrollRef,
  state,
}: AttentionQueueViewProps) {
  const [batchAction, setBatchAction] = useState<"accept" | "decline" | null>(
    null,
  );
  const {
    acceptingInviteId,
    acceptingRequestId,
    actionError,
    answerVisibleContinuation,
    answerVisibleParticipation,
    acceptVisibleInvite,
    acceptVisibleRequest,
    declineVisibleInvite,
    declineVisibleRequest,
    decliningInviteId,
    decliningRequestId,
    continuationCheckIns,
    continuationFeedbackByCheckInId,
    isAccepting,
    isAcceptingInvite,
    isDeclining,
    isDecliningInvite,
    isFriendRequestOnline,
    isContinuationActionOnline,
    isInviteActionOnline,
    isParticipationActionOnline,
    isAnsweringParticipation,
    pendingAnswer,
    pendingContinuationAnswers,
    pendingParticipations,
    proposedPlans,
    queueSize,
    shouldShowSkeleton,
    visibleInvitations,
    visibleRequests,
  } = state;
  const { queueItems, queueSummary, shouldShowEmptyQueue } =
    getAttentionQueueRenderState({
      continuationCheckIns,
      pendingParticipations,
      proposedPlans,
      queueSize,
      shouldShowSkeleton,
      visibleInvitations,
      visibleRequests,
      maxVisibleItems,
    });
  const queueSummaryDescription = getQueueSummaryDescription(queueSummary);
  const urgencyCounts = getAttentionQueueUrgencyCounts({
    continuationCheckIns,
    pendingParticipations,
    proposedPlans,
    visibleInvitations,
    visibleRequests,
  });
  const itemRenderContext: AttentionQueueItemRenderContext = {
    acceptingInviteId,
    acceptingRequestId,
    answerVisibleContinuation,
    answerVisibleParticipation,
    acceptVisibleInvite,
    acceptVisibleRequest,
    declineVisibleInvite,
    declineVisibleRequest,
    decliningInviteId,
    decliningRequestId,
    continuationFeedbackByCheckInId,
    focusedInviteId,
    focusedRequestId,
    isAccepting,
    isAcceptingInvite,
    isDeclining,
    isDecliningInvite,
    isFriendRequestOnline,
    isContinuationActionOnline,
    isInviteActionOnline,
    isParticipationActionOnline,
    isAnsweringParticipation,
    pendingAnswer,
    pendingContinuationAnswers,
  };
  const focusedItemKey = focusedInviteId
    ? `invitation:${focusedInviteId}`
    : focusedRequestId
      ? `request:${focusedRequestId}`
      : null;

  useAttentionQueueFocus({
    focusedInviteId,
    focusedPanel,
    focusedRequestId,
    invitationView,
    onClearFriendRequestFocus,
    onClearInvitationFocus,
    scrollRef,
    visibleInvitations,
    visibleRequests,
  });

  async function acceptBatchItems(
    items: Array<Exclude<AttentionQueueRenderItem, { kind: "see-rest" }>>,
  ) {
    setBatchAction("accept");

    try {
      const results = await Promise.allSettled(
        items.map((item) => {
          if (item.kind === "invitation") {
            return acceptVisibleInvite(item.invite.id);
          }

          if (item.kind === "request") {
            return acceptVisibleRequest(item.request.requesterId);
          }

          return Promise.resolve();
        }),
      );
      return results.every((result) => result.status === "fulfilled");
    } finally {
      setBatchAction(null);
    }
  }

  async function declineBatchItems(
    items: Array<Exclude<AttentionQueueRenderItem, { kind: "see-rest" }>>,
  ) {
    setBatchAction("decline");

    try {
      const results = await Promise.allSettled(
        items.map((item) => {
          if (item.kind === "invitation") {
            return declineVisibleInvite(item.invite.id);
          }

          if (item.kind === "request") {
            return declineVisibleRequest(item.request.requesterId);
          }

          return Promise.resolve();
        }),
      );
      return results.every((result) => result.status === "fulfilled");
    } finally {
      setBatchAction(null);
    }
  }

  return (
    <section
      ref={scrollRef}
      aria-labelledby="attention-queue-heading"
      id="home-attention"
      className="scroll-mt-6"
    >
      <HomeSectionHeading
        id="attention-queue-heading"
        title="Needs your attention"
        description={queueSummaryDescription}
      />

      {actionError ? (
        <ul className="mt-4 list-none p-0">
          <ActionErrorBanner error={actionError} />
        </ul>
      ) : null}

      {shouldShowSkeleton ? (
        <ul
          aria-label="Loading things that need attention"
          className="mt-4 grid min-w-0 list-none gap-2 p-0"
        >
          <HomeAttentionQueueRowsSkeleton limit={maxVisibleItems} />
        </ul>
      ) : null}

      {shouldShowEmptyQueue ? (
        <ul className="mt-4 list-none p-0">
          <EmptyQueueItem />
        </ul>
      ) : null}

      {!shouldShowSkeleton && !shouldShowEmptyQueue ? (
        <AttentionQueueGroupedList
          batchAcceptDisabled={
            batchAction !== null ||
            isAcceptingInvite ||
            isAccepting ||
            !isInviteActionOnline ||
            !isFriendRequestOnline
          }
          batchAcceptLoading={batchAction === "accept"}
          batchDeclineDisabled={
            batchAction !== null ||
            isDecliningInvite ||
            isDeclining ||
            !isInviteActionOnline ||
            !isFriendRequestOnline
          }
          batchDeclineLoading={batchAction === "decline"}
          focusedItemKey={focusedItemKey}
          items={queueItems}
          onBatchAccept={acceptBatchItems}
          onBatchDecline={declineBatchItems}
          urgencyCounts={urgencyCounts}
          renderDetail={(item) =>
            renderAttentionQueueItem(item, itemRenderContext)
          }
        />
      ) : null}
    </section>
  );
}

function getQueueSummaryDescription(queueSummary: string[]) {
  if (queueSummary.length === 0) {
    return undefined;
  }

  return queueSummary.join(" · ");
}

interface AttentionQueueItemRenderContext {
  acceptingInviteId: string | null;
  acceptingRequestId: string | null;
  answerVisibleContinuation: AttentionQueueViewState["answerVisibleContinuation"];
  answerVisibleParticipation: AttentionQueueViewState["answerVisibleParticipation"];
  acceptVisibleInvite: (inviteId: string) => Promise<void>;
  acceptVisibleRequest: (requesterId: string) => Promise<void>;
  declineVisibleInvite: (inviteId: string) => Promise<void>;
  declineVisibleRequest: (requesterId: string) => Promise<void>;
  decliningInviteId: string | null;
  decliningRequestId: string | null;
  continuationFeedbackByCheckInId: AttentionQueueViewState["continuationFeedbackByCheckInId"];
  focusedInviteId: string | null;
  focusedRequestId: string | null;
  isAccepting: boolean;
  isAcceptingInvite: boolean;
  isDeclining: boolean;
  isDecliningInvite: boolean;
  isFriendRequestOnline: boolean;
  isContinuationActionOnline: boolean;
  isInviteActionOnline: boolean;
  isParticipationActionOnline: boolean;
  isAnsweringParticipation: boolean;
  pendingAnswer: AttentionQueueViewState["pendingAnswer"];
  pendingContinuationAnswers: AttentionQueueViewState["pendingContinuationAnswers"];
}

function renderAttentionQueueItem(
  item: AttentionQueueRenderItem,
  context: AttentionQueueItemRenderContext,
) {
  if (item.kind === "invitation") {
    return (
      <InvitationQueueItem
        key={item.invite.id}
        invite={item.invite}
        state={{
          acceptingInviteId: context.acceptingInviteId,
          decliningInviteId: context.decliningInviteId,
          isAccepting: context.isAcceptingInvite,
          isDeclining: context.isDecliningInvite,
          isFocused: context.focusedInviteId === item.invite.id,
          isOnline: context.isInviteActionOnline,
        }}
        onAccept={context.acceptVisibleInvite}
        onDecline={context.declineVisibleInvite}
      />
    );
  }

  if (item.kind === "request") {
    return (
      <FriendRequestQueueItem
        key={item.request.requesterId}
        request={item.request}
        state={{
          acceptingRequestId: context.acceptingRequestId,
          decliningRequestId: context.decliningRequestId,
          isAccepting: context.isAccepting,
          isDeclining: context.isDeclining,
          isFocused: context.focusedRequestId === item.request.requesterId,
          isOnline: context.isFriendRequestOnline,
        }}
        onAccept={context.acceptVisibleRequest}
        onDecline={context.declineVisibleRequest}
      />
    );
  }

  if (item.kind === "plan") {
    return (
      <ProposedPlanQueueItem key={item.group.plan.id} group={item.group} />
    );
  }

  if (item.kind === "participation") {
    return (
      <ParticipationQueueItem
        key={item.group.pendingParticipationPlan.id}
        group={item.group}
        state={{
          isOnline: context.isParticipationActionOnline,
          isPending: context.isAnsweringParticipation,
          pendingAnswer: context.pendingAnswer,
        }}
        onAnswer={context.answerVisibleParticipation}
      />
    );
  }

  if (item.kind === "continuation") {
    return (
      <ContinuationQueueItem
        key={item.group.continuationCheckIn.id}
        group={item.group}
        state={{
          feedback:
            context.continuationFeedbackByCheckInId[
              item.group.continuationCheckIn.id
            ] ?? null,
          isOnline: context.isContinuationActionOnline,
          isPending:
            item.group.continuationCheckIn.id in
            context.pendingContinuationAnswers,
          pendingAnswer:
            context.pendingContinuationAnswers[
              item.group.continuationCheckIn.id
            ] ?? null,
        }}
        onAnswer={context.answerVisibleContinuation}
      />
    );
  }

  return null;
}
