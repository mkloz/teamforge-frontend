import type { PersonalityType } from "@/shared/schemas/enums";

import { TypeSignature } from "./type-signature";

interface PersonalityResultHeroProps {
  personalityType: PersonalityType;
}

export function PersonalityResultHero({
  personalityType,
}: PersonalityResultHeroProps) {
  return (
    <section>
      <TypeSignature personalityType={personalityType} />
    </section>
  );
}
