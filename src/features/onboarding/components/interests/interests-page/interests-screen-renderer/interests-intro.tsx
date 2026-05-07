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
        className="mb-4 font-sans text-2xl leading-tight font-extrabold text-balance text-ink sm:text-display-lg"
      >
        What do you love doing?
      </motion.h1>

      <motion.div variants={fadeUpItem}>
        <p className="mb-3 font-sans text-[13px] leading-relaxed font-medium text-pretty text-slate-muted sm:text-sm">
          This is where your profile starts to feel like your real life: the
          hobbies, places, games, scenes, and small obsessions you would
          genuinely make time for.
        </p>
        <p className="mb-6 font-sans text-[13px] leading-relaxed text-pretty text-slate-muted/80 sm:text-sm">
          Pick at least{" "}
          <span className="border-b border-forge-teal/30 font-bold text-ink">
            15 interests
          </span>
          . There are no wrong answers – only honest ones.
        </p>
      </motion.div>

      <motion.div
        variants={fadeUpItem}
        className="mb-6 h-px w-full bg-slate-muted/10"
      />

      <motion.div
        variants={fadeUpItem}
        className="mb-8 flex w-full flex-col gap-4 text-left"
      >
        {BENEFITS.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-3.5">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forge-teal/5">
              <Icon size={14} strokeWidth={2.5} className="text-forge-teal" />
            </div>
            <p className="font-sans text-[13px] leading-relaxed text-slate-muted sm:text-sm">
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
