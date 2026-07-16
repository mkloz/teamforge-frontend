import { useState } from "react";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import { useHomeInvitationActions } from "@/features/home/hooks/use-home-invitation-actions";
import { useHomeViewer } from "@/features/home/hooks/use-home-viewer";
import { useProfileFriendRequests } from "@/features/profile/public/profile-friend-requests";

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
  const { invitations, plans, isInvitationsLoading, isPlansLoading } =
    useHomeData({
      include: {
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
  const [hiddenInviteIds, setHiddenInviteIds] = useState<string[]>([]);
  const [hiddenRequestIds, setHiddenRequestIds] = useState<string[]>([]);

  const visibleInvitations = invitations.filter(
    (invite) => !hiddenInviteIds.includes(invite.id),
  );
  const visibleRequests = requests.filter(
    (request) => !hiddenRequestIds.includes(request.requesterId),
  );
  const proposedPlans = plans.filter(isProposedPlanCandidate);
  const queueSize =
    visibleInvitations.length +
    visibleRequests.length +
    proposedPlans.length +
    (viewer.nextStep ? 1 : 0);
  const shouldShowSkeleton =
    queueSize === 0 &&
    (isInvitationsLoading || isPlansLoading || friendRequestsLoading);

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

  return {
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
  };
}

function isProposedPlanCandidate(
  group: ReturnType<typeof useHomeData>["plans"][number],
) {
  const action = group.plan.nextRequiredAction;

  return action === null
    ? group.plan.status === "PROPOSED"
    : action !== "READY";
}
