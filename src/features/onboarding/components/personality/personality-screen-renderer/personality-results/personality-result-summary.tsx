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
        <h2 className="text-2xl leading-tight font-black tracking-tight text-ink">
          {profile.title}
        </h2>
        <p className="text-base leading-relaxed font-medium text-pretty text-ink/84">
          {profile.summary}
        </p>
      </div>

      <PersonalityStrengths strengths={profile.strengths.slice(0, 4)} />
    </section>
  );
}
