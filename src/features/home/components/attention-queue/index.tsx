import { type RefObject, useRef } from "react";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import type {
  HomeInvitationView,
  HomePanel,
} from "@/features/home/lib/home-route";

import { ActionErrorBanner } from "./action-error-banner";
import { EmptyQueueItem } from "./empty-queue-item";
import { FriendRequestQueueItem } from "./friend-request-queue-item";
import { InvitationQueueItem } from "./invitation-queue-item";
import { ProfileStepQueueItem } from "./profile-step-queue-item";
import { ProposedPlanQueueItem } from "./proposed-plan-queue-item";
import { SeeRestButton } from "./see-rest-button";
import { useAttentionQueueFocus } from "./use-attention-queue-focus";
import { useAttentionQueueState } from "./use-attention-queue-state";

export type AttentionQueueViewState = ReturnType<typeof useAttentionQueueState>;

interface AttentionQueueProps {
  focusedPanel?: HomePanel | null;
  focusedInviteId?: string | null;
  focusedRequestId?: string | null;
  invitationView?: HomeInvitationView;
  focusRef?: RefObject<HTMLElement | null>;
  onClearInvitationFocus?: () => void;
  onClearFriendRequestFocus?: () => void;
}

export function AttentionQueue({
  focusedPanel = null,
  focusedInviteId = null,
  focusedRequestId = null,
  invitationView = "received",
  focusRef,
  onClearInvitationFocus,
  onClearFriendRequestFocus,
}: AttentionQueueProps) {
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
  extends Omit<AttentionQueueProps, "focusRef"> {
  scrollRef: RefObject<HTMLElement | null>;
  state: AttentionQueueViewState;
}

export function AttentionQueueView({
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
    proposedPlans,
    queueSize,
    shouldShowSkeleton,
    viewer,
    visibleInvitations,
    visibleRequests,
  } = state;

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
        title="Needs your attention"
        description="The small things that keep a group moving."
        action={
          queueSize > 0 ? (
            <span className="font-black text-forge-teal text-xs">
              {queueSize} open item{queueSize === 1 ? "" : "s"}
            </span>
          ) : null
        }
      />

      <ul
        aria-label="Things that need attention"
        className="mt-4 grid min-w-0 list-none border-border/55 border-y p-0"
      >
        {actionError ? <ActionErrorBanner error={actionError} /> : null}
        {!shouldShowSkeleton && queueSize === 0 ? <EmptyQueueItem /> : null}

        {viewer.nextStep ? (
          <ProfileStepQueueItem nextStep={viewer.nextStep} />
        ) : null}

        {visibleInvitations.slice(0, 2).map((invite) => (
          <InvitationQueueItem
            key={invite.id}
            invite={invite}
            isFocused={focusedInviteId === invite.id}
            acceptingInviteId={acceptingInviteId}
            decliningInviteId={decliningInviteId}
            isAccepting={isAcceptingInvite}
            isDeclining={isDecliningInvite}
            onAccept={acceptVisibleInvite}
            onDecline={declineVisibleInvite}
          />
        ))}

        {visibleRequests.slice(0, 2).map((request) => (
          <FriendRequestQueueItem
            key={request.requesterId}
            request={request}
            isFocused={focusedRequestId === request.requesterId}
            acceptingRequestId={acceptingRequestId}
            decliningRequestId={decliningRequestId}
            isAccepting={isAccepting}
            isDeclining={isDeclining}
            onAccept={acceptVisibleRequest}
            onDecline={declineVisibleRequest}
          />
        ))}

        {proposedPlans.map((group) => (
          <ProposedPlanQueueItem key={group.plan.id} group={group} />
        ))}

        {queueSize > 4 ? <SeeRestButton /> : null}
      </ul>
    </section>
  );
}
