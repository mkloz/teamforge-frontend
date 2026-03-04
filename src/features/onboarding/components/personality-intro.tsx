import { Button } from "@/shared/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Lock, RefreshCcw } from "lucide-react";
import { TeamForgeLogo } from "../../../assets/logo";
import { fadeUpItem, staggerContainer } from "../constants/motion";

interface PersonalityIntroProps {
  onStart: () => void;
}

const BENEFITS = [
  {
    icon: Brain,
    text: "Based on the IPIP — one of the most widely validated personality frameworks in academic psychology.",
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
      className="flex flex-col items-center text-center max-w-md mx-auto w-full gap-0"
    >
      {/* Logo */}
      <motion.div variants={fadeUpItem}>
        <TeamForgeLogo
          className="w-10 h-10 mb-6 mx-auto"
          showBackground={false}
        />
      </motion.div>

      {/* Overline */}
      <motion.p
        variants={fadeUpItem}
        className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] mb-4 text-forge-teal"
      >
        Personality Assessment
      </motion.p>

      {/* Headline */}
      <motion.h1
        variants={fadeUpItem}
        className="font-sans text-[2rem] md:text-[2.5rem] font-extrabold leading-tight text-balance mb-4 text-[#1C1C1A]"
      >
        What makes you, you?
      </motion.h1>

      {/* Body */}
      <motion.div variants={fadeUpItem}>
        <p className="font-sans text-sm leading-relaxed text-pretty mb-2 text-slate-500">
          Before we build your group, we want to understand how your mind works
          — not your job title, not your hobbies, not your mood today.
        </p>
        <p className="font-sans text-sm leading-relaxed text-pretty mb-6 text-slate-500">
          This is the{" "}
          <span className="text-[#1C1C1A] font-medium">
            International Personality Item Pool (IPIP)
          </span>{" "}
          — a scientifically validated assessment used in peer-reviewed
          psychology research worldwide. Your scores place you in a
          five-dimensional personality space. The result shapes every group you
          will ever be matched into, and gives you a framework for understanding
          yourself that goes far beyond a label.
        </p>
      </motion.div>

      {/* Divider */}
      <motion.div
        variants={fadeUpItem}
        className="w-full mb-6 h-px bg-slate-200"
      />

      {/* Benefits */}
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

      {/* CTA */}
      <motion.div variants={fadeUpItem} className="w-full">
        <Button
          size="lg"
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 font-sans text-sm font-semibold rounded-xl bg-forge-teal text-primary-foreground hover:bg-forge-teal-light shadow-[0_4px_16px_rgba(13,148,136,0.25)] hover:shadow-[0_8px_24px_rgba(13,148,136,0.4)] transition duration-200 active:scale-[0.98] h-12"
        >
          Let's find out
          <ArrowRight size={16} strokeWidth={2.5} />
        </Button>
      </motion.div>
    </motion.div>
  );
}
