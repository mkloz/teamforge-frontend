import { Link } from "@tanstack/react-router";

import { buildPersonalityEditNavigation } from "@/features/onboarding/lib/onboarding-route";
import type { OceanScores } from "@/features/profile/lib/profile-contract";
import { ProfileSectionHeading } from "@/features/profile/components/profile-section-heading";
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
    <section className="flex min-w-0 flex-col gap-5 border-t border-border/60 pt-6 lg:border-t-0 lg:pt-0">
      <ProfileSectionHeading>Trait map</ProfileSectionHeading>
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
  );
}
