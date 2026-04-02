import { Button } from "@/shared/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Sparkles, Users } from "lucide-react";
import { TeamForgeLogo } from "../../../../../assets/logo";
import { fadeUpItem, staggerContainer } from "../../../constants/motion";

interface InterestsIntroProps {
  onStart: () => void;
}

const BENEFITS = [
  {
    icon: Users,
    text: "Your interests shape every group recommendation – the more accurate they are, the better your matches.",
  },
  {
    icon: Lock,
    text: "Interest data is used only for matching. It is never sold, shared, or visible to other users.",
  },
  {
    icon: Sparkles,
    text: "You can update your interests at any time from your profile – the algorithm adapts immediately.",
  },
];

export function InterestsIntro({ onStart }: InterestsIntroProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center text-center max-w-md mx-auto w-full gap-0 pt-4 sm:pt-0"
    >
      <motion.div variants={fadeUpItem}>
        <TeamForgeLogo
          className="w-10 h-10 mb-5 sm:mb-6 mx-auto"
          showBackground={false}
        />
      </motion.div>

      <motion.p
        variants={fadeUpItem}
        className="font-sans text-[10px] sm:text-micro font-bold uppercase tracking-[0.2em] mb-3 text-forge-teal"
      >
        Step 2 of 2 · Interests
      </motion.p>

      <motion.h1
        variants={fadeUpItem}
        className="font-sans text-2xl sm:text-display-lg font-extrabold leading-tight text-balance mb-4 text-ink"
      >
        What do you love doing?
      </motion.h1>

      <motion.div variants={fadeUpItem}>
        <p className="font-sans text-xs sm:text-sm leading-relaxed text-pretty mb-3 text-slate-500 font-medium">
          Interests are the second dimension of your profile. They power the
          activities your group gets recommended.
        </p>
        <p className="font-sans text-xs sm:text-sm leading-relaxed text-pretty mb-6 text-slate-500">
          Pick at least{" "}
          <span className="text-ink font-semibold">10 interests</span>. There
          are no wrong answers – only honest ones.
        </p>
      </motion.div>

      <motion.div
        variants={fadeUpItem}
        className="w-full mb-6 h-px bg-slate-100"
      />

      <motion.div
        variants={fadeUpItem}
        className="flex flex-col gap-4 w-full mb-8 text-left"
      >
        {BENEFITS.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-3.5">
            <div className="flex items-center justify-center rounded-xl shrink-0 mt-0.5 w-8 h-8 bg-forge-teal/10">
              <Icon size={14} strokeWidth={2.5} className="text-forge-teal" />
            </div>
            <p className="font-sans text-xs sm:text-sm leading-relaxed text-slate-500">
              {text}
            </p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUpItem} className="w-full">
        <Button
          size="lg"
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 font-sans text-sm font-semibold rounded-xl bg-forge-teal text-white hover:bg-forge-teal/90 shadow-lg shadow-forge-teal/20 transition-all duration-200 active:scale-[0.98] h-12"
        >
          Let&apos;s pick your interests
          <ArrowRight size={16} strokeWidth={2.5} />
        </Button>
      </motion.div>
    </motion.div>
  );
}
