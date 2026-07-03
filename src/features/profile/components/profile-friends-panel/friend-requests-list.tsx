import {
  getFriendRequestsStatus,
  hasFriendRequestsError,
  hasFriendRequestsLoading,
  hasPendingFriendRequests,
} from "@/features/profile/components/profile-friends-panel/friend-requests-list/friend-requests-status";
import { PendingFriendRequestsGroups } from "@/features/profile/components/profile-friends-panel/friend-requests-list/pending-friend-requests-groups";
import {
  FriendRequestsEmptyState,
  FriendRequestsErrorState,
  FriendRequestsLoadingState,
} from "@/features/profile/components/profile-friends-panel/friend-requests-list/request-list-states";
import { useProfileFriends } from "@/features/profile/hooks/use-profile-friends";
import { useProfileOutgoingFriendRequests } from "@/features/profile/hooks/use-profile-outgoing-friend-requests";
import { useProfileFriendRequests } from "@/features/profile/public/profile-friend-requests";

export function FriendRequestsList() {
  const {
    requests: incomingRequests,
    isLoading: isIncomingLoading,
    isError: isIncomingError,
    acceptRequest,
    declineRequest,
    acceptingRequestId,
    decliningRequestId,
    isOnline,
  } = useProfileFriendRequests();

  const {
    requests: outgoingRequests,
    isLoading: isOutgoingLoading,
    isError: isOutgoingError,
  } = useProfileOutgoingFriendRequests();

  const { removeFriend, removingFriendId } = useProfileFriends();

  const status = getFriendRequestsStatus({
    hasPendingRequests: hasPendingFriendRequests({
      incomingCount: incomingRequests.length,
      outgoingCount: outgoingRequests.length,
    }),
    isError: hasFriendRequestsError({ isIncomingError, isOutgoingError }),
    isLoading: hasFriendRequestsLoading({
      isIncomingLoading,
      isOutgoingLoading,
    }),
  });

  if (status === "loading") {
    return <FriendRequestsLoadingState />;
  }

  if (status === "error") {
    return <FriendRequestsErrorState />;
  }

  if (status === "empty") {
    return <FriendRequestsEmptyState />;
  }

  return (
    <PendingFriendRequestsGroups
      acceptingRequestId={acceptingRequestId}
      acceptRequest={acceptRequest}
      declineRequest={declineRequest}
      decliningRequestId={decliningRequestId}
      incomingRequests={incomingRequests}
      isOnline={isOnline}
      onCancelRequest={removeFriend}
      outgoingRequests={outgoingRequests}
      removingFriendId={removingFriendId}
    />
  );
}
