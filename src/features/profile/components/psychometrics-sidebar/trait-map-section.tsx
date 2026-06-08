import { Link } from "@tanstack/react-router";
import { buildPersonalityEditNavigation } from "@/features/onboarding/lib/onboarding-route";
import { EmptyTraitMapVisual } from "@/features/profile/assets/empty-trait-map";
import type { OceanScores } from "@/features/profile/lib/profile-contract";
import { OceanChart } from "@/shared/components/psychometrics/ocean-chart";
import { Button } from "@/shared/components/ui/button";
import type { OceanTraitKey } from "@/shared/types/psychometrics";

interface TraitMapSectionProps {
  oceanScores: OceanScores | null;
  selectedTrait: OceanTraitKey | null;
  onTraitSelect: (trait: OceanTraitKey | null) => void;
}

export function TraitMapSection({
  oceanScores,
  selectedTrait,
  onTraitSelect,
}: TraitMapSectionProps) {
  return (
    <section className="flex min-w-0 flex-col border-border/60 border-t pt-6 lg:border-t-0 lg:pt-0">
      <div className="py-2">
        {oceanScores ? (
          <OceanChart
            scores={oceanScores}
            selectedTrait={selectedTrait}
            onTraitSelect={onTraitSelect}
          />
        ) : (
          <EmptyTraitMap />
        )}
      </div>
    </section>
  );
}

function EmptyTraitMap() {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-4 sm:text-left">
      <EmptyTraitMapVisual className="h-16 w-auto shrink-0 text-foreground" />
      <div className="flex min-w-0 flex-col items-center gap-3 sm:items-start">
        <p className="font-medium text-slate-muted text-sm">
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
    </div>
  );
}
