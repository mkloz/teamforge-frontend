import { motion } from "framer-motion";

import { fadeUpItem } from "@/features/onboarding/constants/motion";

interface LengthSelectorHeaderProps {
  description: string;
  eyebrow: string;
  title: string;
}

export function LengthSelectorHeader({
  description,
  eyebrow,
  title,
}: LengthSelectorHeaderProps) {
  return (
    <>
      <motion.p
        variants={fadeUpItem}
        className="mb-3 text-center font-sans text-xs font-bold uppercase tracking-[0.15em] text-forge-teal"
      >
        {eyebrow}
      </motion.p>

      <motion.h2
        variants={fadeUpItem}
        className="mb-3 text-center font-sans text-2xl font-extrabold leading-tight text-ink sm:text-3xl"
      >
        {title}
      </motion.h2>

      <motion.p
        variants={fadeUpItem}
        className="mx-auto mb-8 max-w-sm text-center font-sans text-sm font-medium leading-relaxed text-muted-foreground sm:text-chat-input"
      >
        {description}
      </motion.p>
    </>
  );
}
