import { motion } from "framer-motion";
import { fadeUpItem } from "@/features/onboarding/constants/motion";

interface InsightSectionProps {
  title: string;
  description: string;
  factTitle: string;
  fact: string;
}

export function InsightSection({
  title,
  description,
  factTitle,
  fact,
}: InsightSectionProps) {
  return (
    <>
      <motion.h2
        variants={fadeUpItem}
        className="mb-4 font-sans text-2xl leading-tight font-black tracking-tight text-ink sm:text-4xl"
      >
        {title}
      </motion.h2>

      <motion.p
        variants={fadeUpItem}
        className="mx-auto mb-7 max-w-xl font-sans text-sm leading-relaxed font-medium text-muted-foreground sm:mb-8 sm:text-chat-input"
      >
        {description}
      </motion.p>

      <motion.div
        variants={fadeUpItem}
        className="mx-auto w-full max-w-xl border-l-2 border-forge-teal/25 py-1 pl-4 text-left sm:pl-6"
      >
        <span className="mb-2 block font-sans text-xs font-bold tracking-[0.14em] text-forge-teal uppercase">
          {factTitle}
        </span>
        <p className="font-sans text-sm leading-relaxed text-muted-foreground">
          {fact}
        </p>
      </motion.div>
    </>
  );
}
