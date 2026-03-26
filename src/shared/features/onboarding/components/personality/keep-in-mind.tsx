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
      className="flex flex-col max-w-md mx-auto w-full gap-0 h-full justify-center lg:h-auto"
    >
      {/* Overline */}
      <motion.p
        variants={fadeUpItem}
        className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] mb-4 text-forge-teal text-center"
      >
        Before you begin
      </motion.p>

      {/* Headline */}
      <motion.h1
        variants={fadeUpItem}
        className="font-sans text-[2rem] md:text-[2.5rem] font-extrabold leading-tight text-balance mb-6 text-[#1C1C1A] text-center"
      >
        Keep in mind
      </motion.h1>

      <motion.p
        variants={fadeUpItem}
        className="font-sans text-sm text-slate-500 mb-8 leading-relaxed text-center"
      >
        It can be hard to find your actual personality underneath all the layers
        of expectations. To get the best results:
      </motion.p>

      {/* Guidelines */}
      <motion.div
        variants={fadeUpItem}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 w-full"
      >
        {GUIDELINES.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="flex flex-col gap-2 p-4 rounded-xl bg-slate-50 border border-slate-100"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center rounded-md shrink-0 w-6 h-6 bg-white border border-slate-200 text-slate-600 shadow-sm">
                <Icon size={12} strokeWidth={2} />
              </div>
              <span className="font-sans text-xs font-semibold text-slate-800 leading-tight">
                {title}
              </span>
            </div>
            <p className="font-sans text-[11px] leading-relaxed text-slate-500">
              {text}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Navigation */}
      <motion.div
        variants={fadeUpItem}
        className="w-full flex items-center gap-3"
      >
        <Button
          size="lg"
          variant="outline"
          onClick={onBack}
          className="flex items-center justify-center gap-2 font-sans text-sm font-semibold rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors duration-200 h-12 w-1/3"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back
        </Button>
        <Button
          size="lg"
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 font-sans text-sm font-semibold rounded-xl bg-forge-teal text-primary-foreground hover:bg-forge-teal-light shadow-[0_4px_16px_rgba(13,148,136,0.25)] hover:shadow-[0_8px_24px_rgba(13,148,136,0.4)] transition duration-200 active:scale-[0.98] h-12"
        >
          Choose test length
          <ArrowRight size={16} strokeWidth={2.5} />
        </Button>
      </motion.div>
    </motion.div>
  );
}
