import { AnimatedCircularProgressBar } from "@/shared/components/ui/animated-circular-progress-bar";
import { Button } from "@/shared/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Target } from "lucide-react";
import { fadeUpItem, staggerContainer } from "../../constants/motion";

interface IntermissionPageProps {
  milestoneIndex: number;
  answeredCount: number;
  totalQuestions: number;
  onAdjustLength: () => void;
  onContinue: () => void;
}

const INTERMISSION_CONTENT: {
  icon: React.ElementType;
  title: string;
  description: string;
  factTitle: string;
  fact: string;
}[] = [
  {
    icon: Brain,
    title: "Understanding Trait Interactions",
    description:
      "Your psychological profile is a combination of dimensional traits, not isolated data points.",
    factTitle: "Beyond Individual Metrics",
    fact: "Traits don't exist in a vacuum. For example, high Openness combined with high Conscientiousness often maps to 'Organized Innovators'. We plot these distinct intersections to form your archetype.",
  },
  {
    icon: Target,
    title: "Triangulating Precision",
    description:
      "The system is currently triangulating your position across all five dimensions.",
    factTitle: "Why the repetition?",
    fact: "If some questions feel similar, that's intentional. By asking about the same underlying concept from different angles, we cancel out human bias and pinpoint your exact location on the trait spectrum.",
  },
  {
    icon: Brain,
    title: "The Big Five Advantage",
    description:
      "You are contributing to a scientifically validated, high-resolution map of your working style.",
    factTitle: "Predictive Validity",
    fact: "Unlike popular 4-letter tests, the Big Five model used here is the gold standard in psychology because it has proven predictive validity for real-world job performance and team dynamics.",
  },
  {
    icon: Target,
    title: "Mapping Your Spectrum",
    description:
      "We aren't trying to put you in a box. We are plotting your unique coordinates.",
    factTitle: "The Bell Curve",
    fact: "Most people aren't entirely extroverted or entirely introverted–they fall somewhere in the middle (ambiverts). By measuring on a continuum, we capture the nuances that binary tests miss completely.",
  },
  {
    icon: Brain,
    title: "Refining the Details",
    description:
      "Every answer helps clarify the subtleties of your professional disposition.",
    factTitle: "Neuroticism vs. Stability",
    fact: "The emotional stability dimension doesn't measure 'good' vs 'bad'. It measures how sensitive you are to negative emotion. High sensitivity can actually be a superpower in roles requiring vigilance and risk analysis.",
  },
  {
    icon: Target,
    title: "The Final Polish",
    description:
      "You are providing the granular data needed to make highly accurate team matches.",
    factTitle: "Agreeableness in Teams",
    fact: "While high agreeableness is great for team harmony, lower agreeableness (acting as a 'challenger') is crucial for avoiding groupthink and driving critical, objective decisions.",
  },
  {
    icon: Brain,
    title: "Deep Dive Insights",
    description:
      "Your continued focus ensures the highest possible accuracy for your profile.",
    factTitle: "Conscientiousness at Work",
    fact: "Conscientiousness is the single best personality predictor of occupational performance. But those lower in the trait often excel in chaotic, rapidly changing environments that require extreme flexibility.",
  },
  {
    icon: Target,
    title: "Sharpening the Focus",
    description:
      "We are finalizing the sub-facets of your primary Big Five traits.",
    factTitle: "The Facets of Openness",
    fact: "Openness isn't just about creativity. It includes facets like openness to aesthetics, feelings, and new ideas. You might be highly traditional in your values, but incredibly open to new intellectual concepts.",
  },
  {
    icon: Brain,
    title: "The Comprehensive View",
    description:
      "Your patience in answering these questions results in an incredibly robust profile.",
    factTitle: "Dynamic Teaming",
    fact: "TeamForge uses these 5 distinct data points not just to understand you, but to simulate how you will interact with the specific vectors of your future teammates, predicting friction before it happens.",
  },
  {
    icon: Target,
    title: "The Home Stretch",
    description:
      "You are in the final stages of the assessment. Your final coordinates are nearly locked.",
    factTitle: "Your Unique Signature",
    fact: "There are millions of possible combinations in the dimensional space we are mapping. Your final result will be uniquely yours, and uniquely actionable for your professional growth.",
  },
];

