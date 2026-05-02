import { motion } from "framer-motion";

import { TooltipProvider } from "@/shared/components/ui/tooltip";
import type { User } from "@/shared/schemas";

import {
  profileBadgeItemVariants,
  profileBadgesContainerVariants,
} from "./profile-badge-animations";
import { ProfileBadgeDivider } from "./profile-badge-divider";
import { ProfileBadgeItem } from "./profile-badge-item";
import { buildProfileBadges } from "./profile-badge-models";

interface ProfileBadgesProps {
  archetype: string;
  user: User;
}

export function ProfileBadges({ user, archetype }: ProfileBadgesProps) {
  const badges = buildProfileBadges(user, archetype);

  return (
    <TooltipProvider delayDuration={200}>
      <motion.div
        variants={profileBadgesContainerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center gap-4 md:gap-5 shrink-0 flex-wrap justify-center md:justify-start"
      >
        {badges.map((badge, index) => (
          <ProfileBadgeEntry
            key={badge.id}
            badge={badge}
            showDivider={index > 0}
          />
        ))}
      </motion.div>
    </TooltipProvider>
  );
}

interface ProfileBadgeEntryProps {
  badge: ReturnType<typeof buildProfileBadges>[number];
  showDivider: boolean;
}

function ProfileBadgeEntry({ badge, showDivider }: ProfileBadgeEntryProps) {
  return (
    <>
      {showDivider && <ProfileBadgeDivider />}
      <motion.div variants={profileBadgeItemVariants}>
        <ProfileBadgeItem badge={badge} />
      </motion.div>
    </>
  );
}
