import { Check, Loader2, UserPlus, X } from "lucide-react";
import { useProfileFriendRequests } from "@/features/profile/hooks/use-profile-friend-requests";
import { useProfileFriends } from "@/features/profile/hooks/use-profile-friends";
import { useProfileOutgoingFriendRequests } from "@/features/profile/hooks/use-profile-outgoing-friend-requests";
import { Button } from "@/shared/components/ui/button";
import { FriendCard } from "./friend-card";

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

  const isLoading = isIncomingLoading || isOutgoingLoading;
  const isError = isIncomingError || isOutgoingError;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center py-12 text-center text-muted-foreground text-sm">
        We couldn't load your friend requests right now.
      </div>
    );
  }

  const hasIncoming = incomingRequests.length > 0;
  const hasOutgoing = outgoingRequests.length > 0;

  if (!hasIncoming && !hasOutgoing) {
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
    <div className="flex flex-col gap-8">
      {hasIncoming && (
        <section className="flex flex-col gap-3">
          <h3 className="font-semibold text-foreground text-sm">
            Incoming Requests
          </h3>
          <div className="flex flex-col gap-1">
            {incomingRequests.map((request) => {
              const user = request.counterpart;
              const isAccepting = acceptingRequestId === user.id;
              const isDeclining = decliningRequestId === user.id;
              const isActionPending = isAccepting || isDeclining;

              return (
                <FriendCard
                  key={user.id}
                  user={{
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar,
                    personalityType: user.personalityType,
                    city: user.city,
                    trustScore: user.trustScore,
                    onlineStatus: user.onlineStatus,
                  }}
                  actions={
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={!isOnline || isActionPending}
                        onClick={() => declineRequest(user.id)}
                        aria-label="Decline request"
                        title="Decline"
                        className="size-8 text-muted-foreground hover:text-destructive"
                      >
                        {isDeclining ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <X className="size-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={!isOnline || isActionPending}
                        onClick={() => acceptRequest(user.id)}
                        aria-label="Accept request"
                        title="Accept"
                        className="size-8 text-muted-foreground hover:text-forge-teal"
                      >
                        {isAccepting ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Check className="size-4" />
                        )}
                      </Button>
                    </>
                  }
                />
              );
            })}
          </div>
        </section>
      )}

      {hasOutgoing && (
        <section className="flex flex-col gap-3">
          <h3 className="font-semibold text-foreground text-sm">
            Outgoing Requests
          </h3>
          <div className="flex flex-col gap-1">
            {outgoingRequests.map((request) => {
              const user = request.counterpart;
              const isRemoving = removingFriendId === user.id;

              return (
                <FriendCard
                  key={user.id}
                  user={{
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar,
                    personalityType: user.personalityType,
                    city: user.city,
                    trustScore: user.trustScore,
                    onlineStatus: user.onlineStatus,
                  }}
                  subtitle="Waiting for response"
                  actions={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={!isOnline || isRemoving}
                      onClick={() => removeFriend(user.id)}
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
            })}
          </div>
        </section>
      )}
    </div>
  );
}
