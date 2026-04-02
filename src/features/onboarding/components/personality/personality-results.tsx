import { DimensionSpectrum } from "@/features/profile/components/dimension-spectrum";
import { OceanChart } from "@/features/profile/components/ocean-chart";
import { PersonalitySection } from "@/features/profile/components/personality-section";
import { SectionTitle } from "@/features/profile/components/section-title";
import type {
  DimensionKey,
  DimensionScore,
  OceanScores,
  UserProfile,
} from "@/features/profile/types/profile.types";
import { Button } from "@/shared/components/ui/button";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, RefreshCcw } from "lucide-react";
import { Fragment } from "react";
import { popDownItem, resultsContainer } from "../../constants/motion";
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

  const dimensionScores: DimensionScore[] = [
    {
      dimension: "EI" as DimensionKey,
      score: Math.round(((1 - vector.E) / 2) * 100),
      letter: result.type[0],
      isBorderline: Math.abs(vector.E) < 0.167,
    },
    {
      dimension: "SN" as DimensionKey,
      score: Math.round(((vector.O + 1) / 2) * 100),
      letter: result.type[1],
      isBorderline: Math.abs(vector.O) < 0.167,
    },
    {
      dimension: "TF" as DimensionKey,
      score: Math.round(((vector.A + 1) / 2) * 100),
      letter: result.type[2],
      isBorderline: Math.abs(vector.A) < 0.167,
    },
    {
      dimension: "JP" as DimensionKey,
      score: Math.round(((1 - vector.C) / 2) * 100),
      letter: result.type[3],
      isBorderline: Math.abs(vector.C) < 0.167,
    },
  ];

  const oceanScores: OceanScores = {
    openness: Math.round(((vector.O + 1) / 2) * 100),
    conscientiousness: Math.round(((vector.C + 1) / 2) * 100),
    extraversion: Math.round(((vector.E + 1) / 2) * 100),
    agreeableness: Math.round(((vector.A + 1) / 2) * 100),
    neuroticism: Math.round(((vector.N + 1) / 2) * 100),
  };

  return (
    <TooltipProvider delayDuration={200}>
      <motion.div
        variants={resultsContainer}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto px-4 py-12"
      >
        <p className="font-sans text-[10px] font-bold uppercase tracking-[0.18em] mb-5 text-center text-forge-teal">
          Your Personality Type
        </p>

        <motion.div
          className="flex justify-center items-center gap-1.5 sm:gap-2 mb-8"
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
                  "flex flex-col items-center justify-center rounded-2xl w-14 sm:w-16 h-20 sm:h-24 bg-white border border-slate-100 sm:shadow-sm shadow-[0_1px_3px_rgba(0,0,0,0.05)] gap-0.5",
                  isIdentity && "bg-spark-amber/5 border-spark-amber/20",
                )}
              >
                <span
                  className={cn(
                    "font-sans font-black leading-none text-2xl sm:text-3xl",
                    isIdentity ? "text-spark-amber" : "text-ink",
                  )}
                >
                  {letter}
                </span>

                <div
                  className={cn(
                    "w-4 h-0.5 rounded-full opacity-40 mt-1 mb-1",
                    isIdentity ? "bg-spark-amber" : "bg-forge-teal",
                  )}
                />

                <span className="font-sans font-bold leading-none text-[8px] sm:text-[9px] text-slate-muted uppercase tracking-wider">
                  {axisLabel}
                </span>
              </motion.div>
            );

            // Add a dash before the last (Identity) letter
            if (isIdentity) {
              return (
                <Fragment key="identity-group">
                  <span className="text-2xl font-black text-slate-200">-</span>
                  {tile}
                </Fragment>
              );
            }

            return tile;
          })}
        </motion.div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-ink tracking-tight">
            The {result.info.name}
            <span className="text-slate-muted font-bold">
              {" "}
              · {result.variant === "A" ? "Assertive" : "Turbulent"}
            </span>
          </h2>
        </div>

        <div className="flex flex-col gap-8 mt-4">
          <section className="animate-fade-in">
            <PersonalitySection
              profile={{ oceanScores } as UserProfile}
              hideHeaders={true}
            />
          </section>

          <div className="h-px bg-slate-100" />

          <section className="space-y-6 animate-fade-in">
            <SectionTitle dotColor="bg-spark-amber">
              Personality Fingerprint
            </SectionTitle>
            <div className="bg-transparent lg:bg-white rounded-3xl p-0 sm:p-6 border-0 lg:border border-slate-100 shadow-none lg:shadow-sm">
              <OceanChart scores={oceanScores} />
            </div>
          </section>

          <div className="h-px bg-slate-100" />

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

        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onContinue}
            className="flex-1 h-14 rounded-2xl bg-forge-teal hover:bg-forge-teal/90 text-white font-bold text-lg shadow-lg shadow-forge-teal/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Continue
            <ArrowRight className="ml-2" size={20} />
          </Button>
          <Button
            variant="outline"
            onClick={onRetake}
            className="h-14 px-8 rounded-2xl border-slate-200 text-slate-muted font-bold transition-all hover:bg-slate-50"
          >
            <RefreshCcw className="mr-2" size={18} />
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

        <p className="font-sans text-micro text-center mt-6 text-slate-muted/55">
          Retaking replaces your current results. Your first match may change as
          a result.
        </p>
      </motion.div>
    </TooltipProvider>
  );
}
