import { FriendCard } from "@/features/profile/components/profile-friends-panel/friend-card";
import {
  AcceptIncomingRequestButton,
  CancelOutgoingRequestButton,
  DeclineIncomingRequestButton,
} from "@/features/profile/components/profile-friends-panel/friend-requests-list/friend-request-action-buttons";
import { getIncomingRequestActionState } from "@/features/profile/components/profile-friends-panel/friend-requests-list/friend-request-action-state";
import type {
  IncomingFriendRequest,
  OutgoingFriendRequest,
} from "@/features/profile/components/profile-friends-panel/friend-requests-list/friend-request-types";

export function IncomingFriendRequestCard({
  acceptingRequestId,
  acceptRequest,
  declineRequest,
  decliningRequestId,
  isOnline,
  request,
}: {
  acceptingRequestId: string | null;
  acceptRequest: (userId: string) => unknown;
  declineRequest: (userId: string) => unknown;
  decliningRequestId: string | null;
  isOnline: boolean;
  request: IncomingFriendRequest;
}) {
  const user = request.counterpart;
  const actionState = getIncomingRequestActionState({
    acceptingRequestId,
    decliningRequestId,
    userId: user.id,
  });

  return (
    <FriendCard
      user={user}
      actions={
        <>
          <DeclineIncomingRequestButton
            disabled={!isOnline || actionState.isActionPending}
            loading={actionState.isDeclining}
            onClick={() => declineRequest(user.id)}
          />
          <AcceptIncomingRequestButton
            disabled={!isOnline || actionState.isActionPending}
            loading={actionState.isAccepting}
            onClick={() => acceptRequest(user.id)}
          />
        </>
      }
    />
  );
}

export function OutgoingFriendRequestCard({
  isOnline,
  onCancelRequest,
  removingFriendId,
  request,
}: {
  isOnline: boolean;
  onCancelRequest: (userId: string) => unknown;
  removingFriendId: string | null;
  request: OutgoingFriendRequest;
}) {
  const user = request.counterpart;
  const isRemoving = removingFriendId === user.id;

  return (
    <FriendCard
      user={user}
      subtitle="Waiting for response"
      actions={
        <CancelOutgoingRequestButton
          disabled={!isOnline || isRemoving}
          loading={isRemoving}
          onClick={() => onCancelRequest(user.id)}
        />
      }
    />
  );
}
