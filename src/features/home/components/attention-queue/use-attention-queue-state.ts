import { useState } from "react";
import { useHomeContinuationActions } from "@/features/home/hooks/use-home-continuation-actions";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import { useHomeInvitationActions } from "@/features/home/hooks/use-home-invitation-actions";
import {
  type HomeParticipationAnswer,
  useHomeParticipationActions,
} from "@/features/home/hooks/use-home-participation-actions";
import { useHomeViewer } from "@/features/home/hooks/use-home-viewer";
import { hasHomeParticipationDeadlinePassed } from "@/features/home/lib/home-participation-deadline";
import { useProfileFriendRequests } from "@/features/profile/public/profile-friend-requests";

import type {
  AttentionQueueContinuation,
  AttentionQueueParticipation,
} from "./attention-queue.types";
import { useParticipationDeadlineClock } from "./use-participation-deadline-clock";

interface UseAttentionQueueStateInput {
  focusedInviteId: string | null;
  focusedRequestId: string | null;
  onClearInvitationFocus?: () => void;
  onClearFriendRequestFocus?: () => void;
}

function runOptionalFocusCallback(callback?: () => void) {
  if (callback) {
    callback();
  }
}

export function useAttentionQueueState({
  focusedInviteId,
  focusedRequestId,
  onClearFriendRequestFocus,
  onClearInvitationFocus,
}: UseAttentionQueueStateInput) {
  const viewer = useHomeViewer();
  const {
    groups,
    invitations,
    plans,
    isGroupsLoading,
    isInvitationsLoading,
    isPlansLoading,
  } = useHomeData({
    include: {
      groups: true,
      invitations: true,
      plans: true,
    },
  });
  const {
    requests,
    isLoading: friendRequestsLoading,
    acceptRequest,
    declineRequest,
    acceptingRequestId,
    decliningRequestId,
    isAccepting,
    isDeclining,
    isOnline: isFriendRequestOnline,
  } = useProfileFriendRequests();
  const {
    acceptInvitation,
    declineInvitation,
    isAccepting: isAcceptingInvite,
    isDeclining: isDecliningInvite,
    acceptingInviteId,
    decliningInviteId,
    actionError,
    clearActionError,
    isOnline: isInviteActionOnline,
  } = useHomeInvitationActions();
  const {
    actionError: participationActionError,
    answerParticipation,
    clearActionError: clearParticipationActionError,
    isOnline: isParticipationActionOnline,
    isPending: isAnsweringParticipation,
    pendingAnswer,
  } = useHomeParticipationActions();
  const {
    answerContinuation,
    feedbackByCheckInId,
    isOnline: isContinuationActionOnline,
    pendingAnswers: pendingContinuationAnswers,
  } = useHomeContinuationActions();
  const [hiddenInviteIds, setHiddenInviteIds] = useState<string[]>([]);
  const [hiddenRequestIds, setHiddenRequestIds] = useState<string[]>([]);
  const participationDeadlineClock = useParticipationDeadlineClock(groups);

  const visibleInvitations = invitations.filter(
    (invite) => !hiddenInviteIds.includes(invite.id),
  );
  const visibleRequests = requests.filter(
    (request) => !hiddenRequestIds.includes(request.requesterId),
  );
  const proposedPlans = plans.filter(isProposedPlanCandidate);
  const pendingParticipations = getPendingParticipations(
    groups,
    participationDeadlineClock,
  );
  const continuationCheckIns = getContinuationCheckIns(
    groups,
    feedbackByCheckInId,
  );
  const queueSize =
    visibleInvitations.length +
    visibleRequests.length +
    pendingParticipations.length +
    continuationCheckIns.length +
    proposedPlans.length +
    (viewer.nextStep ? 1 : 0);
  const shouldShowSkeleton =
    queueSize === 0 &&
    (isGroupsLoading ||
      isInvitationsLoading ||
      isPlansLoading ||
      friendRequestsLoading);

  const hideInvite = (inviteId: string) => {
    setHiddenInviteIds((current) =>
      current.includes(inviteId) ? current : [...current, inviteId],
    );
  };

  const restoreInvite = (inviteId: string) => {
    setHiddenInviteIds((current) => current.filter((id) => id !== inviteId));
  };

  const hideRequest = (requesterId: string) => {
    setHiddenRequestIds((current) =>
      current.includes(requesterId) ? current : [...current, requesterId],
    );
  };

  const restoreRequest = (requesterId: string) => {
    setHiddenRequestIds((current) =>
      current.filter((id) => id !== requesterId),
    );
  };

  async function acceptVisibleInvite(inviteId: string) {
    clearParticipationActionError();
    clearActionError();
    if (!isInviteActionOnline) {
      await acceptInvitation(inviteId);
      return;
    }

    hideInvite(inviteId);

    try {
      await acceptInvitation(inviteId);
      if (focusedInviteId === inviteId) {
        runOptionalFocusCallback(onClearInvitationFocus);
      }
    } catch {
      restoreInvite(inviteId);
    }
  }

  async function declineVisibleInvite(inviteId: string) {
    clearParticipationActionError();
    clearActionError();
    if (!isInviteActionOnline) {
      await declineInvitation(inviteId);
      return;
    }

    hideInvite(inviteId);

    try {
      await declineInvitation(inviteId);
      if (focusedInviteId === inviteId) {
        runOptionalFocusCallback(onClearInvitationFocus);
      }
    } catch {
      restoreInvite(inviteId);
    }
  }

  async function acceptVisibleRequest(requesterId: string) {
    clearParticipationActionError();
    if (!isFriendRequestOnline) {
      await acceptRequest(requesterId);
      return;
    }

    hideRequest(requesterId);

    try {
      await acceptRequest(requesterId);
      if (focusedRequestId === requesterId) {
        runOptionalFocusCallback(onClearFriendRequestFocus);
      }
    } catch {
      restoreRequest(requesterId);
    }
  }

  async function declineVisibleRequest(requesterId: string) {
    clearParticipationActionError();
    if (!isFriendRequestOnline) {
      await declineRequest(requesterId);
      return;
    }

    hideRequest(requesterId);

    try {
      await declineRequest(requesterId);
      if (focusedRequestId === requesterId) {
        runOptionalFocusCallback(onClearFriendRequestFocus);
      }
    } catch {
      restoreRequest(requesterId);
    }
  }

  async function answerVisibleParticipation(answer: HomeParticipationAnswer) {
    clearActionError();
    clearParticipationActionError();
    await answerParticipation(answer);
  }

  async function answerVisibleContinuation(
    answer: Parameters<typeof answerContinuation>[0],
  ) {
    clearActionError();
    clearParticipationActionError();
    await answerContinuation(answer);
  }

  return {
    acceptingInviteId,
    acceptingRequestId,
    actionError: actionError ?? participationActionError,
    answerVisibleContinuation,
    answerVisibleParticipation,
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
    isContinuationActionOnline,
    isInviteActionOnline,
    isParticipationActionOnline,
    isAnsweringParticipation,
    pendingAnswer,
    pendingContinuationAnswers,
    continuationFeedbackByCheckInId: feedbackByCheckInId,
    continuationCheckIns,
    pendingParticipations,
    proposedPlans,
    queueSize,
    shouldShowSkeleton,
    viewer,
    visibleInvitations,
    visibleRequests,
  };
}

