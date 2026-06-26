import { Link2, type LucideIcon, UserPlus, Users } from "lucide-react";
import { useProfileCommonFriends } from "@/features/profile/hooks/use-profile-common-friends";
import { useProfileFriendRequests } from "@/features/profile/hooks/use-profile-friend-requests";
import { useProfileFriends } from "@/features/profile/hooks/use-profile-friends";
import { useProfilePublicFriends } from "@/features/profile/hooks/use-profile-public-friends";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { SheetTrigger } from "@/shared/components/ui/sheet";
import type { User } from "@/shared/schemas";

type FriendsSheetTab = "friends" | "requests" | "public_friends";
type SocialStatVariant = "amber" | "mutual" | "teal";

interface ProfileMobileSocialStatsProps {
  user: User;
  onOpenFriends?: (tab: FriendsSheetTab) => void;
}

interface MobileSocialStat {
  count: number;
  Icon: LucideIcon;
  label: string;
  tab: FriendsSheetTab;
  variant: SocialStatVariant;
}

interface MobileSocialStatsInput {
  canShowPublicFriends: boolean;
  commonFriendsCount: number;
  friendsCount: number;
  isSelf: boolean;
  publicFriendsCount: number;
  requestsCount: number;
}

interface MobileSocialQueryScope {
  canShowPublicFriends: boolean;
  commonFriendsUserId: string | undefined;
  publicFriendsUserId: string;
}

type MobileSocialStatConfig = Omit<MobileSocialStat, "count">;

const MOBILE_SOCIAL_STAT_CONFIGS = {
  friends: {
    Icon: Users,
    label: "Friends",
    tab: "friends",
    variant: "teal",
  },
  mutualFriends: {
    Icon: Link2,
    label: "Mutual Friends",
    tab: "friends",
    variant: "mutual",
  },
  publicFriends: {
    Icon: Users,
    label: "Friends",
    tab: "public_friends",
    variant: "teal",
  },
  requests: {
    Icon: UserPlus,
    label: "Requests",
    tab: "requests",
    variant: "amber",
  },
} satisfies Record<string, MobileSocialStatConfig>;

const SOCIAL_STAT_VARIANTS: Record<
  SocialStatVariant,
  { buttonClassName: string; iconContainerClassName: string }
> = {
  amber: {
    buttonClassName:
      "group inline-flex items-center gap-2.5 rounded-full border border-spark-amber/15 bg-spark-amber/5 py-1.5 pr-4 pl-2 transition-all hover:border-spark-amber/30 hover:bg-spark-amber/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-spark-amber active:scale-[0.97]",
    iconContainerClassName:
      "flex size-6 shrink-0 items-center justify-center rounded-full bg-spark-amber/15 text-spark-amber transition-transform group-hover:scale-105",
  },
  mutual: {
    buttonClassName:
      "inline-flex items-center gap-2.5 rounded-full border border-slate-muted/20 bg-canvas py-1.5 pr-4 pl-2 transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    iconContainerClassName:
      "flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-muted/10 text-slate-muted",
  },
  teal: {
    buttonClassName:
      "group inline-flex items-center gap-2.5 rounded-full border border-forge-teal/15 bg-forge-teal/5 py-1.5 pr-4 pl-2 transition-all hover:border-forge-teal/30 hover:bg-forge-teal/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal active:scale-[0.97]",
    iconContainerClassName:
      "flex size-6 shrink-0 items-center justify-center rounded-full bg-forge-teal/15 text-forge-teal transition-transform group-hover:scale-105",
  },
};

function getMobileSocialStats({
  canShowPublicFriends,
  commonFriendsCount,
  friendsCount,
  isSelf,
  publicFriendsCount,
  requestsCount,
}: MobileSocialStatsInput): MobileSocialStat[] {
  if (isSelf) {
    return getSelfMobileSocialStats({ friendsCount, requestsCount });
  }

  return getPublicMobileSocialStats({
    canShowPublicFriends,
    commonFriendsCount,
    publicFriendsCount,
  });
}

