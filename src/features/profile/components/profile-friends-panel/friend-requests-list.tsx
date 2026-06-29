import { Check, Loader2, UserPlus, X } from "lucide-react";
import { useProfileFriends } from "@/features/profile/hooks/use-profile-friends";
import { useProfileOutgoingFriendRequests } from "@/features/profile/hooks/use-profile-outgoing-friend-requests";
import { useProfileFriendRequests } from "@/features/profile/public/profile-friend-requests";
import { Button } from "@/shared/components/ui/button";
import { FriendCard } from "./friend-card";

type IncomingFriendRequest = ReturnType<
  typeof useProfileFriendRequests
>["requests"][number];
type OutgoingFriendRequest = ReturnType<
  typeof useProfileOutgoingFriendRequests
>["requests"][number];
type FriendRequestsStatus = "loading" | "error" | "empty" | "ready";

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
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex justify-center py-12 text-center text-muted-foreground text-sm">
        We couldn't load your friend requests right now.
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border border-dashed py-16 text-center">
        <div className="rounded-full bg-muted/50 p-3">
          <UserPlus className="size-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 font-bold text-foreground">No pending requests</h3>
        <p className="mt-1 max-w-sm text-muted-foreground text-sm">
          You don't have any pending friend requests.
        </p>
      </div>
    );
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

function PendingFriendRequestsGroups({
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

function IncomingFriendRequestCard({
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

function DeclineIncomingRequestButton({
  disabled,
  loading,
  onClick,
}: {
  disabled: boolean;
  loading: boolean;
  onClick: () => unknown;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={disabled}
      onClick={onClick}
      aria-label="Decline request"
      title="Decline"
      className="size-8 text-muted-foreground hover:text-destructive"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <X className="size-4" />
      )}
    </Button>
  );
}

function AcceptIncomingRequestButton({
  disabled,
  loading,
  onClick,
}: {
  disabled: boolean;
  loading: boolean;
  onClick: () => unknown;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={disabled}
      onClick={onClick}
      aria-label="Accept request"
      title="Accept"
      className="size-8 text-muted-foreground hover:text-forge-teal"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Check className="size-4" />
      )}
    </Button>
  );
}

function OutgoingFriendRequestCard({
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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!isOnline || isRemoving}
          onClick={() => onCancelRequest(user.id)}
          aria-label="Cancel request"
          title="Cancel request"
          className="size-8 text-muted-foreground hover:text-destructive"
        >
          {isRemoving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <X className="size-4" />
          )}
        </Button>
      }
    />
  );
}

function getIncomingRequestActionState({
  acceptingRequestId,
  decliningRequestId,
  userId,
}: {
  acceptingRequestId: string | null;
  decliningRequestId: string | null;
  userId: string;
}) {
  const isAccepting = acceptingRequestId === userId;
  const isDeclining = decliningRequestId === userId;

  return {
    isAccepting,
    isDeclining,
    isActionPending: isAccepting || isDeclining,
  };
}

function getFriendRequestsStatus({
  hasPendingRequests,
  isError,
  isLoading,
}: {
  hasPendingRequests: boolean;
  isError: boolean;
  isLoading: boolean;
}): FriendRequestsStatus {
  if (isLoading) {
    return "loading";
  }

  if (isError) {
    return "error";
  }

  if (!hasPendingRequests) {
    return "empty";
  }

  return "ready";
}

function hasFriendRequestsLoading({
  isIncomingLoading,
  isOutgoingLoading,
}: {
  isIncomingLoading: boolean;
  isOutgoingLoading: boolean;
}) {
  return isIncomingLoading || isOutgoingLoading;
}

function hasFriendRequestsError({
  isIncomingError,
  isOutgoingError,
}: {
  isIncomingError: boolean;
  isOutgoingError: boolean;
}) {
  return isIncomingError || isOutgoingError;
}

function hasPendingFriendRequests({
  incomingCount,
  outgoingCount,
}: {
  incomingCount: number;
  outgoingCount: number;
}) {
  return incomingCount > 0 || outgoingCount > 0;
}
