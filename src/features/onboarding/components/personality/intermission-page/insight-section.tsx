import { motion } from "framer-motion";
import { fadeUpItem } from "../../../constants/motion";

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
        className="font-sans text-3xl sm:text-4xl font-black leading-tight mb-4 text-ink tracking-tight"
      >
        {title}
      </motion.h2>

      <motion.p
        variants={fadeUpItem}
        className="font-sans text-sm sm:text-chat-input leading-relaxed mb-8 text-muted-foreground font-medium px-2"
      >
        {description}
      </motion.p>

      <motion.div
        variants={fadeUpItem}
        className="w-full text-left border-l-2 border-forge-teal/20 pl-6 mb-10 py-1"
      >
        <span className="font-sans text-xs font-bold text-ink block mb-2 tracking-tight">
          {factTitle}
        </span>
        <p className="font-sans text-[13px] text-muted-foreground leading-relaxed">
          {fact}
        </p>
      </motion.div>
    </>
  );
}
