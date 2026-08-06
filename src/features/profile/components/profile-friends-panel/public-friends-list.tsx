import { useProfilePublicFriends } from "@/features/profile/hooks/use-profile-public-friends";
import { Spinner } from "@/shared/components/ui/spinner";
import { FriendCard } from "./friend-card";
import { FriendsListEmptyState } from "./friendship-list-helpers";

interface PublicFriendsListProps {
  userId: string;
}

export function PublicFriendsList({ userId }: PublicFriendsListProps) {
  const { publicFriends, isLoading, isError } = useProfilePublicFriends(userId);

  if (isLoading) {
    return (
      <div
        className="flex justify-center py-12"
        role="status"
        aria-live="polite"
      >
        <Spinner aria-hidden="true" className="size-6 text-muted-foreground" />
        <span className="sr-only">Loading friends.</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="flex justify-center py-12 text-center text-muted-foreground text-sm"
        role="alert"
      >
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
      {publicFriends.map((friend) => (
        <FriendCard key={friend.id} user={friend} />
      ))}
    </div>
  );
}
