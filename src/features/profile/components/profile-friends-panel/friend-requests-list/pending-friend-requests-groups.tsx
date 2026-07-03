import {
  IncomingFriendRequestCard,
  OutgoingFriendRequestCard,
} from "@/features/profile/components/profile-friends-panel/friend-requests-list/friend-request-cards";
import type {
  IncomingFriendRequest,
  OutgoingFriendRequest,
} from "@/features/profile/components/profile-friends-panel/friend-requests-list/friend-request-types";

export function PendingFriendRequestsGroups({
  acceptingRequestId,
  acceptRequest,
  declineRequest,
  decliningRequestId,
  incomingRequests,
  isOnline,
  onCancelRequest,
  outgoingRequests,
  removingFriendId,
}: {
  acceptingRequestId: string | null;
  acceptRequest: (userId: string) => unknown;
  declineRequest: (userId: string) => unknown;
  decliningRequestId: string | null;
  incomingRequests: IncomingFriendRequest[];
  isOnline: boolean;
  onCancelRequest: (userId: string) => unknown;
  outgoingRequests: OutgoingFriendRequest[];
  removingFriendId: string | null;
}) {
  const hasIncoming = incomingRequests.length > 0;
  const hasOutgoing = outgoingRequests.length > 0;

  return (
    <div className="flex flex-col gap-8">
      {hasIncoming && (
        <section className="flex flex-col gap-3">
          <h3 className="font-semibold text-foreground text-sm">
            Incoming Requests
          </h3>
          <div className="flex flex-col gap-1">
            {incomingRequests.map((request) => (
              <IncomingFriendRequestCard
                key={request.counterpart.id}
                acceptingRequestId={acceptingRequestId}
                acceptRequest={acceptRequest}
                declineRequest={declineRequest}
                decliningRequestId={decliningRequestId}
                isOnline={isOnline}
                request={request}
              />
            ))}
          </div>
        </section>
      )}

      {hasOutgoing && (
        <section className="flex flex-col gap-3">
          <h3 className="font-semibold text-foreground text-sm">
            Outgoing Requests
          </h3>
          <div className="flex flex-col gap-1">
            {outgoingRequests.map((request) => (
              <OutgoingFriendRequestCard
                key={request.counterpart.id}
                isOnline={isOnline}
                onCancelRequest={onCancelRequest}
                removingFriendId={removingFriendId}
                request={request}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
