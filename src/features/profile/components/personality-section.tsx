import { Check } from "lucide-react";
import {
  generateDetailedDescription,
  type PersonalityProfile,
} from "../lib/ocean-traits";
import type { UserProfile } from "../types/profile.types";
import { SectionTitle } from "./section-title";

interface PersonalitySectionProps {
  profile: UserProfile;
}

export function PersonalitySection({ profile }: PersonalitySectionProps) {
  const personalityProfile = generateDetailedDescription(profile.oceanScores);

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Primary Section Header */}
      <h3 className="text-xl font-bold text-ink flex items-center gap-2">
        Personality Insights
      </h3>

      <div className="flex flex-col gap-10">
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
    <div className="space-y-4">
      {/* Title badge */}
      <div className="flex items-center gap-2">
        <span className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-spark-amber/10 text-spark-amber border border-spark-amber/20 tracking-tight">
          {profile.title}
        </span>
      </div>

      {/* Summary */}
      <p className="text-[17px] text-ink/90 font-medium leading-relaxed text-pretty">
        {profile.summary}
      </p>
    </div>
  );
}

function PersonalityStrengths({ strengths }: { strengths: string[] }) {
  return (
    <div className="space-y-5">
      <SectionTitle dotColor="bg-forge-teal">Key Strengths</SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {strengths.map((strength) => (
          <div key={strength} className="flex items-center gap-3.5 group">
            <div className="w-6 h-6 rounded-lg bg-forge-teal/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-forge-teal/20">
              <Check size={14} className="text-forge-teal font-bold" />
            </div>
            <span className="text-sm font-semibold text-ink leading-tight">
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
    <div className="space-y-5">
      <SectionTitle dotColor="bg-spark-amber">Group Dynamics</SectionTitle>
      <div className="relative pl-4 border-l-2 border-spark-amber/30">
        <p className="text-base text-ink/90 leading-relaxed font-medium italic">
          {inGroups}
        </p>
      </div>
    </div>
  );
}
