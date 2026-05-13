import { motion } from "framer-motion";

import { profileBadgeItemVariants } from "./profile-badge-animations";

export function ProfileBadgeDivider() {
  return (
    <motion.div
      variants={profileBadgeItemVariants}
      className="h-6 w-px rounded-full bg-slate-muted/20"
    />
  );
}
