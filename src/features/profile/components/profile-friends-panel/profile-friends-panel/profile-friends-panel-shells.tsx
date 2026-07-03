import {
  PublicFriendsPanelContent,
  SelfFriendsPanelContent,
} from "@/features/profile/components/profile-friends-panel/profile-friends-panel/friends-panel-content";
import { FriendsPanelHeader } from "@/features/profile/components/profile-friends-panel/profile-friends-panel/friends-panel-header";
import { getPublicFriendsCopy } from "@/features/profile/components/profile-friends-panel/profile-friends-panel/friends-panel-state";
import {
  PublicFriendsTabs,
  SelfFriendsTabs,
} from "@/features/profile/components/profile-friends-panel/profile-friends-panel/friends-tabs";
import { MyCodeCard } from "@/features/profile/components/profile-friends-panel/profile-friends-panel/my-code-card";
import type { TabValue } from "@/features/profile/components/profile-friends-panel/profile-friends-panel/types";
import type { User } from "@/shared/schemas";

export function PublicProfileFriendsPanel({
  activeTab,
  hasMultipleTabs,
  onTabChange,
  userId,
}: {
  activeTab: TabValue;
  hasMultipleTabs: boolean;
  onTabChange: (tab: TabValue) => void;
  userId: string;
}) {
  const copy = getPublicFriendsCopy(activeTab);

  return (
    <div className="flex flex-col gap-6">
      <FriendsPanelHeader description={copy.description} title={copy.title} />

      {hasMultipleTabs && (
        <PublicFriendsTabs activeTab={activeTab} onTabChange={onTabChange} />
      )}

      <PublicFriendsPanelContent activeTab={activeTab} userId={userId} />
    </div>
  );
}

export function SelfProfileFriendsPanel({
  activeTab,
  onTabChange,
  profileQrUrl,
  user,
}: {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
  profileQrUrl: string;
  user: User;
}) {
  return (
    <div className="flex flex-col gap-6">
      <FriendsPanelHeader
        description="Manage your connections and incoming requests."
        title="Friends"
      />

      <MyCodeCard user={user} url={profileQrUrl} />

      <SelfFriendsTabs activeTab={activeTab} onTabChange={onTabChange} />

      <SelfFriendsPanelContent activeTab={activeTab} />
    </div>
  );
}
