import { DimensionSpectrum } from "@/shared/components/psychometrics/dimension-spectrum";
import { OceanChart } from "@/shared/components/psychometrics/ocean-chart";
import type { DimensionScore, OceanScores } from "@/shared/types/psychometrics";

import { SectionHeading } from "./section-heading";

interface PersonalityTraitMapProps {
  dimensionScores: DimensionScore[];
  oceanScores: OceanScores;
}

export function PersonalityTraitMap({
  dimensionScores,
  oceanScores,
}: PersonalityTraitMapProps) {
  return (
    <section className="grid gap-9">
      <div className="flex flex-col gap-8">
        <div className="grid gap-3 md:grid-cols-2 md:items-stretch">
          <section className="flex h-full flex-col gap-5">
            <SectionHeading eyebrow="Type dimensions" title="The four levers" />
            <div className="flex flex-1 flex-col justify-center gap-4">
              {dimensionScores.map((score) => (
                <DimensionSpectrum key={score.dimension} score={score} />
              ))}
            </div>
          </section>

          <section className="flex h-full flex-col gap-5 border-border/60 border-t pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-3">
            <SectionHeading eyebrow="Trait map" title="Personality shape" />
            <div className="flex flex-1 items-center justify-center md:hidden">
              <OceanChart scores={oceanScores} />
            </div>
            <div className="hidden flex-1 items-center justify-center md:flex">
              <OceanChart
                scores={oceanScores}
                interactive={false}
                showDetails={false}
              />
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
