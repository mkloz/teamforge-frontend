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
    const stats: MobileSocialStat[] = [
      {
        count: friendsCount,
        Icon: Users,
        label: "Friends",
        tab: "friends",
        variant: "teal",
      },
    ];

    if (requestsCount > 0) {
      stats.push({
        count: requestsCount,
        Icon: UserPlus,
        label: "Requests",
        tab: "requests",
        variant: "amber",
      });
    }

    return stats;
  }

  const stats: MobileSocialStat[] = [];

  if (canShowPublicFriends) {
    stats.push({
      count: publicFriendsCount,
      Icon: Users,
      label: "Friends",
      tab: "public_friends",
      variant: "teal",
    });
  }

  if (commonFriendsCount > 0) {
    stats.push({
      count: commonFriendsCount,
      Icon: Link2,
      label: "Mutual Friends",
      tab: "friends",
      variant: "mutual",
    });
  }

  return stats;
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
  const { data: currentUser } = useCurrentUserQuery();
  const isSelf = currentUser?.id === user.id;

  const { friends } = useProfileFriends();
  const { requests } = useProfileFriendRequests();
  const { commonFriends } = useProfileCommonFriends(
    !isSelf ? user.id : undefined,
  );
  const { publicFriends } = useProfilePublicFriends(
    !isSelf && user.showFriendsListOnProfile ? user.id : "",
  );

  const friendsCount = friends?.length ?? 0;
  const requestsCount = requests?.length ?? 0;
  const commonFriendsCount = commonFriends?.length ?? 0;
  const publicFriendsCount = publicFriends?.length ?? 0;

  const canShowPublicFriends = !isSelf && user.showFriendsListOnProfile;
  const socialStats = getMobileSocialStats({
    canShowPublicFriends,
    commonFriendsCount,
    friendsCount,
    isSelf,
    publicFriendsCount,
    requestsCount,
  });

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
