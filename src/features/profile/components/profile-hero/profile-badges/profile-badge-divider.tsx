import { motion } from "framer-motion";

import { profileBadgeItemVariants } from "./profile-badge-animations";

export function ProfileBadgeDivider() {
  return (
    <motion.div
      variants={profileBadgeItemVariants}
      className="w-px h-6 bg-slate-muted/20 rounded-full hidden sm:block"
    />
  );
}
