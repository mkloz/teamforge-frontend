import { type RefObject, useRef } from "react";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import { HomeAttentionQueueRowsSkeleton } from "@/features/home/components/home-skeletons";
import type {
  HomeInvitationView,
  HomePanel,
} from "@/features/home/lib/home-route";
import { StatusPill } from "@/shared/components/ui/status-pill";

import { ActionErrorBanner } from "./action-error-banner";
import { formatQueueCount } from "./attention-queue-formatters";
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
  const renderedInvitations = visibleInvitations.slice(0, 2);
  const renderedRequests = visibleRequests.slice(0, 2);
  const renderedPlans = proposedPlans.slice(0, 2);
  const collapsedQueueSize =
    Math.min(visibleInvitations.length, 2) +
    Math.min(visibleRequests.length, 2) +
    Math.min(proposedPlans.length, 2) +
    (viewer.nextStep ? 1 : 0);
  const hiddenItemCount = Math.max(queueSize - collapsedQueueSize, 0);
  const queueSummary = [
    formatQueueCount(visibleInvitations.length, "invite"),
    formatQueueCount(visibleRequests.length, "request"),
    formatQueueCount(proposedPlans.length, "plan"),
    viewer.nextStep ? "1 setup" : null,
  ].filter(Boolean);

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
        action={
          queueSummary.length > 0 ? (
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
          ) : null
        }
      />

      <ul
        aria-label="Things that need attention"
        className="mt-4 grid min-w-0 list-none border-border/55 border-y p-0"
      >
        {actionError ? <ActionErrorBanner error={actionError} /> : null}
        {shouldShowSkeleton ? <HomeAttentionQueueRowsSkeleton /> : null}
        {!shouldShowSkeleton && queueSize === 0 ? <EmptyQueueItem /> : null}

        {!shouldShowSkeleton
          ? renderedInvitations.map((invite) => (
              <InvitationQueueItem
                key={invite.id}
                invite={invite}
                isFocused={focusedInviteId === invite.id}
                acceptingInviteId={acceptingInviteId}
                decliningInviteId={decliningInviteId}
                isAccepting={isAcceptingInvite}
                isDeclining={isDecliningInvite}
                isOnline={isInviteActionOnline}
                onAccept={acceptVisibleInvite}
                onDecline={declineVisibleInvite}
              />
            ))
          : null}

        {!shouldShowSkeleton
          ? renderedRequests.map((request) => (
              <FriendRequestQueueItem
                key={request.requesterId}
                request={request}
                isFocused={focusedRequestId === request.requesterId}
                acceptingRequestId={acceptingRequestId}
                decliningRequestId={decliningRequestId}
                isAccepting={isAccepting}
                isDeclining={isDeclining}
                isOnline={isFriendRequestOnline}
                onAccept={acceptVisibleRequest}
                onDecline={declineVisibleRequest}
              />
            ))
          : null}

        {!shouldShowSkeleton
          ? renderedPlans.map((group) => (
              <ProposedPlanQueueItem key={group.plan.id} group={group} />
            ))
          : null}

        {!shouldShowSkeleton && viewer.nextStep ? (
          <ProfileStepQueueItem nextStep={viewer.nextStep} />
        ) : null}

        {!shouldShowSkeleton && hiddenItemCount > 0 ? (
          <SeeRestButton hiddenItemCount={hiddenItemCount} />
        ) : null}
      </ul>
    </section>
  );
}
