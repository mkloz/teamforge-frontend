import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";

import { completionFadeUp } from "./completion-blueprint-motion";

export function CompletionBlueprintHeader() {
  return (
    <motion.div variants={completionFadeUp} className="mb-12 text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[10px] font-bold tracking-[0.26em] text-foreground/86 uppercase shadow-sm backdrop-blur-sm">
        <BadgeCheck size={12} aria-hidden="true" />
        All set
      </div>
      <h1 className="font-sans text-4xl leading-tight font-extrabold tracking-tight text-foreground drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
        Your TeamForge profile is ready
      </h1>
    </motion.div>
  );
}
