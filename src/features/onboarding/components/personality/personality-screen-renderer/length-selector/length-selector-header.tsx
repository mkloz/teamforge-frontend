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
        className="mb-3 text-center font-sans text-xs font-bold tracking-[0.15em] text-forge-teal uppercase"
      >
        {eyebrow}
      </motion.p>

      <motion.h2
        variants={fadeUpItem}
        className="mb-3 text-center font-sans text-2xl leading-tight font-extrabold text-ink sm:text-3xl"
      >
        {title}
      </motion.h2>

      <motion.p
        variants={fadeUpItem}
        className="mx-auto mb-8 max-w-sm text-center font-sans text-sm leading-relaxed font-medium text-muted-foreground sm:text-chat-input"
      >
        {description}
      </motion.p>
    </>
  );
}
