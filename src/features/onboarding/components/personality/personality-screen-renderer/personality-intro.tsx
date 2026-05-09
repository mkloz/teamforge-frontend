import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Brain, Lock, RefreshCcw } from "lucide-react";
import { fadeUpItem } from "@/features/onboarding/constants/motion";
import { Button } from "@/shared/components/ui/button";
import { PersonalityScreenShell } from "./personality-screen-layout";

interface PersonalityIntroProps {
  backLabel: string;
  onBack: () => void;
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

export function PersonalityIntro({
  backLabel,
  onBack,
  onStart,
}: PersonalityIntroProps) {
  return (
    <PersonalityScreenShell className="max-w-md pt-10 sm:pt-12">
      <motion.p
        variants={fadeUpItem}
        className="mb-3 text-center font-bold font-sans text-forge-teal text-xs uppercase tracking-widest"
      >
        Personality Assessment
      </motion.p>

      <motion.h1
        variants={fadeUpItem}
        className="mb-4 text-balance text-center font-extrabold font-sans text-2xl text-ink leading-tight sm:text-display-lg"
      >
        What makes you, you?
      </motion.h1>

      <motion.div variants={fadeUpItem} className="text-left">
        <p className="mb-3 text-pretty font-medium font-sans text-muted-foreground text-sm leading-relaxed sm:text-base">
          Before we build your group, we want to understand how your mind works
          – the core of your personality.
        </p>
        <p className="mb-6 text-pretty font-sans text-muted-foreground text-xs leading-relaxed">
          This is the{" "}
          <span className="font-semibold text-ink">IPIP Assessment</span> – a
          scientifically validated framework. The result shapes your group
          matches and gives you a framework for understanding yourself.
        </p>
      </motion.div>

      <motion.div
        variants={fadeUpItem}
        className="mb-6 h-px w-full bg-slate-100 dark:bg-white/10"
      />

      <motion.div
        variants={fadeUpItem}
        className="mb-8 flex w-full flex-col gap-4 text-left"
      >
        {BENEFITS.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-3.5">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-forge-teal/10">
              <Icon size={14} strokeWidth={2.5} className="text-forge-teal" />
            </div>
            <p className="font-sans text-muted-foreground text-xs leading-relaxed">
              {text}
            </p>
          </div>
        ))}
      </motion.div>

      <motion.div
        variants={fadeUpItem}
        className="mt-auto flex w-full flex-col-reverse items-stretch gap-3 pt-6 min-[430px]:flex-row min-[430px]:items-center"
      >
        <Button
          size="md"
          variant="outline"
          onClick={onBack}
          className="w-full min-w-0 px-4 min-[430px]:w-auto min-[430px]:shrink-0"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          <span className="truncate">{backLabel}</span>
        </Button>
        <Button
          size="md"
          onClick={onStart}
          className="flex w-full min-w-0 items-center justify-center gap-2 min-[430px]:flex-1"
        >
          <span className="truncate">Let's find out</span>
          <ArrowRight size={16} strokeWidth={2.5} />
        </Button>
      </motion.div>
    </PersonalityScreenShell>
  );
}
