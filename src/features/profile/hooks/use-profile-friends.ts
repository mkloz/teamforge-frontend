import { useMutation, useQuery } from "@tanstack/react-query";
import { ProfileFriendsCommands } from "@/features/profile/api/profile-friends-commands";
import { ProfileFriendsQueryFactory } from "@/features/profile/api/profile-query-options";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";

export function useProfileFriends() {
  const friendsQuery = useQuery(ProfileFriendsQueryFactory.friends());
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();

  const removeMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't remove this friend right now.",
    },
    mutationKey: ["profile", "friend", "remove"],
    mutationFn: (friendId: string) =>
      ProfileFriendsCommands.removeFriend(friendId),
  });

  async function removeFriend(friendId: string) {
    if (
      guardOfflineAction({
        id: "explore-remove-friend-offline",
        description: "Reconnect before removing a friend.",
      })
    ) {
      return null;
    }

    return removeMutation.mutateAsync(friendId);
  }

  return {
    friends: friendsQuery.data ?? [],
    isLoading: friendsQuery.isLoading,
    isError: friendsQuery.isError,
    removeFriend,
    removingFriendId: removeMutation.variables ?? null,
    isRemoving: removeMutation.isPending,
    isOnline,
  };
}
