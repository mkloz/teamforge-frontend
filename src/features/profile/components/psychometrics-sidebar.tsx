import { useState } from "react";
import type { UserProfile, OceanTraitKey } from "../types/profile.types";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { DimensionSpectrum } from "./dimension-spectrum";
import { OceanChart } from "./ocean-chart";
import { SectionTitle } from "./section-title";

interface PsychometricsSidebarProps {
  profile: UserProfile;
}

export function PsychometricsSidebar({ profile }: PsychometricsSidebarProps) {
  const [selectedTrait, setSelectedTrait] = useState<OceanTraitKey | null>(
    null,
  );

  return (
    <div className="flex flex-col gap-10 w-full lg:sticky lg:top-24">
      {/* OCEAN Radar Chart Section */}
      <section className="space-y-6">
        <SectionTitle dotColor="bg-spark-amber">OCEAN Profile</SectionTitle>
        <div className="bg-canvas border border-border/40 rounded-2xl p-4 md:p-6 shadow-xs">
          <OceanChart
            scores={profile.oceanScores}
            selectedTrait={selectedTrait}
            onTraitSelect={setSelectedTrait}
          />
        </div>
      </section>

      {/* MBTI Dimension Spectrums Section */}
      <section className="space-y-6">
        <SectionTitle dotColor="bg-forge-teal">Trait Dimensions</SectionTitle>
        <div className="space-y-4 px-1">
          <TooltipProvider delayDuration={200}>
            {profile.dimensionScores.map((score) => (
              <DimensionSpectrum key={score.dimension} score={score} />
            ))}
          </TooltipProvider>
        </div>
      </section>
    </div>
  );
}
