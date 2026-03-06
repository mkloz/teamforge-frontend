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
      className="flex flex-col items-center text-center max-w-md mx-auto w-full gap-0"
    >
      <motion.div variants={fadeUpItem}>
        <TeamForgeLogo
          className="w-10 h-10 mb-6 mx-auto"
          showBackground={false}
        />
      </motion.div>

      <motion.p
        variants={fadeUpItem}
        className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] mb-2 text-forge-teal"
      >
        Step 2 of 2 · Interests
      </motion.p>

      <motion.h1
        variants={fadeUpItem}
        className="font-sans text-[2rem] md:text-[2.5rem] font-extrabold leading-tight text-balance mb-4 text-[#1C1C1A]"
      >
        What do you love doing?
      </motion.h1>

      <motion.div variants={fadeUpItem}>
        <p className="font-sans text-sm leading-relaxed text-pretty mb-2 text-slate-500">
          Interests are the second dimension of your matching profile. They
          power the activities your group gets recommended – hiking, jazz clubs,
          hackathons, dinner parties.
        </p>
        <p className="font-sans text-sm leading-relaxed text-pretty mb-6 text-slate-500">
          Pick at least{" "}
          <span className="text-[#1C1C1A] font-medium">
            10 that genuinely reflect you
          </span>
          . There are no wrong answers – only honest ones.
        </p>
      </motion.div>

      <motion.div
        variants={fadeUpItem}
        className="w-full mb-6 h-px bg-slate-200"
      />

      <motion.div
        variants={fadeUpItem}
        className="flex flex-col gap-3 w-full mb-8 text-left"
      >
        {BENEFITS.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-3">
            <div className="flex items-center justify-center rounded-lg shrink-0 mt-0.5 w-7 h-7 bg-forge-teal/10">
              <Icon size={14} strokeWidth={2} className="text-forge-teal" />
            </div>
            <p className="font-sans text-sm leading-relaxed text-slate-500">
              {text}
            </p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUpItem} className="w-full">
        <Button
          size="lg"
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 font-sans text-sm font-semibold rounded-xl bg-forge-teal text-primary-foreground hover:bg-forge-teal-light shadow-[0_4px_16px_rgba(13,148,136,0.25)] hover:shadow-[0_8px_24px_rgba(13,148,136,0.4)] transition duration-200 active:scale-[0.98] h-12"
        >
          Let&apos;s pick your interests
          <ArrowRight size={16} strokeWidth={2.5} />
        </Button>
      </motion.div>
    </motion.div>
  );
}
