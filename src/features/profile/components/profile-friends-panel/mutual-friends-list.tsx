import { MessageSquare } from "lucide-react";
import { useProfileCommonFriends } from "@/features/profile/hooks/use-profile-common-friends";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Spinner } from "@/shared/components/ui/spinner";
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
        <Spinner aria-hidden="true" className="size-6 text-muted-foreground" />
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
      <EmptyState
        icon={MessageSquare}
        title="No mutual friends"
        description="People you both know will appear here."
      />
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
