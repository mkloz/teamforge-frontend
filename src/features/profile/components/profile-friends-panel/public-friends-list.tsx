import { Loader2, Users } from "lucide-react";
import { useProfilePublicFriends } from "@/features/profile/hooks/use-profile-public-friends";
import { FriendCard } from "./friend-card";
import { FriendMessageAction } from "./friend-message-action";

interface PublicFriendsListProps {
  userId: string;
}

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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border border-dashed py-16 text-center">
        <div className="rounded-full bg-muted/50 p-3">
          <Users className="size-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 font-bold text-foreground">No friends yet</h3>
        <p className="mt-1 max-w-sm text-muted-foreground text-sm">
          This user hasn't added any friends yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {publicFriends.map((friendship) => {
        const user = friendship.counterpart;
        const messageChatId =
          friendship.privateChat?.id ?? friendship.privateChatId;

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
            actions={<FriendMessageAction chatId={messageChatId} />}
          />
        );
      })}
    </div>
  );
}
