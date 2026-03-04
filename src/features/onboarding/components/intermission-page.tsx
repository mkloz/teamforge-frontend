import { Button } from "@/shared/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Target } from "lucide-react";
import { fadeUpItem, staggerContainer } from "../constants/motion";

interface IntermissionPageProps {
  milestoneIndex: number;
  answeredCount: number;
  totalQuestions: number;
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
    fact: "Unlike popular 4-letter tests, the Big Five model used here is the gold standard in academic psychology because it has proven predictive validity for real-world job performance and team dynamics.",
  },
  {
    icon: Target,
    title: "Mapping Your Spectrum",
    description:
      "We aren't trying to put you in a box. We are plotting your unique coordinates.",
    factTitle: "The Bell Curve",
    fact: "Most people aren't entirely extroverted or entirely introverted—they fall somewhere in the middle (ambiverts). By measuring on a continuum, we capture the nuances that binary tests miss completely.",
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
  onContinue,
}: IntermissionPageProps) {
  // Safe indexing modulo array length
  const validIndex = Math.max(0, milestoneIndex - 1);
  const content =
    INTERMISSION_CONTENT[validIndex % INTERMISSION_CONTENT.length];
  const Icon = content.icon;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center max-w-md mx-auto w-full gap-0 text-center h-[60vh] lg:h-auto my-auto"
    >
      <motion.div
        variants={fadeUpItem}
        className="relative w-24 h-24 mb-6 flex items-center justify-center"
      >
        {/* Background circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="44"
            className="stroke-slate-100"
            strokeWidth="4"
            fill="none"
          />
          {/* Animated progress ring */}
          <motion.circle
            cx="48"
            cy="48"
            r="44"
            className="stroke-forge-teal"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            initial={{
              strokeDasharray: 2 * Math.PI * 44,
              strokeDashoffset: 2 * Math.PI * 44,
            }}
            animate={{
              strokeDashoffset:
                2 * Math.PI * 44 * (1 - answeredCount / totalQuestions),
            }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          />
        </svg>

        <div className="w-16 h-16 rounded-2xl bg-forge-teal/10 flex items-center justify-center text-forge-teal z-10 relative">
          <Icon size={32} strokeWidth={2} />
        </div>
      </motion.div>

      <motion.div
        variants={fadeUpItem}
        className="flex flex-col items-center mb-4 gap-2"
      >
        <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-forge-teal">
          Quick Break
        </span>
        <span className="font-sans text-xs font-medium text-slate-500 bg-slate-100/80 px-3 py-1 rounded-full">
          {answeredCount} / {totalQuestions} questions answered
        </span>
      </motion.div>

      <motion.h2
        variants={fadeUpItem}
        className="font-sans text-[2rem] lg:text-[2.5rem] font-extrabold leading-tight text-balance mb-4 text-[#1C1C1A]"
      >
        {content.title}
      </motion.h2>

      <motion.p
        variants={fadeUpItem}
        className="font-sans text-sm md:text-base leading-relaxed mb-8 text-slate-500 max-w-sm"
      >
        {content.description}
      </motion.p>

      <motion.div
        variants={fadeUpItem}
        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-5 mb-10 text-left relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-forge-teal/40" />
        <span className="font-sans text-xs font-semibold text-slate-700 block mb-1">
          {content.factTitle}
        </span>
        <span className="font-sans text-xs text-slate-500 leading-normal block">
          {content.fact}
        </span>
      </motion.div>

      <motion.div variants={fadeUpItem} className="w-full">
        <Button
          size="lg"
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 font-sans text-sm font-semibold rounded-xl bg-forge-teal text-primary-foreground hover:bg-forge-teal-light shadow-[0_4px_16px_rgba(13,148,136,0.25)] hover:shadow-[0_8px_24px_rgba(13,148,136,0.4)] transition duration-200 active:scale-[0.98] h-12"
        >
          Continue assessment
          <ArrowRight size={16} strokeWidth={2.5} />
        </Button>
      </motion.div>
    </motion.div>
  );
}
