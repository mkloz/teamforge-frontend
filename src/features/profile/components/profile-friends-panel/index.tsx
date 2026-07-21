import {
  getProfileQrUrl,
  getPublicFriendsPanelState,
} from "@/features/profile/components/profile-friends-panel/profile-friends-panel/friends-panel-state";
import {
  PublicProfileFriendsPanel,
  SelfProfileFriendsPanel,
} from "@/features/profile/components/profile-friends-panel/profile-friends-panel/profile-friends-panel-shells";
import type { TabValue } from "@/features/profile/components/profile-friends-panel/profile-friends-panel/types";
import { useProfileCommonFriends } from "@/features/profile/hooks/use-profile-common-friends";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import type { User } from "@/shared/schemas";

export function ProfileFriendsPanel({
  user,
  activeTab,
  onTabChange,
}: {
  user: User;
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
}) {
  const { data: currentUser } = useCurrentUserQuery();
  const isSelf = currentUser?.id === user.id;

  const { commonFriends } = useProfileCommonFriends(
    !isSelf ? user.id : undefined,
  );

  const publicPanelState = getPublicFriendsPanelState({
    commonFriendCount: commonFriends?.length ?? 0,
    isSelf,
    showFriendsListOnProfile: user.showFriendsListOnProfile,
  });
  const profileQrUrl = getProfileQrUrl(user.id);

  if (!isSelf) {
    return (
      <PublicProfileFriendsPanel
        activeTab={activeTab}
        hasMultipleTabs={publicPanelState.hasMultipleTabs}
        onTabChange={onTabChange}
        userId={user.id}
      />
    );
  }

  return (
    <SelfProfileFriendsPanel
      activeTab={activeTab}
      onTabChange={onTabChange}
      profileQrUrl={profileQrUrl}
      user={user}
    />
  );
}
