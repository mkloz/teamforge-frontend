import type { PersonalityTraitScores } from "@/shared/schemas/public-personality-profile";

const TRAITS: Array<{ key: keyof PersonalityTraitScores; label: string }> = [
  { key: "openness", label: "Openness" },
  { key: "conscientiousness", label: "Conscientiousness" },
  { key: "extraversion", label: "Extraversion" },
  { key: "agreeableness", label: "Agreeableness" },
  { key: "neuroticism", label: "Emotional sensitivity" },
];

interface PersonalityTraitMapProps {
  oceanScores: PersonalityTraitScores;
}

export function PersonalityTraitMap({ oceanScores }: PersonalityTraitMapProps) {
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
