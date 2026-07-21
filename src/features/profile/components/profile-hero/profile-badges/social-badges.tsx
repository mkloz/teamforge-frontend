import { SheetTrigger } from "@/shared/components/ui/sheet";
import type { FriendsSheetTab } from "../use-profile-social-summary";
import { ProfileBadgeDivider } from "./profile-badge-divider";
import { ProfileSignal } from "./profile-signal";
import type { SocialBadge } from "./social-badge-model";

export function ProfileSocialBadges({
  badges,
  onOpenFriends,
}: {
  badges: SocialBadge[];
  onOpenFriends?: (tab: FriendsSheetTab) => void;
}) {
  return (
    <div className="hidden sm:contents">
      {badges.map((badge) => (
        <ProfileSocialBadge
          key={badge.tab}
          badge={badge}
          onOpenFriends={onOpenFriends}
        />
      ))}
    </div>
  );
}

function ProfileSocialBadge({
  badge,
  onOpenFriends,
}: {
  badge: SocialBadge;
  onOpenFriends?: (tab: FriendsSheetTab) => void;
}) {
  return (
    <>
      <ProfileBadgeDivider className="hidden sm:block" />
      <SheetTrigger asChild>
        <button
          type="button"
          onClick={() => onOpenFriends?.(badge.tab)}
          className="group min-h-11 min-w-11 rounded text-left transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white [@media(pointer:fine)]:min-h-0 [@media(pointer:fine)]:min-w-0"
        >
          <ProfileSignal
            accent={badge.accent}
            label={badge.label}
            value={badge.value}
          />
        </button>
      </SheetTrigger>
    </>
  );
}
