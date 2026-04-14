import { Button } from "@/shared/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Lock, RefreshCcw } from "lucide-react";
import { TeamForgeLogo } from "../../../../assets/logo";
import { fadeUpItem, staggerContainer } from "../../constants/motion";

interface PersonalityIntroProps {
  onStart: () => void;
}

const BENEFITS = [
  {
    icon: Brain,
    text: "Based on the IPIP – one of the most widely validated personality frameworks in academic psychology.",
  },
  {
    icon: Lock,
    text: "Your results are only used to find compatible people. They are never sold or shared.",
  },
  {
    icon: RefreshCcw,
    text: "You can retake or update your assessment at any time from your profile.",
  },
];

export function PersonalityIntro({ onStart }: PersonalityIntroProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col max-w-md mx-auto w-full gap-0 pt-4 sm:pt-0 h-full justify-start sm:justify-center lg:h-auto"
    >
      {/* Logo */}
      <motion.div variants={fadeUpItem}>
        <TeamForgeLogo
          className="w-10 h-10 mb-5 sm:mb-6 mx-auto"
          showBackground={false}
        />
      </motion.div>

      {/* Overline */}
      <motion.p
        variants={fadeUpItem}
        className="font-sans text-xs font-bold uppercase tracking-[0.2em] mb-4 text-forge-teal text-center"
      >
        Personality Assessment
      </motion.p>

      {/* Headline */}
      <motion.h1
        variants={fadeUpItem}
        className="font-sans text-2xl sm:text-display-lg font-extrabold leading-tight text-balance mb-4 text-ink text-center"
      >
        What makes you, you?
      </motion.h1>

      {/* Body */}
      <motion.div variants={fadeUpItem} className="text-left">
        <p className="font-sans text-sm leading-relaxed text-pretty mb-3 text-slate-500 font-medium indent-8">
          Before we build your group, we want to understand how your mind works
          – the core of your personality.
        </p>
        <p className="font-sans text-xs sm:text-sm leading-relaxed text-pretty mb-6 text-slate-500 indent-8">
          This is the{" "}
          <span className="text-ink font-semibold">IPIP Assessment</span> – a
          scientifically validated framework. The result shapes your group
          matches and gives you a framework for understanding yourself.
        </p>
      </motion.div>

      {/* Divider */}
      <motion.div
        variants={fadeUpItem}
        className="w-full mb-6 h-px bg-slate-100"
      />

      {/* Benefits */}
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

      {/* CTA */}
      <motion.div variants={fadeUpItem} className="w-full">
        <Button
          size="lg"
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 font-sans text-sm font-semibold rounded-xl bg-forge-teal text-white hover:bg-forge-teal/90 shadow-lg shadow-forge-teal/20 transition-all duration-200 active:scale-[0.98] h-12"
        >
          Let's find out
          <ArrowRight size={16} strokeWidth={2.5} />
        </Button>
      </motion.div>
    </motion.div>
  );
}
