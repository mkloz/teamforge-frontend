import { motion } from "framer-motion";
import { Eye, Globe2, ShieldCheck, UserCircle } from "lucide-react";
import { fadeUpItem } from "@/features/onboarding/constants/motion";
import {
  PersonalityScreenShell,
  StepNavigation,
} from "./personality-screen-layout";

interface KeepInMindProps {
  onBack: () => void;
  onNext: () => void;
}

const GUIDELINES = [
  {
    icon: ShieldCheck,
    title: "Be your authentic self",
    text: "Answer as your true self, not who you feel pressured to be at work or by society.",
  },
  {
    icon: Eye,
    title: "Nobody is watching",
    text: "Notice which answer you'd pick if no one was here to judge you.",
  },
  {
    icon: Globe2,
    title: "Think broadly",
    text: "Consider how you act across your whole life, not just in specific stressful situations.",
  },
  {
    icon: UserCircle,
    title: "Compare to the average",
    text: "Compare yourself to an average person, not a world-class expert in a specific skill.",
  },
];

export function KeepInMind({ onBack, onNext }: KeepInMindProps) {
  return (
    <PersonalityScreenShell className="max-w-md">
      <motion.p
        variants={fadeUpItem}
        className="mb-3 text-center font-bold font-sans text-forge-teal text-xs"
      >
        Before you begin
      </motion.p>

      <motion.h1
        variants={fadeUpItem}
        className="mb-5 text-balance text-center font-extrabold font-sans text-display-xs text-ink leading-tight sm:text-display-sm"
      >
        Answer as yourself
      </motion.h1>

      <motion.p
        variants={fadeUpItem}
        className="mb-7 text-center font-medium font-sans text-muted-foreground text-sm leading-relaxed sm:text-base"
      >
        A quick reminder before the questions: answer from ordinary life, not
        from the version of yourself you think you should be.
      </motion.p>

      <motion.div
        variants={fadeUpItem}
        className="mb-8 flex w-full flex-col gap-4 pl-1 sm:pl-3"
      >
        {GUIDELINES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3.5">
            <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-forge-teal/10 text-forge-teal">
              <Icon size={14} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col gap-0.5 text-left">
              <span className="font-bold font-sans text-ink text-sm leading-tight">
                {title}
              </span>
              <p className="max-w-sm font-medium font-sans text-muted-foreground text-sm leading-relaxed">
                {text}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      <StepNavigation
        backLabel="Back to theory"
        onBack={onBack}
        onNext={onNext}
        nextLabel="Choose test length"
        backClassName="w-auto shrink-0 px-4"
      />
    </PersonalityScreenShell>
  );
}
