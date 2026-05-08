import { ProfileSectionHeading } from "@/features/profile/components/profile-section-heading";
import type { DimensionScore } from "@/features/profile/lib/profile-contract";
import { DimensionSpectrum } from "@/shared/components/psychometrics/dimension-spectrum";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

interface TypeDimensionsSectionProps {
  dimensionScores: DimensionScore[] | null;
}

export function TypeDimensionsSection({
  dimensionScores,
}: TypeDimensionsSectionProps) {
  return (
    <section className="flex min-w-0 flex-col gap-5 border-border/60 border-t pt-6 md:border-t-0 md:pt-0 lg:border-t-0">
      <ProfileSectionHeading>Type dimensions</ProfileSectionHeading>
      <div className="flex flex-col gap-4 px-1">
        {dimensionScores ? (
          <TooltipProvider delayDuration={200}>
            {dimensionScores.map((score) => (
              <DimensionSpectrum key={score.dimension} score={score} />
            ))}
          </TooltipProvider>
        ) : (
          <p className="font-medium text-slate-muted text-sm">
            Trait dimension data is not available yet.
          </p>
        )}
      </div>
    </section>
  );
}
