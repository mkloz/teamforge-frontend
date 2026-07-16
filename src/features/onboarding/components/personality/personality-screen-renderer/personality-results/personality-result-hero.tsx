import type { PersonalityType } from "@/shared/schemas/enums";

import { TypeSignature } from "./type-signature";

interface PersonalityResultHeroProps {
  personalityType: PersonalityType;
}

export function PersonalityResultHero({
  personalityType,
}: PersonalityResultHeroProps) {
  return (
    <section className="flex flex-col gap-3">
      <p className="font-bold text-forge-teal text-xs">Personality result</p>
      <TypeSignature personalityType={personalityType} />
    </section>
  );
}
