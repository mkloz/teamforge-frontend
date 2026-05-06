import { Button } from "@/shared/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Lock, RefreshCw, Users } from "lucide-react";
import {
  fadeUpItem,
  staggerContainer,
} from "@/features/onboarding/constants/motion";

interface InterestsIntroProps {
  backLabel: string;
  onBack: () => void;
  onStart: () => void;
}

const BENEFITS = [
  {
    icon: Users,
    text: "Pick the things you would actually say yes to. The best profile feels honest, not impressive.",
  },
  {
    icon: Lock,
    text: "Your interests are used to shape group ideas. They are not shown as a public checklist.",
  },
  {
    icon: RefreshCw,
    text: "You can update this later as your taste changes.",
  },
];

export function InterestsIntro({
  backLabel,
  onBack,
  onStart,
}: InterestsIntroProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col items-center gap-0 pt-10 text-center sm:min-h-[calc(100dvh-5rem)] sm:pt-12"
    >
      <motion.h1
        variants={fadeUpItem}
        className="font-sans text-2xl sm:text-display-lg font-extrabold leading-tight text-balance mb-4 text-ink"
      >
        What do you love doing?
      </motion.h1>

      <motion.div variants={fadeUpItem}>
        <p className="font-sans text-[13px] sm:text-sm leading-relaxed text-pretty mb-3 text-slate-muted font-medium">
          This is where your profile starts to feel like your real life: the
          hobbies, places, games, scenes, and small obsessions you would
          genuinely make time for.
        </p>
        <p className="font-sans text-[13px] sm:text-sm leading-relaxed text-pretty mb-6 text-slate-muted/80">
          Pick at least{" "}
          <span className="text-ink font-bold border-b border-forge-teal/30">
            15 interests
          </span>
          . There are no wrong answers – only honest ones.
        </p>
      </motion.div>

      <motion.div
        variants={fadeUpItem}
        className="w-full mb-6 h-px bg-slate-muted/10"
      />

      <motion.div
        variants={fadeUpItem}
        className="flex flex-col gap-4 w-full mb-8 text-left"
      >
        {BENEFITS.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-3.5">
            <div className="flex items-center justify-center rounded-xl shrink-0 mt-0.5 w-8 h-8 bg-forge-teal/5">
              <Icon size={14} strokeWidth={2.5} className="text-forge-teal" />
            </div>
            <p className="font-sans text-[13px] sm:text-sm leading-relaxed text-slate-muted">
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
          <span className="truncate">Let&apos;s pick your interests</span>
          <ArrowRight size={16} strokeWidth={2.5} />
        </Button>
      </motion.div>
    </motion.div>
  );
}
