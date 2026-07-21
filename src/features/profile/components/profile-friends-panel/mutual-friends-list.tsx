import { Loader2, MessageSquare } from "lucide-react";
import { useProfileCommonFriends } from "@/features/profile/hooks/use-profile-common-friends";
import { Button } from "@/shared/components/ui/button";
import { FriendCard } from "./friend-card";
import { FriendMessageAction } from "./friend-message-action";

interface MutualFriendsListProps {
  userId: string;
}

type MutualFriendship = ReturnType<
  typeof useProfileCommonFriends
>["commonFriends"][number];

export function MutualFriendsList({ userId }: MutualFriendsListProps) {
  const { commonFriends, isLoading, isError, refetchCommonFriends } =
    useProfileCommonFriends(userId);

  if (isLoading) {
    return (
      <div
        className="flex justify-center py-12"
        role="status"
        aria-live="polite"
      >
        <Loader2
          aria-hidden="true"
          className="size-6 animate-spin text-muted-foreground motion-reduce:animate-none"
        />
        <span className="sr-only">Loading mutual friends.</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 py-12 text-center text-muted-foreground text-sm"
        role="alert"
      >
        <p>We couldn't load your mutual friends right now.</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void refetchCommonFriends()}
        >
          Try again
        </Button>
      </div>
    );
  }

  if (commonFriends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border border-dashed py-16 text-center">
        <div className="rounded-full bg-muted/50 p-3">
          <MessageSquare className="size-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 font-bold text-foreground">No mutual friends</h3>
        <p className="mt-1 max-w-sm text-muted-foreground text-sm">
          You don't have any friends in common with this user.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {commonFriends.map((friendship) => (
        <MutualFriendCard
          key={friendship.counterpart.id}
          friendship={friendship}
        />
      ))}
    </div>
  );
}

function MutualFriendCard({ friendship }: { friendship: MutualFriendship }) {
  const messageChatId = getMutualFriendshipMessageChatId(friendship);

  return (
    <FriendCard
      user={friendship.counterpart}
      actions={<FriendMessageAction chatId={messageChatId} />}
    />
  );
}

function getMutualFriendshipMessageChatId(friendship: MutualFriendship) {
  return friendship.privateChat?.id ?? friendship.privateChatId;
}