function getContinuationCheckIns(
  groups: ReturnType<typeof useHomeData>["groups"],
  feedbackByCheckInId: ReturnType<
    typeof useHomeContinuationActions
  >["feedbackByCheckInId"],
) {
  return groups
    .filter(
      (group): group is AttentionQueueContinuation =>
        hasContinuationCheckIn(group) &&
        (group.continuationCheckIn.state === "DUE" ||
          group.continuationCheckIn.id in feedbackByCheckInId),
    )
    .sort(compareContinuationCheckIns);
}

function hasContinuationCheckIn(
  group: ReturnType<typeof useHomeData>["groups"][number],
): group is AttentionQueueContinuation {
  return group.continuationCheckIn !== null;
}

function compareContinuationCheckIns(
  left: AttentionQueueContinuation,
  right: AttentionQueueContinuation,
) {
  return (
    Date.parse(left.continuationCheckIn.responseWindowEndsAt) -
    Date.parse(right.continuationCheckIn.responseWindowEndsAt)
  );
}

function getPendingParticipations(
  groups: ReturnType<typeof useHomeData>["groups"],
  currentTime: number,
) {
  return groups
    .filter(hasPendingParticipation)
    .filter(
      (group) =>
        !hasHomeParticipationDeadlinePassed(
          group.pendingParticipationPlan.responseDeadline,
          currentTime,
        ),
    )
    .sort(comparePendingParticipations);
}

function hasPendingParticipation(
  group: ReturnType<typeof useHomeData>["groups"][number],
): group is AttentionQueueParticipation {
  return group.pendingParticipationPlan !== null;
}

function comparePendingParticipations(
  left: AttentionQueueParticipation,
  right: AttentionQueueParticipation,
) {
  const leftDeadline = left.pendingParticipationPlan.responseDeadline;
  const rightDeadline = right.pendingParticipationPlan.responseDeadline;

  if (leftDeadline && rightDeadline) {
    return Date.parse(leftDeadline) - Date.parse(rightDeadline);
  }

  if (leftDeadline) {
    return -1;
  }

  if (rightDeadline) {
    return 1;
  }

  return (
    Date.parse(left.pendingParticipationPlan.completedAt) -
    Date.parse(right.pendingParticipationPlan.completedAt)
  );
}

function isProposedPlanCandidate(
  group: ReturnType<typeof useHomeData>["plans"][number],
) {
  const action = group.plan.nextRequiredAction;

  return action === null
    ? group.plan.status === "PROPOSED"
    : action !== "READY";
}