function getSelfMobileSocialStats({
  friendsCount,
  requestsCount,
}: Pick<MobileSocialStatsInput, "friendsCount" | "requestsCount">) {
  const stats = [
    createMobileSocialStat(MOBILE_SOCIAL_STAT_CONFIGS.friends, friendsCount),
  ];

  if (requestsCount > 0) {
    stats.push(
      createMobileSocialStat(
        MOBILE_SOCIAL_STAT_CONFIGS.requests,
        requestsCount,
      ),
    );
  }

  return stats;
}

function getPublicMobileSocialStats({
  canShowPublicFriends,
  commonFriendsCount,
  publicFriendsCount,
}: Pick<
  MobileSocialStatsInput,
  "canShowPublicFriends" | "commonFriendsCount" | "publicFriendsCount"
>) {
  const stats: MobileSocialStat[] = [];

  if (canShowPublicFriends) {
    stats.push(
      createMobileSocialStat(
        MOBILE_SOCIAL_STAT_CONFIGS.publicFriends,
        publicFriendsCount,
      ),
    );
  }

  if (commonFriendsCount > 0) {
    stats.push(
      createMobileSocialStat(
        MOBILE_SOCIAL_STAT_CONFIGS.mutualFriends,
        commonFriendsCount,
      ),
    );
  }

  return stats;
}

function createMobileSocialStat(
  config: MobileSocialStatConfig,
  count: number,
): MobileSocialStat {
  return {
    ...config,
    count,
  };
}

interface MobileSocialStatPillProps {
  stat: MobileSocialStat;
  onOpenFriends?: (tab: FriendsSheetTab) => void;
}

function MobileSocialStatPill({
  stat,
  onOpenFriends,
}: MobileSocialStatPillProps) {
  const { buttonClassName, iconContainerClassName } =
    SOCIAL_STAT_VARIANTS[stat.variant];
  const { Icon } = stat;

  return (
    <SheetTrigger asChild>
      <button
        type="button"
        onClick={() => onOpenFriends?.(stat.tab)}
        className={buttonClassName}
      >
        <div className={iconContainerClassName}>
          <Icon className="size-3.5" />
        </div>
        <span className="font-semibold text-ink text-sm">
          {stat.count}{" "}
          <span className="font-medium text-slate-muted">{stat.label}</span>
        </span>
      </button>
    </SheetTrigger>
  );
}

export function ProfileMobileSocialStats({
  user,
  onOpenFriends,
}: ProfileMobileSocialStatsProps) {
  const socialStats = useMobileSocialStats(user);

  if (socialStats.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-border/40 border-t pt-5 sm:hidden">
      {socialStats.map((stat) => (
        <MobileSocialStatPill
          key={stat.tab}
          stat={stat}
          onOpenFriends={onOpenFriends}
        />
      ))}
    </div>
  );
}

function useMobileSocialStats(user: User) {
  const { data: currentUser } = useCurrentUserQuery();
  const isSelf = getIsSelfProfile(currentUser?.id ?? null, user.id);
  const queryScope = getMobileSocialQueryScope(user, isSelf);

  const { friends } = useProfileFriends();
  const { requests } = useProfileFriendRequests();
  const { commonFriends } = useProfileCommonFriends(
    queryScope.commonFriendsUserId,
  );
  const { publicFriends } = useProfilePublicFriends(
    queryScope.publicFriendsUserId,
  );

  return getMobileSocialStats({
    canShowPublicFriends: queryScope.canShowPublicFriends,
    commonFriendsCount: getCollectionCount(commonFriends),
    friendsCount: getCollectionCount(friends),
    isSelf,
    publicFriendsCount: getCollectionCount(publicFriends),
    requestsCount: getCollectionCount(requests),
  });
}

function getMobileSocialQueryScope(
  user: User,
  isSelf: boolean,
): MobileSocialQueryScope {
  const canShowPublicFriends = !isSelf && user.showFriendsListOnProfile;

  return {
    canShowPublicFriends,
    commonFriendsUserId: isSelf ? undefined : user.id,
    publicFriendsUserId: canShowPublicFriends ? user.id : "",
  };
}

function getIsSelfProfile(currentUserId: string | null, profileUserId: string) {
  return currentUserId === profileUserId;
}

function getCollectionCount(collection: { length: number } | null | undefined) {
  return collection?.length ?? 0;
}