export function IntermissionPage({
  milestoneIndex,
  answeredCount,
  totalQuestions,
  onAdjustLength,
  onContinue,
}: IntermissionPageProps) {
  // Safe indexing modulo array length
  const validIndex = Math.max(0, milestoneIndex - 1);
  const content =
    INTERMISSION_CONTENT[validIndex % INTERMISSION_CONTENT.length];
  const Icon = content.icon;
  const isDone = answeredCount >= totalQuestions;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col max-w-lg mx-auto w-full gap-0 h-full justify-start pt-2 sm:pt-0 sm:justify-center lg:h-auto px-6 text-center"
    >
      <motion.div
        variants={fadeUpItem}
        className="relative w-24 h-24 mb-8 flex items-center justify-center mx-auto"
      >
        <AnimatedCircularProgressBar
          max={totalQuestions}
          min={0}
          value={answeredCount}
          gaugePrimaryColor="var(--color-forge-teal)"
          gaugeSecondaryColor="var(--color-slate-100)"
          className="w-full h-full text-[0px]"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-forge-teal z-10">
            <Icon size={24} strokeWidth={2.5} />
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={fadeUpItem}
        className="flex flex-col items-center mb-6 gap-3"
      >
        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-forge-teal">
          Quick Break
        </span>
        <span className="font-sans text-xs font-semibold text-slate-500 bg-slate-100/80 px-4 py-1.5 rounded-full border border-slate-200/50">
          {answeredCount} / {totalQuestions} questions answered
        </span>
      </motion.div>

      <motion.h2
        variants={fadeUpItem}
        className="font-sans text-3xl sm:text-4xl font-black leading-tight mb-4 text-ink tracking-tight"
      >
        {content.title}
      </motion.h2>

      <motion.p
        variants={fadeUpItem}
        className="font-sans text-sm sm:text-chat-input leading-relaxed mb-8 text-slate-600 font-medium px-2"
      >
        {content.description}
      </motion.p>

      {/* Unboxed facts section with vertical accent */}
      <motion.div
        variants={fadeUpItem}
        className="w-full text-left border-l-2 border-forge-teal/20 pl-6 mb-10 py-1"
      >
        <span className="font-sans text-xs font-bold text-ink block mb-2 tracking-tight">
          {content.factTitle}
        </span>
        <p className="font-sans text-[13px] text-slate-500 leading-relaxed">
          {content.fact}
        </p>
      </motion.div>

      {/* Mid-test length adjustment - Simplified to a single action */}
      <motion.div variants={fadeUpItem} className="w-full mb-10">
        <Button
          variant="outline"
          onClick={onAdjustLength}
          className="w-full h-11 flex items-center justify-center gap-2 font-sans text-xs font-bold rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-[0.98]"
        >
          <Target size={14} className="opacity-70" />
          Adjust test depth
        </Button>
        <p className="font-sans text-[10px] text-slate-400 font-medium mt-3">
          Need more or less questions? Change it here. Progress preserved.
        </p>
      </motion.div>

      <motion.div variants={fadeUpItem} className="w-full mt-auto sm:mt-4 pb-2">
        <Button
          size="lg"
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 font-sans text-sm font-bold rounded-xl bg-forge-teal text-white hover:bg-forge-teal/90 shadow-lg shadow-forge-teal/20 transition-all duration-200 active:scale-[0.98] h-14"
        >
          {isDone ? "Finish assessment" : "Continue assessment"}
          <ArrowRight size={16} strokeWidth={2.5} />
        </Button>
      </motion.div>
    </motion.div>
  );
}
