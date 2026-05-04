import { ShieldCheck } from "lucide-react";

import { OceanDiagram } from "@/shared/components/psychometrics/ocean-chart";
import { OCEAN_TRAITS } from "@/shared/lib/ocean-traits";
import type { OceanScores } from "@/shared/types/psychometrics";

interface IdentityCardProps {
  mbti: string;
  oceanScores: OceanScores;
  trustScore: number;
}

export function IdentityCard({
  mbti,
  oceanScores,
  trustScore,
}: IdentityCardProps) {
  const strongestTraits = [...OCEAN_TRAITS]
    .sort((left, right) => oceanScores[right.key] - oceanScores[left.key])
    .slice(0, 2);

  return (
    <section aria-labelledby="match-identity-heading" className="px-1 py-1">
      <div className="flex items-center gap-2.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-forge-teal text-sm font-black text-background shadow-sm">
          {mbti}
        </span>

        <div className="min-w-0 flex-1">
          <h2
            id="match-identity-heading"
            className="text-sm font-black leading-tight tracking-tight text-foreground"
          >
            Match identity
          </h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <ShieldCheck
              className="size-3.5 text-forge-teal"
              strokeWidth={2.4}
              aria-hidden
            />
            Verified personality profile
          </p>
        </div>

        <div className="shrink-0 text-right leading-none">
          <span className="text-sm font-black tabular-nums text-spark-amber">
            {trustScore}
          </span>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
            Trust
          </p>
        </div>
      </div>

      <div className="my-3 h-px w-full bg-border/45" aria-hidden />

      <div className="relative mx-auto flex h-56 w-full max-w-60 items-center justify-center">
        <OceanDiagram
          scores={oceanScores}
          interactive={false}
          className="min-h-0"
        />
      </div>

      <div className="mt-1 space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
          Strongest signals
        </p>

        <div className="space-y-1.5">
          {strongestTraits.map((trait) => {
            const score = oceanScores[trait.key];

            return (
              <div key={trait.key}>
                <div className="mb-0.5 flex items-center justify-between gap-3">
                  <span className="truncate text-xs font-bold text-foreground">
                    {trait.label}
                  </span>
                  <span className="text-xs font-black tabular-nums text-forge-teal">
                    {score}
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-muted/50">
                  <div
                    className="h-full rounded-full bg-forge-teal"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
