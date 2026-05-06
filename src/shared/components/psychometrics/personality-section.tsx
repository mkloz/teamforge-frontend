import { Check } from "lucide-react";
import type { ReactNode } from "react";

import {
  generateDetailedDescription,
  type PersonalityProfile,
} from "@/shared/lib/personality-profile";
import { cn } from "@/shared/lib/utils";
import type { OceanScores } from "@/shared/types/psychometrics";
import { SectionTitle } from "@/shared/components/psychometrics/section-title";

interface PersonalitySectionProps {
  oceanScores?: OceanScores;
  hideHeaders?: boolean;
  missingProfileAction?: ReactNode;
}

export function PersonalitySection({
  oceanScores,
  hideHeaders = false,
  missingProfileAction,
}: PersonalitySectionProps) {
  if (!oceanScores) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className={cn("flex flex-col", hideHeaders ? "gap-6" : "gap-10")}>
          <div className="flex flex-col gap-4">
            <h4 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">
              Personality profile still calibrating
            </h4>
            <p className="text-base text-slate-muted font-medium leading-relaxed text-pretty">
              We do not have a complete OCEAN profile for this account yet, so
              these narrative insights are not available.
            </p>
            {missingProfileAction}
          </div>
        </div>
      </div>
    );
  }

  const personalityProfile = generateDetailedDescription(oceanScores);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className={cn("flex flex-col", hideHeaders ? "gap-6" : "gap-10")}>
        <PersonalitySummary profile={personalityProfile} />

        <div className="grid grid-cols-1 gap-10">
          <PersonalityStrengths strengths={personalityProfile.strengths} />
          <GroupDynamics inGroups={personalityProfile.inGroups} />
        </div>
      </div>
    </div>
  );
}

function PersonalitySummary({ profile }: { profile: PersonalityProfile }) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">
        {profile.title}
      </h4>

      <p className="text-lg text-ink/90 font-medium leading-relaxed text-pretty">
        {profile.summary}
      </p>
    </div>
  );
}

function PersonalityStrengths({ strengths }: { strengths: string[] }) {
  return (
    <div className="flex flex-col gap-5">
      <SectionTitle dotColor="bg-forge-teal">Key Strengths</SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {strengths.map((strength) => (
          <div key={strength} className="flex items-start gap-3 group">
            <div className="mt-1 flex items-center justify-center shrink-0">
              <Check size={16} className="text-forge-teal" strokeWidth={3} />
            </div>
            <span className="text-base font-medium text-ink/90 leading-tight">
              {strength}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GroupDynamics({ inGroups }: { inGroups: string }) {
  return (
    <div className="flex flex-col gap-4">
      <SectionTitle dotColor="bg-spark-amber">Group Dynamics</SectionTitle>
      <div className="pl-4 border-l-2 border-border/50">
        <p className="text-base text-ink/80 leading-relaxed font-medium italic">
          {inGroups}
        </p>
      </div>
    </div>
  );
}
