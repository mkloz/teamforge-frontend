import { ExternalLink } from "lucide-react";

import type { PersonalityEvaluation } from "@/features/onboarding/lib/personality-evaluation";

import { TypeSignature } from "./type-signature";

interface PersonalityResultHeroProps {
  profileUrl: string;
  result: PersonalityEvaluation;
  typeLabel: string;
}

export function PersonalityResultHero({
  profileUrl,
  result,
  typeLabel,
}: PersonalityResultHeroProps) {
  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-forge-teal">
            Personality result
          </p>
          <TypeSignature result={result} typeLabel={typeLabel} />
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-black text-muted-foreground underline-offset-4 transition-colors hover:text-forge-teal hover:underline"
          >
            Read the {result.type} profile on 16Personalities
            <ExternalLink size={12} className="shrink-0" />
          </a>
        </div>
      </div>
    </section>
  );
}
