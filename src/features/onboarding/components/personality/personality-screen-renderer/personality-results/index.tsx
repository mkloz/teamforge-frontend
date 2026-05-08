import { motion } from "framer-motion";

import { resultsContainer } from "@/features/onboarding/constants/motion";
import type { PersonalityEvaluation } from "@/features/onboarding/lib/personality-evaluation";
import { getPersonalityResultViewModel } from "@/features/onboarding/lib/personality-results";
import type { OceanVectorWithMeta } from "@/features/onboarding/utils/score-calculator";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

import { PersonalityResultActions } from "./personality-result-actions";
import { PersonalityResultHero } from "./personality-result-hero";
import { PersonalityResultSummary } from "./personality-result-summary";
import { PersonalityTraitMap } from "./personality-trait-map";
import { SectionHeading } from "./section-heading";

interface PersonalityResultsProps {
  result: PersonalityEvaluation;
  vector: OceanVectorWithMeta;
  onContinue: () => void;
  onRetake: () => void;
  continueLabel?: string;
}

export function PersonalityResults({
  result,
  vector,
  onContinue,
  onRetake,
  continueLabel = "Continue",
}: PersonalityResultsProps) {
  const viewModel = getPersonalityResultViewModel(result, vector);

  return (
    <TooltipProvider delayDuration={200}>
      <motion.div
        variants={resultsContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-xl flex-col gap-8 py-8 sm:min-h-[calc(100dvh-5rem)] sm:py-10"
      >
        <PersonalityResultHero
          result={result}
          profileUrl={viewModel.externalProfileUrl}
          typeLabel={viewModel.typeLabel}
        />

        <PersonalityResultSummary profile={viewModel.profile} />

        <section className="flex flex-col gap-4 border-border/60 border-t pt-7">
          <SectionHeading
            eyebrow="TeamForge read"
            title="How this helps a group"
          />
          <p className="text-pretty font-medium text-base text-ink/82 leading-relaxed">
            {viewModel.groupRead}
          </p>
        </section>

        <PersonalityTraitMap
          dimensionScores={viewModel.dimensionScores}
          oceanScores={viewModel.oceanScores}
        />

        <PersonalityResultActions
          continueLabel={continueLabel}
          onContinue={onContinue}
          onRetake={onRetake}
        />
      </motion.div>
    </TooltipProvider>
  );
}
