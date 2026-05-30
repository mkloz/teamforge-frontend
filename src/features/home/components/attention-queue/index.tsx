import { AnimatePresence } from "framer-motion";
import { type RefObject, useEffect, useRef } from "react";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import { HomeAttentionQueueRowsSkeleton } from "@/features/home/components/home-skeletons";
import type {
  HomeInvitationView,
  HomePanel,
} from "@/features/home/lib/home-route";

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
  const queueHasSettledRef = useRef(false);
  const animateQueueInsertions = queueHasSettledRef.current;
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

  useEffect(() => {
    if (!shouldShowSkeleton) {
      queueHasSettledRef.current = true;
    }
  }, [shouldShowSkeleton]);

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
                <span
                  key={item}
                  className="rounded-full border border-forge-teal/25 bg-forge-teal/8 px-2 py-1 font-black text-forge-teal text-xs leading-none"
                >
                  {item}
                </span>
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
        <AnimatePresence initial={false}>
          {!shouldShowSkeleton && queueSize === 0 ? (
            <EmptyQueueItem animateOnInsert={animateQueueInsertions} />
          ) : null}

          {!shouldShowSkeleton
            ? renderedInvitations.map((invite) => (
                <InvitationQueueItem
                  key={invite.id}
                  invite={invite}
                  isFocused={focusedInviteId === invite.id}
                  acceptingInviteId={acceptingInviteId}
                  animateOnInsert={animateQueueInsertions}
                  decliningInviteId={decliningInviteId}
                  isAccepting={isAcceptingInvite}
                  isDeclining={isDecliningInvite}
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
                  animateOnInsert={animateQueueInsertions}
                  decliningRequestId={decliningRequestId}
                  isAccepting={isAccepting}
                  isDeclining={isDeclining}
                  onAccept={acceptVisibleRequest}
                  onDecline={declineVisibleRequest}
                />
              ))
            : null}

          {!shouldShowSkeleton
            ? renderedPlans.map((group) => (
                <ProposedPlanQueueItem
                  key={group.plan.id}
                  animateOnInsert={animateQueueInsertions}
                  group={group}
                />
              ))
            : null}

          {!shouldShowSkeleton && viewer.nextStep ? (
            <ProfileStepQueueItem
              animateOnInsert={animateQueueInsertions}
              nextStep={viewer.nextStep}
            />
          ) : null}
        </AnimatePresence>

        {!shouldShowSkeleton && hiddenItemCount > 0 ? (
          <SeeRestButton hiddenItemCount={hiddenItemCount} />
        ) : null}
      </ul>
    </section>
  );
}
