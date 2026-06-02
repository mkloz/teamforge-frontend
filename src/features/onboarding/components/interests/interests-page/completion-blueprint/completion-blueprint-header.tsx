import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";

import { completionFadeUp } from "./completion-blueprint-motion";

export function CompletionBlueprintHeader() {
  return (
    <motion.div variants={completionFadeUp} className="mb-12 text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1 font-bold text-foreground/86 text-xs shadow-sm backdrop-blur-sm">
        <BadgeCheck size={12} aria-hidden="true" />
        All set
      </div>
      <h1 className="font-extrabold font-sans text-4xl text-foreground leading-tight tracking-tight drop-shadow-lg">
        Your TeamForge profile is ready
      </h1>
    </motion.div>
  );
}
