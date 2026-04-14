import { Button } from "@/shared/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { fadeUpItem, staggerContainer } from "../../../constants/motion";
import type { LeafTag } from "../../../data/interests-types";
import { InterestTag } from "./interest-tag";

interface InterestsSuggestProps {
  mbtiType: string;
  suggestedTags: LeafTag[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onContinue: () => void;
}

export function InterestsSuggest({
  mbtiType,
  suggestedTags,
  selectedIds,
  onToggle,
  onContinue,
}: InterestsSuggestProps) {
  const selectedCount = suggestedTags.filter((t) =>
    selectedIds.has(t.id),
  ).length;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center text-center max-w-md mx-auto w-full"
    >
      {/* Icon + overline */}
      <motion.div
        variants={fadeUpItem}
        className="flex flex-col items-center gap-3 mb-4"
      >
        <Zap
          size={22}
          className="text-spark-amber fill-spark-amber"
          strokeWidth={1.5}
        />
        <div className="flex items-center gap-2">
          <span className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-forge-teal">
            Suggested for you
          </span>
          <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-white bg-forge-teal px-2 py-0.5 rounded-full">
            {mbtiType}
          </span>
        </div>
      </motion.div>

      <motion.h2
        variants={fadeUpItem}
        className="font-sans text-display-xs md:text-display-sm font-extrabold leading-tight text-balance mb-2 text-ink"
      >
        Start with what resonates
      </motion.h2>

      <motion.p
        variants={fadeUpItem}
        className="font-sans text-sm leading-relaxed text-slate-muted mb-6 text-pretty"
      >
        Based on your personality. Select the ones that resonate—we&apos;ll
        fine-tune everything next.
      </motion.p>

      {/* Tag cloud */}
      <motion.div
        variants={fadeUpItem}
        className="flex flex-wrap gap-2 justify-center mb-6 w-full"
      >
        {suggestedTags.map((tag, i) => (
          <motion.div
            key={tag.id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.25,
              delay: i * 0.04,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <InterestTag
              tag={tag}
              selected={selectedIds.has(tag.id)}
              onToggle={() => onToggle(tag.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Selection count */}
      <motion.p
        variants={fadeUpItem}
        className="font-sans text-[10px] font-bold uppercase tracking-widest text-slate-muted/50 mb-6"
      >
        {selectedCount} selected so far
      </motion.p>

      {/* CTA */}
      <motion.div variants={fadeUpItem} className="w-full">
        <Button
          size="lg"
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 font-sans text-sm font-bold rounded-xl bg-forge-teal text-white shadow-teal-glow hover:shadow-teal-glow-lg transition duration-200 active:scale-[0.98] h-12"
        >
          Continue to browse all interests
          <ArrowRight size={16} strokeWidth={2.5} />
        </Button>
      </motion.div>
    </motion.div>
  );
}
