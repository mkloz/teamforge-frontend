import { OceanChart } from "@/shared/components/psychometrics/ocean-chart";
import type { DimensionScore, OceanScores } from "@/shared/types/psychometrics";
import { DimensionSpectrum } from "@/features/profile/components/dimension-spectrum";
import { PersonalitySection } from "@/features/profile/components/personality-section";
import { SectionTitle } from "@/features/profile/components/section-title";
import { Button } from "@/shared/components/ui/button";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, RefreshCcw } from "lucide-react";
import { Fragment } from "react";
import { popDownItem, resultsContainer } from "../../constants/motion";
import {
  getDimensionScoresFromVector,
  getOceanScoresFromVector,
} from "../../lib/personality-results";
import type { OceanVectorWithMeta } from "../../utils/score-calculator";
import type { PersonalityResult } from "../../utils/type-translation";

interface PersonalityResultsProps {
  result: PersonalityResult;
  vector: OceanVectorWithMeta;
  onContinue: () => void;
  onRetake: () => void;
}

export function PersonalityResults({
  result,
  vector,
  onContinue,
  onRetake,
}: PersonalityResultsProps) {
  const allLetters = [...result.type.split(""), result.variant];

  const dimensionScores: DimensionScore[] = getDimensionScoresFromVector(
    result,
    vector,
  );
  const oceanScores: OceanScores = getOceanScoresFromVector(vector);

  return (
    <TooltipProvider delayDuration={200}>
      <motion.div
        variants={resultsContainer}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto py-6"
      >
        <p className="font-sans text-xs font-bold uppercase tracking-[0.15em] mb-5 text-center text-forge-teal">
          Your Personality Type
        </p>

        <motion.div
          className="flex justify-center items-center gap-1 sm:gap-2 mb-8 px-1"
          variants={resultsContainer}
        >
          {allLetters.map((letter, i) => {
            const axisLabel = [
              "Energy",
              "Mind",
              "Nature",
              "Tactics",
              "Identity",
            ][i];
            const isIdentity = i === 4;

            const tile = (
              <motion.div
                key={i}
                variants={popDownItem}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl sm:rounded-2xl w-14 sm:w-20 h-18 sm:h-20 bg-card border border-border sm:shadow-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition-all gap-0.5",
                  isIdentity
                    ? "bg-linear-to-b from-spark-amber/3 to-spark-amber/8 border-spark-amber/20 shadow-spark-amber/10 dark:from-spark-amber/10 dark:to-spark-amber/6"
                    : "bg-linear-to-b from-card to-slate-50/50 dark:to-white/4",
                )}
              >
                <span
                  className={cn(
                    "font-sans font-black leading-none text-2xl sm:text-3xl tracking-tight",
                    isIdentity ? "text-spark-amber" : "text-ink",
                  )}
                >
                  {letter}
                </span>

                <div
                  className={cn(
                    "w-5 sm:w-7 h-0.5 rounded-full opacity-60 -mt-1",
                    isIdentity ? "bg-spark-amber" : "bg-forge-teal",
                  )}
                />

                <span className="font-sans font-bold leading-none text-nano text-muted-foreground uppercase tracking-wider mt-1 px-1">
                  {axisLabel}
                </span>
              </motion.div>
            );

            // Add a dash before the last (Identity) letter
            if (isIdentity) {
              return (
                <Fragment key="identity-group">
                  <span className="text-xl sm:text-2xl font-bold text-slate-200 dark:text-white/15 px-0.5">
                    —
                  </span>
                  {tile}
                </Fragment>
              );
            }

            return tile;
          })}
        </motion.div>

        <div className="text-center mb-2 sm:mb-4 px-2">
          <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
            {result.info.name}
            <span className="text-slate-muted font-bold block sm:inline mt-1 sm:mt-0">
              {" "}
              · {result.variant === "A" ? "Assertive" : "Turbulent"}
            </span>
          </h2>
        </div>

        <div className="flex flex-col gap-8">
          <section className="animate-fade-in">
            <PersonalitySection oceanScores={oceanScores} hideHeaders={true} />
          </section>

          <div className="h-px bg-slate-100 dark:bg-white/10" />

          <section className="space-y-6 animate-fade-in">
            <SectionTitle dotColor="bg-spark-amber">
              Personality Fingerprint
            </SectionTitle>
            <div className="bg-transparent lg:bg-card rounded-3xl p-0 sm:p-6 border-0 lg:border border-border shadow-none lg:shadow-sm dark:lg:shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
              <OceanChart scores={oceanScores} />
            </div>
          </section>

          <div className="h-px bg-slate-100 dark:bg-white/10" />

          <section className="space-y-6 animate-fade-in px-1">
            <SectionTitle dotColor="bg-forge-teal">
              Trait Dimensions
            </SectionTitle>
            <div className="space-y-4 px-1">
              {dimensionScores.map((score) => (
                <DimensionSpectrum key={score.dimension} score={score} />
              ))}
            </div>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row gap-4">
          <Button size="hero" onClick={onContinue} className="flex-1">
            Continue
            <ArrowRight size={20} />
          </Button>
          <Button variant="outline" size="hero" onClick={onRetake}>
            <RefreshCcw size={18} />
            Retake test
          </Button>
        </div>

        <div className="mt-6 flex justify-center">
          <a
            href={`https://www.16personalities.com/${result.type.toLowerCase()}-personality`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-muted hover:text-ink transition-colors text-sm font-medium"
          >
            <ExternalLink size={15} />
            Learn more about {result.type}
          </a>
        </div>

        <p className="font-sans text-xs text-center mt-6 text-slate-muted/75 dark:text-slate-muted/85">
          Retaking replaces your current results. Your first match may change as
          a result.
        </p>
      </motion.div>
    </TooltipProvider>
  );
}
