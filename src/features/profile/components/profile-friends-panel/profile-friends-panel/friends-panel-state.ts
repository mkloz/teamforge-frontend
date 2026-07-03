import { Link2, UserPlus, Users } from "lucide-react";
import type {
  FriendsPanelTabItem,
  TabValue,
} from "@/features/profile/components/profile-friends-panel/profile-friends-panel/types";
import { getCurrentBrowserOrigin } from "@/shared/lib/browser-capabilities";
import { buildPublicProfilePath } from "@/shared/navigation/profile-navigation";
import type { User } from "@/shared/schemas";

const PUBLIC_FRIENDS_COPY: Record<
  "friends" | "public_friends",
  { description: string; title: string }
> = {
  friends: {
    title: "Mutual Friends",
    description: "People you both know.",
  },
  public_friends: {
    title: "Friends",
    description: "Their friends list.",
  },
};

export const PUBLIC_FRIENDS_TAB_ITEMS = [
  {
    Icon: Link2,
    label: "Mutual Friends",
    value: "friends",
  },
  {
    Icon: Users,
    label: "Friends",
    value: "public_friends",
  },
] as const satisfies readonly FriendsPanelTabItem[];

export const SELF_FRIENDS_TAB_ITEMS = [
  {
    Icon: Users,
    label: "My Friends",
    value: "friends",
  },
  {
    Icon: UserPlus,
    label: "Requests",
    value: "requests",
  },
] as const satisfies readonly FriendsPanelTabItem[];

export function getPublicFriendsCopy(activeTab: TabValue) {
  return activeTab === "friends"
    ? PUBLIC_FRIENDS_COPY.friends
    : PUBLIC_FRIENDS_COPY.public_friends;
}

export function getPublicFriendsPanelState({
  commonFriendCount,
  isSelf,
  showFriendsListOnProfile,
}: {
  commonFriendCount: number;
  isSelf: boolean;
  showFriendsListOnProfile: boolean;
}) {
  if (isSelf) {
    return { hasMultipleTabs: true };
  }

  return {
    hasMultipleTabs: showFriendsListOnProfile && commonFriendCount > 0,
  };
}

export function getProfileQrUrl(userId: string) {
  return `${getCurrentBrowserOrigin()}${buildPublicProfilePath(userId, {
    intent: "connect",
  })}`;
}

export function getProfileQrHandle(name: User["name"]) {
  return `@${name.replace(/\s/g, "").toLowerCase()}`;
}
