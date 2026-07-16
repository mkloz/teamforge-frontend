import type { PersonalityProfile } from "@/shared/lib/personality-profile";

import { PersonalityStrengths } from "./personality-strengths";

interface PersonalityResultSummaryProps {
  profile: PersonalityProfile;
}

export function PersonalityResultSummary({
  profile,
}: PersonalityResultSummaryProps) {
  return (
    <section className="flex flex-col gap-5 border-border/60 border-t pt-7">
      <div className="flex flex-col gap-3">
        <h2 className="font-black text-2xl text-ink leading-tight tracking-tight">
          {profile.title}
        </h2>
        <p className="text-pretty font-medium text-base text-ink/84 leading-relaxed">
          {profile.summary}
        </p>
      </div>

      <PersonalityStrengths strengths={profile.strengths.slice(0, 4)} />
    </section>
  );
}
