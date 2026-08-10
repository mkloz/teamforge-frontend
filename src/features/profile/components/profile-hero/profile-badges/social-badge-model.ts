import type {
  FriendsSheetTab,
  ProfileSocialSummary,
} from "../use-profile-social-summary";

export interface SocialBadge {
  accent?: string;
  label: string;
  tab: FriendsSheetTab;
  value: string;
}

type SocialBadgeConfig = Omit<SocialBadge, "value">;

const SOCIAL_BADGE_CONFIGS = {
  friends: {
    label: "Friends",
    tab: "friends",
  },
  mutualFriends: {
    label: "Mutual Friends",
    tab: "friends",
  },
  publicFriends: {
    label: "Friends",
    tab: "public_friends",
  },
  requests: {
    accent: "text-brand-amber",
    label: "Requests",
    tab: "requests",
  },
} satisfies Record<string, SocialBadgeConfig>;

export function getSocialBadges({
  canShowPublicFriends,
  commonFriendsCount,
  friendsCount,
  isSelf,
  publicFriendsCount,
  requestsCount,
}: ProfileSocialSummary): SocialBadge[] {
  if (isSelf) {
    return getSelfSocialBadges({ friendsCount, requestsCount });
  }

  return getPublicSocialBadges({
    canShowPublicFriends,
    commonFriendsCount,
    publicFriendsCount,
  });
}

function getSelfSocialBadges({
  friendsCount,
  requestsCount,
}: Pick<ProfileSocialSummary, "friendsCount" | "requestsCount">) {
  const badges = [
    createSocialBadge(SOCIAL_BADGE_CONFIGS.friends, friendsCount),
  ];

  if (requestsCount > 0) {
    badges.push(
      createSocialBadge(SOCIAL_BADGE_CONFIGS.requests, requestsCount),
    );
  }

  return badges;
}

function getPublicSocialBadges({
  canShowPublicFriends,
  commonFriendsCount,
  publicFriendsCount,
}: Pick<
  ProfileSocialSummary,
  "canShowPublicFriends" | "commonFriendsCount" | "publicFriendsCount"
>) {
  const badges: SocialBadge[] = [];

  if (canShowPublicFriends) {
    badges.push(
      createSocialBadge(SOCIAL_BADGE_CONFIGS.publicFriends, publicFriendsCount),
    );
  }

  if (commonFriendsCount > 0) {
    badges.push(
      createSocialBadge(SOCIAL_BADGE_CONFIGS.mutualFriends, commonFriendsCount),
    );
  }

  return badges;
}

function createSocialBadge(
  config: SocialBadgeConfig,
  count: number,
): SocialBadge {
  return {
    ...config,
    value: count.toString(),
  };
}
