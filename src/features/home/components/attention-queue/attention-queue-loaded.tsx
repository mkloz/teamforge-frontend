import { type RefObject, useRef } from "react";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import { HomeAttentionQueueRowsSkeleton } from "@/features/home/components/home-skeletons";
import type {
  HomeInvitationView,
  HomePanel,
} from "@/features/home/lib/home-route";
import { StatusPill } from "@/shared/components/ui/status-pill";

import { ActionErrorBanner } from "./action-error-banner";
import {
  type AttentionQueueRenderItem,
  getAttentionQueueRenderState,
} from "./attention-queue-render-state";
import { EmptyQueueItem } from "./empty-queue-item";
import { FriendRequestQueueItem } from "./friend-request-queue-item";
import { InvitationQueueItem } from "./invitation-queue-item";
import { ProfileStepQueueItem } from "./profile-step-queue-item";
import { ProposedPlanQueueItem } from "./proposed-plan-queue-item";
import { SeeRestButton } from "./see-rest-button";
import { useAttentionQueueFocus } from "./use-attention-queue-focus";
import { useAttentionQueueState } from "./use-attention-queue-state";

type AttentionQueueViewState = ReturnType<typeof useAttentionQueueState>;

interface LoadedAttentionQueueProps {
  focusedPanel?: HomePanel | null;
  focusedInviteId?: string | null;
  focusedRequestId?: string | null;
  invitationView?: HomeInvitationView;
  focusRef?: RefObject<HTMLElement | null>;
  onClearInvitationFocus?: () => void;
  onClearFriendRequestFocus?: () => void;
}

export function LoadedAttentionQueue({
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
  onClearFriendRequestFocus,
  onClearInvitationFocus,
  scrollRef,
  state,
}: AttentionQueueViewProps) {
  const {
    acceptingInviteId,
    acceptingRequestId,
    actionError,
    acceptVisibleInvite,
    acceptVisibleRequest,
    declineVisibleInvite,
    declineVisibleRequest,
    decliningInviteId,
    decliningRequestId,
    isAccepting,
    isAcceptingInvite,
    isDeclining,
    isDecliningInvite,
    isFriendRequestOnline,
    isInviteActionOnline,
    proposedPlans,
    queueSize,
    shouldShowSkeleton,
    viewer,
    visibleInvitations,
    visibleRequests,
  } = state;
  const { queueItems, queueSummary, shouldShowEmptyQueue } =
    getAttentionQueueRenderState({
      proposedPlans,
      queueSize,
      shouldShowSkeleton,
      viewer,
      visibleInvitations,
      visibleRequests,
    });
  const queueSummaryAction = renderQueueSummaryAction(queueSummary);

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

  return (
    <section
      ref={scrollRef}
      aria-labelledby="attention-queue-heading"
      id="home-attention"
      className="scroll-mt-6"
    >
      <HomeSectionHeading
        id="attention-queue-heading"
        eyebrow="Right now"
        title="Action queue"
        description="Invites, requests, and plan details waiting on a clear decision."
        action={queueSummaryAction}
      />

      <ul
        aria-label="Things that need attention"
        className="mt-4 grid min-w-0 list-none border-border/55 border-y p-0"
      >
        {actionError ? <ActionErrorBanner error={actionError} /> : null}
        {shouldShowSkeleton ? <HomeAttentionQueueRowsSkeleton /> : null}
        {shouldShowEmptyQueue ? <EmptyQueueItem /> : null}
        {queueItems.map((item) =>
          renderAttentionQueueItem(item, {
            acceptingInviteId,
            acceptingRequestId,
            acceptVisibleInvite,
            acceptVisibleRequest,
            declineVisibleInvite,
            declineVisibleRequest,
            decliningInviteId,
            decliningRequestId,
            focusedInviteId,
            focusedRequestId,
            isAccepting,
            isAcceptingInvite,
            isDeclining,
            isDecliningInvite,
            isFriendRequestOnline,
            isInviteActionOnline,
          }),
        )}
      </ul>
    </section>
  );
}

function renderQueueSummaryAction(queueSummary: string[]) {
  if (queueSummary.length === 0) {
    return null;
  }

  return (
    <div className="flex max-w-72 flex-wrap justify-end gap-1.5">
      {queueSummary.map((item) => (
        <StatusPill
          key={item}
          size="sm"
          tone="teal"
          surface="soft"
          className="px-2 font-black"
        >
          {item}
        </StatusPill>
      ))}
    </div>
  );
}

interface AttentionQueueItemRenderContext {
  acceptingInviteId: string | null;
  acceptingRequestId: string | null;
  acceptVisibleInvite: (inviteId: string) => Promise<void>;
  acceptVisibleRequest: (requesterId: string) => Promise<void>;
  declineVisibleInvite: (inviteId: string) => Promise<void>;
  declineVisibleRequest: (requesterId: string) => Promise<void>;
  decliningInviteId: string | null;
  decliningRequestId: string | null;
  focusedInviteId: string | null;
  focusedRequestId: string | null;
  isAccepting: boolean;
  isAcceptingInvite: boolean;
  isDeclining: boolean;
  isDecliningInvite: boolean;
  isFriendRequestOnline: boolean;
  isInviteActionOnline: boolean;
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

  if (item.kind === "profile") {
    return <ProfileStepQueueItem key="profile-step" nextStep={item.nextStep} />;
  }

  return (
    <SeeRestButton key="see-rest" hiddenItemCount={item.hiddenItemCount} />
  );
}
