import { Loader2 } from "lucide-react";
import { useProfilePublicFriends } from "@/features/profile/hooks/use-profile-public-friends";
import { FriendCard } from "./friend-card";
import { FriendMessageAction } from "./friend-message-action";
import { FriendsListEmptyState } from "./friendship-list-helpers";
import { getFriendshipMessageChatId } from "./friendship-list-utils";

interface PublicFriendsListProps {
  userId: string;
}

type PublicFriendship = ReturnType<
  typeof useProfilePublicFriends
>["publicFriends"][number];

export function PublicFriendsList({ userId }: PublicFriendsListProps) {
  const { publicFriends, isLoading, isError } = useProfilePublicFriends(userId);

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
        We couldn't load their friends list right now.
      </div>
    );
  }

  if (publicFriends.length === 0) {
    return (
      <FriendsListEmptyState description="This user hasn't added any friends yet." />
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {publicFriends.map((friendship) => (
        <PublicFriendCard
          key={friendship.counterpart.id}
          friendship={friendship}
        />
      ))}
    </div>
  );
}

function PublicFriendCard({ friendship }: { friendship: PublicFriendship }) {
  const messageChatId = getFriendshipMessageChatId(friendship);

  return (
    <FriendCard
      user={friendship.counterpart}
      actions={<FriendMessageAction chatId={messageChatId} />}
    />
  );
}
