import { useProfileCommonFriends } from "@/features/profile/hooks/use-profile-common-friends";
import { useProfileFriendRequests } from "@/features/profile/hooks/use-profile-friend-requests";
import { useProfileFriends } from "@/features/profile/hooks/use-profile-friends";
import { useProfilePublicFriends } from "@/features/profile/hooks/use-profile-public-friends";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import type { User } from "@/shared/schemas";

export type FriendsSheetTab = "friends" | "requests" | "public_friends";

export interface ProfileSocialSummary {
  canShowPublicFriends: boolean;
  commonFriendsCount: number;
  friendsCount: number;
  isSelf: boolean;
  publicFriendsCount: number;
  requestsCount: number;
}

interface ProfileSocialQueryScope {
  canShowPublicFriends: boolean;
  commonFriendsUserId: string | undefined;
  publicFriendsUserId: string;
}

export function useProfileSocialSummary(user: User): ProfileSocialSummary {
  const { data: currentUser } = useCurrentUserQuery();
  const isSelf = currentUser?.id === user.id;
  const queryScope = getProfileSocialQueryScope(user, isSelf);

  const { friends } = useProfileFriends();
  const { requests } = useProfileFriendRequests();
  const { commonFriends } = useProfileCommonFriends(
    queryScope.commonFriendsUserId,
  );
  const { publicFriends } = useProfilePublicFriends(
    queryScope.publicFriendsUserId,
  );

  return {
    canShowPublicFriends: queryScope.canShowPublicFriends,
    commonFriendsCount: getCollectionCount(commonFriends),
    friendsCount: getCollectionCount(friends),
    isSelf,
    publicFriendsCount: getCollectionCount(publicFriends),
    requestsCount: getCollectionCount(requests),
  };
}

function getProfileSocialQueryScope(
  user: User,
  isSelf: boolean,
): ProfileSocialQueryScope {
  const canShowPublicFriends = !isSelf && user.showFriendsListOnProfile;

  return {
    canShowPublicFriends,
    commonFriendsUserId: isSelf ? undefined : user.id,
    publicFriendsUserId: canShowPublicFriends ? user.id : "",
  };
}

function getCollectionCount(collection: { length: number } | null | undefined) {
  return collection?.length ?? 0;
}
