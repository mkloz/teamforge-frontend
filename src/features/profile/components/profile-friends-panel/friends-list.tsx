import { Link } from "@tanstack/react-router";
import { Loader2, MessageSquare, UserMinus, Users } from "lucide-react";
import { useProfileFriends } from "@/features/profile/hooks/use-profile-friends";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { FriendCard } from "./friend-card";

export function FriendsList() {
  const {
    friends,
    isLoading,
    isError,
    removeFriend,
    isRemoving,
    removingFriendId,
    isOnline,
  } = useProfileFriends();

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
        We couldn't load your friends list right now.
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border border-dashed py-16 text-center">
        <div className="rounded-full bg-muted/50 p-3">
          <Users className="size-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 font-bold text-foreground">No friends yet</h3>
        <p className="mt-1 max-w-sm text-muted-foreground text-sm">
          When you accept friend requests or people accept yours, they will
          appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {friends.map((friendship) => {
        const user = friendship.counterpart;
        const isRemovingThisUser = isRemoving && removingFriendId === user.id;

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
            friendsSince={friendship.createdAt}
            actions={
              <>
                <ActionDialog
                  cancelLabel="Keep friend"
                  confirmLabel={
                    isRemovingThisUser ? "Removing..." : "Remove friend"
                  }
                  description={`${user.name} will no longer be on your friends list. You will still be in any shared groups.`}
                  disabled={!isOnline || isRemovingThisUser}
                  loading={isRemovingThisUser}
                  onConfirm={() => removeFriend(user.id)}
                  title="Remove this friend?"
                  tone="danger"
                  trigger={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={!isOnline || isRemovingThisUser}
                      aria-label="Remove friend"
                      title="Remove friend"
                      className="size-8 text-muted-foreground hover:text-destructive"
                    >
                      {isRemovingThisUser ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <UserMinus className="size-4" />
                      )}
                    </Button>
                  }
                />
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-forge-teal"
                  aria-label="Message"
                  title="Message"
                >
                  <Link to="/activity" search={{ dm: user.id }}>
                    <MessageSquare className="size-4" />
                  </Link>
                </Button>
              </>
            }
          />
        );
      })}
    </div>
  );
}
