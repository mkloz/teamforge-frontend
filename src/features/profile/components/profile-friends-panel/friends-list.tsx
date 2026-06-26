import { Loader2, UserMinus, Users } from "lucide-react";
import { useProfileFriends } from "@/features/profile/hooks/use-profile-friends";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { FriendCard } from "./friend-card";
import { FriendMessageAction } from "./friend-message-action";

type FriendListItem = ReturnType<typeof useProfileFriends>["friends"][number];

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
      {friends.map((friendship) => (
        <FriendListCard
          key={friendship.counterpart.id}
          friendship={friendship}
          isOnline={isOnline}
          isRemoving={isRemoving}
          onRemoveFriend={removeFriend}
          removingFriendId={removingFriendId}
        />
      ))}
    </div>
  );
}

function FriendListCard({
  friendship,
  isOnline,
  isRemoving,
  onRemoveFriend,
  removingFriendId,
}: {
  friendship: FriendListItem;
  isOnline: boolean;
  isRemoving: boolean;
  onRemoveFriend: (userId: string) => unknown;
  removingFriendId: string | null;
}) {
  const user = friendship.counterpart;
  const messageChatId = getFriendshipMessageChatId(friendship);
  const isRemovingThisUser = isRemovingFriend({
    isRemoving,
    removingFriendId,
    userId: user.id,
  });

  return (
    <FriendCard
      user={user}
      friendsSince={friendship.createdAt}
      actions={
        <FriendListActions
          isOnline={isOnline}
          isRemovingThisUser={isRemovingThisUser}
          messageChatId={messageChatId}
          onRemoveFriend={onRemoveFriend}
          userId={user.id}
          userName={user.name}
        />
      }
    />
  );
}

function FriendListActions({
  isOnline,
  isRemovingThisUser,
  messageChatId,
  onRemoveFriend,
  userId,
  userName,
}: {
  isOnline: boolean;
  isRemovingThisUser: boolean;
  messageChatId: string | null;
  onRemoveFriend: (userId: string) => unknown;
  userId: string;
  userName: string;
}) {
  return (
    <>
      <ActionDialog
        cancelLabel="Keep friend"
        confirmLabel={isRemovingThisUser ? "Removing..." : "Remove friend"}
        description={`${userName} will no longer be on your friends list. You will still be in any shared groups.`}
        disabled={!isOnline || isRemovingThisUser}
        loading={isRemovingThisUser}
        onConfirm={() => onRemoveFriend(userId)}
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
      <FriendMessageAction chatId={messageChatId} />
    </>
  );
}

function getFriendshipMessageChatId(friendship: FriendListItem) {
  return friendship.privateChat?.id ?? friendship.privateChatId;
}

function isRemovingFriend({
  isRemoving,
  removingFriendId,
  userId,
}: {
  isRemoving: boolean;
  removingFriendId: string | null;
  userId: string;
}) {
  return isRemoving && removingFriendId === userId;
}
