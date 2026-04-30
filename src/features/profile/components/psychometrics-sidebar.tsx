import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { OceanChart } from "@/shared/components/psychometrics/ocean-chart";
import { buildPersonalityEditNavigation } from "@/shared/lib/onboarding-route";
import type { OceanTraitKey } from "@/shared/types/psychometrics";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import type { DimensionScore, OceanScores } from "../lib/profile-contract";
import { DimensionSpectrum } from "./dimension-spectrum";
import { SectionTitle } from "./section-title";
import { Button } from "@/shared/components/ui/button";

interface PsychometricsSidebarProps {
  oceanScores: OceanScores | null;
  dimensionScores: DimensionScore[] | null;
}

export function PsychometricsSidebar({
  oceanScores,
  dimensionScores,
}: PsychometricsSidebarProps) {
  const [selectedTrait, setSelectedTrait] = useState<OceanTraitKey | null>(
    null,
  );

  return (
    <div className="flex flex-col gap-10 w-full lg:sticky lg:top-24">
      {/* OCEAN Radar Chart Section */}
      <section className="space-y-6">
        <SectionTitle dotColor="bg-spark-amber">OCEAN Profile</SectionTitle>
        <div className="bg-canvas border border-border/40 rounded-2xl p-4 md:p-6 shadow-xs">
          {oceanScores ? (
            <OceanChart
              scores={oceanScores}
              selectedTrait={selectedTrait}
              onTraitSelect={setSelectedTrait}
            />
          ) : (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm font-medium text-slate-muted">
                OCEAN scores are not available yet.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link
                  {...buildPersonalityEditNavigation({
                    returnTo: "/profile",
                  })}
                >
                  Finish personality setup
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* MBTI Dimension Spectrums Section */}
      <section className="space-y-6">
        <SectionTitle dotColor="bg-forge-teal">Trait Dimensions</SectionTitle>
        <div className="space-y-4 px-1">
          {dimensionScores ? (
            <TooltipProvider delayDuration={200}>
              {dimensionScores.map((score) => (
                <DimensionSpectrum key={score.dimension} score={score} />
              ))}
            </TooltipProvider>
          ) : (
            <p className="text-sm font-medium text-slate-muted">
              Trait dimension data is not available yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
