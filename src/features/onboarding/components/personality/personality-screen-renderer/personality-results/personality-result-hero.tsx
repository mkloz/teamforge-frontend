import type { PersonalityType } from "@/shared/schemas/enums";

import { TypeSignature } from "./type-signature";

interface PersonalityResultHeroProps {
  compact?: boolean;
  personalityType: PersonalityType;
}

export function PersonalityResultHero({
  compact = false,
  personalityType,
}: PersonalityResultHeroProps) {
  return (
    <section className="flex flex-col gap-3">
      <p className="font-bold text-forge-teal text-xs">Personality result</p>
      <TypeSignature compact={compact} personalityType={personalityType} />
    </section>
  );
}
