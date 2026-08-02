import { normalizeTrustScore } from "@/shared/lib/user-psychometrics";
import type { User } from "@/shared/schemas";
import {
  type FriendsSheetTab,
  useProfileSocialSummary,
} from "../use-profile-social-summary";
import { ProfileBadgeDivider } from "./profile-badge-divider";
import { RoleBadge } from "./role-badge";
import { getSocialBadges } from "./social-badge-model";
import { ProfileSocialBadges } from "./social-badges";
import { TrustBadge } from "./trust-badge";
import { TypeBadge } from "./type-badge";

interface ProfileBadgesProps {
  archetype: string;
  user: User;
  onOpenFriends?: (tab: FriendsSheetTab) => void;
}

export function ProfileBadges({
  user,
  archetype,
  onOpenFriends,
}: ProfileBadgesProps) {
  const trustScore = normalizeTrustScore(user.trustScore);
  const reputationSummary = user.reputationSummary ?? {
    calculationVersion: "legacy-trust-score-v1",
    displayScore: trustScore,
    distinctCounterpartyCount: 0,
    eligiblePlanCount: 0,
    evidenceState: "LIMITED" as const,
    evidenceThrough: null,
    hasOpenCorrection: false,
    updatedAt: null,
  };
  const groupMode = archetype.replace(/^The\s+/i, "");
  const socialBadgeInput = useProfileSocialSummary(user);
  const socialBadges = getSocialBadges(socialBadgeInput);

  return (
    <div className="flex w-full shrink-0 flex-wrap items-center justify-start gap-x-3 gap-y-3 sm:w-auto sm:gap-4 sm:gap-y-4">
      <TrustBadge summary={reputationSummary} />

      <ProfileBadgeDivider />

      <TypeBadge personalityType={user.personalityType ?? null} />

      <ProfileBadgeDivider />

      <RoleBadge archetype={archetype} groupMode={groupMode} />

      <ProfileSocialBadges
        badges={socialBadges}
        onOpenFriends={onOpenFriends}
      />
    </div>
  );
}
