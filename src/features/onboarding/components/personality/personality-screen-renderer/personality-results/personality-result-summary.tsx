import type { PersonalityProfile } from "@/shared/lib/personality-profile";

import { PersonalityStrengths } from "./personality-strengths";

interface PersonalityResultSummaryProps {
  profile: PersonalityProfile;
}

export function PersonalityResultSummary({
  profile,
}: PersonalityResultSummaryProps) {
  return (
    <section className="flex flex-col gap-5 border-t border-border/60 pt-7">
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-black leading-tight tracking-tight text-ink">
          {profile.title}
        </h2>
        <p className="text-base font-medium leading-relaxed text-ink/84 text-pretty">
          {profile.summary}
        </p>
      </div>

      <PersonalityStrengths strengths={profile.strengths.slice(0, 4)} />
    </section>
  );
}
