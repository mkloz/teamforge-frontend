import { Button } from "@/shared/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Globe2,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import { fadeUpItem, staggerContainer } from "../../constants/motion";

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
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col max-w-md mx-auto w-full gap-0 h-full justify-start pt-4 sm:pt-0 sm:justify-center lg:h-auto"
    >
      {/* Overline */}
      <motion.p
        variants={fadeUpItem}
        className="font-sans text-xs font-bold uppercase tracking-[0.15em] mb-4 text-forge-teal text-center"
      >
        Before you begin
      </motion.p>

      {/* Headline */}
      <motion.h1
        variants={fadeUpItem}
        className="font-sans text-display-xs sm:text-display-sm font-extrabold leading-tight text-balance mb-6 text-ink text-center"
      >
        Keep in mind
      </motion.h1>

      <motion.p
        variants={fadeUpItem}
        className="font-sans text-sm sm:text-base text-muted-foreground mb-8 leading-relaxed font-medium text-center"
      >
        It can be hard to find your actual personality underneath all the layers
        of expectations. To get the best results:
      </motion.p>

      {/* Guidelines */}
      <motion.div
        variants={fadeUpItem}
        className="flex flex-col gap-5 mb-10 w-full pl-2 sm:pl-4"
      >
        {GUIDELINES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-4">
            <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-forge-teal/10 text-forge-teal mt-0.5">
              <Icon size={16} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col gap-1 text-left">
              <span className="font-sans text-sm font-bold text-ink leading-tight">
                {title}
              </span>
              <p className="font-sans text-sm text-muted-foreground font-medium leading-relaxed max-w-sm">
                {text}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Navigation */}
      <motion.div
        variants={fadeUpItem}
        className="w-full flex items-center gap-3"
      >
        <Button size="lg" variant="outline" onClick={onBack} className="w-1/3">
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back
        </Button>
        <Button size="lg" onClick={onNext} className="flex-1">
          Next step
          <ArrowRight size={16} strokeWidth={2.5} />
        </Button>
      </motion.div>
    </motion.div>
  );
}
