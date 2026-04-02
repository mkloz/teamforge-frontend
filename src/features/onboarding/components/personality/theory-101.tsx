import { Button } from "@/shared/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { fadeUpItem, staggerContainer } from "../../constants/motion";

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
      className="flex flex-col max-w-lg mx-auto w-full gap-0 h-full justify-start pt-4 sm:pt-0 sm:justify-center lg:h-auto"
    >
      {/* Overline */}
      <motion.p
        variants={fadeUpItem}
        className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-forge-teal text-center"
      >
        Personality Theory 101
      </motion.p>

      {/* Headline */}
      <motion.h1
        variants={fadeUpItem}
        className="font-sans text-[1.75rem] sm:text-3xl font-extrabold leading-tight text-balance mb-6 sm:mb-8 text-ink text-center"
      >
        A dimensional baseline
      </motion.h1>

      {/* Body Content */}
      <motion.div
        variants={fadeUpItem}
        className="flex flex-col gap-6 mb-10 leading-relaxed px-1 text-left"
      >
        <p className="font-sans text-sm sm:text-chat-input text-slate-600 font-medium indent-8">
          Most generic tests group people into strict categories (like entirely
          a "Thinker" or purely a "Feeler"). But human psychology is much more
          nuanced than that.
        </p>

        <div className="space-y-4">
          <p className="font-sans text-sm sm:text-chat-input leading-relaxed text-pretty text-slate-500">
            That's where the{" "}
            <span className="text-ink font-bold">Big Five (OCEAN) model</span>{" "}
            comes in. Instead of boxing you in, it measures exactly where you
            sit on a <i className="text-slate-600 font-medium">spectrum</i> for
            five distinct traits:
          </p>

          <ul className="flex flex-col gap-3 font-sans text-sm sm:text-chat-input text-slate-700 pl-5 border-l-2 border-forge-teal/30 ml-4 py-1">
            <li className="flex items-center gap-2.5">
              <span className="font-black text-forge-teal w-4">O</span>
              <span>Openness to Experience</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="font-black text-forge-teal w-4">C</span>
              <span>Conscientiousness</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="font-black text-forge-teal w-4">E</span>
              <span>Extraversion</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="font-black text-forge-teal w-4">A</span>
              <span>Agreeableness</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="font-black text-forge-teal w-4">N</span>
              <span>Neuroticism (Stability)</span>
            </li>
          </ul>
        </div>

        <p className="font-sans text-sm sm:text-chat-input text-slate-500 opacity-90 leading-relaxed indent-8">
          By measuring traits on a continuous scale, the Big Five provides a
          remarkably accurate mathematical map of your personality. It's the
          gold standard in modern psychology, and the foundation of TeamForge.
        </p>
      </motion.div>

      {/* Navigation */}
      <motion.div
        variants={fadeUpItem}
        className="w-full flex items-center gap-3 mt-auto sm:mt-0 pt-6 sm:pt-0"
      >
        <Button
          size="lg"
          variant="outline"
          onClick={onBack}
          className="flex items-center justify-center gap-2 font-sans text-sm font-bold rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors duration-200 h-12 w-1/3 active:scale-[0.98]"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back
        </Button>
        <Button
          size="lg"
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 font-sans text-sm font-bold rounded-xl bg-forge-teal text-white hover:bg-forge-teal/90 shadow-lg shadow-forge-teal/20 transition-all duration-200 active:scale-[0.98] h-12"
        >
          Next step
          <ArrowRight size={16} strokeWidth={2.5} />
        </Button>
      </motion.div>
    </motion.div>
  );
}
