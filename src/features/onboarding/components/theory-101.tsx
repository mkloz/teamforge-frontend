import { Button } from "@/shared/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { fadeUpItem, staggerContainer } from "../constants/motion";

interface Theory101Props {
  onBack: () => void;
  onNext: () => void;
}

export function Theory101({ onBack, onNext }: Theory101Props) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col max-w-md mx-auto w-full gap-0 h-full justify-center lg:h-auto"
    >
      {/* Overline */}
      <motion.p
        variants={fadeUpItem}
        className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] mb-4 text-center text-forge-teal"
      >
        Personality Theory 101
      </motion.p>

      {/* Headline */}
      <motion.h1
        variants={fadeUpItem}
        className="font-sans text-[2rem] md:text-[2.25rem] font-extrabold leading-tight text-center text-balance mb-8 text-[#1C1C1A]"
      >
        A dimensional baseline
      </motion.h1>

      {/* Body Content */}
      <motion.div variants={fadeUpItem} className="flex flex-col gap-5 mb-8">
        <p className="font-sans text-sm leading-relaxed text-pretty text-slate-500">
          Most generic tests group people into strict categories (like entirely
          a "Thinker" or purely a "Feeler"). But human psychology is much more
          nuanced than that.
        </p>

        <p className="font-sans text-sm leading-relaxed text-pretty text-slate-500">
          That's where the{" "}
          <span className="text-[#1C1C1A] font-medium">
            Big Five (OCEAN) model
          </span>{" "}
          comes in. It doesn't box you in. Instead, it measures exactly where
          you sit on a <i>spectrum</i> for five distinct traits:
        </p>

        <ul className="flex flex-col gap-2 font-sans text-sm text-slate-600 pl-4 border-l-2 border-forge-teal/30 ml-2">
          <li>
            <strong>O</strong>penness to Experience
          </li>
          <li>
            <strong>C</strong>onscientiousness
          </li>
          <li>
            <strong>E</strong>xtraversion
          </li>
          <li>
            <strong>A</strong>greeableness
          </li>
          <li>
            <strong>N</strong>euroticism (Emotional Stability)
          </li>
        </ul>

        <p className="font-sans text-sm leading-relaxed text-pretty text-slate-500">
          Because it measures traits on a continuous scale rather than a binary
          "this or that," the Big Five provides a remarkably accurate
          mathematical map of your working style. It's the gold standard in
          modern psychology, and the foundation of TeamForge.
        </p>
      </motion.div>

      {/* Navigation */}
      <motion.div
        variants={fadeUpItem}
        className="w-full flex items-center gap-3"
      >
        <Button
          size="lg"
          variant="outline"
          onClick={onBack}
          className="flex items-center justify-center gap-2 font-sans text-sm font-semibold rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors duration-200 h-12 w-1/3"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back
        </Button>
        <Button
          size="lg"
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 font-sans text-sm font-semibold rounded-xl bg-forge-teal text-primary-foreground hover:bg-forge-teal-light shadow-[0_4px_16px_rgba(13,148,136,0.25)] hover:shadow-[0_8px_24px_rgba(13,148,136,0.4)] transition duration-200 active:scale-[0.98] h-12"
        >
          Next step
          <ArrowRight size={16} strokeWidth={2.5} />
        </Button>
      </motion.div>
    </motion.div>
  );
}
