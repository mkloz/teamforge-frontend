import { Link } from "@tanstack/react-router";
import { Loader2, MessageSquare } from "lucide-react";
import { useProfileCommonFriends } from "@/features/profile/hooks/use-profile-common-friends";
import { Button } from "@/shared/components/ui/button";
import { FriendCard } from "./friend-card";

interface MutualFriendsListProps {
  userId: string;
}

export function MutualFriendsList({ userId }: MutualFriendsListProps) {
  const { commonFriends, isLoading, isError } = useProfileCommonFriends(userId);

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
        We couldn't load your mutual friends right now.
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
      {commonFriends.map((friendship) => {
        const user = friendship.counterpart;

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
            }
          />
        );
      })}
    </div>
  );
}
