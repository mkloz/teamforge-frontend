import type { PersonalityTraitScores } from "@/shared/schemas/public-personality-profile";

import { SectionHeading } from "./section-heading";

const TRAITS: Array<{ key: keyof PersonalityTraitScores; label: string }> = [
  { key: "openness", label: "Openness" },
  { key: "conscientiousness", label: "Conscientiousness" },
  { key: "extraversion", label: "Extraversion" },
  { key: "agreeableness", label: "Agreeableness" },
  { key: "neuroticism", label: "Emotional sensitivity" },
];

interface PrivatePersonalityResultProps {
  audienceText: string;
  oceanScores: PersonalityTraitScores;
}

export function PrivatePersonalityResult({
  audienceText,
  oceanScores,
}: PrivatePersonalityResultProps) {
  return (
    <>
      <section className="flex flex-col gap-4 border-border/60 border-t pt-7">
        <SectionHeading
          eyebrow="Your result"
          title="Five broad personality traits"
        />
        <p className="text-pretty text-muted-foreground text-sm leading-relaxed">
          This is an estimate based on your answers. It is not a diagnosis or a
          fixed description of who you are. It does not measure safety or
          guarantee how well a group will work.
        </p>
        <PrivateTraitList oceanScores={oceanScores} />
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <SectionHeading
          eyebrow="Before you publish"
          title="What publication allows"
        />
        <p className="text-pretty text-ink/82 text-sm leading-relaxed">
          Publishing lets TeamForge use this exact type and these five scores
          for {audienceText}. Keeping it private stores the result for you.
          TeamForge will not use it when forming groups. It is never published
          on the open web.
        </p>
        <p className="text-pretty text-muted-foreground text-xs leading-relaxed">
          Your answers were used for this submission and are not saved.
        </p>
      </section>
    </>
  );
}

function PrivateTraitList({
  oceanScores,
}: Pick<PrivatePersonalityResultProps, "oceanScores">) {
  return (
    <div className="flex flex-col gap-4">
      {TRAITS.map((trait) => {
        const score = oceanScores[trait.key];

        return (
          <div key={trait.key} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-ink">{trait.label}</span>
              <span className="font-bold text-forge-teal">{score}%</span>
            </div>
            <progress
              aria-label={trait.label}
              className="h-2 w-full overflow-hidden rounded-full accent-primary"
              max={100}
              value={score}
            >
              {score}%
            </progress>
          </div>
        );
      })}
    </div>
  );
}
